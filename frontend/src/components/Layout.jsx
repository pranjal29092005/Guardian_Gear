import { motion } from 'framer-motion';
import { useSidebar } from '../contexts/SidebarContext';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const Layout = ({ children }) => {
    const { isCollapsed } = useSidebar();

    return (
        <div className="flex h-screen bg-dark-500 mesh-bg overflow-hidden">
            <Sidebar />
            <motion.div
                animate={{ marginLeft: isCollapsed ? 72 : 280 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="flex-1 flex flex-col overflow-hidden"
            >
                <Navbar />
                <main className="flex-1 overflow-y-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="p-6 md:p-8"
                    >
                        {children}
                    </motion.div>
                </main>
            </motion.div>
        </div>
    );
};

export default Layout;
