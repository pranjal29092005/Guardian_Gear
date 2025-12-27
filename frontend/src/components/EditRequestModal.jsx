import { useState, useEffect } from 'react';
import { requestAPI } from '../api/requests';
import { teamAPI } from '../api/teams';
import { UserIcon, TeamIcon } from './Icons';

const EditRequestModal = ({ isOpen, onClose, request, onSuccess }) => {
    const [teams, setTeams] = useState([]);
    const [technicians, setTechnicians] = useState([]);
    const [selectedTeamId, setSelectedTeamId] = useState('');
    const [selectedTechnicianId, setSelectedTechnicianId] = useState('');
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen && request) {
            setSelectedTeamId(request.maintenanceTeamId?._id || request.maintenanceTeamId || '');
            setSelectedTechnicianId(request.assignedTechnicianId?._id || request.assignedTechnicianId || '');
            fetchData();
        }
    }, [isOpen, request]);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError('');
            const [teamsData, techniciansData] = await Promise.all([
                teamAPI.getAll(),
                requestAPI.getAvailableTechnicians()
            ]);
            setTeams(teamsData);
            setTechnicians(techniciansData);
        } catch (err) {
            console.error('Failed to fetch data:', err);
            setError('Failed to load teams and technicians');
        } finally {
            setLoading(false);
        }
    };

    const handleTeamChange = (teamId) => {
        setSelectedTeamId(teamId);
        // Clear technician when team changes, as technician should be from the selected team
        setSelectedTechnicianId('');
    };

    const handleUpdate = async () => {
        try {
            setUpdating(true);
            setError('');
            await requestAPI.updateTeamAndTechnician(
                request._id,
                selectedTeamId || null,
                selectedTechnicianId || null
            );
            onSuccess();
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update request');
        } finally {
            setUpdating(false);
        }
    };

    // Filter technicians by selected team
    const filteredTechnicians = selectedTeamId
        ? technicians.filter(tech =>
            tech.teams && tech.teams.some(t => t._id === selectedTeamId)
        )
        : technicians;

    if (!isOpen || !request) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                    Edit Request Assignment
                </h2>

                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-700">
                        <span className="font-semibold">Request:</span> {request.subject}
                    </p>
                    <p className="text-sm text-gray-600">
                        Equipment: {request.equipmentId?.name || 'N/A'}
                    </p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="text-center py-12 text-gray-500">Loading...</div>
                ) : (
                    <div className="space-y-4">
                        {/* Team Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <TeamIcon className="w-4 h-4 inline mr-1" />
                                Maintenance Team
                            </label>
                            <select
                                value={selectedTeamId}
                                onChange={(e) => handleTeamChange(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">Select Team</option>
                                {teams.map((team) => (
                                    <option key={team._id} value={team._id}>
                                        {team.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Technician Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <UserIcon className="w-4 h-4 inline mr-1" />
                                Assigned Technician
                            </label>
                            <select
                                value={selectedTechnicianId}
                                onChange={(e) => setSelectedTechnicianId(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                disabled={!selectedTeamId}
                            >
                                <option value="">No Technician Assigned</option>
                                {filteredTechnicians.length === 0 ? (
                                    <option value="" disabled>
                                        {selectedTeamId ? 'No technicians in selected team' : 'Select a team first'}
                                    </option>
                                ) : (
                                    filteredTechnicians.map((tech) => (
                                        <option key={tech._id} value={tech._id}>
                                            {tech.name} ({tech.email})
                                        </option>
                                    ))
                                )}
                            </select>
                            {selectedTeamId && filteredTechnicians.length === 0 && (
                                <p className="mt-1 text-xs text-gray-500">
                                    No technicians available in the selected team
                                </p>
                            )}
                        </div>

                        {/* Current Assignment Info */}
                        <div className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-xs text-gray-600">
                                <span className="font-semibold">Current Team:</span>{' '}
                                {request.maintenanceTeamId?.name || 'Not assigned'}
                            </p>
                            <p className="text-xs text-gray-600 mt-1">
                                <span className="font-semibold">Current Technician:</span>{' '}
                                {request.assignedTechnicianId?.name || 'Not assigned'}
                            </p>
                        </div>
                    </div>
                )}

                <div className="flex gap-3 pt-4 mt-4 border-t border-gray-200">
                    <button
                        onClick={onClose}
                        disabled={updating}
                        className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleUpdate}
                        disabled={updating || loading || !selectedTeamId}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {updating ? 'Updating...' : 'Update'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditRequestModal;

