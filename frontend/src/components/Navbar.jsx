import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FaHome,
  FaBook,
  FaRobot,
  FaQuestionCircle,
  FaChartLine,
  FaUser,
  FaSignOutAlt,
  FaBars,
  FaTimes,
} from 'react-icons/fa';
import { useState } from 'react';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard', icon: FaHome, label: 'Dashboard', protected: true },
    { path: '/notes', icon: FaBook, label: 'Notes', protected: true },
    { path: '/ai-assistant', icon: FaRobot, label: 'AI Assistant', protected: true },
    { path: '/quiz', icon: FaQuestionCircle, label: 'Quiz', protected: true },
    { path: '/progress', icon: FaChartLine, label: 'Progress', protected: true },
    { path: '/profile', icon: FaUser, label: 'Profile', protected: true },
  ];

  const filteredNavItems = navItems.filter((item) => !item.protected || isAuthenticated);

  const isActivePath = (path) => location.pathname === path;

  return (
    <nav className="bg-slate-900/80 backdrop-blur-xl shadow-lg border-b border-white/10 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-purple-600 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
                <div className="relative bg-gradient-to-r from-primary-500 to-purple-600 p-2 rounded-xl">
                  <FaRobot className="text-xl text-white" />
                </div>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">
                AI Study Buddy
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {filteredNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActivePath(item.path)
                    ? 'bg-gradient-to-r from-primary-500 to-purple-600 text-white shadow-lg shadow-purple-500/25'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <item.icon />
                <span>{item.label}</span>
              </Link>
            ))}

            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200"
              >
                <FaSignOutAlt />
                <span>Logout</span>
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-slate-300 hover:text-white p-2"
            >
              {isMobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-slate-900/95 backdrop-blur-xl border-t border-white/10">
          <div className="px-4 pt-2 pb-4 space-y-2">
            {filteredNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 ${
                  isActivePath(item.path)
                    ? 'bg-gradient-to-r from-primary-500 to-purple-600 text-white'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <item.icon />
                <span>{item.label}</span>
              </Link>
            ))}

            {isAuthenticated && (
              <button
                onClick={() => {
                  handleLogout();
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 w-full transition-all duration-200"
              >
                <FaSignOutAlt />
                <span>Logout</span>
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
