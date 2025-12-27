import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FolderOpen, Plus, Edit3, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { categoryAPI } from '../api/categories';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { LoadingScreen } from '../components/ui/Loading';
import { EmptyState } from '../components/ui/EmptyState';

const Categories = () => {
    const { hasRole } = useAuth();
    const isManager = hasRole(['MANAGER']);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [formData, setFormData] = useState({ name: '', description: '' });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const data = await categoryAPI.getAll();
            setCategories(data);
        } catch (err) {
            console.error('Failed to fetch categories:', err);
            toast.error('Failed to load categories');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            if (editingCategory) {
                await categoryAPI.update(editingCategory._id, formData);
                toast.success('Category updated successfully!');
            } else {
                await categoryAPI.create(formData);
                toast.success('Category created successfully!');
            }
            fetchCategories();
            handleCloseModal();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save category');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this category?')) return;

        try {
            await categoryAPI.delete(id);
            toast.success('Category deleted successfully!');
            fetchCategories();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete category');
        }
    };

    const handleOpenModal = (category = null) => {
        setEditingCategory(category);
        setFormData(category ? { name: category.name, description: category.description || '' } : { name: '', description: '' });
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingCategory(null);
        setFormData({ name: '', description: '' });
    };

    if (loading) {
        return <LoadingScreen message="Loading categories..." />;
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
                        <FolderOpen className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-bold text-white">Equipment Categories</h1>
                        <p className="text-gray-400 mt-1">Organize equipment by categories</p>
                    </div>
                </div>
                {isManager && (
                    <Button onClick={() => handleOpenModal()} icon={Plus} size="lg">
                        Create Category
                    </Button>
                )}
            </motion.div>

            {/* Categories Grid */}
            {categories.length === 0 ? (
                <EmptyState
                    icon={FolderOpen}
                    title="No categories found"
                    description="Get started by creating your first equipment category"
                    action={isManager ? { label: 'Create Category', onClick: () => handleOpenModal() } : undefined}
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categories.map((category, index) => (
                        <motion.div
                            key={category._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Card hoverable>
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="p-3 rounded-xl bg-orange-500/20">
                                            <FolderOpen className="w-6 h-6 text-orange-400" />
                                        </div>
                                        {isManager && (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleOpenModal(category)}
                                                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                                                >
                                                    <Edit3 className="w-4 h-4 text-blue-400" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(category._id)}
                                                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4 text-red-400" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    <h3 className="text-xl font-semibold text-white mb-2">{category.name}</h3>
                                    <p className="text-gray-400 text-sm line-clamp-2">
                                        {category.description || 'No description provided'}
                                    </p>
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
                title={editingCategory ? 'Edit Category' : 'Create New Category'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Category Name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Enter category name"
                        required
                    />
                    <Input
                        label="Description"
                        as="textarea"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Enter category description (optional)"
                        rows={3}
                    />
                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="ghost" onClick={handleCloseModal}>
                            Cancel
                        </Button>
                        <Button type="submit" loading={submitting}>
                            {editingCategory ? 'Update' : 'Create'} Category
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Categories;
