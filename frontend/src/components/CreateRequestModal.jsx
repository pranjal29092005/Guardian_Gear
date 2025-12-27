import { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { equipmentAPI } from '../api/equipment';
import { requestAPI } from '../api/requests';
import { workcenterAPI } from '../api/workcenters';
import { teamAPI } from '../api/teams';
import { useAuth } from '../contexts/AuthContext';

const CreateRequestModal = ({ isOpen, onClose, onSuccess, initialData = null }) => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        subject: '',
        maintenanceFor: 'EQUIPMENT',
        equipmentId: '',
        workCenterId: '',
        type: 'CORRECTIVE',
        description: '',
        scheduledDate: '',
        scheduledTime: '',
        durationHours: '',
        priority: 'LOW',
        notes: '',
        instructions: '',
        maintenanceTeamId: '',
        assignedTechnicianId: ''
    });
    const [equipment, setEquipment] = useState([]);
    const [workcenters, setWorkcenters] = useState([]);
    const [teams, setTeams] = useState([]);
    const [technicians, setTechnicians] = useState([]);
    const [selectedEquipment, setSelectedEquipment] = useState(null);
    const [selectedWorkCenter, setSelectedWorkCenter] = useState(null);
    const [activeTab, setActiveTab] = useState('notes');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            fetchActiveEquipment();
            fetchWorkcenters();
            fetchTeams();
            fetchTechnicians();

            // Apply initial data if provided (e.g., from calendar date click)
            if (initialData) {
                setFormData(prev => ({
                    ...prev,
                    ...initialData
                }));
            }
        }
    }, [isOpen, initialData]);

    const fetchActiveEquipment = async () => {
        try {
            const data = await equipmentAPI.getActive();
            setEquipment(data);
        } catch (err) {
            console.error('Failed to fetch equipment:', err);
        }
    };

    const fetchWorkcenters = async () => {
        try {
            const data = await workcenterAPI.getActive();
            setWorkcenters(data);
        } catch (err) {
            console.error('Failed to fetch workcenters:', err);
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

    const fetchTechnicians = async () => {
        try {
            const data = await requestAPI.getAvailableTechnicians();
            setTechnicians(data);
        } catch (err) {
            console.error('Failed to fetch technicians:', err);
        }
    };

    // Filter technicians based on selected team
    const getFilteredTechnicians = () => {
        if (!formData.maintenanceTeamId) {
            return [];
        }
        return technicians.filter(tech => 
            tech.teams && tech.teams.some(team => 
                (typeof team === 'object' ? team._id : team) === formData.maintenanceTeamId
            )
        );
    };

    const handleMaintenanceForChange = (value) => {
        setFormData(prev => ({ ...prev, maintenanceFor: value, equipmentId: '', workCenterId: '' }));
        setSelectedEquipment(null);
        setSelectedWorkCenter(null);
    };

    const handleEquipmentChange = (equipmentId) => {
        setFormData(prev => ({ ...prev, equipmentId }));

        // Find selected equipment and show auto-filled data
        const selected = equipment.find(e => e._id === equipmentId);
        setSelectedEquipment(selected);
        
        // Auto-fill team and category from equipment
        if (selected) {
            setFormData(prev => ({
                ...prev,
                equipmentId,
                maintenanceTeamId: selected.defaultMaintenanceTeamId?._id || selected.defaultMaintenanceTeamId || ''
            }));
        }
    };

    const handleWorkCenterChange = (workCenterId) => {
        setFormData(prev => ({ ...prev, workCenterId }));
        const selected = workcenters.find(wc => wc._id === workCenterId);
        setSelectedWorkCenter(selected);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Combine scheduled date and time for preventive requests
        let scheduledDate = formData.scheduledDate;
        if (formData.type === 'PREVENTIVE' && formData.scheduledDate && formData.scheduledTime) {
            scheduledDate = `${formData.scheduledDate}T${formData.scheduledTime}:00`;
        }

        const submitData = {
            subject: formData.subject,
            type: formData.type,
            description: formData.description || formData.notes || formData.instructions,
            maintenanceFor: formData.maintenanceFor,
            equipmentId: formData.maintenanceFor === 'EQUIPMENT' ? formData.equipmentId : null,
            workCenterId: formData.maintenanceFor === 'WORK_CENTER' ? formData.workCenterId : null,
            maintenanceTeamId: formData.maintenanceTeamId || selectedEquipment?.defaultMaintenanceTeamId?._id || selectedEquipment?.defaultMaintenanceTeamId || null,
            assignedTechnicianId: formData.assignedTechnicianId || null,
            scheduledDate: formData.type === 'PREVENTIVE' ? scheduledDate : null,
            durationHours: formData.durationHours ? parseFloat(formData.durationHours) : null
        };

        console.log('[CreateRequestModal] Submitting request with data:', submitData);

        try {
            const result = await requestAPI.create(submitData);
            console.log('[CreateRequestModal] Request created successfully:', result);

            console.log('[CreateRequestModal] Calling onSuccess callback');
            onSuccess();

            console.log('[CreateRequestModal] Closing modal');
            handleClose();
        } catch (err) {
            console.error('[CreateRequestModal] Failed to create request:', err);
            console.error('[CreateRequestModal] Error response:', err.response?.data);
            setError(err.response?.data?.message || 'Failed to create request');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setFormData({
            subject: '',
            maintenanceFor: 'EQUIPMENT',
            equipmentId: '',
            workCenterId: '',
            type: 'CORRECTIVE',
            description: '',
            scheduledDate: '',
            scheduledTime: '',
            durationHours: '',
            priority: 'LOW',
            notes: '',
            instructions: '',
            maintenanceTeamId: '',
            assignedTechnicianId: ''
        });
        setSelectedEquipment(null);
        setSelectedWorkCenter(null);
        setActiveTab('notes');
        setError('');
        onClose();
    };

    // Get current date for Request Date
    const currentDate = new Date().toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric'
    });

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-dark-400 rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
                {/* Header */}
                <div className="p-6 border-b border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-2xl font-bold text-white">Maintenance Request</h2>
                            <div className="mt-2 flex items-center gap-2">
                                <span className="px-3 py-1 text-xs bg-primary-500/20 text-primary-400 rounded-lg border border-primary-500/30">New</span>
                                <span className="text-sm text-gray-400">{formData.subject || 'New Request'}</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-xs text-gray-500 mb-1">Status Flow</div>
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                                <span className="px-2 py-1 bg-white/5 rounded">New</span>
                                <span>→</span>
                                <span className="px-2 py-1 bg-white/5 rounded">In Progress</span>
                                <span>→</span>
                                <span className="px-2 py-1 bg-white/5 rounded">Repaired</span>
                                <span>→</span>
                                <span className="px-2 py-1 bg-white/5 rounded">Scrap</span>
                            </div>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    {error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg mb-4 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5" />
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-6 mb-6">
                        {/* Left Column */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Subject
                                </label>
                                <input
                                    type="text"
                                    value={formData.subject}
                                    onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                                    className="w-full px-4 py-3 bg-dark-300 border border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-lg font-semibold text-white placeholder-gray-500 transition-all"
                                    required
                                    placeholder="Enter subject"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Created By
                                </label>
                                <input
                                    type="text"
                                    value={user?.name || ''}
                                    className="w-full px-4 py-3 bg-dark-500 border border-gray-700 rounded-lg text-gray-400"
                                    disabled
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Maintenance For
                                </label>
                                <select
                                    value={formData.maintenanceFor}
                                    onChange={(e) => handleMaintenanceForChange(e.target.value)}
                                    className="w-full px-4 py-3 bg-dark-300 border border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white transition-all"
                                    required
                                >
                                    <option value="EQUIPMENT">Equipment</option>
                                    <option value="WORK_CENTER">Work Center</option>
                                </select>
                            </div>

                            {formData.maintenanceFor === 'EQUIPMENT' ? (
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Equipment
                                    </label>
                                    <select
                                        value={formData.equipmentId}
                                        onChange={(e) => handleEquipmentChange(e.target.value)}
                                        className="w-full px-4 py-3 bg-dark-300 border border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white transition-all"
                                        required={formData.maintenanceFor === 'EQUIPMENT'}
                                    >
                                        <option value="">Select Equipment</option>
                                        {equipment.map((item) => (
                                            <option key={item._id} value={item._id}>
                                                {item.name}/{item.serialNumber}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Work Center
                                    </label>
                                    <select
                                        value={formData.workCenterId}
                                        onChange={(e) => handleWorkCenterChange(e.target.value)}
                                        className="w-full px-4 py-3 bg-dark-300 border border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white transition-all"
                                        required={formData.maintenanceFor === 'WORK_CENTER'}
                                    >
                                        <option value="">Select Work Center</option>
                                        {workcenters.map((wc) => (
                                            <option key={wc._id} value={wc._id}>
                                                {wc.name} ({wc.code})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Category
                                </label>
                                <input
                                    type="text"
                                    value={selectedEquipment?.category || selectedWorkCenter?.name || ''}
                                    className="w-full px-4 py-3 bg-dark-500 border border-gray-700 rounded-lg text-gray-400"
                                    disabled
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Request Date
                                </label>
                                <input
                                    type="text"
                                    value={currentDate}
                                    className="w-full px-4 py-3 bg-dark-500 border border-gray-700 rounded-lg text-gray-400"
                                    disabled
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Maintenance Type
                                </label>
                                <div className="flex gap-4">
                                    <label className="flex items-center cursor-pointer">
                                        <input
                                            type="radio"
                                            name="type"
                                            value="CORRECTIVE"
                                            checked={formData.type === 'CORRECTIVE'}
                                            onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                                            className="mr-2 w-4 h-4 text-primary-600 focus:ring-primary-500 focus:ring-2"
                                        />
                                        <span className="text-gray-300">Corrective</span>
                                    </label>
                                    <label className="flex items-center cursor-pointer">
                                        <input
                                            type="radio"
                                            name="type"
                                            value="PREVENTIVE"
                                            checked={formData.type === 'PREVENTIVE'}
                                            onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                                            className="mr-2 w-4 h-4 text-primary-600 focus:ring-primary-500 focus:ring-2"
                                        />
                                        <span className="text-gray-300">Preventive</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Team
                                </label>
                                <select
                                    value={formData.maintenanceTeamId || selectedEquipment?.defaultMaintenanceTeamId?._id || ''}
                                    onChange={(e) => setFormData(prev => ({ 
                                        ...prev, 
                                        maintenanceTeamId: e.target.value,
                                        assignedTechnicianId: '' // Clear technician when team changes
                                    }))}
                                    className="w-full px-4 py-3 bg-dark-300 border border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white transition-all"
                                    required
                                >
                                    <option value="">Select Team</option>
                                    {teams.map((team) => (
                                        <option key={team._id} value={team._id}>
                                            {team.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Technician
                                </label>
                                <select
                                    value={formData.assignedTechnicianId || ''}
                                    onChange={(e) => setFormData(prev => ({ ...prev, assignedTechnicianId: e.target.value }))}
                                    className="w-full px-4 py-3 bg-dark-300 border border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={!formData.maintenanceTeamId}
                                >
                                    <option value="">Select Technician</option>
                                    {getFilteredTechnicians().map((tech) => (
                                        <option key={tech._id} value={tech._id}>
                                            {tech.name}
                                        </option>
                                    ))}
                                </select>
                                {!formData.maintenanceTeamId && (
                                    <p className="mt-1 text-xs text-gray-500">Please select a team first</p>
                                )}
                            </div>

                            {formData.type === 'PREVENTIVE' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Scheduled Date
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="date"
                                            value={formData.scheduledDate}
                                            onChange={(e) => setFormData(prev => ({ ...prev, scheduledDate: e.target.value }))}
                                            className="flex-1 px-4 py-3 bg-dark-300 border border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white transition-all"
                                            required={formData.type === 'PREVENTIVE'}
                                        />
                                        <input
                                            type="time"
                                            value={formData.scheduledTime}
                                            onChange={(e) => setFormData(prev => ({ ...prev, scheduledTime: e.target.value }))}
                                            className="px-4 py-3 bg-dark-300 border border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white transition-all"
                                        />
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Duration (hours)
                                </label>
                                <input
                                    type="number"
                                    step="0.5"
                                    min="0"
                                    value={formData.durationHours}
                                    onChange={(e) => setFormData(prev => ({ ...prev, durationHours: e.target.value }))}
                                    placeholder="e.g. 2.5"
                                    className="w-full px-4 py-3 bg-dark-300 border border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white placeholder-gray-500 transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Priority
                                </label>
                                <div className="flex gap-3">
                                    {['LOW', 'MEDIUM', 'HIGH'].map((priority) => (
                                        <button
                                            key={priority}
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, priority }))}
                                            className={`flex-1 px-4 py-3 rounded-lg border-2 font-medium transition-all ${
                                                formData.priority === priority
                                                    ? 'border-primary-500 bg-primary-500/20 text-primary-400'
                                                    : 'border-gray-600 bg-dark-300 text-gray-400 hover:border-gray-500'
                                            }`}
                                        >
                                            {priority}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Company
                                </label>
                                <input
                                    type="text"
                                    value={selectedEquipment?.company || selectedEquipment?.location || ''}
                                    className="w-full px-4 py-3 bg-dark-500 border border-gray-700 rounded-lg text-gray-400"
                                    disabled
                                />
                            </div>
                        </div>
                    </div>

                    {/* Notes and Instructions Tabs */}
                    <div className="border-t border-gray-700 pt-6 mt-6">
                        <div className="flex gap-2 mb-4">
                            <button
                                type="button"
                                onClick={() => setActiveTab('notes')}
                                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                                    activeTab === 'notes'
                                        ? 'bg-primary-500/20 border-2 border-primary-500/30 text-primary-400'
                                        : 'bg-dark-300 border-2 border-gray-600 text-gray-400 hover:bg-dark-200'
                                }`}
                            >
                                Notes
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab('instructions')}
                                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                                    activeTab === 'instructions'
                                        ? 'bg-primary-500/20 border-2 border-primary-500/30 text-primary-400'
                                        : 'bg-dark-300 border-2 border-gray-600 text-gray-400 hover:bg-dark-200'
                                }`}
                            >
                                Instructions
                            </button>
                        </div>
                        <div className="border-2 border-gray-600 rounded-lg overflow-hidden">
                            <textarea
                                value={activeTab === 'notes' ? formData.notes : formData.instructions}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    [activeTab === 'notes' ? 'notes' : 'instructions']: e.target.value
                                }))}
                                rows={6}
                                className="w-full px-4 py-3 bg-dark-300 text-white placeholder-gray-500 border-0 focus:ring-2 focus:ring-primary-500 resize-none"
                                placeholder={activeTab === 'notes' ? 'Enter notes...' : 'Enter instructions...'}
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 pt-6">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-medium py-3 px-6 rounded-lg shadow-lg shadow-primary-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Creating...
                                </span>
                            ) : (
                                'Create Request'
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

export default CreateRequestModal;
