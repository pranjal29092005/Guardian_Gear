import { useState, useEffect } from 'react';
import { Save, X, Wrench } from 'lucide-react';
import { categoryAPI } from '../api/categories';
import { teamAPI } from '../api/teams';
import { workcenterAPI } from '../api/workcenters';

const EquipmentModal = ({ isOpen, onClose, onSave, equipment = null, mode = 'create' }) => {
    const [categories, setCategories] = useState([]);
    const [teams, setTeams] = useState([]);
    const [workcenters, setWorkcenters] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
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

    useEffect(() => {
        if (isOpen) {
            fetchData();
            
            if (equipment && mode === 'edit') {
                setFormData({
                    name: equipment.name || '',
                    serialNumber: equipment.serialNumber || '',
                    category: equipment.category || '',
                    department: equipment.department || '',
                    ownerEmployeeName: equipment.ownerEmployeeName || '',
                    purchaseDate: equipment.purchaseDate ? equipment.purchaseDate.split('T')[0] : '',
                    warrantyUntil: equipment.warrantyUntil ? equipment.warrantyUntil.split('T')[0] : '',
                    location: equipment.location || '',
                    company: equipment.company || '',
                    assignedDate: equipment.assignedDate ? equipment.assignedDate.split('T')[0] : '',
                    scrapDate: equipment.scrapDate ? equipment.scrapDate.split('T')[0] : '',
                    workCenterId: equipment.workCenterId?._id || equipment.workCenterId || '',
                    description: equipment.description || '',
                    technician: equipment.technician || '',
                    defaultMaintenanceTeamId: equipment.defaultMaintenanceTeamId?._id || equipment.defaultMaintenanceTeamId || '',
                    status: equipment.status || 'ACTIVE'
                });
            } else {
                resetForm();
            }
        }
    }, [isOpen, equipment, mode]);

    const fetchData = async () => {
        try {
            const [catData, teamData, wcData] = await Promise.all([
                categoryAPI.getAll(),
                teamAPI.getAll(),
                workcenterAPI.getAll()
            ]);
            setCategories(catData);
            setTeams(teamData);
            setWorkcenters(wcData);
        } catch (err) {
            console.error('Failed to fetch data:', err);
        }
    };

    const resetForm = () => {
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
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await onSave(formData, equipment?._id);
            resetForm();
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || `Failed to ${mode} equipment`);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-dark-400 rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
                {/* Header */}
                <div className="p-6 border-b border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-2xl font-bold text-white">
                                {mode === 'create' ? 'New Equipment' : 'Edit Equipment'}
                            </h2>
                            <p className="text-sm text-gray-400 mt-1">
                                {mode === 'create' ? 'Add new equipment to the system' : 'Update equipment information'}
                            </p>
                        </div>
                        <button
                            onClick={handleClose}
                            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6">
                    {error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg mb-6 flex items-center gap-2">
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-6 mb-6">
                        {/* Left Column */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Name <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-3 bg-dark-300 border border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white placeholder-gray-500 transition-all"
                                    required
                                    placeholder="Equipment name"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Serial Number <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.serialNumber}
                                    onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                                    className="w-full px-4 py-3 bg-dark-300 border border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white placeholder-gray-500 transition-all font-mono"
                                    required
                                    placeholder="SN-12345"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Equipment Category <span className="text-red-400">*</span>
                                </label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full px-4 py-3 bg-dark-300 border border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white transition-all"
                                    required
                                >
                                    <option value="" className="bg-dark-400">Select Category</option>
                                    {categories.map(cat => (
                                        <option key={cat._id} value={cat.name} className="bg-dark-400">
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Department <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.department}
                                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                    className="w-full px-4 py-3 bg-dark-300 border border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white placeholder-gray-500 transition-all"
                                    required
                                    placeholder="Department name"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Company
                                </label>
                                <input
                                    type="text"
                                    value={formData.company}
                                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                    className="w-full px-4 py-3 bg-dark-300 border border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white placeholder-gray-500 transition-all"
                                    placeholder="Company name"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Owner/Employee
                                </label>
                                <input
                                    type="text"
                                    value={formData.ownerEmployeeName}
                                    onChange={(e) => setFormData({ ...formData, ownerEmployeeName: e.target.value })}
                                    className="w-full px-4 py-3 bg-dark-300 border border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white placeholder-gray-500 transition-all"
                                    placeholder="Employee name"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Maintenance Team <span className="text-red-400">*</span>
                                </label>
                                <select
                                    value={formData.defaultMaintenanceTeamId}
                                    onChange={(e) => setFormData({ ...formData, defaultMaintenanceTeamId: e.target.value })}
                                    className="w-full px-4 py-3 bg-dark-300 border border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white transition-all"
                                    required
                                >
                                    <option value="" className="bg-dark-400">Select Team</option>
                                    {teams.map(team => (
                                        <option key={team._id} value={team._id} className="bg-dark-400">
                                            {team.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Location <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    className="w-full px-4 py-3 bg-dark-300 border border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white placeholder-gray-500 transition-all"
                                    required
                                    placeholder="Location"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Work Center
                                </label>
                                <select
                                    value={formData.workCenterId}
                                    onChange={(e) => setFormData({ ...formData, workCenterId: e.target.value })}
                                    className="w-full px-4 py-3 bg-dark-300 border border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white transition-all"
                                >
                                    <option value="" className="bg-dark-400">Select Work Center</option>
                                    {workcenters.map(wc => (
                                        <option key={wc._id} value={wc._id} className="bg-dark-400">
                                            {wc.name} ({wc.code})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Purchase Date
                                </label>
                                <input
                                    type="date"
                                    value={formData.purchaseDate}
                                    onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                                    className="w-full px-4 py-3 bg-dark-300 border border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Warranty Until
                                </label>
                                <input
                                    type="date"
                                    value={formData.warrantyUntil}
                                    onChange={(e) => setFormData({ ...formData, warrantyUntil: e.target.value })}
                                    className="w-full px-4 py-3 bg-dark-300 border border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Assigned Date
                                </label>
                                <input
                                    type="date"
                                    value={formData.assignedDate}
                                    onChange={(e) => setFormData({ ...formData, assignedDate: e.target.value })}
                                    className="w-full px-4 py-3 bg-dark-300 border border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Status
                                </label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    className="w-full px-4 py-3 bg-dark-300 border border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white transition-all"
                                >
                                    <option value="ACTIVE" className="bg-dark-400">Active</option>
                                    <option value="UNDER_MAINTENANCE" className="bg-dark-400">Under Maintenance</option>
                                    <option value="DAMAGED" className="bg-dark-400">Damaged</option>
                                    <option value="SCRAP" className="bg-dark-400">Scrap</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Description
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={3}
                                    className="w-full px-4 py-3 bg-dark-300 border border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white placeholder-gray-500 transition-all resize-none"
                                    placeholder="Equipment description..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-6 border-t border-gray-700">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-medium py-3 px-6 rounded-lg shadow-lg shadow-primary-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    {mode === 'create' ? 'Creating...' : 'Updating...'}
                                </>
                            ) : (
                                <>
                                    <Save className="w-5 h-5" />
                                    {mode === 'create' ? 'Create Equipment' : 'Update Equipment'}
                                </>
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={handleClose}
                            className="flex-1 bg-dark-300 border-2 border-gray-600 text-gray-300 font-medium py-3 px-6 rounded-lg hover:bg-dark-200 hover:border-gray-500 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EquipmentModal;
