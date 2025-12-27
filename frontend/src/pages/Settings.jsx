import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Lock, Bell, Save, X, Shield, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { userAPI } from '../api/user';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { cn } from '../utils/cn';

const TABS = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'preferences', label: 'Preferences', icon: Bell }
];

const Settings = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('profile');
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await userAPI.updateProfile({
                name: formData.name,
                email: formData.email
            });

            toast.success(response.message || 'Profile updated successfully!');
            setTimeout(() => window.location.reload(), 1500);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();

        if (formData.newPassword !== formData.confirmPassword) {
            toast.error('Passwords do not match!');
            return;
        }

        if (formData.newPassword.length < 6) {
            toast.error('Password must be at least 6 characters!');
            return;
        }

        setLoading(true);

        try {
            const response = await userAPI.changePassword({
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword
            });

            toast.success(response.message || 'Password changed successfully!');
            setFormData({ ...formData, currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to change password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="text-4xl font-bold text-white mb-2">Settings</h1>
                <p className="text-gray-400">
                    Manage your account settings and preferences
                </p>
            </motion.div>

            {/* Tabs Navigation */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <Card>
                    <CardContent className="p-2">
                        <nav className="flex gap-2">
                            {TABS.map((tab) => {
                                const Icon = tab.icon;
                                const isActive = activeTab === tab.id;

                                return (
                                    <motion.button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={cn(
                                            "relative flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-all",
                                            isActive
                                                ? "text-white"
                                                : "text-gray-400 hover:text-white hover:bg-white/5"
                                        )}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        {isActive && (
                                            <motion.div
                                                layoutId="activeTab"
                                                className="absolute inset-0 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl shadow-glow"
                                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                            />
                                        )}
                                        <Icon className="w-5 h-5 relative z-10" />
                                        <span className="relative z-10">{tab.label}</span>
                                    </motion.button>
                                );
                            })}
                        </nav>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
                {/* Profile Tab */}
                {activeTab === 'profile' && (
                    <motion.div
                        key="profile"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Card>
                            <CardHeader>
                                <CardTitle>Profile Information</CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <form onSubmit={handleProfileUpdate} className="space-y-6">
                                    {/* Avatar Section */}
                                    <div className="flex items-center gap-6 pb-6 border-b border-white/10">
                                        <div className="relative">
                                            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center shadow-glow">
                                                <User className="w-12 h-12 text-white" />
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-xl font-semibold text-white">{user?.name}</p>
                                            <p className="text-gray-400">{user?.email}</p>
                                            <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/20 border border-primary-500/30">
                                                <Shield className="w-4 h-4 text-primary-400" />
                                                <span className="text-sm font-medium text-primary-400">{user?.role}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Form Fields */}
                                    <div className="space-y-4">
                                        <Input
                                            label="Full Name"
                                            leftIcon={User}
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="Enter your full name"
                                        />

                                        <Input
                                            label="Email Address"
                                            type="email"
                                            leftIcon={Mail}
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            placeholder="Enter your email"
                                        />
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex justify-end gap-3 pt-6 border-t border-white/10">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            icon={X}
                                            onClick={() => setFormData({
                                                ...formData,
                                                name: user?.name || '',
                                                email: user?.email || ''
                                            })}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            icon={Save}
                                            loading={loading}
                                        >
                                            Save Changes
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {/* Security Tab */}
                {activeTab === 'security' && (
                    <motion.div
                        key="security"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Card>
                            <CardHeader>
                                <CardTitle>Change Password</CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <form onSubmit={handlePasswordChange} className="space-y-6">
                                    <div className="space-y-4">
                                        <Input
                                            label="Current Password"
                                            type="password"
                                            leftIcon={Lock}
                                            value={formData.currentPassword}
                                            onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                                            placeholder="Enter current password"
                                            required
                                        />

                                        <Input
                                            label="New Password"
                                            type="password"
                                            leftIcon={Lock}
                                            value={formData.newPassword}
                                            onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                                            placeholder="Enter new password"
                                            required
                                        />

                                        <Input
                                            label="Confirm New Password"
                                            type="password"
                                            leftIcon={Lock}
                                            value={formData.confirmPassword}
                                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                            placeholder="Confirm new password"
                                            required
                                        />
                                    </div>

                                    {/* Password Requirements */}
                                    <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                                        <p className="text-sm font-medium text-blue-400 mb-2">Password Requirements:</p>
                                        <ul className="text-sm text-gray-400 space-y-1 list-disc list-inside">
                                            <li>Minimum 6 characters</li>
                                            <li>New password must match confirmation</li>
                                        </ul>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex justify-end gap-3 pt-6 border-t border-white/10">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            icon={X}
                                            onClick={() => setFormData({
                                                ...formData,
                                                currentPassword: '',
                                                newPassword: '',
                                                confirmPassword: ''
                                            })}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            icon={Save}
                                            loading={loading}
                                        >
                                            Update Password
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {/* Preferences Tab */}
                {activeTab === 'preferences' && (
                    <motion.div
                        key="preferences"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Card>
                            <CardHeader>
                                <CardTitle>Application Preferences</CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="space-y-6">
                                    {/* Email Notifications */}
                                    <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                                        <div className="flex items-start gap-4">
                                            <div className="p-2 rounded-lg bg-primary-500/20">
                                                <Mail className="w-5 h-5 text-primary-400" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-white">Email Notifications</p>
                                                <p className="text-sm text-gray-400 mt-1">
                                                    Receive email updates for maintenance requests
                                                </p>
                                            </div>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="sr-only peer" defaultChecked />
                                            <div className="w-14 h-7 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-primary-500 peer-checked:to-secondary-500"></div>
                                        </label>
                                    </div>

                                    {/* Desktop Notifications */}
                                    <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                                        <div className="flex items-start gap-4">
                                            <div className="p-2 rounded-lg bg-yellow-500/20">
                                                <Bell className="w-5 h-5 text-yellow-400" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-white">Desktop Notifications</p>
                                                <p className="text-sm text-gray-400 mt-1">
                                                    Show desktop alerts for important updates
                                                </p>
                                            </div>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="sr-only peer" />
                                            <div className="w-14 h-7 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-primary-500 peer-checked:to-secondary-500"></div>
                                        </label>
                                    </div>

                                    {/* Auto-refresh */}
                                    <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                                        <div className="flex items-start gap-4">
                                            <div className="p-2 rounded-lg bg-green-500/20">
                                                <Bell className="w-5 h-5 text-green-400" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-white">Auto-refresh Dashboard</p>
                                                <p className="text-sm text-gray-400 mt-1">
                                                    Automatically refresh data every 5 minutes
                                                </p>
                                            </div>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="sr-only peer" defaultChecked />
                                            <div className="w-14 h-7 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-primary-500 peer-checked:to-secondary-500"></div>
                                        </label>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Settings;
