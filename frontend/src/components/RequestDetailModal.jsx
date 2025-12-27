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
            case 'NEW': return 'bg-blue-100 text-blue-800';
            case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-800';
            case 'REPAIRED': return 'bg-green-100 text-green-800';
            case 'SCRAP': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
                    <div className="flex items-start justify-between mb-4">
                        <h2 className="text-xl font-bold text-gray-900">Request Details</h2>
                        <span className={`px-3 py-1 text-sm font-semibold rounded ${getStatusColor(request.stage)}`}>
                            {request.stage}
                        </span>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        {/* Subject & Description */}
                        <div>
                            <h3 className="font-semibold text-gray-900 text-lg">{request.subject}</h3>
                            {request.description && (
                                <p className="text-sm text-gray-600 mt-1">{request.description}</p>
                            )}
                        </div>

                        {/* Equipment Info */}
                        {request.equipmentId && (
                            <div className="p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    <EquipmentIcon className="w-5 h-5 text-gray-600" />
                                    <span className="font-medium text-gray-900">Equipment</span>
                                </div>
                                <p className="text-sm text-gray-700">{request.equipmentId.name}</p>
                                <p className="text-xs text-gray-500">
                                    Serial: {request.equipmentId.serialNumber} | Category: {request.equipmentId.category}
                                </p>
                                {request.equipmentId.status && (
                                    <p className="text-xs text-gray-500 mt-1">
                                        Status: <span className="font-medium">{request.equipmentId.status}</span>
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Request Details */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-500">Type</label>
                                <p className="text-gray-900">{request.type}</p>
                            </div>

                            {request.scheduledDate && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Scheduled</label>
                                    <p className="text-gray-900 flex items-center gap-1">
                                        <CalendarIcon className="w-4 h-4" />
                                        {new Date(request.scheduledDate).toLocaleDateString()}
                                    </p>
                                </div>
                            )}

                            {request.maintenanceTeamId && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Team</label>
                                    <p className="text-gray-900 flex items-center gap-1">
                                        <TeamIcon className="w-4 h-4" />
                                        {request.maintenanceTeamId.name}
                                    </p>
                                </div>
                            )}

                            {request.assignedTechnicianId && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Assigned To</label>
                                    <p className="text-gray-900 flex items-center gap-1">
                                        <UserIcon className="w-4 h-4" />
                                        {request.assignedTechnicianId.name}
                                    </p>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-500">Created</label>
                                <p className="text-gray-900">
                                    {new Date(request.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="pt-4 mt-4 border-t border-gray-200">
                            <div className="flex flex-wrap gap-2">
                                {canAssign && !request.assignedTechnicianId && (
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setShowAssignModal(true);
                                        }}
                                        disabled={updating}
                                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
                                    >
                                        Assign Technician
                                    </button>
                                )}

                                {canStartWork && (
                                    <button
                                        onClick={(e) => handleStatusUpdate('IN_PROGRESS', e)}
                                        disabled={updating}
                                        className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors disabled:opacity-50"
                                    >
                                        {updating ? 'Starting...' : 'Start Work'}
                                    </button>
                                )}

                                {canComplete && (
                                    <>
                                        <button
                                            onClick={(e) => handleStatusUpdate('REPAIRED', e)}
                                            disabled={updating}
                                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
                                        >
                                            {updating ? 'Updating...' : 'Mark as Repaired'}
                                        </button>
                                        <button
                                            onClick={(e) => handleStatusUpdate('SCRAP', e)}
                                            disabled={updating}
                                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
                                        >
                                            {updating ? 'Updating...' : 'Mark as Scrap'}
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4 mt-4 border-t border-gray-200">
                        <button
                            onClick={onClose}
                            className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
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
