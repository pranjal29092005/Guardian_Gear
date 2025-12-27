import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Plus, Edit3, Trash2, User, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { teamAPI } from '../api/teams';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { LoadingScreen, SkeletonTable } from '../components/ui/Loading';
import { EmptyState } from '../components/ui/EmptyState';
import ManageMembersModal from '../components/ManageMembersModal';

const Teams = () => {
    const { hasRole } = useAuth();
    const isManager = hasRole(['MANAGER']);
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingTeam, setEditingTeam] = useState(null);
    const [formData, setFormData] = useState({ name: '', description: '' });
    const [submitting, setSubmitting] = useState(false);
    const [showMembersModal, setShowMembersModal] = useState(false);
    const [selectedTeam, setSelectedTeam] = useState(null);

    useEffect(() => {
        fetchTeams();
    }, []);

    const fetchTeams = async () => {
        try {
            setLoading(true);
            const data = await teamAPI.getAll();
            setTeams(data);
        } catch (err) {
            console.error('Failed to fetch teams:', err);
            toast.error('Failed to load teams');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            if (editingTeam) {
                await teamAPI.update(editingTeam._id, formData);
                toast.success('Team updated successfully!');
            } else {
                await teamAPI.create(formData);
                toast.success('Team created successfully!');
            }
            fetchTeams();
            handleCloseModal();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save team');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this team?')) return;

        try {
            await teamAPI.delete(id);
            toast.success('Team deleted successfully!');
            fetchTeams();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete team');
        }
    };

    const handleOpenModal = (team = null) => {
        setEditingTeam(team);
        setFormData(team ? { name: team.name, description: team.description || '' } : { name: '', description: '' });
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingTeam(null);
        setFormData({ name: '', description: '' });
    };

    const handleManageMembers = (team) => {
        setSelectedTeam(team);
        setShowMembersModal(true);
    };

    if (loading) {
        return <LoadingScreen message="Loading teams..." />;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between"
            >
                <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 shadow-glow">
                        <Users className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-bold text-white">Maintenance Teams</h1>
                        <p className="text-gray-400 mt-1">Manage your maintenance teams</p>
                    </div>
                </div>
                {isManager && (
                    <Button onClick={() => handleOpenModal()} icon={Plus} size="lg">
                        Create Team
                    </Button>
                )}
            </motion.div>

            {/* Teams Grid */}
            {teams.length === 0 ? (
                <EmptyState
                    icon={Users}
                    title="No teams found"
                    description="Get started by creating your first maintenance team"
                    action={isManager ? { label: 'Create Team', onClick: () => handleOpenModal() } : undefined}
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {teams.map((team, index) => (
                        <motion.div
                            key={team._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Card hoverable>
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="p-3 rounded-xl bg-primary-500/20">
                                            <Users className="w-6 h-6 text-primary-400" />
                                        </div>
                                        {isManager && (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleManageMembers(team)}
                                                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                                                    title="Manage Members"
                                                >
                                                    <UserPlus className="w-4 h-4 text-green-400" />
                                                </button>
                                                <button
                                                    onClick={() => handleOpenModal(team)}
                                                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                                                >
                                                    <Edit3 className="w-4 h-4 text-blue-400" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(team._id)}
                                                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4 text-red-400" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    <h3 className="text-xl font-semibold text-white mb-2">{team.name}</h3>
                                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                                        {team.description || 'No description provided'}
                                    </p>
                                    <div className="flex items-center gap-2 text-sm text-gray-400">
                                        <User className="w-4 h-4" />
                                        <span>{team.members?.length || 0} members</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Create/Edit Modal */}
            <Modal
                isOpen={showModal}
                onClose={handleCloseModal}
                title={editingTeam ? 'Edit Team' : 'Create New Team'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Team Name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Enter team name"
                        required
                    />
                    <Input
                        label="Description"
                        as="textarea"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Enter team description (optional)"
                        rows={3}
                    />
                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="ghost" onClick={handleCloseModal}>
                            Cancel
                        </Button>
                        <Button type="submit" loading={submitting}>
                            {editingTeam ? 'Update' : 'Create'} Team
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Manage Members Modal */}
            <ManageMembersModal
                isOpen={showMembersModal}
                onClose={() => setShowMembersModal(false)}
                team={selectedTeam}
                onSuccess={fetchTeams}
            />
        </div>
    );
};

export default Teams;
