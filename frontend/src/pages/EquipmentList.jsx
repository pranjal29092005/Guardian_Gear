import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { equipmentAPI } from '../api/equipment';
import { categoryAPI } from '../api/categories';
import { teamAPI } from '../api/teams';
import { workcenterAPI } from '../api/workcenters';
import { useAuth } from '../contexts/AuthContext';
import { EquipmentIcon, AddIcon, EditIcon, ViewIcon, DeleteIcon, SaveIcon, WrenchIcon } from '../components/Icons';

const SearchIcon = ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
);

const EquipmentList = () => {
    const { hasRole } = useAuth();
    const [equipment, setEquipment] = useState([]);
    const [categories, setCategories] = useState([]);
    const [teams, setTeams] = useState([]);
    const [workcenters, setWorkcenters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedEquipment, setSelectedEquipment] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        serialNumber: '',
        category: '',
        department: '',
        ownerEmployeeName: '',
        purchaseDate: '',
        warrantyUntil: '',
        location: '',
        company: '',
        assignedDate: '',
        scrapDate: '',
        workCenterId: '',
        description: '',
        technician: '',
        defaultMaintenanceTeamId: '',
        status: 'ACTIVE'
    });
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchEquipment();
        fetchCategories();
        fetchTeams();
        fetchWorkcenters();
    }, []);

    const fetchEquipment = async () => {
        try {
            setLoading(true);
            console.log('[EquipmentList] Fetching all equipment...');
            const data = await equipmentAPI.getAll();
            console.log('[EquipmentList] Equipment data received:', data);
            console.log('[EquipmentList] Total equipment count:', data.length);
            if (data.length > 0) {
                console.log('[EquipmentList] Sample equipment item:', data[0]);
            }
            setEquipment(data);
        } catch (err) {
            console.error('[EquipmentList] Failed to fetch equipment:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const data = await categoryAPI.getAll();
            setCategories(data);
        } catch (err) {
            console.error('Failed to fetch categories:', err);
        }
    };

    const fetchTeams = async () => {
        try {
            const data = await teamAPI.getAll();
            setTeams(data);
        } catch (err) {
            console.error('Failed to fetch teams:', err);
        }
    };

    const fetchWorkcenters = async () => {
        try {
            const data = await workcenterAPI.getAll();
            setWorkcenters(data);
        } catch (err) {
            console.error('Failed to fetch workcenters:', err);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setError('');

        try {
            // Format data: convert empty date strings to null, ensure purchaseDate exists
            const submitData = {
                ...formData,
                purchaseDate: formData.purchaseDate || formData.assignedDate || new Date().toISOString().split('T')[0],
                assignedDate: formData.assignedDate || null,
                scrapDate: formData.scrapDate || null,
                warrantyUntil: formData.warrantyUntil || null,
                workCenterId: formData.workCenterId || null,
            };
            await equipmentAPI.create(submitData);
            fetchEquipment();
            handleCloseCreateModal();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create equipment');
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setError('');

        try {
            // Format data: convert empty date strings to null
            const submitData = {
                ...formData,
                assignedDate: formData.assignedDate || null,
                scrapDate: formData.scrapDate || null,
                warrantyUntil: formData.warrantyUntil || null,
                workCenterId: formData.workCenterId || null,
            };
            await equipmentAPI.update(selectedEquipment._id, submitData);
            fetchEquipment();
            handleCloseEditModal();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update equipment');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this equipment?')) {
            return;
        }

        try {
            await equipmentAPI.delete(id);
            fetchEquipment();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to delete equipment');
        }
    };

    const handleOpenCreateModal = () => {
        setFormData({
            name: '',
            serialNumber: '',
            category: '',
            department: '',
            ownerEmployeeName: '',
            purchaseDate: '',
            warrantyUntil: '',
            location: '',
            company: '',
            assignedDate: '',
            scrapDate: '',
            workCenterId: '',
            description: '',
            technician: '',
            defaultMaintenanceTeamId: '',
            status: 'ACTIVE'
        });
        setShowCreateModal(true);
    };

    const handleCloseCreateModal = () => {
        setShowCreateModal(false);
        setError('');
    };

    const handleOpenEditModal = (equip) => {
        setSelectedEquipment(equip);
        setFormData({
            name: equip.name,
            serialNumber: equip.serialNumber,
            category: equip.category,
            department: equip.department,
            ownerEmployeeName: equip.ownerEmployeeName,
            purchaseDate: equip.purchaseDate?.split('T')[0] || '',
            warrantyUntil: equip.warrantyUntil?.split('T')[0] || '',
            location: equip.location,
            company: equip.company || '',
            assignedDate: equip.assignedDate?.split('T')[0] || '',
            scrapDate: equip.scrapDate?.split('T')[0] || '',
            workCenterId: equip.workCenterId?._id || equip.workCenterId || '',
            description: equip.description || '',
            technician: equip.technician || '',
            defaultMaintenanceTeamId: equip.defaultMaintenanceTeamId?._id || equip.defaultMaintenanceTeamId || '',
            status: equip.status || 'ACTIVE'
        });
        setShowEditModal(true);
    };

    const handleCloseEditModal = () => {
        setShowEditModal(false);
        setSelectedEquipment(null);
        setError('');
    };

    const handleOpenViewModal = (equip) => {
        setSelectedEquipment(equip);
        setShowViewModal(true);
    };

    const handleCloseViewModal = () => {
        setShowViewModal(false);
        setSelectedEquipment(null);
    };

    const isManager = hasRole(['MANAGER']);

    // Filter equipment based on search query
    const filteredEquipment = equipment.filter(item => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            item.name?.toLowerCase().includes(query) ||
            item.serialNumber?.toLowerCase().includes(query) ||
            item.category?.toLowerCase().includes(query) ||
            item.department?.toLowerCase().includes(query) ||
            item.ownerEmployeeName?.toLowerCase().includes(query) ||
            item.location?.toLowerCase().includes(query) ||
            item.defaultMaintenanceTeamId?.name?.toLowerCase().includes(query)
        );
    });

    if (loading) {
        return <div className="text-center py-12">Loading...</div>;
    }

    return (
        <div>
            <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                        <EquipmentIcon className="w-8 h-8 text-blue-600" />
                        Equipment
                    </h1>
                    {isManager && (
                        <button
                            onClick={handleOpenCreateModal}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                        >
                            <AddIcon className="w-5 h-5" />
                            New
                        </button>
                    )}
                </div>
                {/* Search Bar */}
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <SearchIcon className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Q Search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Equipment Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Employee
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Department
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Serial Number
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Technician
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Equipment Category
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Company
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredEquipment.map((item) => (
                            <tr key={item._id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <Link
                                        to={`/equipment/${item._id}`}
                                        className="text-sm font-medium text-blue-600 hover:text-blue-900"
                                    >
                                        {item.name}
                                    </Link>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 py-1 text-xs font-medium rounded ${
                                        item.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                                        item.status === 'DAMAGED' ? 'bg-orange-100 text-orange-800' :
                                        item.status === 'UNDER_MAINTENANCE' ? 'bg-yellow-100 text-yellow-800' :
                                        item.status === 'SCRAP' ? 'bg-red-100 text-red-800' :
                                        'bg-gray-100 text-gray-800'
                                    }`}>
                                        {item.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                    {item.ownerEmployeeName || '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                    {item.department}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                    {item.serialNumber}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                    {item.defaultMaintenanceTeamId?.name || '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                    {item.category}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                    {item.location || '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            onClick={() => handleOpenViewModal(item)}
                                            className="text-gray-600 hover:text-gray-900 p-1"
                                            title="View"
                                        >
                                            <ViewIcon className="w-4 h-4" />
                                        </button>
                                        {isManager && (
                                            <>
                                                <button
                                                    onClick={() => handleOpenEditModal(item)}
                                                    className="text-blue-600 hover:text-blue-900 p-1"
                                                    title="Edit"
                                                >
                                                    <EditIcon className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(item._id)}
                                                    className="text-red-600 hover:text-red-900 p-1"
                                                    title="Delete"
                                                >
                                                    <DeleteIcon className="w-4 h-4" />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {filteredEquipment.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        {searchQuery ? 'No equipment found matching your search.' : 'No equipment found. '}
                        {isManager && !searchQuery && 'Click "New" to add one.'}
                    </div>
                )}
            </div>

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full p-6 max-h-[90vh] overflow-y-auto">
                        {/* Tabs */}
                        <div className="flex items-center gap-4 mb-6 border-b border-gray-200">
                            <button
                                type="button"
                                className="px-4 py-2 text-sm font-medium text-blue-600 border-b-2 border-blue-600"
                            >
                                New
                            </button>
                            <button
                                type="button"
                                onClick={handleCloseCreateModal}
                                className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700"
                            >
                                Equipment
                            </button>
                        </div>

                        {/* Maintenance Smart Button */}
                        <div className="mb-6 flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-gray-900">New Equipment</h2>
                            <button
                                type="button"
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                                title="Clicking this button opens a list of all requests related only to this specific machine"
                            >
                                <WrenchIcon className="w-5 h-5" />
                                Maintenance (0)
                            </button>
                        </div>

                        <form onSubmit={handleCreate} className="space-y-4">
                            {error && (
                                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded">
                                    {error}
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-6">
                                {/* Left Column */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Name
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
                                            Equipment Category
                                        </label>
                                        <select
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            required
                                        >
                                            <option value="">Select Category</option>
                                            {categories.map(cat => (
                                                <option key={cat._id} value={cat.name}>{cat.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Company
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.company}
                                            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Used By
                                        </label>
                                        <select
                                            value={formData.ownerEmployeeName}
                                            onChange={(e) => setFormData({ ...formData, ownerEmployeeName: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="">Select Employee</option>
                                            <option value="Employee">Employee</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Maintenance Team
                                        </label>
                                        <select
                                            value={formData.defaultMaintenanceTeamId}
                                            onChange={(e) => setFormData({ ...formData, defaultMaintenanceTeamId: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            required
                                        >
                                            <option value="">Select Team</option>
                                            {teams.map(team => (
                                                <option key={team._id} value={team._id}>{team.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Assigned Date
                                        </label>
                                        <input
                                            type="date"
                                            value={formData.assignedDate}
                                            onChange={(e) => setFormData({ ...formData, assignedDate: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Description
                                        </label>
                                        <textarea
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            rows={4}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                {/* Right Column */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Technician
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.technician}
                                            onChange={(e) => setFormData({ ...formData, technician: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Employee
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.ownerEmployeeName}
                                            onChange={(e) => setFormData({ ...formData, ownerEmployeeName: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Scrap Date
                                        </label>
                                        <input
                                            type="date"
                                            value={formData.scrapDate}
                                            onChange={(e) => setFormData({ ...formData, scrapDate: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Used in location
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.location}
                                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Work Center
                                        </label>
                                        <select
                                            value={formData.workCenterId}
                                            onChange={(e) => setFormData({ ...formData, workCenterId: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="">Select Work Center</option>
                                            {workcenters.map(wc => (
                                                <option key={wc._id} value={wc._id}>{wc.name} ({wc.code})</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Additional required fields */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Serial Number *
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.serialNumber}
                                            onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Department *
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.department}
                                            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    <SaveIcon className="w-5 h-5" />
                                    Create
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCloseCreateModal}
                                    className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Modal - Same form structure */}
            {showEditModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Edit Equipment</h2>

                        <form onSubmit={handleUpdate} className="space-y-4">
                            {error && (
                                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded">
                                    {error}
                                </div>
                            )}

                            {/* Same form fields as create */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Serial Number *</label>
                                    <input
                                        type="text"
                                        value={formData.serialNumber}
                                        onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                        required
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map(cat => (
                                            <option key={cat._id} value={cat.name}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Department *</label>
                                    <input
                                        type="text"
                                        value={formData.department}
                                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Owner/Employee</label>
                                    <input
                                        type="text"
                                        value={formData.ownerEmployeeName}
                                        onChange={(e) => setFormData({ ...formData, ownerEmployeeName: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
                                    <input
                                        type="text"
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Purchase Date</label>
                                    <input
                                        type="date"
                                        value={formData.purchaseDate}
                                        onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Warranty Until</label>
                                    <input
                                        type="date"
                                        value={formData.warrantyUntil}
                                        onChange={(e) => setFormData({ ...formData, warrantyUntil: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Maintenance Team</label>
                                    <select
                                        value={formData.defaultMaintenanceTeamId}
                                        onChange={(e) => setFormData({ ...formData, defaultMaintenanceTeamId: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    >
                                        <option value="">Select Team</option>
                                        {teams.map(team => (
                                            <option key={team._id} value={team._id}>{team.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    >
                                        <option value="ACTIVE">Active</option>
                                        <option value="UNDER_MAINTENANCE">Under Maintenance</option>
                                        <option value="SCRAP">Scrap</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
                                >
                                    <SaveIcon className="w-5 h-5" />
                                    Update
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCloseEditModal}
                                    className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* View Modal */}
            {showViewModal && selectedEquipment && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full p-8 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-bold text-gray-900">Equipment</h2>
                            <button
                                onClick={handleCloseViewModal}
                                className="text-gray-400 hover:text-gray-600 text-3xl font-bold"
                            >
                                ×
                            </button>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-8">
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">Name</label>
                                        <p className="text-gray-900">{selectedEquipment.name}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">Serial Number</label>
                                        <p className="text-gray-900">{selectedEquipment.serialNumber}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">Category</label>
                                        <p className="text-gray-900">{selectedEquipment.category}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">Department</label>
                                        <p className="text-gray-900">{selectedEquipment.department}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">Owner/Employee</label>
                                        <p className="text-gray-900">{selectedEquipment.ownerEmployeeName || '-'}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">Location</label>
                                        <p className="text-gray-900">{selectedEquipment.location}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">Purchase Date</label>
                                        <p className="text-gray-900">
                                            {selectedEquipment.purchaseDate ? new Date(selectedEquipment.purchaseDate).toLocaleDateString() : '-'}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">Warranty Until</label>
                                        <p className="text-gray-900">
                                            {selectedEquipment.warrantyUntil ? new Date(selectedEquipment.warrantyUntil).toLocaleDateString() : '-'}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">Maintenance Team</label>
                                        <p className="text-gray-900">
                                            {selectedEquipment.defaultMaintenanceTeamId?.name || '-'}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">Status</label>
                                        <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${
                                            selectedEquipment.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                                            selectedEquipment.status === 'DAMAGED' ? 'bg-orange-100 text-orange-800' :
                                            selectedEquipment.status === 'UNDER_MAINTENANCE' ? 'bg-yellow-100 text-yellow-800' :
                                            selectedEquipment.status === 'SCRAP' ? 'bg-red-100 text-red-800' :
                                            'bg-gray-100 text-gray-800'
                                        }`}>
                                            {selectedEquipment.status}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-6 mt-6 border-t border-gray-200">
                                <button
                                    onClick={handleCloseViewModal}
                                    className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            </div>
        );
};

            export default EquipmentList;
