import { useState, useEffect } from 'react';
import { workcenterAPI } from '../api/workcenters';
import { useAuth } from '../contexts/AuthContext';
import { AddIcon, EditIcon, DeleteIcon, SaveIcon } from '../components/Icons';

const WorkCenters = () => {
    const { hasRole } = useAuth();
    const isManager = hasRole(['MANAGER']);
    const [workcenters, setWorkcenters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selectedWorkcenter, setSelectedWorkcenter] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        tag: '',
        alternativeWorkcenters: [],
        costPerHour: 0,
        capacityTimeEfficiency: 100,
        oeeTarget: 85,
        status: 'ACTIVE'
    });
    const [error, setError] = useState('');

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
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setError('');

        try {
            await workcenterAPI.create(formData);
            fetchWorkcenters();
            handleCloseModal();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create work center');
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setError('');

        try {
            await workcenterAPI.update(selectedWorkcenter._id, formData);
            fetchWorkcenters();
            handleCloseModal();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update work center');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this work center?')) {
            return;
        }

        try {
            await workcenterAPI.delete(id);
            fetchWorkcenters();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to delete work center');
        }
    };

    const handleOpenCreateModal = () => {
        setEditMode(false);
        setSelectedWorkcenter(null);
        setFormData({
            name: '',
            code: '',
            tag: '',
            alternativeWorkcenters: [],
            costPerHour: 0,
            capacityTimeEfficiency: 100,
            oeeTarget: 85,
            status: 'ACTIVE'
        });
        setError('');
        setShowModal(true);
    };

    const handleOpenEditModal = (workcenter) => {
        setEditMode(true);
        setSelectedWorkcenter(workcenter);
        setFormData({
            name: workcenter.name,
            code: workcenter.code,
            tag: workcenter.tag || '',
            alternativeWorkcenters: workcenter.alternativeWorkcenters?.map(wc => wc._id) || [],
            costPerHour: workcenter.costPerHour || 0,
            capacityTimeEfficiency: workcenter.capacityTimeEfficiency || 100,
            oeeTarget: workcenter.oeeTarget || 85,
            status: workcenter.status
        });
        setError('');
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditMode(false);
        setSelectedWorkcenter(null);
        setError('');
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAlternativeWCChange = (e) => {
        const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
        setFormData(prev => ({
            ...prev,
            alternativeWorkcenters: selectedOptions
        }));
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'ACTIVE': return 'bg-green-100 text-green-800';
            case 'MAINTENANCE': return 'bg-red-100 text-red-800';
            case 'INACTIVE': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return <div className="text-center py-12">Loading...</div>;
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Work Centers</h1>
                {isManager && (
                    <button
                        onClick={handleOpenCreateModal}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                        <AddIcon className="w-5 h-5" />
                        Add Work Center
                    </button>
                )}
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Code
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Tag
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Cost/Hour
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Capacity %
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                OEE Target
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            {isManager && (
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {workcenters.map((wc) => (
                            <tr key={wc._id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {wc.name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                    {wc.code}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                    {wc.tag || '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                    ${wc.costPerHour}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                    {wc.capacityTimeEfficiency}%
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                    {wc.oeeTarget}%
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(wc.status)}`}>
                                        {wc.status}
                                    </span>
                                </td>
                                {isManager && (
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleOpenEditModal(wc)}
                                                className="text-blue-600 hover:text-blue-900 p-1"
                                                title="Edit"
                                            >
                                                <EditIcon className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(wc._id)}
                                                className="text-red-600 hover:text-red-900 p-1"
                                                title="Delete"
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

                {workcenters.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        No work centers found. {isManager && 'Click "Add Work Center" to create one.'}
                    </div>
                )}
            </div>

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">
                            {editMode ? 'Edit Work Center' : 'Create Work Center'}
                        </h2>

                        {error && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
                                {error}
                            </div>
                        )}

                        <form onSubmit={editMode ? handleUpdate : handleCreate}>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Name *
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Code *
                                    </label>
                                    <input
                                        type="text"
                                        name="code"
                                        value={formData.code}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 uppercase"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Tag
                                    </label>
                                    <input
                                        type="text"
                                        name="tag"
                                        value={formData.tag}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Cost per Hour
                                    </label>
                                    <input
                                        type="number"
                                        name="costPerHour"
                                        value={formData.costPerHour}
                                        onChange={handleChange}
                                        min="0"
                                        step="0.01"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Capacity Time Efficiency (%)
                                    </label>
                                    <input
                                        type="number"
                                        name="capacityTimeEfficiency"
                                        value={formData.capacityTimeEfficiency}
                                        onChange={handleChange}
                                        min="0"
                                        max="100"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        OEE Target (%)
                                    </label>
                                    <input
                                        type="number"
                                        name="oeeTarget"
                                        value={formData.oeeTarget}
                                        onChange={handleChange}
                                        min="0"
                                        max="100"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Status
                                    </label>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="ACTIVE">ACTIVE</option>
                                        <option value="INACTIVE">INACTIVE</option>
                                        <option value="MAINTENANCE">MAINTENANCE</option>
                                    </select>
                                </div>

                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Alternative Work Centers
                                    </label>
                                    <select
                                        multiple
                                        name="alternativeWorkcenters"
                                        value={formData.alternativeWorkcenters}
                                        onChange={handleAlternativeWCChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        size="4"
                                    >
                                        {workcenters
                                            .filter(wc => !selectedWorkcenter || wc._id !== selectedWorkcenter._id)
                                            .map(wc => (
                                                <option key={wc._id} value={wc._id}>
                                                    {wc.name} ({wc.code})
                                                </option>
                                            ))}
                                    </select>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Hold Ctrl/Cmd to select multiple
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4 mt-4 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
                                >
                                    <SaveIcon className="w-5 h-5" />
                                    {editMode ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WorkCenters;
