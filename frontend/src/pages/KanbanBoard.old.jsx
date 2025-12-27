import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DndContext, DragOverlay, closestCenter, PointerSensor, useSensor, useSensors, useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { requestAPI } from '../api/requests';
import { useAuth } from '../contexts/AuthContext';
import CreateRequestModal from '../components/CreateRequestModal';
import RequestDetailModal from '../components/RequestDetailModal';
import AssignTechnicianModal from '../components/AssignTechnicianModal';
import EditRequestModal from '../components/EditRequestModal';
import { WarningIcon, UserIcon, EditIcon } from '../components/Icons';

const STAGES = {
    NEW: 'NEW',
    IN_PROGRESS: 'IN_PROGRESS',
    REPAIRED: 'REPAIRED',
    SCRAP: 'SCRAP'
};

// Sortable Request Card Component
const SortableRequestCard = ({ request, canModifyRequest, onAssign, onStageChange, isManager, onOpenAssignModal, onOpenEditModal }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({
        id: request._id,
        disabled: !canModifyRequest || request.stage === STAGES.REPAIRED || request.stage === STAGES.SCRAP
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            onClick={() => {
                if (!isDragging && request.onClick) {
                    request.onClick(request);
                }
            }}
            className={`bg-white rounded-lg p-4 shadow-sm border-l-4 cursor-move ${request.isOverdue ? 'border-red-500' : 'border-blue-500'
                } ${isDragging ? 'shadow-lg' : ''}`}
        >
            <h4 className="font-medium text-gray-900 mb-2">{request.subject}</h4>

            <p className="text-sm text-gray-600 mb-2">
                {request.equipmentId?.name}
            </p>

            {request.assignedTechnicianId && (
                <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                    <UserIcon className="w-4 h-4" />
                    <span>{request.assignedTechnicianId.name}</span>
                </div>
            )}

            {request.isOverdue && (
                <div className="flex items-center gap-1 text-xs text-red-600 font-medium mb-2">
                    <WarningIcon className="w-4 h-4" />
                    <span>Overdue</span>
                </div>
            )}

            {canModifyRequest && (
                <div className="mt-3 space-y-2">
                    {isManager && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onOpenEditModal(request);
                            }}
                            className="w-full text-xs px-2 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded transition-colors flex items-center justify-center gap-1"
                        >
                            <EditIcon className="w-3 h-3" />
                            Edit
                        </button>
                    )}

                    {!request.assignedTechnicianId && request.stage === STAGES.NEW && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                if (isManager) {
                                    onOpenAssignModal(request);
                                } else {
                                    onAssign(request._id);
                                }
                            }}
                            className="w-full text-xs px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded transition-colors"
                        >
                            {isManager ? 'Assign' : 'Assign to Me'}
                        </button>
                    )}

                    {request.stage === STAGES.IN_PROGRESS && (
                        <>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onStageChange(request._id, STAGES.REPAIRED);
                                }}
                                className="w-full text-xs px-2 py-1 bg-green-50 hover:bg-green-100 text-green-700 rounded transition-colors"
                            >
                                Complete
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onStageChange(request._id, STAGES.SCRAP);
                                }}
                                className="w-full text-xs px-2 py-1 bg-red-50 hover:bg-red-100 text-red-700 rounded transition-colors"
                            >
                                Scrap
                            </button>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

