import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
    ArrowLeft, 
    Package, 
    Calendar, 
    Shield, 
    MapPin, 
    User, 
    Users, 
    Hash,
    Grid3x3,
    Building,
    ClipboardList,
    FileText
} from 'lucide-react';
import { equipmentAPI } from '../api/equipment';
import MaintenanceHistory from '../components/MaintenanceHistory';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { StatusBadge, CountBadge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { LoadingScreen } from '../components/ui/Loading';
import { cn } from '../utils/cn';

const EquipmentDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchEquipmentDetail();
    }, [id]);

    const fetchEquipmentDetail = async () => {
        try {
            setLoading(true);
            const result = await equipmentAPI.getById(id);
            setData(result);
        } catch (error) {
            console.error('Failed to fetch equipment:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <LoadingScreen message="Loading equipment details..." />;
    }

    if (!data) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Package className="w-16 h-16 text-gray-600 mb-4" />
                <h2 className="text-2xl font-semibold text-white mb-2">Equipment not found</h2>
                <Button onClick={() => navigate('/equipment')} variant="outline">
                    Back to Equipment List
                </Button>
            </div>
        );
    }

    const { equipment, openRequestCount } = data;

    const detailFields = [
        { icon: Hash, label: 'Serial Number', value: equipment.serialNumber, mono: true },
        { icon: Grid3x3, label: 'Category', value: equipment.category },
        { icon: Building, label: 'Department', value: equipment.department },
        { icon: MapPin, label: 'Location', value: equipment.location },
        { icon: User, label: 'Owner', value: equipment.ownerEmployeeName || 'Not assigned' },
        { icon: Users, label: 'Maintenance Team', value: equipment.defaultMaintenanceTeamId?.name || 'Not assigned' },
        { icon: Calendar, label: 'Purchase Date', value: new Date(equipment.purchaseDate).toLocaleDateString() },
        { icon: Shield, label: 'Warranty Until', value: equipment.warrantyUntil ? new Date(equipment.warrantyUntil).toLocaleDateString() : 'N/A' },
    ];

    return (
        <div className="space-y-6">
            {/* Back Button */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
            >
                <Button
                    variant="ghost"
                    icon={ArrowLeft}
                    onClick={() => navigate('/equipment')}
                >
                    Back to Equipment List
                </Button>
            </motion.div>

            {/* Equipment Header Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <Card variant="gradient" glow>
                    <CardContent className="p-8">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                            {/* Icon and Title */}
                            <div className="flex items-start gap-4">
                                <div className="p-4 rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 shadow-glow">
                                    <Package className="w-10 h-10 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-4xl font-bold text-white mb-2">
                                        {equipment.name}
                                    </h1>
                                    <p className="text-gray-400">
                                        Equipment Details and Maintenance History
                                    </p>
                                </div>
                            </div>
                            
                            {/* Status Badge */}
                            <div>
                                <StatusBadge status={equipment.status} size="lg" pulse />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Details Grid */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <Card>
                    <CardHeader>
                        <CardTitle>Equipment Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {detailFields.map((field, index) => (
                                <motion.div
                                    key={field.label}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 + index * 0.05 }}
                                    className="flex items-start gap-3 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                                >
                                    <div className="p-2 rounded-lg bg-primary-500/20">
                                        <field.icon className="w-5 h-5 text-primary-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-sm font-medium text-gray-400 mb-1">
                                            {field.label}
                                        </h3>
                                        <p className={cn(
                                            "text-base text-white truncate",
                                            field.mono && "font-mono"
                                        )}>
                                            {field.value}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Maintenance Requests Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
            >
                <Card>
                    <CardContent className="p-8">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                            <div className="flex items-start gap-4">
                                <div className="p-3 rounded-xl bg-secondary-500/20">
                                    <ClipboardList className="w-8 h-8 text-secondary-400" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-semibold text-white mb-2">
                                        Maintenance Requests
                                    </h2>
                                    <p className="text-gray-400">
                                        {openRequestCount === 0
                                            ? 'No open maintenance requests for this equipment'
                                            : `${openRequestCount} open maintenance request${openRequestCount > 1 ? 's' : ''}`}
                                    </p>
                                </div>
                            </div>
                            
                            <div className="relative">
                                <Button
                                    onClick={() => navigate(`/kanban?equipmentId=${id}`)}
                                    size="lg"
                                    icon={ClipboardList}
                                >
                                    View in Kanban
                                </Button>
                                {openRequestCount > 0 && (
                                    <CountBadge count={openRequestCount} variant="danger" />
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Audit Notes */}
            {equipment.notes && equipment.notes.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                <div className="flex items-center gap-2">
                                    <FileText className="w-5 h-5" />
                                    Audit Notes
                                </div>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {equipment.notes.map((note, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.6 + index * 0.1 }}
                                        className="border-l-4 border-primary-500 pl-4 py-3 bg-white/5 rounded-r-xl"
                                    >
                                        <p className="text-gray-100">{note.text}</p>
                                        <p className="text-sm text-gray-400 mt-2">
                                            {new Date(note.createdAt).toLocaleString()}
                                        </p>
                                    </motion.div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            {/* Maintenance History Timeline */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
            >
                <Card>
                    <CardContent className="p-6">
                        <MaintenanceHistory equipmentId={id} />
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
};

export default EquipmentDetail;
