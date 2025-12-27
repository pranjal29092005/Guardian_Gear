import { Link, useLocation } from 'react-router-dom';
import { useSidebar } from '../contexts/SidebarContext';
import { useAuth } from '../contexts/AuthContext';
import {
    GearGuardLogo,
    DashboardIcon,
    EquipmentIcon,
    KanbanIcon,
    CalendarIcon,
    ReportsIcon,
    SettingsIcon,
    CategoryIcon,
    TeamIcon
} from './Icons';

const Sidebar = () => {
    const location = useLocation();
    const { isCollapsed } = useSidebar();
    const { hasRole } = useAuth();

    const menuItems = [
        { path: '/dashboard', label: 'Dashboard', icon: DashboardIcon },
        { path: '/equipment', label: 'Equipment', icon: EquipmentIcon },
        { path: '/kanban', label: 'Kanban', icon: KanbanIcon },
        { path: '/calendar', label: 'Calendar', icon: CalendarIcon },
        { path: '/reports', label: 'Reports', icon: ReportsIcon },
        { path: '/categories', label: 'Categories', icon: CategoryIcon, managerOnly: true },
        { path: '/teams', label: 'Teams', icon: TeamIcon, managerOnly: true },
        { path: '/workcenters', label: 'Work Centers', icon: EquipmentIcon },
        { path: '/settings', label: 'Settings', icon: SettingsIcon }
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <div
            className={`bg-slate-900 text-white h-screen fixed left-0 top-0 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'
                }`}
        >
            {/* Header */}
            <div className={`p-6 flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
                {isCollapsed ? (
                    <GearGuardLogo className="w-10 h-10" />
                ) : (
                    <div className="flex items-center gap-3">
                        <GearGuardLogo className="w-10 h-10" />
                        <div>
                            <h1 className="text-2xl font-bold">GearGuard</h1>
                            <p className="text-sm text-gray-400 mt-1">Maintenance Tracker</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Navigation */}
            <nav className="mt-6">
                {menuItems
                    .filter(item => !item.managerOnly || hasRole(['MANAGER']))
                    .map((item) => {
                        const IconComponent = item.icon;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${isActive(item.path)
                                    ? 'bg-blue-600 text-white'
                                    : 'text-gray-300 hover:bg-slate-800'
                                    } ${isCollapsed ? 'justify-center' : ''}`}
                                title={isCollapsed ? item.label : ''}
                            >
                                <IconComponent className="w-5 h-5" />
                                {!isCollapsed && <span className="ml-3">{item.label}</span>}
                            </Link>
                        );
                    })}
            </nav>
        </div>
    );
};

export default Sidebar;
