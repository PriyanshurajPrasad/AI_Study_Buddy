import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FaHome,
  FaBook,
  FaRobot,
  FaQuestionCircle,
  FaChartLine,
  FaBookmark,
  FaUser,
  FaCog,
} from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';

const DashboardSidebar = ({ isMobileOpen, onClose }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', icon: FaHome, label: 'Dashboard' },
    { path: '/notes', icon: FaBook, label: 'Notes' },
    { path: '/ai-assistant', icon: FaRobot, label: 'AI Assistant' },
    { path: '/quiz', icon: FaQuestionCircle, label: 'Quiz' },
    { path: '/progress', icon: FaChartLine, label: 'Progress' },
    { path: '/bookmarks', icon: FaBookmark, label: 'Bookmarks' },
    { path: '/profile', icon: FaUser, label: 'Profile' },
    { path: '/settings', icon: FaCog, label: 'Settings' },
  ];

  const isActivePath = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const sidebarContent = (
    <div className="flex flex-col h-screen glass-enhanced w-[280px] shadow-sm">
      {/* Logo Section */}
      <div className="p-4 sm:p-5 border-b border-gray-200/50 bg-white/50 backdrop-blur-sm flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center space-x-3 group" onClick={() => onClose && onClose()}>
          <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 p-2.5 rounded-xl shadow-md shadow-purple-500/20 group-hover:shadow-lg shadow-purple-500/30 transition-all duration-300">
            <FaRobot className="text-lg text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent leading-tight">AI Study Buddy</span>
          </div>
        </Link>
        {/* Mobile Close Button */}
        <button
          onClick={() => onClose && onClose()}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100/80 transition-colors"
          aria-label="Close menu"
        >
          <IoClose className="text-gray-600 text-xl" />
        </button>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item, index) => (
          <Link
            key={item.path}
            to={item.path}
            onClick={() => onClose && onClose()}
            style={{ animationDelay: `${index * 50}ms` }}
            className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group min-h-[44px] ${
              isActivePath(item.path)
                ? 'bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 text-white shadow-md shadow-purple-500/15'
                : 'text-gray-600 hover:bg-gray-100/80 hover:text-gray-900'
            }`}
          >
            <item.icon className={`text-base ${isActivePath(item.path) ? 'text-white' : 'text-gray-400 group-hover:text-gray-600 transition-colors'}`} />
            <span className="font-medium text-sm">{item.label}</span>
            {isActivePath(item.path) && (
              <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full animate-pulse shadow-sm"></div>
            )}
          </Link>
        ))}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block fixed left-0 top-0 z-40">
        {sidebarContent}
      </div>

      {/* Mobile Sidebar */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => onClose && onClose()}></div>
          <div className="absolute left-0 top-0 h-full">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};

export default DashboardSidebar;
