import { useAuth } from '../contexts/AuthContext';
import { useSidebar } from '../contexts/SidebarContext';

const MenuIcon = ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" fill="currentColor" />
    </svg>
);

const Navbar = () => {
    const { user, logout } = useAuth();
    const { toggleSidebar } = useSidebar();

    return (
        <div className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={toggleSidebar}
                        className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 p-2 rounded-lg transition-colors"
                        title="Toggle sidebar"
                    >
                        <MenuIcon className="w-6 h-6" />
                    </button>
                    <p className="text-gray-900 font-semibold">
                        Welcome back, {user?.name} 👋
                    </p>
                </div>

                <button
                    onClick={logout}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    Logout
                </button>
            </div>
        </div>
    );
};

export default Navbar;
