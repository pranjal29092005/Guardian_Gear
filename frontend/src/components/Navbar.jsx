import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Menu, 
    Search, 
    Bell, 
    LogOut, 
    User, 
    Settings,
    ChevronDown 
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSidebar } from '../contexts/SidebarContext';
import { cn } from '../utils/cn';
import { CountBadge } from './ui/Badge';

const Navbar = () => {
    const { user, logout } = useAuth();
    const { toggleSidebar } = useSidebar();
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);

    // Mock notification count - replace with actual data
    const notificationCount = 3;

    return (
        <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="sticky top-0 z-30 backdrop-blur-xl bg-dark-400/80 border-b border-white/10"
        >
            <div className="px-6 py-4">
                <div className="flex items-center justify-between">
                    {/* Left Section */}
                    <div className="flex items-center gap-4">
                        {/* Hamburger Menu */}
                        <button
                            onClick={toggleSidebar}
                            className={cn(
                                'p-2 rounded-xl',
                                'text-gray-400 hover:text-white',
                                'hover:bg-white/10',
                                'transition-all duration-200',
                                'lg:hidden'
                            )}
                            title="Toggle sidebar"
                        >
                            <Menu className="w-6 h-6" />
                        </button>

                        {/* Welcome Message */}
                        <div className="hidden sm:block">
                            <h2 className="text-lg font-semibold text-white">
                                Welcome back, <span className="gradient-text">{user?.name}</span> 👋
                            </h2>
                            <p className="text-xs text-gray-400 mt-0.5">
                                {new Date().toLocaleDateString('en-US', { 
                                    weekday: 'long', 
                                    year: 'numeric', 
                                    month: 'long', 
                                    day: 'numeric' 
                                })}
                            </p>
                        </div>
                    </div>

                    {/* Right Section */}
                    <div className="flex items-center gap-3">
                        {/* Search Button */}
                        <button
                            className={cn(
                                'hidden md:flex items-center gap-2',
                                'px-4 py-2 rounded-xl',
                                'bg-white/5 border border-white/10',
                                'text-gray-400 hover:text-white',
                                'hover:border-primary-500/50',
                                'transition-all duration-200',
                                'text-sm'
                            )}
                        >
                            <Search className="w-4 h-4" />
                            <span className="hidden lg:inline">Search...</span>
                            <kbd className="hidden lg:inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white/10 text-xs">
                                ⌘K
                            </kbd>
                        </button>

                        {/* Mobile Search Icon */}
                        <button
                            className={cn(
                                'md:hidden p-2 rounded-xl',
                                'text-gray-400 hover:text-white',
                                'hover:bg-white/10',
                                'transition-all duration-200'
                            )}
                        >
                            <Search className="w-5 h-5" />
                        </button>

                        {/* Notifications */}
                        <div className="relative">
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                className={cn(
                                    'relative p-2 rounded-xl',
                                    'text-gray-400 hover:text-white',
                                    'hover:bg-white/10',
                                    'transition-all duration-200'
                                )}
                            >
                                <Bell className="w-5 h-5" />
                                <CountBadge count={notificationCount} />
                            </button>

                            {/* Notification Dropdown */}
                            <AnimatePresence>
                                {showNotifications && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-40"
                                            onClick={() => setShowNotifications(false)}
                                        />
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            transition={{ duration: 0.2 }}
                                            className={cn(
                                                'absolute right-0 top-full mt-2 w-80',
                                                'backdrop-blur-xl bg-dark-300/95 border border-white/10',
                                                'rounded-xl shadow-2xl',
                                                'z-50'
                                            )}
                                        >
                                            <div className="p-4 border-b border-white/10">
                                                <h3 className="font-semibold text-white">Notifications</h3>
                                            </div>
                                            <div className="p-2 max-h-96 overflow-y-auto">
                                                <p className="text-center text-gray-400 py-8 text-sm">
                                                    No new notifications
                                                </p>
                                            </div>
                                        </motion.div>
                                    </>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Profile Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setShowProfileMenu(!showProfileMenu)}
                                className={cn(
                                    'flex items-center gap-2 px-3 py-2 rounded-xl',
                                    'bg-white/5 hover:bg-white/10',
                                    'border border-white/10',
                                    'transition-all duration-200'
                                )}
                            >
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white text-sm font-semibold shadow-glow-sm">
                                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                                </div>
                                <div className="hidden md:block text-left">
                                    <p className="text-sm font-medium text-white leading-none">
                                        {user?.name || 'User'}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-0.5">
                                        {user?.role || 'Role'}
                                    </p>
                                </div>
                                <ChevronDown className={cn(
                                    'w-4 h-4 text-gray-400 transition-transform',
                                    showProfileMenu && 'rotate-180'
                                )} />
                            </button>

                            {/* Profile Dropdown Menu */}
                            <AnimatePresence>
                                {showProfileMenu && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-40"
                                            onClick={() => setShowProfileMenu(false)}
                                        />
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            transition={{ duration: 0.2 }}
                                            className={cn(
                                                'absolute right-0 top-full mt-2 w-56',
                                                'backdrop-blur-xl bg-dark-300/95 border border-white/10',
                                                'rounded-xl shadow-2xl',
                                                'z-50',
                                                'overflow-hidden'
                                            )}
                                        >
                                            {/* User Info */}
                                            <div className="p-4 border-b border-white/10">
                                                <p className="font-medium text-white">{user?.name}</p>
                                                <p className="text-xs text-gray-400 mt-0.5">{user?.email}</p>
                                            </div>

                                            {/* Menu Items */}
                                            <div className="p-2">
                                                <button
                                                    className={cn(
                                                        'w-full flex items-center gap-3 px-3 py-2 rounded-lg',
                                                        'text-sm text-gray-300 hover:text-white',
                                                        'hover:bg-white/10',
                                                        'transition-all duration-200'
                                                    )}
                                                >
                                                    <User className="w-4 h-4" />
                                                    Profile
                                                </button>
                                                <button
                                                    className={cn(
                                                        'w-full flex items-center gap-3 px-3 py-2 rounded-lg',
                                                        'text-sm text-gray-300 hover:text-white',
                                                        'hover:bg-white/10',
                                                        'transition-all duration-200'
                                                    )}
                                                >
                                                    <Settings className="w-4 h-4" />
                                                    Settings
                                                </button>
                                            </div>

                                            {/* Logout */}
                                            <div className="p-2 border-t border-white/10">
                                                <button
                                                    onClick={logout}
                                                    className={cn(
                                                        'w-full flex items-center gap-3 px-3 py-2 rounded-lg',
                                                        'text-sm text-rose-400 hover:text-rose-300',
                                                        'hover:bg-rose-500/10',
                                                        'transition-all duration-200'
                                                    )}
                                                >
                                                    <LogOut className="w-4 h-4" />
                                                    Logout
                                                </button>
                                            </div>
                                        </motion.div>
                                    </>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default Navbar;
