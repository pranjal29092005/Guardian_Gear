import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { DndContext, DragOverlay, closestCenter, PointerSensor, useSensor, useSensors, useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
    Plus, 
    User, 
    AlertTriangle, 
    CheckCircle, 
    XCircle, 
    Edit3, 
    Clock, 
    Package,
    Wrench,
    GripVertical
} from 'lucide-react';
import { requestAPI } from '../api/requests';
import { useAuth } from '../contexts/AuthContext';
import CreateRequestModal from '../components/CreateRequestModal';
import RequestDetailModal from '../components/RequestDetailModal';
import AssignTechnicianModal from '../components/AssignTechnicianModal';
import EditRequestModal from '../components/EditRequestModal';
import { Button } from '../components/ui/Button';
import { Badge, CountBadge } from '../components/ui/Badge';
import { LoadingScreen } from '../components/ui/Loading';
import { cn } from '../utils/cn';

const STAGES = {
    NEW: 'NEW',
    IN_PROGRESS: 'IN_PROGRESS',
    REPAIRED: 'REPAIRED',
    SCRAP: 'SCRAP'
};

const STAGE_CONFIG = {
    NEW: {
        label: 'New Requests',
        icon: AlertTriangle,
        color: 'from-blue-500 to-cyan-500',
        bgColor: 'bg-blue-500/10',
        borderColor: 'border-blue-500/30',
        glowColor: 'shadow-blue-500/20'
    },
    IN_PROGRESS: {
        label: 'In Progress',
        icon: Wrench,
        color: 'from-yellow-500 to-orange-500',
        bgColor: 'bg-yellow-500/10',
        borderColor: 'border-yellow-500/30',
        glowColor: 'shadow-yellow-500/20'
    },
    REPAIRED: {
        label: 'Completed',
        icon: CheckCircle,
        color: 'from-green-500 to-emerald-500',
        bgColor: 'bg-green-500/10',
        borderColor: 'border-green-500/30',
        glowColor: 'shadow-green-500/20'
    },
    SCRAP: {
        label: 'Scrapped',
        icon: XCircle,
        color: 'from-red-500 to-rose-500',
        bgColor: 'bg-red-500/10',
        borderColor: 'border-red-500/30',
        glowColor: 'shadow-red-500/20'
    }
};

// Sortable Request Card Component
const SortableRequestCard = ({ 
    request, 
    canModifyRequest, 
    onAssign, 
    onStageChange, 
    isManager, 
    onOpenAssignModal, 
    onOpenEditModal 
}) => {
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
    };

    const isDraggable = canModifyRequest && request.stage !== STAGES.REPAIRED && request.stage !== STAGES.SCRAP;

    return (
        <motion.div
            ref={setNodeRef}
            style={style}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isDragging ? 0.5 : 1, y: 0 }}
            whileHover={!isDragging && isDraggable ? { y: -4 } : {}}
            onClick={() => {
                if (!isDragging && request.onClick) {
                    request.onClick(request);
                }
            }}
            className={cn(
                "group relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10",
                "hover:border-white/20 transition-all duration-300",
                isDraggable && "cursor-move",
                request.isOverdue && "border-red-500/50 shadow-red-500/20",
                isDragging && "shadow-2xl scale-105 ring-2 ring-primary-500/50"
            )}
        >
            {/* Drag Handle */}
            {isDraggable && (
                <div 
                    {...attributes} 
                    {...listeners}
                    className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
                >
                    <GripVertical className="w-5 h-5 text-gray-400" />
                </div>
            )}

            <div className={cn("space-y-3", isDraggable && "ml-8")}>
                {/* Title */}
                <h4 className="font-semibold text-white text-sm leading-tight pr-2">
                    {request.subject}
                </h4>

                {/* Equipment */}
                {request.equipmentId?.name && (
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Package className="w-4 h-4" />
                        <span className="truncate">{request.equipmentId.name}</span>
                    </div>
                )}

                {/* Assigned Technician */}
                {request.assignedTechnicianId && (
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-primary-500/20">
                            <User className="w-3.5 h-3.5 text-primary-400" />
                        </div>
                        <span className="text-xs text-gray-300 truncate">
                            {request.assignedTechnicianId.name}
                        </span>
                    </div>
                )}

                {/* Overdue Warning */}
                {request.isOverdue && (
                    <div className="flex items-center gap-2 px-2 py-1.5 bg-red-500/20 rounded-lg border border-red-500/30">
                        <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                        <span className="text-xs text-red-400 font-medium">Overdue</span>
                    </div>
                )}

                {/* Action Buttons */}
                {canModifyRequest && (
                    <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
                        {isManager && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onOpenEditModal(request);
                                }}
                                className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg transition-colors"
                            >
                                <Edit3 className="w-3.5 h-3.5" />
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
                                className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg transition-colors"
                            >
                                <User className="w-3.5 h-3.5" />
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
                                    className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-green-500/20 hover:bg-green-500/30 text-green-300 rounded-lg transition-colors"
                                >
                                    <CheckCircle className="w-3.5 h-3.5" />
                                    Complete
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onStageChange(request._id, STAGES.SCRAP);
                                    }}
                                    className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors"
                                >
                                    <XCircle className="w-3.5 h-3.5" />
                                    Scrap
                                </button>
                            </>
                        )}
                    </div>
                )}
            </div>
        </motion.div>
    );
};

