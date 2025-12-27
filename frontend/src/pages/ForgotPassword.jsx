import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, Shield } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { toast } from 'sonner';
import { authAPI } from '../api/auth';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) {
            toast.error('Please enter a valid email address');
            return;
        }

        setLoading(true);

        try {
            await authAPI.forgotPassword(email);
            toast.success('Reset link sent! Check your email.');
            setEmailSent(true);
        } catch (error) {
            toast.error(
                error.response?.data?.message || 
                'Failed to send reset link. Please try again.'
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

                    {emailSent ? (
                        // Success state
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center"
                        >
                            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-6">
                                <Mail className="w-8 h-8 text-green-600 dark:text-green-400" />
                            </div>
                            <h1 className="text-2xl font-bold text-dark-400 dark:text-white mb-3">
                                Check Your Email
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 mb-8">
                                We've sent a password reset link to <span className="font-semibold text-dark-400 dark:text-white">{email}</span>
                            </p>
                            <Link to="/login">
                                <Button variant="outline" className="w-full">
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Back to Login
                                </Button>
                            </Link>
                        </motion.div>
                    ) : (
                        // Form state
                        <>
                            <div className="text-center mb-8">
                                <h1 className="text-3xl font-bold text-dark-400 dark:text-white mb-3">
                                    Reset Password
                                </h1>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Enter your email to receive a reset link
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Email Input */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Mail className="w-5 h-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full h-12 pl-12 pr-4 bg-gray-50 dark:bg-dark-500 text-dark-400 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                            placeholder="you@company.com"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <motion.button
                                    type="submit"
                                    disabled={loading}
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.99 }}
                                    className="w-full h-12 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-medium rounded-lg shadow-lg shadow-primary-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
                                >
                                    {loading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <Mail className="w-5 h-5 mr-2" />
                                            Send Reset Link
                                        </>
                                    )}
                                </motion.button>

                                {/* Back to Login */}
                                <div className="text-center">
                                    <Link 
                                        to="/login"
                                        className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
                                    >
                                        <ArrowLeft className="w-4 h-4 mr-1" />
                                        Back to Login
                                    </Link>
                                </div>
                            </form>
                        </>
                    )}
                </div>

                {/* Footer */}
                <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
                    Remember your password?{' '}
                    <Link 
                        to="/login" 
                        className="font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
                    >
                        Sign in
                    </Link>
                </p>
            </motion.div>
        </div>
    );
};

export default ForgotPassword;