const KanbanBoard = () => {
    const [searchParams] = useSearchParams();
    const equipmentId = searchParams.get('equipmentId');

    const { user, hasRole } = useAuth();
    const [kanbanData, setKanbanData] = useState({
        NEW: [],
        IN_PROGRESS: [],
        REPAIRED: [],
        SCRAP: []
    });
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [activeId, setActiveId] = useState(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    useEffect(() => {
        fetchKanbanData();
    }, [equipmentId]);

    const fetchKanbanData = async () => {
        try {
            console.log('[KanbanBoard] Fetching kanban data, equipmentId:', equipmentId);
            setLoading(true);
            const data = await requestAPI.getKanban(equipmentId);
            console.log('[KanbanBoard] Received kanban data:', data);

            // If filtered by equipment, convert array to kanban structure
            if (equipmentId && Array.isArray(data)) {
                console.log('[KanbanBoard] Grouping equipment-filtered data');
                const grouped = {
                    NEW: [],
                    IN_PROGRESS: [],
                    REPAIRED: [],
                    SCRAP: []
                };
                data.forEach(req => {
                    if (grouped[req.stage]) {
                        grouped[req.stage].push(req);
                    }
                });
                console.log('[KanbanBoard] Grouped data:', grouped);
                setKanbanData(grouped);
            } else {
                console.log('[KanbanBoard] Setting kanban data directly:', data);
                setKanbanData(data);
            }

            console.log('[KanbanBoard] Final kanban data state:', data);
        } catch (error) {
            console.error('[KanbanBoard] Failed to fetch kanban data:', error);
            console.error('[KanbanBoard] Error response:', error.response?.data);
        } finally {
            setLoading(false);
        }
    };

    const handleDragStart = (event) => {
        setActiveId(event.active.id);
    };

    const handleDragEnd = async (event) => {
        const { active, over } = event;
        setActiveId(null);

        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        // Find the request being dragged
        let draggedRequest = null;
        let fromStage = null;

        for (const [stage, requests] of Object.entries(kanbanData)) {
            const found = requests.find(r => r._id === activeId);
            if (found) {
                draggedRequest = found;
                fromStage = stage;
                break;
            }
        }

        if (!draggedRequest) return;

        // Determine target stage (overId could be a stage name or another request)
        let toStage = null;
        if (Object.keys(STAGES).includes(overId)) {
            toStage = overId;
        } else {
            // Find which stage the target request is in
            for (const [stage, requests] of Object.entries(kanbanData)) {
                if (requests.find(r => r._id === overId)) {
                    toStage = stage;
                    break;
                }
            }
        }

        if (!toStage || fromStage === toStage) return;

        // Validate transition
        const validTransitions = {
            NEW: ['IN_PROGRESS'],
            IN_PROGRESS: ['REPAIRED', 'SCRAP'],
            REPAIRED: [],
            SCRAP: []
        };

        if (!validTransitions[fromStage].includes(toStage)) {
            // Invalid transition - silently ignore
            return;
        }

        // Handle REPAIRED - duration will be calculated automatically on backend
        if (toStage === STAGES.REPAIRED) {
            // Optimistic update
            const newKanbanData = { ...kanbanData };
            newKanbanData[fromStage] = newKanbanData[fromStage].filter(r => r._id !== activeId);
            newKanbanData[toStage] = [...newKanbanData[toStage], draggedRequest];
            setKanbanData(newKanbanData);

            // Update backend - duration will be auto-calculated
            try {
                await requestAPI.updateStage(activeId, toStage);
            } catch (error) {
                console.error('Failed to update stage:', error);
                // Revert on error
                fetchKanbanData();
            }
            return;
        }

        if (toStage === STAGES.SCRAP) {
            // Scrap directly when dragged
            try {
                await requestAPI.scrap(activeId);
                fetchKanbanData();
            } catch (error) {
                console.error('Failed to scrap request:', error);
                fetchKanbanData(); // Refresh to revert UI
            }
            return;
        }

        // Optimistic update
        const newKanbanData = { ...kanbanData };
        newKanbanData[fromStage] = newKanbanData[fromStage].filter(r => r._id !== activeId);
        newKanbanData[toStage] = [...newKanbanData[toStage], draggedRequest];
        setKanbanData(newKanbanData);

        // Update backend
        try {
            await requestAPI.updateStage(activeId, toStage);
        } catch (error) {
            console.error('Failed to update stage:', error);
            // Revert on error
            fetchKanbanData();
        }
    };

    const handleAssignToMe = async (requestId) => {
        try {
            await requestAPI.assign(requestId);
            fetchKanbanData();
        } catch (error) {
            console.error('Failed to assign request:', error);
            fetchKanbanData(); // Refresh to revert UI
        }
    };

    const handleStageChange = async (requestId, newStage) => {
        if (newStage === STAGES.REPAIRED) {
            // Complete with auto-calculated duration
            try {
                await requestAPI.complete(requestId, 0); // 0 will trigger auto-calculation on backend
                fetchKanbanData();
            } catch (error) {
                console.error('Failed to complete request:', error);
                fetchKanbanData(); // Refresh to revert UI
            }
            return;
        }

        if (newStage === STAGES.SCRAP) {
            // Scrap directly without confirmation
            try {
                await requestAPI.scrap(requestId);
                fetchKanbanData();
            } catch (error) {
                console.error('Failed to scrap request:', error);
                fetchKanbanData(); // Refresh to revert UI
            }
            return;
        }

        try {
            await requestAPI.updateStage(requestId, newStage);
            fetchKanbanData();
        } catch (error) {
            console.error('Failed to update stage:', error);
            fetchKanbanData(); // Refresh to revert UI
        }
    };

    const canModifyRequest = hasRole(['TECHNICIAN', 'MANAGER']);

    if (loading) {
        return <div className="text-center py-12">Loading...</div>;
    }

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div>
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">
                        {equipmentId ? 'Equipment Maintenance Requests' : 'Kanban Board'}
                    </h1>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                        + Create Request
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {Object.entries(STAGES).map(([key, stage]) => {
                        const DroppableColumn = () => {
                            const { setNodeRef, isOver } = useDroppable({
                                id: stage
                            });

                            return (
                                <div
                                    ref={setNodeRef}
                                    className={`bg-gray-100 rounded-lg p-4 min-h-[500px] ${isOver ? 'bg-gray-200 ring-2 ring-blue-500' : ''}`}
                                >
                                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center justify-between">
                                        <span>{stage.replace('_', ' ')}</span>
                                        <span className="text-sm bg-gray-200 px-2 py-1 rounded">
                                            {kanbanData[stage]?.length || 0}
                                        </span>
                                    </h3>

                                    <SortableContext
                                        items={kanbanData[stage]?.map(r => r._id) || []}
                                        strategy={verticalListSortingStrategy}
                                        id={stage}
                                    >
                                        <div className="space-y-3">
                                            {kanbanData[stage]?.map((request) => (
                                                <SortableRequestCard
                                                    key={request._id}
                                                    request={{
                                                        ...request,
                                                        onClick: (req) => {
                                                            setSelectedRequest(req);
                                                            setShowDetailModal(true);
                                                        }
                                                    }}
                                                    canModifyRequest={canModifyRequest}
                                                    isManager={hasRole(['MANAGER'])}
                                                    onAssign={handleAssignToMe}
                                                    onStageChange={handleStageChange}
                                                    onOpenAssignModal={(req) => {
                                                        setSelectedRequest(req);
                                                        setShowAssignModal(true);
                                                    }}
                                                    onOpenEditModal={(req) => {
                                                        setSelectedRequest(req);
                                                        setShowEditModal(true);
                                                    }}
                                                />
                                            ))}

                                            {kanbanData[stage]?.length === 0 && (
                                                <div className="text-center py-8 text-gray-400 text-sm">
                                                    Drop cards here
                                                </div>
                                            )}
                                        </div>
                                    </SortableContext>
                                </div>
                            );
                        };

                        return <DroppableColumn key={stage} />;
                    })}
                </div>

                <CreateRequestModal
                    isOpen={showCreateModal}
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={fetchKanbanData}
                />

            </div>

            <DragOverlay>
                {activeId ? (
                    <div className="bg-white rounded-lg p-4 shadow-xl border-l-4 border-blue-500 opacity-90">
                        Dragging...
                    </div>
                ) : null}
            </DragOverlay>

            <RequestDetailModal
                isOpen={showDetailModal}
                onClose={() => {
                    setShowDetailModal(false);
                    setSelectedRequest(null);
                }}
                request={selectedRequest}
                onSuccess={() => {
                    fetchKanbanData();
                    setShowDetailModal(false);
                    setSelectedRequest(null);
                }}
            />

            <AssignTechnicianModal
                isOpen={showAssignModal}
                onClose={() => {
                    setShowAssignModal(false);
                    setSelectedRequest(null);
                }}
                request={selectedRequest}
                onSuccess={() => {
                    fetchKanbanData();
                    setShowAssignModal(false);
                    setSelectedRequest(null);
                }}
            />

            <EditRequestModal
                isOpen={showEditModal}
                onClose={() => {
                    setShowEditModal(false);
                    setSelectedRequest(null);
                }}
                request={selectedRequest}
                onSuccess={() => {
                    fetchKanbanData();
                    setShowEditModal(false);
                    setSelectedRequest(null);
                }}
            />
        </DndContext>
    );
};

export default KanbanBoard;
