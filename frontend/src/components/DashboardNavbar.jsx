import { FaBars, FaBell, FaSearch, FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const DashboardNavbar = ({ onMobileMenuClick }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="h-[64px] sm:h-[72px] glass-enhanced border-b border-gray-200/50 fixed left-0 lg:left-[280px] right-0 top-0 z-30 max-w-full">
      <div className="flex items-center justify-between px-3 sm:px-4 md:px-6 h-full">
        {/* Left Section */}
        <div className="flex items-center gap-3 sm:space-x-4">
          <button
            onClick={onMobileMenuClick}
            className="lg:hidden p-3 rounded-xl hover:bg-gray-100/80 transition-all duration-200 w-10 h-10 flex items-center justify-center min-h-[40px] min-w-[40px]"
            aria-label="Open menu"
          >
            <FaBars className="text-gray-600 text-base" />
          </button>
        </div>

        {/* Mobile Search - Compact */}
        <div className="sm:hidden flex-1 max-w-[240px] mx-0">
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400 text-sm left-3" />
            </div>
            <input
              type="text"
              placeholder="Search..."
              className="input-modern w-full pl-9 pr-3 py-2 bg-gray-50/80 border border-gray-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-xs h-[44px]"
            />
          </div>
        </div>

        {/* Center Section - Search Bar - Desktop Only */}
        <div className="hidden sm:flex flex-1 max-w-2xl mx-4 sm:mx-8">
          <div className="relative w-full group">
            <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400 group-hover:text-gray-500 transition-colors text-sm sm:text-base" />
            </div>
            <input
              type="text"
              placeholder="Search notes, quizzes, AI responses..."
              className="input-modern w-full pl-9 sm:pl-12 pr-16 sm:pr-24 py-2 sm:py-3 bg-gray-50/80 border border-gray-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent focus:bg-white transition-all duration-200 placeholder-gray-400 text-xs sm:text-sm"
            />
            <div className="absolute inset-y-0 right-2 flex items-center">
              <span className="px-2 sm:px-3 py-1 bg-gray-100/80 text-gray-500 text-xs rounded-lg font-medium border border-gray-200/50 hover:bg-gray-200/80 transition-colors cursor-pointer hidden sm:block">
                Ctrl + K
              </span>
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2 sm:space-x-3">
          {/* Notification Bell */}
          <button className="relative p-2 sm:p-2.5 rounded-xl hover:bg-gray-100/80 transition-all duration-200 group w-10 h-10 sm:min-h-[44px] sm:min-w-[44px] flex items-center justify-center" aria-label="Notifications">
            <FaBell className="text-gray-500 group-hover:text-gray-700 transition-colors text-sm sm:text-base" />
            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-gradient-to-r from-red-500 to-pink-500 rounded-full border-2 border-white shadow-sm"></span>
          </button>

          {/* User Greeting - Desktop */}
          <div className="hidden md:flex items-center space-x-3 pl-3 border-l border-gray-200/50">
            <div className="text-right">
              <p className="text-xs text-gray-500 font-medium">Hello,</p>
              <p className="text-sm font-semibold text-gray-800">{user?.name || 'User'}</p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-purple-500 to-cyan-500 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-purple-500/20">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
          </div>

          {/* Logout Button - Desktop */}
          <button
            onClick={handleLogout}
            className="hidden md:flex p-2.5 rounded-xl hover:bg-red-50/80 transition-all duration-200 group"
            title="Logout"
          >
            <FaSignOutAlt className="text-gray-500 group-hover:text-red-500 transition-colors" />
          </button>

          {/* Mobile Profile */}
          <div className="md:hidden w-11 h-11 bg-gradient-to-br from-blue-500 via-purple-500 to-cyan-500 rounded-xl flex items-center justify-center text-white font-bold text-xs sm:text-sm shadow-lg shadow-purple-500/20 flex-shrink-0">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardNavbar;