// Droppable Column Component
const DroppableColumn = ({ stage, requests, children }) => {
    const { setNodeRef, isOver } = useDroppable({ id: stage });
    const config = STAGE_CONFIG[stage];
    const Icon = config.icon;

    return (
        <motion.div
            ref={setNodeRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
                "relative rounded-2xl p-4 min-h-[600px] backdrop-blur-sm",
                "bg-gradient-to-b from-white/5 to-transparent border border-white/10",
                "transition-all duration-300",
                isOver && "ring-2 ring-primary-500/50 shadow-glow scale-[1.02]"
            )}
        >
            {/* Column Header */}
            <div className="mb-4 pb-4 border-b border-white/10">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            "p-2 rounded-xl bg-gradient-to-br",
                            config.color,
                            "shadow-lg"
                        )}>
                            <Icon className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="font-bold text-white text-lg">
                            {config.label}
                        </h3>
                    </div>
                    <CountBadge 
                        count={requests?.length || 0} 
                        variant={stage === 'NEW' ? 'primary' : 'secondary'}
                    />
                </div>
            </div>

            {/* Cards Container */}
            <div className="space-y-3">
                {children}
            </div>

            {/* Empty State */}
            {(!requests || requests.length === 0) && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center py-12">
                        <Icon className="w-12 h-12 text-gray-600 mx-auto mb-3 opacity-50" />
                        <p className="text-sm text-gray-500">
                            {isOver ? 'Drop here' : 'No requests'}
                        </p>
                    </div>
                </div>
            )}

            {/* Drop Indicator */}
            {isOver && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 bg-primary-500/10 rounded-2xl border-2 border-dashed border-primary-500/50 pointer-events-none"
                />
            )}
        </motion.div>
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
            setLoading(true);
            const data = await requestAPI.getKanban(equipmentId);

            // If filtered by equipment, convert array to kanban structure
            if (equipmentId && Array.isArray(data)) {
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
                setKanbanData(grouped);
            } else {
                setKanbanData(data);
            }
        } catch (error) {
            console.error('Failed to fetch kanban data:', error);
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

        // Determine target stage
        let toStage = null;
        if (Object.keys(STAGES).includes(overId)) {
            toStage = overId;
        } else {
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
            return;
        }

        // Optimistic update
        const newKanbanData = { ...kanbanData };
        newKanbanData[fromStage] = newKanbanData[fromStage].filter(r => r._id !== activeId);
        newKanbanData[toStage] = [...newKanbanData[toStage], draggedRequest];
        setKanbanData(newKanbanData);

        // Update backend
        try {
            if (toStage === STAGES.REPAIRED) {
                await requestAPI.complete(activeId, 0);
            } else if (toStage === STAGES.SCRAP) {
                await requestAPI.scrap(activeId);
            } else {
                await requestAPI.updateStage(activeId, toStage);
            }
        } catch (error) {
            console.error('Failed to update stage:', error);
            fetchKanbanData();
        }
    };

    const handleAssignToMe = async (requestId) => {
        try {
            await requestAPI.assign(requestId);
            fetchKanbanData();
        } catch (error) {
            console.error('Failed to assign request:', error);
            fetchKanbanData();
        }
    };

    const handleStageChange = async (requestId, newStage) => {
        if (newStage === STAGES.REPAIRED) {
            try {
                await requestAPI.complete(requestId, 0);
                fetchKanbanData();
            } catch (error) {
                console.error('Failed to complete request:', error);
                fetchKanbanData();
            }
            return;
        }

        if (newStage === STAGES.SCRAP) {
            try {
                await requestAPI.scrap(requestId);
                fetchKanbanData();
            } catch (error) {
                console.error('Failed to scrap request:', error);
                fetchKanbanData();
            }
            return;
        }

        try {
            await requestAPI.updateStage(requestId, newStage);
            fetchKanbanData();
        } catch (error) {
            console.error('Failed to update stage:', error);
            fetchKanbanData();
        }
    };

    const canModifyRequest = hasRole(['TECHNICIAN', 'MANAGER']);
    const isManager = hasRole(['MANAGER']);

    if (loading) {
        return <LoadingScreen message="Loading kanban board..." />;
    }

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="space-y-6">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between"
                >
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-2">
                            {equipmentId ? 'Equipment Requests' : 'Kanban Board'}
                        </h1>
                        <p className="text-gray-400">
                            Manage maintenance requests across workflow stages
                        </p>
                    </div>
                    <Button
                        onClick={() => setShowCreateModal(true)}
                        icon={Plus}
                        size="lg"
                    >
                        Create Request
                    </Button>
                </motion.div>

                {/* Kanban Columns */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                    {Object.entries(STAGES).map(([key, stage]) => (
                        <DroppableColumn
                            key={stage}
                            stage={stage}
                            requests={kanbanData[stage]}
                        >
                            <SortableContext
                                items={kanbanData[stage]?.map(r => r._id) || []}
                                strategy={verticalListSortingStrategy}
                                id={stage}
                            >
                                <AnimatePresence>
                                    {kanbanData[stage]?.map((request, index) => (
                                        <motion.div
                                            key={request._id}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            transition={{ delay: index * 0.05 }}
                                        >
                                            <SortableRequestCard
                                                request={{
                                                    ...request,
                                                    onClick: (req) => {
                                                        setSelectedRequest(req);
                                                        setShowDetailModal(true);
                                                    }
                                                }}
                                                canModifyRequest={canModifyRequest}
                                                isManager={isManager}
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
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </SortableContext>
                        </DroppableColumn>
                    ))}
                </div>
            </div>

            {/* Drag Overlay */}
            <DragOverlay>
                {activeId ? (
                    <div className="bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl p-4 shadow-2xl opacity-90">
                        <div className="flex items-center gap-2 text-white font-medium">
                            <GripVertical className="w-5 h-5" />
                            <span>Moving request...</span>
                        </div>
                    </div>
                ) : null}
            </DragOverlay>

            {/* Modals */}
            <CreateRequestModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSuccess={fetchKanbanData}
            />

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
