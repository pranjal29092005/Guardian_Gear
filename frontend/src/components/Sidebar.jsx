import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    LayoutDashboard, 
    Settings, 
    Package, 
    Calendar, 
    BarChart3,
    FolderKanban,
    Grid3x3,
    Users,
    Factory,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { useSidebar } from '../contexts/SidebarContext';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../utils/cn';

const Sidebar = () => {
    const location = useLocation();
    const { isCollapsed, toggleSidebar } = useSidebar();
    const { hasRole, user } = useAuth();

    const menuItems = [
        { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/equipment', label: 'Equipment', icon: Package },
        { path: '/kanban', label: 'Kanban', icon: FolderKanban },
        { path: '/calendar', label: 'Calendar', icon: Calendar },
        { path: '/reports', label: 'Reports', icon: BarChart3 },
        { path: '/categories', label: 'Categories', icon: Grid3x3, managerOnly: true },
        { path: '/teams', label: 'Teams', icon: Users, managerOnly: true },
        { path: '/workcenters', label: 'Work Centers', icon: Factory },
        { path: '/settings', label: 'Settings', icon: Settings }
    ];

    const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

    return (
        <motion.div
            initial={false}
            animate={{ width: isCollapsed ? 72 : 280 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="fixed left-0 top-0 h-screen bg-gradient-to-b from-dark-400 via-dark-500 to-dark-600 border-r border-white/10 backdrop-blur-xl z-40"
        >
            <div className="flex flex-col h-full">
                {/* Header/Logo */}
                <div className="p-6 border-b border-white/10">
                    <AnimatePresence mode="wait">
                        {isCollapsed ? (
                            <motion.div
                                key="collapsed"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="flex justify-center"
                            >
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center shadow-glow">
                                    <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none">
                                        <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="expanded"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="flex items-center gap-3"
                            >
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center shadow-glow">
                                    <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none">
                                        <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold gradient-text">Guardian Gear</h1>
                                    <p className="text-xs text-gray-400 mt-0.5">Maintenance Tracker</p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Navigation */}
                <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
                    {menuItems
                        .filter(item => !item.managerOnly || hasRole(['MANAGER']))
                        .map((item) => {
                            const Icon = item.icon;
                            const active = isActive(item.path);
                            
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={cn(
                                        'group relative flex items-center gap-3 px-3 py-3 rounded-xl',
                                        'transition-all duration-200',
                                        'text-sm font-medium',
                                        active
                                            ? 'bg-gradient-to-r from-primary-600/20 to-secondary-600/20 text-white shadow-glow-sm'
                                            : 'text-gray-400 hover:text-white hover:bg-white/5',
                                        isCollapsed && 'justify-center'
                                    )}
                                    title={isCollapsed ? item.label : ''}
                                >
                                    {/* Active indicator */}
                                    {active && (
                                        <motion.div
                                            layoutId="activeTab"
                                            className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-primary-500 to-secondary-500 rounded-r-full"
                                            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                                        />
                                    )}
                                    
                                    {/* Icon */}
                                    <Icon className={cn(
                                        'w-5 h-5 transition-transform duration-200',
                                        active ? 'text-primary-400' : 'group-hover:scale-110'
                                    )} />
                                    
                                    {/* Label */}
                                    <AnimatePresence>
                                        {!isCollapsed && (
                                            <motion.span
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -10 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                {item.label}
                                            </motion.span>
                                        )}
                                    </AnimatePresence>
                                </Link>
                            );
                        })}
                </nav>

                {/* User Profile Section */}
                <div className="p-3 border-t border-white/10">
                    <AnimatePresence mode="wait">
                        {isCollapsed ? (
                            <motion.div
                                key="collapsed-user"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex justify-center"
                            >
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-semibold shadow-glow-sm">
                                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="expanded-user"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                            >
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-semibold shadow-glow-sm">
                                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-white truncate">
                                        {user?.name || 'User'}
                                    </p>
                                    <p className="text-xs text-gray-400 truncate">
                                        {user?.role || 'Role'}
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Toggle Button */}
                <button
                    onClick={toggleSidebar}
                    className={cn(
                        'absolute -right-3 top-20',
                        'w-6 h-6 rounded-full',
                        'bg-dark-400 border border-white/20',
                        'flex items-center justify-center',
                        'text-gray-400 hover:text-white',
                        'hover:bg-primary-500/20 hover:border-primary-500/50',
                        'transition-all duration-200',
                        'shadow-lg hover:shadow-glow-sm'
                    )}
                >
                    {isCollapsed ? (
                        <ChevronRight className="w-4 h-4" />
                    ) : (
                        <ChevronLeft className="w-4 h-4" />
                    )}
                </button>
            </div>
        </motion.div>
    );
};

export default Sidebar;
