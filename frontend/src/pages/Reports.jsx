import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { BarChart3, Users, TrendingUp, Activity } from 'lucide-react';
import { reportsAPI } from '../api/reports';
import { Card, CardContent, CardHeader, CardTitle, StatCard } from '../components/ui/Card';
import { LoadingScreen } from '../components/ui/Loading';

// Custom dark theme for charts
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-dark-300/95 backdrop-blur-sm border border-white/10 rounded-xl p-4 shadow-glow">
                <p className="text-sm font-semibold text-white mb-2">{label}</p>
                <p className="text-2xl font-bold text-primary-400">
                    {payload[0].value}
                </p>
                <p className="text-xs text-gray-400 mt-1">Total Requests</p>
            </div>
        );
    }
    return null;
};

const Reports = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            setLoading(true);
            const result = await reportsAPI.getRequestsPerTeam();
            setData(result);
        } catch (error) {
            console.error('Failed to fetch reports:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <LoadingScreen message="Loading reports..." />;
    }

    // Calculate total requests
    const totalRequests = data.reduce((sum, item) => sum + item.count, 0);
    const averagePerTeam = data.length > 0 ? Math.round(totalRequests / data.length) : 0;
    const maxTeam = data.reduce((max, item) => item.count > max.count ? item : max, data[0] || { count: 0 });

    return (
        <div className="space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="text-4xl font-bold text-white mb-2">Reports & Analytics</h1>
                <p className="text-gray-400">
                    Track maintenance performance across teams and equipment
                </p>
            </motion.div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <StatCard
                        title="Total Requests"
                        value={totalRequests}
                        icon={BarChart3}
                        trend="up"
                        trendValue="All Time"
                    />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <StatCard
                        title="Active Teams"
                        value={data.length}
                        icon={Users}
                        trend="neutral"
                        trendValue="Teams"
                    />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <StatCard
                        title="Average per Team"
                        value={averagePerTeam}
                        icon={TrendingUp}
                        trend="neutral"
                        trendValue="Requests"
                    />
                </motion.div>
            </div>

            {/* Chart Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
            >
                <Card glow>
                    <CardHeader>
                        <CardTitle>
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 shadow-glow">
                                    <BarChart3 className="w-6 h-6 text-white" />
                                </div>
                                <span>Maintenance Requests by Team</span>
                            </div>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8">
                        <ResponsiveContainer width="100%" height={400}>
                            <BarChart data={data} barSize={60}>
                                <CartesianGrid 
                                    strokeDasharray="3 3" 
                                    stroke="rgba(255, 255, 255, 0.1)" 
                                    vertical={false}
                                />
                                <XAxis 
                                    dataKey="teamName" 
                                    stroke="rgba(255, 255, 255, 0.5)"
                                    style={{
                                        fontSize: '14px',
                                        fontFamily: 'Inter, sans-serif',
                                    }}
                                />
                                <YAxis 
                                    stroke="rgba(255, 255, 255, 0.5)"
                                    style={{
                                        fontSize: '14px',
                                        fontFamily: 'Inter, sans-serif',
                                    }}
                                />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99, 102, 241, 0.1)' }} />
                                <Bar 
                                    dataKey="count" 
                                    fill="url(#colorGradient)" 
                                    name="Number of Requests"
                                    radius={[8, 8, 0, 0]}
                                />
                                <defs>
                                    <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#6366f1" stopOpacity={1} />
                                        <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.8} />
                                    </linearGradient>
                                </defs>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Team Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {data.map((item, index) => (
                    <motion.div
                        key={item._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                    >
                        <Card hoverable>
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="p-3 rounded-xl bg-primary-500/20">
                                        <Users className="w-6 h-6 text-primary-400" />
                                    </div>
                                    {item._id === maxTeam._id && (
                                        <div className="px-3 py-1 rounded-full bg-yellow-500/20 border border-yellow-500/30">
                                            <span className="text-xs font-semibold text-yellow-400">Top Team</span>
                                        </div>
                                    )}
                                </div>
                                <h3 className="text-lg font-semibold text-white mb-3">{item.teamName}</h3>
                                <div className="flex items-baseline gap-2">
                                    <p className="text-4xl font-bold text-primary-400">{item.count}</p>
                                    <p className="text-sm text-gray-400">requests</p>
                                </div>
                                <div className="mt-4 pt-4 border-t border-white/10">
                                    <div className="flex items-center gap-2 text-sm text-gray-400">
                                        <Activity className="w-4 h-4" />
                                        <span>
                                            {((item.count / totalRequests) * 100).toFixed(1)}% of total
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default Reports;
