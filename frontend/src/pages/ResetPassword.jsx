import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, Shield, CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { toast } from 'sonner';
import { authAPI } from '../api/auth';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [resetSuccess, setResetSuccess] = useState(false);
    const [token, setToken] = useState('');

    useEffect(() => {
        // Get token from URL params
        const resetToken = searchParams.get('token');
        if (!resetToken) {
            toast.error('Invalid or missing reset token');
            setTimeout(() => navigate('/login'), 2000);
        } else {
            setToken(resetToken);
        }
    }, [searchParams, navigate]);

    const getPasswordStrength = (pass) => {
        if (pass.length === 0) return { strength: 0, label: '', color: '' };
        if (pass.length < 6) return { strength: 25, label: 'Weak', color: 'bg-red-500' };
        if (pass.length < 10) return { strength: 50, label: 'Fair', color: 'bg-yellow-500' };
        if (pass.length < 12 && /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(pass)) {
            return { strength: 75, label: 'Good', color: 'bg-blue-500' };
        }
        if (/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(pass)) {
            return { strength: 100, label: 'Strong', color: 'bg-green-500' };
        }
        return { strength: 60, label: 'Fair', color: 'bg-yellow-500' };
    };

    const passwordStrength = getPasswordStrength(password);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (password.length < 6) {
            toast.error('Password must be at least 6 characters long');
            return;
        }

        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        setLoading(true);

        try {
            await authAPI.resetPassword(token, password);
            
            toast.success('Password reset successful!');
            setResetSuccess(true);
            
            // Redirect to login after 2 seconds
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (error) {
            toast.error(
                error.response?.data?.message || 
                'Failed to reset password. The link may have expired.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-dark-500 via-dark-400 to-dark-500 p-4">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl animate-pulse-glow" />
                <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-secondary-500/10 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1s' }} />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="relative w-full max-w-[450px]"
            >
                {/* Card */}
                <div className="bg-white dark:bg-dark-400 rounded-2xl shadow-2xl shadow-black/20 p-8 sm:p-10">
                    {/* Logo */}
                    <div className="flex justify-center mb-8">
                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center shadow-lg shadow-primary-500/30">
                            <Shield className="w-9 h-9 text-white" />
                        </div>
                    </div>

                    {resetSuccess ? (
                        // Success state
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center"
                        >
                            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-6">
                                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                            </div>
                            <h1 className="text-2xl font-bold text-dark-400 dark:text-white mb-3">
                                Password Reset!
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                                Your password has been successfully reset.
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Redirecting to login...
                            </p>
                        </motion.div>
                    ) : (
                        // Form state
                        <>
                            <div className="text-center mb-8">
                                <h1 className="text-3xl font-bold text-dark-400 dark:text-white mb-3">
                                    New Password
                                </h1>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Enter your new password
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* New Password Input */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        New Password
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Lock className="w-5 h-5 text-gray-400" />
                                        </div>
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full h-12 pl-12 pr-12 bg-gray-50 dark:bg-dark-500 text-dark-400 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                            placeholder="Enter new password"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                        >
                                            {showPassword ? (
                                                <EyeOff className="w-5 h-5" />
                                            ) : (
                                                <Eye className="w-5 h-5" />
                                            )}
                                        </button>
                                    </div>

                                    {/* Password Strength Indicator */}
                                    {password && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            className="mt-2"
                                        >
                                            <div className="flex items-center gap-2 mb-1">
                                                <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${passwordStrength.strength}%` }}
                                                        className={`h-full ${passwordStrength.color} transition-all duration-300`}
                                                    />
                                                </div>
                                                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                                    {passwordStrength.label}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                Use 8+ characters with a mix of letters, numbers & symbols
                                            </p>
                                        </motion.div>
                                    )}
                                </div>

                                {/* Confirm Password Input */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Confirm Password
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Lock className="w-5 h-5 text-gray-400" />
                                        </div>
                                        <input
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="w-full h-12 pl-12 pr-12 bg-gray-50 dark:bg-dark-500 text-dark-400 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                            placeholder="Confirm new password"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                        >
                                            {showConfirmPassword ? (
                                                <EyeOff className="w-5 h-5" />
                                            ) : (
                                                <Eye className="w-5 h-5" />
                                            )}
                                        </button>
                                    </div>

                                    {/* Password Match Indicator */}
                                    {confirmPassword && (
                                        <motion.p
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className={`text-xs mt-2 ${
                                                password === confirmPassword
                                                    ? 'text-green-600 dark:text-green-400'
                                                    : 'text-red-600 dark:text-red-400'
                                            }`}
                                        >
                                            {password === confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                                        </motion.p>
                                    )}
                                </div>

                                {/* Submit Button */}
                                <motion.button
                                    type="submit"
                                    disabled={loading || !password || !confirmPassword || password !== confirmPassword}
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.99 }}
                                    className="w-full h-12 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-medium rounded-lg shadow-lg shadow-primary-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
                                >
                                    {loading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <Lock className="w-5 h-5 mr-2" />
                                            Reset Password
                                        </>
                                    )}
                                </motion.button>
                            </form>
                        </>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default ResetPassword;
