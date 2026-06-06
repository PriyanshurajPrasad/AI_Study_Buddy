import { FaRobot } from 'react-icons/fa';

const AuthLayout = ({ children, title }) => {
  return (
    <div className="min-h-screen bg-slate-900 relative overflow-hidden flex items-center justify-center p-4 sm:p-8">
      {/* Decorative Background Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob-delayed"></div>
        <div className="absolute -bottom-32 left-20 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse-glow"></div>
      </div>

      <div className="max-w-md w-full relative z-10">
        {/* Logo Section */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-purple-600 rounded-full blur-2xl opacity-50 animate-pulse"></div>
            <div className="relative bg-gradient-to-r from-primary-500 to-purple-600 p-4 rounded-full">
              <FaRobot className="text-4xl text-white" />
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3">
            <span className="bg-gradient-to-r from-primary-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              AI Study Buddy
            </span>
          </h1>
          <p className="text-slate-400 text-lg">{title}</p>
        </div>

        {/* Glassmorphism Card */}
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;
