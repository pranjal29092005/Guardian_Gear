import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
    AlertTriangle, 
    Users, 
    ClipboardList, 
    Package, 
    FolderKanban,
    TrendingUp,
    TrendingDown,
    ArrowRight
} from 'lucide-react';
import { requestAPI } from '../api/requests';
import { useAuth } from '../contexts/AuthContext';
import { StatCard, Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { StatusBadge } from '../components/ui/Badge';
import { LoadingScreen, SkeletonStat, SkeletonTable } from '../components/ui/Loading';
import { NoDataFound } from '../components/ui/EmptyState';
import { cn } from '../utils/cn';

const Dashboard = () => {
    const { hasRole, user } = useAuth();
    const isManager = hasRole(['MANAGER']);
    const [dashboardStats, setDashboardStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardStats = async () => {
            if (!isManager) {
                setLoading(false);
                return;
            }

            try {
                const stats = await requestAPI.getDashboardStats();
                setDashboardStats(stats);
            } catch (error) {
                console.error('Failed to fetch dashboard stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardStats();
    }, [isManager]);

    if (loading && isManager) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="space-y-2">
                        <div className="h-10 w-64 bg-white/5 rounded-lg shimmer" />
                        <div className="h-5 w-96 bg-white/5 rounded-lg shimmer" />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <SkeletonStat />
                    <SkeletonStat />
                    <SkeletonStat />
                </div>
                <SkeletonTable rows={5} columns={6} />
            </div>
        );
    }

    // If not manager, show basic dashboard
    if (!isManager) {
        return (
            <div className="space-y-8">
                {/* Hero Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative overflow-hidden"
                >
                    <div className="glass-card p-8 md:p-12">
                        <div className="max-w-3xl">
                            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                                Welcome back, <span className="gradient-text">{user?.name}</span> 👋
                            </h1>
                            <p className="text-lg text-gray-400">
                                Manage your equipment, track maintenance requests, and stay on top of your workflow.
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Quick Action Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <Link to="/equipment" className="block group">
                            <Card hoverable className="h-full">
                                <CardContent className="p-8">
                                    <div className="flex items-start gap-4">
                                        <div className="p-4 rounded-xl bg-primary-500/20 group-hover:bg-primary-500/30 transition-colors">
                                            <Package className="w-8 h-8 text-primary-400" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-xl font-semibold text-white mb-2 flex items-center gap-2">
                                                View Equipment
                                                <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </h3>
                                            <p className="text-gray-400">
                                                Manage all company equipment and assets
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <Link to="/kanban" className="block group">
                            <Card hoverable className="h-full">
                                <CardContent className="p-8">
                                    <div className="flex items-start gap-4">
                                        <div className="p-4 rounded-xl bg-secondary-500/20 group-hover:bg-secondary-500/30 transition-colors">
                                            <FolderKanban className="w-8 h-8 text-secondary-400" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-xl font-semibold text-white mb-2 flex items-center gap-2">
                                                Kanban Board
                                                <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </h3>
                                            <p className="text-gray-400">
                                                Track maintenance requests and workflows
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    </motion.div>
                </div>
            </div>
        );
    }

    if (!dashboardStats) {
        return <NoDataFound />;
    }

    return (
        <div className="space-y-8">
            {/* Hero Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="text-4xl font-bold text-white mb-2">
                    Dashboard Overview
                </h1>
                <p className="text-gray-400">
                    Monitor your maintenance operations and team performance
                </p>
            </motion.div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <StatCard
                        title="Critical Equipment"
                        value={`${dashboardStats.criticalEquipment.count}`}
                        icon={AlertTriangle}
                        color="danger"
                        trend="up"
                        trendValue={dashboardStats.criticalEquipment.subtitle}
                    />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <StatCard
                        title="Technician Load"
                        value={`${dashboardStats.technicianLoad.utilization}%`}
                        icon={Users}
                        color="primary"
                        trend={dashboardStats.technicianLoad.utilization > 75 ? "up" : "down"}
                        trendValue={dashboardStats.technicianLoad.subtitle}
                    />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <StatCard
                        title="Open Requests"
                        value={dashboardStats.openRequests.pending}
                        icon={ClipboardList}
                        color="success"
                        trend="down"
                        trendValue={dashboardStats.openRequests.subtitle}
                    />
                </motion.div>
            </div>

            {/* Requests Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
            >
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Maintenance Requests</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-white/5">
                                <thead>
                                    <tr className="bg-white/5">
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                            Subject
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                            Employee
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                            Technician
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                            Category
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                            Stage
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                            Company
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {dashboardStats.requestsTable.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-12 text-center">
                                                <div className="flex flex-col items-center gap-2">
                                                    <ClipboardList className="w-12 h-12 text-gray-600" />
                                                    <p className="text-gray-400">No open requests found</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        dashboardStats.requestsTable.map((request, index) => (
                                            <motion.tr
                                                key={request._id}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: 0.5 + index * 0.05 }}
                                                className="hover:bg-white/5 transition-colors"
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                                                    {request.subject}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                                    {request.employee}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                                    {request.technician}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                                    {request.category}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <StatusBadge status={request.stage} />
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                                    {request.company}
                                                </td>
                                            </motion.tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
};

export default Dashboard;
