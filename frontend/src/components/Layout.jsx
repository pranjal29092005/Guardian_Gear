import { useSidebar } from '../contexts/SidebarContext';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const Layout = ({ children }) => {
    const { isCollapsed } = useSidebar();

    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar />
            <div
                className="flex-1 flex flex-col transition-all duration-300"
                style={{ marginLeft: isCollapsed ? '5rem' : '16rem' }}
            >
                <Navbar />
                <main className="flex-1 overflow-y-auto p-8">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;
