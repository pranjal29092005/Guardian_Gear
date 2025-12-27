import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, UserPlus, UserMinus, Search } from 'lucide-react';
import { toast } from 'sonner';
import { teamAPI } from '../api/teams';
import { userAPI } from '../api/user';

const ManageMembersModal = ({ isOpen, onClose, team, onSuccess }) => {
    const [allUsers, setAllUsers] = useState([]);
    const [teamMembers, setTeamMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        if (isOpen && team) {
            fetchData();
        }
    }, [isOpen, team]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [usersData, teamData] = await Promise.all([
                userAPI.getAllUsers(),
                teamAPI.getById(team._id)
            ]);
            setAllUsers(usersData);
            setTeamMembers(teamData.members || []);
        } catch (err) {
            console.error('Failed to fetch data:', err);
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const handleAddMember = async (userId) => {
        try {
            setUpdating(true);
            await teamAPI.addMember(team._id, userId);
            toast.success('Member added successfully!');
            fetchData();
            onSuccess();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to add member');
        } finally {
            setUpdating(false);
        }
    };

    const handleRemoveMember = async (userId) => {
        if (!confirm('Are you sure you want to remove this member from the team?')) return;

        try {
            setUpdating(true);
            await teamAPI.removeMember(team._id, userId);
            toast.success('Member removed successfully!');
            fetchData();
            onSuccess();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to remove member');
        } finally {
            setUpdating(false);
        }
    };

    const isMember = (userId) => {
        return teamMembers.some(member => member._id === userId);
    };

    const filteredUsers = allUsers.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!isOpen || !team) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-dark-400 border border-gray-700 rounded-lg shadow-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden"
            >
                {/* Header */}
                <div className="p-6 border-b border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-white">Manage Team Members</h2>
                            <p className="text-gray-400 mt-1">{team.name}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-400" />
                        </button>
                    </div>

                    {/* Search */}
                    <div className="mt-4 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search users by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-3 py-2 bg-dark-300 border border-gray-600 text-white placeholder-gray-500 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(85vh-200px)]">
                    {loading ? (
                        <div className="text-center py-12 text-gray-400">Loading users...</div>
                    ) : (
                        <div className="space-y-2">
                            {filteredUsers.length === 0 ? (
                                <div className="text-center py-12 text-gray-400">
                                    No users found
                                </div>
                            ) : (
                                filteredUsers.map((user) => {
                                    const isTeamMember = isMember(user._id);
                                    return (
                                        <motion.div
                                            key={user._id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
                                                isTeamMember
                                                    ? 'bg-primary-500/10 border-primary-500/30'
                                                    : 'bg-dark-300 border-gray-700 hover:border-gray-600'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3 flex-1">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                                                    isTeamMember
                                                        ? 'bg-primary-500/20 text-primary-400'
                                                        : 'bg-gray-700 text-gray-400'
                                                }`}>
                                                    {user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="font-medium text-white">{user.name}</h3>
                                                    <p className="text-sm text-gray-400">{user.email}</p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-xs px-2 py-0.5 rounded bg-gray-700 text-gray-300">
                                                            {user.role}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => isTeamMember ? handleRemoveMember(user._id) : handleAddMember(user._id)}
                                                disabled={updating}
                                                className={`ml-4 px-4 py-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ${
                                                    isTeamMember
                                                        ? 'bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30'
                                                        : 'bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white'
                                                }`}
                                            >
                                                {isTeamMember ? (
                                                    <>
                                                        <UserMinus className="w-4 h-4" />
                                                        Remove
                                                    </>
                                                ) : (
                                                    <>
                                                        <UserPlus className="w-4 h-4" />
                                                        Add
                                                    </>
                                                )}
                                            </button>
                                        </motion.div>
                                    );
                                })
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-700">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-400">
                            {teamMembers.length} member{teamMembers.length !== 1 ? 's' : ''} in this team
                        </p>
                        <button
                            onClick={onClose}
                            className="px-6 py-2 bg-dark-300 border border-gray-600 text-gray-300 rounded-lg hover:bg-dark-200 hover:border-gray-500 transition-colors"
                        >
                            Done
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default ManageMembersModal;
