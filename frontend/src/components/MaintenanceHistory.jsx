import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { requestAPI } from '../api/requests';
import { CalendarIcon, WrenchIcon } from './Icons';

const MaintenanceHistory = ({ equipmentId }) => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (equipmentId) {
            fetchHistory();
        }
    }, [equipmentId]);

    const fetchHistory = async () => {
        try {
            setLoading(true);
            const data = await requestAPI.getKanban(equipmentId);

            // Combine all requests and sort by creation date
            const allRequests = Array.isArray(data) ? data : Object.values(data).flat();
            const sorted = allRequests.sort((a, b) =>
                new Date(b.createdAt) - new Date(a.createdAt)
            );

            setHistory(sorted);
        } catch (error) {
            console.error('Failed to fetch history:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStageColor = (stage) => {
        switch (stage) {
            case 'NEW':
                return 'bg-blue-100 text-blue-800';
            case 'IN_PROGRESS':
                return 'bg-yellow-100 text-yellow-800';
            case 'REPAIRED':
                return 'bg-green-100 text-green-800';
            case 'SCRAP':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const TypeIcon = ({ type }) => {
        return type === 'PREVENTIVE'
            ? <CalendarIcon className="w-5 h-5 text-blue-600" />
            : <WrenchIcon className="w-5 h-5 text-orange-600" />;
    };

    if (loading) {
        return <div className="text-center py-8 text-gray-500">Loading history...</div>;
    }

    if (history.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                No maintenance history for this equipment
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Maintenance History</h3>

            {/* Timeline */}
            <div className="relative">
                {/* Vertical line */}
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-300"></div>

                {/* Timeline items */}
                <div className="space-y-6">
                    {history.map((request, index) => (
                        <div key={request._id} className="relative pl-10">
                            {/* Timeline dot */}
                            <div className={`absolute left-2 w-4 h-4 rounded-full border-2 border-white ${request.stage === 'REPAIRED' ? 'bg-green-500' :
                                request.stage === 'SCRAP' ? 'bg-red-500' :
                                    request.stage === 'IN_PROGRESS' ? 'bg-yellow-500' :
                                        'bg-blue-500'
                                }`}></div>

                            {/* Content card */}
                            <div className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <TypeIcon type={request.type} />
                                        <h4 className="font-medium text-gray-900">{request.subject}</h4>
                                    </div>
                                    <span className={`px-2 py-1 text-xs font-semibold rounded ${getStageColor(request.stage)}`}>
                                        {request.stage}
                                    </span>
                                </div>

                                {request.description && (
                                    <p className="text-sm text-gray-600 mb-3">{request.description}</p>
                                )}

                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    {request.type === 'PREVENTIVE' && request.scheduledDate && (
                                        <div>
                                            <span className="text-gray-500">Scheduled:</span>{' '}
                                            <span className="text-gray-900">
                                                {new Date(request.scheduledDate).toLocaleDateString()}
                                            </span>
                                        </div>
                                    )}

                                    {request.assignedTechnicianId && (
                                        <div>
                                            <span className="text-gray-500">Technician:</span>{' '}
                                            <span className="text-gray-900">{request.assignedTechnicianId.name}</span>
                                        </div>
                                    )}

                                    {request.durationHours && (
                                        <div>
                                            <span className="text-gray-500">Duration:</span>{' '}
                                            <span className="text-gray-900">{request.durationHours}h</span>
                                        </div>
                                    )}

                                    <div>
                                        <span className="text-gray-500">Created:</span>{' '}
                                        <span className="text-gray-900">
                                            {new Date(request.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>

                                {request.maintenanceTeamId && (
                                    <div className="mt-3 pt-3 border-t border-gray-200">
                                        <span className="text-xs text-gray-500">
                                            Team: {request.maintenanceTeamId.name || 'Unassigned'}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {history.length > 5 && (
                <button
                    onClick={() => navigate(`/kanban?equipmentId=${equipmentId}`)}
                    className="w-full mt-4 px-4 py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                >
                    View All in Kanban Board →
                </button>
            )}
        </div>
    );
};

export default MaintenanceHistory;
