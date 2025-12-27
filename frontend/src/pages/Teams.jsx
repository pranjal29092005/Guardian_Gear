import { useState, useEffect } from 'react';
import { teamAPI } from '../api/teams';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../api/client';
import { TeamIcon, AddIcon, EditIcon, DeleteIcon, UserIcon, SaveIcon } from '../components/Icons';

const Teams = () => {
    const { hasRole } = useAuth();
    const [teams, setTeams] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showMemberModal, setShowMemberModal] = useState(false);
    const [editingTeam, setEditingTeam] = useState(null);
    const [managingTeam, setManagingTeam] = useState(null);
    const [formData, setFormData] = useState({ name: '', description: '' });
    const [error, setError] = useState('');

    useEffect(() => {
        fetchTeams();
        fetchUsers();
    }, []);

    const fetchTeams = async () => {
        try {
            setLoading(true);
            const data = await teamAPI.getAll();
            setTeams(data);
        } catch (err) {
            console.error('Failed to fetch teams:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await apiClient.get('/users');
            const techsAndManagers = response.data.data.filter(
                u => u.role === 'TECHNICIAN' || u.role === 'MANAGER'
            );
            setUsers(techsAndManagers);
        } catch (err) {
            console.error('Failed to fetch users:', err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            if (editingTeam) {
                await teamAPI.update(editingTeam._id, formData);
            } else {
                await teamAPI.create(formData);
            }

            fetchTeams();
            handleCloseModal();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save team');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this team?')) {
            return;
        }

        try {
            await teamAPI.delete(id);
            fetchTeams();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to delete team');
        }
    };

    const handleEdit = (team) => {
        setEditingTeam(team);
        setFormData({ name: team.name, description: team.description || '' });
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingTeam(null);
        setFormData({ name: '', description: '' });
        setError('');
    };

    const handleManageMembers = (team) => {
        setManagingTeam(team);
        setShowMemberModal(true);
    };

    const handleAddMember = async (userId) => {
        try {
            await teamAPI.addMember(managingTeam._id, userId);
            fetchTeams();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to add member');
        }
    };

    const handleRemoveMember = async (userId) => {
        try {
            await teamAPI.removeMember(managingTeam._id, userId);
            fetchTeams();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to remove member');
        }
    };

    const isManager = hasRole(['MANAGER']);

    if (loading) {
        return <div className="text-center py-12">Loading...</div>;
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                    <TeamIcon className="w-8 h-8 text-blue-600" />
                    Teams
                </h1>
                {isManager && (
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                        <AddIcon className="w-5 h-5" />
                        New
                    </button>
                )}
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Team Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Team Members
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Description
                            </th>
                            {isManager && (
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {teams.map((team) => (
                            <tr key={team._id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-2">
                                        <TeamIcon className="w-5 h-5 text-blue-600" />
                                        <span className="text-sm font-medium text-gray-900">{team.name}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    {team.memberIds && team.memberIds.length > 0 ? (
                                        <div className="space-y-1">
                                            {team.memberIds.map((member) => (
                                                <div key={member._id} className="text-sm text-gray-700 flex items-center gap-1">
                                                    <UserIcon className="w-3 h-3 text-gray-500" />
                                                    {member.name}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <span className="text-sm text-gray-400 italic">No members</span>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-sm text-gray-600">{team.description || '-'}</span>
                                </td>
                                {isManager && (
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleManageMembers(team)}
                                                className="text-sm text-blue-600 hover:text-blue-900 px-2 py-1 hover:bg-blue-50 rounded"
                                            >
                                                Manage
                                            </button>
                                            <button
                                                onClick={() => handleEdit(team)}
                                                className="text-blue-600 hover:text-blue-900 p-1"
                                            >
                                                <EditIcon className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(team._id)}
                                                className="text-red-600 hover:text-red-900 p-1"
                                            >
                                                <DeleteIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>

                {teams.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        No teams found. {isManager && 'Click "New" to create one.'}
                    </div>
                )}
            </div>

            {/* Create/Edit Team Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">
                            {editingTeam ? 'Edit Team' : 'New Team'}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && (
                                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded">
                                    {error}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Team Name *
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    <SaveIcon className="w-5 h-5" />
                                    {editingTeam ? 'Update' : 'Create'}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Member Management Modal */}
            {showMemberModal && managingTeam && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">
                            Manage Members - {managingTeam.name}
                        </h2>

                        <div className="space-y-6">
                            {/* Current Members */}
                            <div>
                                <h3 className="text-sm font-medium text-gray-700 mb-3">Current Members ({managingTeam.memberIds?.length || 0})</h3>
                                <div className="space-y-2">
                                    {managingTeam.memberIds && managingTeam.memberIds.length > 0 ? (
                                        managingTeam.memberIds.map((member) => (
                                            <div key={member._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                <div className="flex items-center gap-2">
                                                    <UserIcon className="w-5 h-5 text-gray-600" />
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">{member.name}</p>
                                                        <p className="text-xs text-gray-500">{member.email} - {member.role}</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleRemoveMember(member._id)}
                                                    className="text-red-600 hover:text-red-900 text-sm"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-gray-500">No members yet</p>
                                    )}
                                </div>
                            </div>

                            {/* Available Users */}
                            <div>
                                <h3 className="text-sm font-medium text-gray-700 mb-3">Add Members</h3>
                                <div className="space-y-2 max-h-64 overflow-y-auto">
                                    {users
                                        .filter(user => !managingTeam.memberIds?.some(m => m._id === user._id))
                                        .map((user) => (
                                            <div key={user._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                <div className="flex items-center gap-2">
                                                    <UserIcon className="w-5 h-5 text-gray-600" />
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">{user.name}</p>
                                                        <p className="text-xs text-gray-500">{user.email} - {user.role}</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleAddMember(user._id)}
                                                    className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                                                >
                                                    Add
                                                </button>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-6 mt-6 border-t border-gray-200">
                            <button
                                onClick={() => setShowMemberModal(false)}
                                className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Teams;
