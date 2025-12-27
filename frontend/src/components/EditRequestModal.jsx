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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-dark-400 border border-gray-700 rounded-lg shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-bold text-white mb-4">
                    Edit Request Assignment
                </h2>

                <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <p className="text-sm text-gray-300">
                        <span className="font-semibold text-white">Request:</span> {request.subject}
                    </p>
                    <p className="text-sm text-gray-400">
                        Equipment: {request.equipmentId?.name || 'N/A'}
                    </p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="text-center py-12 text-gray-400">Loading...</div>
                ) : (
                    <div className="space-y-4">
                        {/* Team Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                <TeamIcon className="w-4 h-4 inline mr-1" />
                                Maintenance Team
                            </label>
                            <select
                                value={selectedTeamId}
                                onChange={(e) => handleTeamChange(e.target.value)}
                                className="w-full px-3 py-2 bg-dark-300 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            >
                                <option value="" className="bg-dark-400">Select Team</option>
                                {teams.map((team) => (
                                    <option key={team._id} value={team._id} className="bg-dark-400">
                                        {team.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Technician Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                <UserIcon className="w-4 h-4 inline mr-1" />
                                Assigned Technician
                            </label>
                            <select
                                value={selectedTechnicianId}
                                onChange={(e) => setSelectedTechnicianId(e.target.value)}
                                className="w-full px-3 py-2 bg-dark-300 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={!selectedTeamId}
                            >
                                <option value="" className="bg-dark-400">No Technician Assigned</option>
                                {filteredTechnicians.length === 0 ? (
                                    <option value="" disabled className="bg-dark-400">
                                        {selectedTeamId ? 'No technicians in selected team' : 'Select a team first'}
                                    </option>
                                ) : (
                                    filteredTechnicians.map((tech) => (
                                        <option key={tech._id} value={tech._id} className="bg-dark-400">
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
                        <div className="p-3 bg-dark-300 border border-gray-700 rounded-lg">
                            <p className="text-xs text-gray-400">
                                <span className="font-semibold text-gray-300">Current Team:</span>{' '}
                                {request.maintenanceTeamId?.name || 'Not assigned'}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                                <span className="font-semibold text-gray-300">Current Technician:</span>{' '}
                                {request.assignedTechnicianId?.name || 'Not assigned'}
                            </p>
                        </div>
                    </div>
                )}

                <div className="flex gap-3 pt-4 mt-4 border-t border-gray-700">
                    <button
                        onClick={onClose}
                        disabled={updating}
                        className="flex-1 bg-dark-300 border border-gray-600 text-gray-300 py-2 px-4 rounded-lg hover:bg-dark-200 hover:border-gray-500 transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleUpdate}
                        disabled={updating || loading || !selectedTeamId}
                        className="flex-1 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white py-2 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {updating ? 'Updating...' : 'Update'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditRequestModal;

