import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Building2, Plus, Edit3, Trash2, Activity } from 'lucide-react';
import { toast } from 'sonner';
import { workcenterAPI } from '../api/workcenters';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { LoadingScreen } from '../components/ui/Loading';
import { EmptyState } from '../components/ui/EmptyState';
import { StatusBadge } from '../components/ui/Badge';

const WorkCenters = () => {
    const { hasRole } = useAuth();
    const isManager = hasRole(['MANAGER']);
    const [workcenters, setWorkcenters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedWorkcenter, setSelectedWorkcenter] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        tag: '',
        costPerHour: 0,
        capacityTimeEfficiency: 100,
        oeeTarget: 85,
        status: 'ACTIVE'
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchWorkcenters();
    }, []);

    const fetchWorkcenters = async () => {
        try {
            setLoading(true);
            const data = await workcenterAPI.getAll();
            setWorkcenters(data);
        } catch (err) {
            console.error('Failed to fetch work centers:', err);
            toast.error('Failed to load work centers');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            if (selectedWorkcenter) {
                await workcenterAPI.update(selectedWorkcenter._id, formData);
                toast.success('Work center updated successfully!');
            } else {
                await workcenterAPI.create(formData);
                toast.success('Work center created successfully!');
            }
            fetchWorkcenters();
            handleCloseModal();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save work center');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this work center?')) return;

        try {
            await workcenterAPI.delete(id);
            toast.success('Work center deleted successfully!');
            fetchWorkcenters();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete work center');
        }
    };

    const handleOpenModal = (workcenter = null) => {
        setSelectedWorkcenter(workcenter);
        setFormData(workcenter || {
            name: '',
            code: '',
            tag: '',
            costPerHour: 0,
            capacityTimeEfficiency: 100,
            oeeTarget: 85,
            status: 'ACTIVE'
        });
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedWorkcenter(null);
    };

    if (loading) {
        return <LoadingScreen message="Loading work centers..." />;
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
                        <Building2 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-bold text-white">Work Centers</h1>
                        <p className="text-gray-400 mt-1">Manage facility work centers</p>
                    </div>
                </div>
                {isManager && (
                    <Button onClick={() => handleOpenModal()} icon={Plus} size="lg">
                        Create Work Center
                    </Button>
                )}
            </motion.div>

            {/* Work Centers Grid */}
            {workcenters.length === 0 ? (
                <EmptyState
                    icon={Building2}
                    title="No work centers found"
                    description="Get started by creating your first work center"
                    action={isManager ? { label: 'Create Work Center', onClick: () => handleOpenModal() } : undefined}
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {workcenters.map((wc, index) => (
                        <motion.div
                            key={wc._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Card hoverable>
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-3 rounded-xl bg-purple-500/20">
                                                <Building2 className="w-6 h-6 text-purple-400" />
                                            </div>
                                            <StatusBadge status={wc.status} size="sm" />
                                        </div>
                                        {isManager && (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleOpenModal(wc)}
                                                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                                                >
                                                    <Edit3 className="w-4 h-4 text-blue-400" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(wc._id)}
                                                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4 text-red-400" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    <h3 className="text-xl font-semibold text-white mb-1">{wc.name}</h3>
                                    <p className="text-sm text-gray-400 mb-4">Code: {wc.code}</p>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-400">Cost/Hour:</span>
                                            <span className="text-white font-medium">${wc.costPerHour}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-400">Efficiency:</span>
                                            <span className="text-white font-medium">{wc.capacityTimeEfficiency}%</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-400">OEE Target:</span>
                                            <span className="text-white font-medium">{wc.oeeTarget}%</span>
                                        </div>
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
                title={selectedWorkcenter ? 'Edit Work Center' : 'Create New Work Center'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Work Center Name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Enter name"
                        required
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Code"
                            value={formData.code}
                            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                            placeholder="WC-001"
                            required
                        />
                        <Input
                            label="Tag"
                            value={formData.tag}
                            onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                            placeholder="Optional tag"
                        />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <Input
                            label="Cost/Hour ($)"
                            type="number"
                            value={formData.costPerHour}
                            onChange={(e) => setFormData({ ...formData, costPerHour: Number(e.target.value) })}
                            min="0"
                        />
                        <Input
                            label="Efficiency (%)"
                            type="number"
                            value={formData.capacityTimeEfficiency}
                            onChange={(e) => setFormData({ ...formData, capacityTimeEfficiency: Number(e.target.value) })}
                            min="0"
                            max="100"
                        />
                        <Input
                            label="OEE Target (%)"
                            type="number"
                            value={formData.oeeTarget}
                            onChange={(e) => setFormData({ ...formData, oeeTarget: Number(e.target.value) })}
                            min="0"
                            max="100"
                        />
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="ghost" onClick={handleCloseModal}>
                            Cancel
                        </Button>
                        <Button type="submit" loading={submitting}>
                            {selectedWorkcenter ? 'Update' : 'Create'} Work Center
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default WorkCenters;
