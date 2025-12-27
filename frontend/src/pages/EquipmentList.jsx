import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
    Search, 
    Plus, 
    Eye, 
    Edit, 
    Trash2, 
    Filter,
    Download,
    Package
} from 'lucide-react';
import { equipmentAPI } from '../api/equipment';
import { categoryAPI } from '../api/categories';
import { teamAPI } from '../api/teams';
import { workcenterAPI } from '../api/workcenters';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent } from '../components/ui/Card';
import { StatusBadge } from '../components/ui/Badge';
import { SkeletonTable } from '../components/ui/Loading';
import { NoEquipmentFound, NoSearchResults } from '../components/ui/EmptyState';
import EquipmentModal from '../components/EquipmentModal';
import { cn } from '../utils/cn';
import { toast } from 'sonner';

const EquipmentList = () => {
    const navigate = useNavigate();
    const { hasRole } = useAuth();
    const isManager = hasRole(['MANAGER']);
    const [equipment, setEquipment] = useState([]);
    const [categories, setCategories] = useState([]);
    const [teams, setTeams] = useState([]);
    const [workcenters, setWorkcenters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [selectedEquipment, setSelectedEquipment] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [equipData, catData, teamData, wcData] = await Promise.all([
                equipmentAPI.getAll(),
                categoryAPI.getAll(),
                teamAPI.getAll(),
                workcenterAPI.getAll()
            ]);
            setEquipment(equipData);
            setCategories(catData);
            setTeams(teamData);
            setWorkcenters(wcData);
        } catch (err) {
            console.error('Failed to fetch data:', err);
            toast.error('Failed to load equipment data');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this equipment?')) return;
        
        try {
            await equipmentAPI.delete(id);
            setEquipment(equipment.filter(e => e._id !== id));
            toast.success('Equipment deleted successfully');
        } catch (err) {
      

    const handleOpenCreateModal = () => {
        setModalMode('create');
        setSelectedEquipment(null);
        setShowModal(true);
    };

    const handleOpenEditModal = (item) => {
        setModalMode('edit');
        setSelectedEquipment(item);
        setShowModal(true);
    };

    const handleSaveEquipment = async (formData, equipmentId) => {
        try {
            if (modalMode === 'create') {
                const newEquipment = await equipmentAPI.create(formData);
                setEquipment([...equipment, newEquipment]);
                toast.success('Equipment created successfully');
            } else {
                const updatedEquipment = await equipmentAPI.update(equipmentId, formData);
                setEquipment(equipment.map(e => e._id === equipmentId ? updatedEquipment : e));
                toast.success('Equipment updated successfully');
            }
        } catch (err) {
            console.error('Failed to save equipment:', err);
            throw err;
        }
    };      console.error('Failed to delete equipment:', err);
            toast.error('Failed to delete equipment');
        }
    };

    // Filter equipment
    const filteredEquipment = equipment.filter(item => {
        const matchesSearch = !searchQuery || 
            item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.serialNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.department?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.category?.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
        
        return matchesSearch && matchesStatus;
    });
handleOpenCreateModal
    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="h-10 w-64 bg-white/5 rounded-lg shimmer" />
                    <div className="h-10 w-32 bg-white/5 rounded-lg shimmer" />
                </div>
                <div className="h-12 bg-white/5 rounded-xl shimmer" />
                <SkeletonTable rows={8} columns={8} />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
                <div>
                    <h1 className="text-4xl font-bold text-white mb-2">Equipment</h1>
                    <p className="text-gray-400">
                        Manage and track all company equipment and assets
                    </p>
                </div>
                {isManager && (
                    <Button icon={Plus} onClick={() => toast.info('Create modal coming soon')}>
                        Add Equipment
                    </Button>
                )}
            </motion.div>

            {/* Search and Filters */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <Card>
                    <CardContent className="p-4">
                        <div className="flex flex-col md:flex-row gap-4">
                            {/* Search */}
                            <div className="flex-1">
                                <Input
                                    type="search"
                                    placeholder="Search equipment by name, serial number, or category..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    leftIcon={Search}
                                />
                            </div>

                            {/* Status Filter */}
                            <div className="w-full md:w-48">
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className={cn(
                                        'w-full h-12 px-4 rounded-xl',
                                        'bg-dark-300 border border-gray-600',
                                        'text-white',
                                        'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
                                        'cursor-pointer transition-all'
                                    )}
                                    style={{
                                        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239CA3AF' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                                        backgroundPosition: 'right 0.5rem center',
                                        backgroundRepeat: 'no-repeat',
                                        backgroundSize: '1.5em 1.5em',
                                        paddingRight: '2.5rem'
                                    }}
                                >
                                    <option value="ALL" className="bg-dark-400 text-white">All Status</option>
                                    <option value="ACTIVE" className="bg-dark-400 text-white">Active</option>
                                    <option value="UNDER_MAINTENANCE" className="bg-dark-400 text-white">Under Maintenance</option>
                                    <option value="DAMAGED" className="bg-dark-400 text-white">Damaged</option>
                                    <option value="SCRAP" className="bg-dark-400 text-white">Scrap</option>
                                </select>
                            </div>

                            {/* Export Button */}
                            <Button variant="outline" icon={Download}>
                                Export
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Equipment Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <Card>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            {filteredEquipment.length === 0 ? (
                                <div className="py-12">
                                    {searchQuery ? (
                                        <NoSearchResults 
                                            searchTerm={searchQuery}
                                            onClear={() => setSearchQuery('')}
                                        />
                                    ) : (
                                        <NoEquipmentFound 
                                            action={isManager ? handleOpenCreateModal : null}
                                        />
                                    )}
                                </div>
                            ) : (
                                <table className="min-w-full divide-y divide-white/5">
                                    <thead>
                                        <tr className="bg-white/5">
                                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                                Equipment
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                                Employee
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                                Department
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                                Serial Number
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                                Team
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                                Category
                                            </th>
                                            <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {filteredEquipment.map((item, index) => (
                                            <motion.tr
                                                key={item._id}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: index * 0.02 }}                                                onClick={() => navigate(`/equipment/${item._id}`)}                                                className="hover:bg-white/5 transition-colors cursor-pointer"
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <Link
                                                        to={`/equipment/${item._id}`}
                                                        className="flex items-center gap-2 text-sm font-medium text-primary-400 hover:text-primary-300 transition-colors"
                                                    >
                                                        <Package className="w-4 h-4" />
                                                        {item.name}
                                                    </Link>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <StatusBadge status={item.status} />
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                                    {item.ownerEmployeeName || '-'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                                    {item.department}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 font-mono">
                                                    {item.serialNumber}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                                    {item.defaultMaintenanceTeamId?.name || '-'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                                    <span className="px-2 py-1 rounded-lg bg-white/5 text-xs">
                                                        {item.category}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right" onClick={(e) => e.stopPropagation()}>
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Link
                                                            to={`/equipment/${item._id}`}
                                                            className={cn(
                                                                'p-2 rounded-lg',
                                                                'text-gray-400 hover:text-primary-400',
                                                                'hover:bg-white/10',
                                                                'transition-all duration-200'
                                                            )}
                                                            title="View Details"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </Link>
                                                        {isManager && (
                                                            <>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleOpenEditModal(item);
                                                                    }}
                                                                    className={cn(
                                                                        'p-2 rounded-lg',
                                                                        'text-gray-400 hover:text-blue-400',
                                                                        'hover:bg-white/10',
                                                                        'transition-all duration-200'
                                                                    )}
                                                                    title="Edit"
                                                                >
                                                                    <Edit className="w-4 h-4" />
                                                                </button>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleDelete(item._id);
                                                                    }}
                                                                    className={cn(
                                                                        'p-2 rounded-lg',
                                                                        'text-gray-400 hover:text-rose-400',
                                                                        'hover:bg-white/10',
                                                                        'transition-all duration-200'
                                                                    )}
                                                                    title="Delete"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Stats Footer */}
            {filteredEquipment.length > 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="flex items-center justify-between text-sm text-gray-400"
                >
                    <p>
                        Showing <span className="text-white font-medium">{filteredEquipment.length}</span> of{' '}
                        <span className="text-white font-medium">{equipment.length}</span> equipment
                    </p>
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="text-primary-400 hover:text-primary-300 transition-colors"
                        >
                            Clear search
                        </button>
                    )}
                </motion.div>
            )}

            {/* Equipment Modal */}
            <EquipmentModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onSave={handleSaveEquipment}
                equipment={selectedEquipment}
                mode={modalMode}
            />
        </div>
    );
};

export default EquipmentList;
