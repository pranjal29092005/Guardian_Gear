import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { requestAPI } from '../api/requests';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
    const { hasRole } = useAuth();
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

    if (loading) {
        return <div className="text-center py-12">Loading...</div>;
    }

    // If not manager, show basic dashboard
    if (!isManager) {
        return (
            <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Link
                        to="/equipment"
                        className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
                    >
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">View Equipment</h3>
                        <p className="text-gray-600">Manage all company equipment and assets</p>
                    </Link>
                    <Link
                        to="/kanban"
                        className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
                    >
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Kanban Board</h3>
                        <p className="text-gray-600">Track maintenance requests and workflows</p>
                    </Link>
                </div>
            </div>
        );
    }

    if (!dashboardStats) {
        return <div className="text-center py-12">No data available</div>;
    }

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Critical Equipment Card - Red outline */}
                <div className="bg-white rounded-lg border-2 border-red-500 shadow p-6">
                    <div className="flex flex-col">
                        <p className="text-lg font-semibold text-gray-900 mb-2">Critical Equipment</p>
                        <p className="text-3xl font-bold text-gray-900 mb-1">
                            {dashboardStats.criticalEquipment.count} Units
                        </p>
                        <p className="text-sm text-gray-600">{dashboardStats.criticalEquipment.subtitle}</p>
                    </div>
                </div>

                {/* Technician Load Card - Blue outline */}
                <div className="bg-white rounded-lg border-2 border-blue-500 shadow p-6">
                    <div className="flex flex-col">
                        <p className="text-lg font-semibold text-gray-900 mb-2">Technician Load</p>
                        <p className="text-3xl font-bold text-gray-900 mb-1">
                            {dashboardStats.technicianLoad.utilization}% Utilized
                        </p>
                        <p className="text-sm text-gray-600">{dashboardStats.technicianLoad.subtitle}</p>
                    </div>
                </div>

                {/* Open Requests Card - Green outline */}
                <div className="bg-white rounded-lg border-2 border-green-500 shadow p-6">
                    <div className="flex flex-col">
                        <p className="text-lg font-semibold text-gray-900 mb-2">Open Requests</p>
                        <p className="text-3xl font-bold text-gray-900 mb-1">
                            {dashboardStats.openRequests.pending} Pending
                        </p>
                        <p className="text-sm text-gray-600">{dashboardStats.openRequests.subtitle}</p>
                    </div>
                </div>
            </div>

            {/* Requests Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Subjects
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Employee
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Technician
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Category
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Stage
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Company
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {dashboardStats.requestsTable.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                                    No open requests found
                                </td>
                            </tr>
                        ) : (
                            dashboardStats.requestsTable.map((request) => (
                                <tr key={request._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {request.subject}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                        {request.employee}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                        {request.technician}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                        {request.category}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-800">
                                            {request.stage}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                        {request.company}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Dashboard;
