import { useState } from 'react';
import { requestAPI } from '../api/requests';
import { useAuth } from '../contexts/AuthContext';
import AssignTechnicianModal from './AssignTechnicianModal';
import { UserIcon, TeamIcon, CalendarIcon, EquipmentIcon } from './Icons';

const RequestDetailModal = ({ isOpen, onClose, request, onSuccess }) => {
    const { user, hasRole } = useAuth();
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen || !request) return null;

    const isManager = hasRole(['MANAGER']);
    const isAssignedTechnician = request.assignedTechnicianId?._id === user?.id;
    const canStartWork = request.stage === 'NEW' && isAssignedTechnician;
    const canComplete = request.stage === 'IN_PROGRESS' && (isAssignedTechnician || isManager);
    const canAssign = request.stage === 'NEW' && isManager;

    const handleStatusUpdate = async (newStatus, event) => {
        // Prevent any default behavior and propagation
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }


        // Only confirm for destructive actions (REPAIRED and SCRAP), not for IN_PROGRESS
        if (newStatus === 'REPAIRED' || newStatus === 'SCRAP') {
            const confirmMessages = {
                'REPAIRED': 'Mark this request as repaired?',
                'SCRAP': 'Mark this equipment as scrap? This action cannot be undone.'
            };

            const confirmed = window.confirm(confirmMessages[newStatus]);

            if (!confirmed) {
                return;
            }
        }

        try {
            setUpdating(true);
            setError('');
            await requestAPI.updateStatus(request._id, newStatus);
            onSuccess();
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update status');
        } finally {
            setUpdating(false);
        }
    };

    const getStatusColor = (stage) => {
        switch (stage) {
            case 'NEW': return 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
            case 'IN_PROGRESS': return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30';
            case 'REPAIRED': return 'bg-green-500/20 text-green-400 border border-green-500/30';
            case 'SCRAP': return 'bg-red-500/20 text-red-400 border border-red-500/30';
            default: return 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
        }
    };

    return (
        <>
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-dark-400 border border-gray-700 rounded-lg shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
                    <div className="flex items-start justify-between mb-4">
                        <h2 className="text-xl font-bold text-white">Request Details</h2>
                        <span className={`px-3 py-1 text-sm font-semibold rounded ${getStatusColor(request.stage)}`}>
                            {request.stage}
                        </span>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        {/* Subject & Description */}
                        <div>
                            <h3 className="font-semibold text-white text-lg">{request.subject}</h3>
                            {request.description && (
                                <p className="text-sm text-gray-400 mt-1">{request.description}</p>
                            )}
                        </div>

                        {/* Equipment Info */}
                        {request.equipmentId && (
                            <div className="p-3 bg-dark-300 border border-gray-700 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    <EquipmentIcon className="w-5 h-5 text-gray-400" />
                                    <span className="font-medium text-white">Equipment</span>
                                </div>
                                <p className="text-sm text-gray-300">{request.equipmentId.name}</p>
                                <p className="text-xs text-gray-500">
                                    Serial: {request.equipmentId.serialNumber} | Category: {request.equipmentId.category}
                                </p>
                                {request.equipmentId.status && (
                                    <p className="text-xs text-gray-500 mt-1">
                                        Status: <span className="font-medium text-gray-400">{request.equipmentId.status}</span>
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Request Details */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-500">Type</label>
                                <p className="text-white">{request.type}</p>
                            </div>

                            {request.scheduledDate && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Scheduled</label>
                                    <p className="text-white flex items-center gap-1">
                                        <CalendarIcon className="w-4 h-4" />
                                        {new Date(request.scheduledDate).toLocaleDateString()}
                                    </p>
                                </div>
                            )}

                            {request.maintenanceTeamId && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Team</label>
                                    <p className="text-white flex items-center gap-1">
                                        <TeamIcon className="w-4 h-4" />
                                        {request.maintenanceTeamId.name}
                                    </p>
                                </div>
                            )}

                            {request.assignedTechnicianId && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Assigned To</label>
                                    <p className="text-white flex items-center gap-1">
                                        <UserIcon className="w-4 h-4" />
                                        {request.assignedTechnicianId.name}
                                    </p>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-500">Created</label>
                                <p className="text-white">
                                    {new Date(request.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="pt-4 mt-4 border-t border-gray-700">
                            <div className="flex flex-wrap gap-2">
                                {canAssign && !request.assignedTechnicianId && (
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setShowAssignModal(true);
                                        }}
                                        disabled={updating}
                                        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Assign Technician
                                    </button>
                                )}

                                {canStartWork && (
                                    <button
                                        onClick={(e) => handleStatusUpdate('IN_PROGRESS', e)}
                                        disabled={updating}
                                        className="px-4 py-2 bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {updating ? 'Starting...' : 'Start Work'}
                                    </button>
                                )}

                                {canComplete && (
                                    <>
                                        <button
                                            onClick={(e) => handleStatusUpdate('REPAIRED', e)}
                                            disabled={updating}
                                            className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {updating ? 'Updating...' : 'Mark as Repaired'}
                                        </button>
                                        <button
                                            onClick={(e) => handleStatusUpdate('SCRAP', e)}
                                            disabled={updating}
                                            className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {updating ? 'Updating...' : 'Mark as Scrap'}
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4 mt-4 border-t border-gray-700">
                        <button
                            onClick={onClose}
                            className="flex-1 bg-dark-300 border border-gray-600 text-gray-300 py-2 px-4 rounded-lg hover:bg-dark-200 hover:border-gray-500 transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>

            <AssignTechnicianModal
                isOpen={showAssignModal}
                onClose={() => setShowAssignModal(false)}
                request={request}
                onSuccess={() => {
                    setShowAssignModal(false);
                    onSuccess();
                }}
            />
        </>
    );
};

export default RequestDetailModal;
