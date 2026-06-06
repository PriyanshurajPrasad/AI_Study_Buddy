import { Link } from 'react-router-dom';
import { FaRobot, FaBook, FaBrain, FaTrophy, FaArrowRight } from 'react-icons/fa';
import { IoSparkles } from 'react-icons/io5';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';

const Home = () => {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: FaBook,
      title: 'Upload Notes',
      description: 'Upload PDF and text files to extract and organize your study materials',
      gradient: 'from-blue-500 to-cyan-400',
    },
    {
      icon: FaBrain,
      title: 'AI-Powered Learning',
      description: 'Get summaries, explanations in Hinglish, and personalized study help',
      gradient: 'from-purple-500 to-pink-400',
    },
    {
      icon: FaTrophy,
      title: 'Track Progress',
      description: 'Monitor your learning streak, quiz scores, and completed topics',
      gradient: 'from-orange-500 to-amber-400',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden">
      {/* Decorative Background Blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob-delayed"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-glow"></div>
      </div>

      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-purple-600 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
                <div className="relative bg-gradient-to-r from-primary-500 to-purple-600 p-2 rounded-xl">
                  <FaRobot className="text-xl text-white" />
                </div>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
                AI Study Buddy
              </span>
            </Link>
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <Link to="/dashboard">
                  <Button variant="primary">Go to Dashboard</Button>
                </Link>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="secondary" className="hidden sm:block">Login</Button>
                  </Link>
                  <Link to="/register">
                    <Button variant="primary">Sign Up</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 relative z-10">
        <div className="text-center">
          {/* Icon with floating animation */}
          <div className="relative inline-block mb-8 animate-float">
            <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-purple-600 rounded-full blur-2xl opacity-40"></div>
            <div className="relative bg-gradient-to-r from-primary-500 to-purple-600 p-6 rounded-full">
              <FaRobot className="text-5xl text-white" />
            </div>
            <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500 p-2 rounded-full animate-bounce">
              <IoSparkles className="text-white text-sm" />
            </div>
          </div>

          {/* Title with gradient text */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 animate-fade-up">
            <span className="bg-gradient-to-r from-primary-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              AI Study Buddy
            </span>
          </h1>

          {/* Description */}
          <p className="text-lg sm:text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed animate-fade-up-delayed">
            Your smart learning assistant powered by AI. Upload notes, get summaries,
            explanations in Hinglish, generate quizzes, and track your progress.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 animate-fade-up-delayed">
            {isAuthenticated ? (
              <Link to="/dashboard" className="w-full sm:w-auto">
                <Button 
                  variant="primary" 
                  size="lg" 
                  className="w-full sm:w-auto group relative overflow-hidden"
                >
                  <span className="relative z-10 flex items-center justify-center">
                    Go to Dashboard <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/register" className="w-full sm:w-auto">
                  <Button 
                    variant="primary" 
                    size="lg" 
                    className="w-full sm:w-auto group relative overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center justify-center">
                      Get Started Free <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </Button>
                </Link>
                <Link to="/login" className="w-full sm:w-auto">
                  <Button 
                    variant="secondary" 
                    size="lg" 
                    className="w-full sm:w-auto hover:bg-gray-100 transition-colors"
                  >
                    Login
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-24 sm:mt-32">
          <div className="text-center mb-16 animate-fade-up">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Powerful Features
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Everything you need to supercharge your learning journey
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:scale-105"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className={`relative mb-6 inline-block`}>
                  <div className={`absolute inset-0 bg-gradient-to-r ${feature.gradient} rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity`}></div>
                  <div className={`relative bg-gradient-to-r ${feature.gradient} p-4 rounded-2xl`}>
                    <feature.icon className="text-3xl text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-24 sm:mt-32">
          <div className="relative bg-white rounded-3xl shadow-2xl p-8 sm:p-12 max-w-4xl mx-auto overflow-hidden">
            {/* Gradient border effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary-500 via-purple-500 to-pink-500 opacity-10"></div>
            <div className="absolute inset-0.5 bg-gradient-to-r from-primary-500 via-purple-500 to-pink-500 rounded-3xl opacity-20 blur-lg"></div>
            
            <div className="relative z-10 text-center">
              <div className="inline-flex items-center justify-center mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-purple-600 rounded-full blur-lg opacity-50"></div>
                  <div className="relative bg-gradient-to-r from-primary-500 to-purple-600 p-4 rounded-full">
                    <IoSparkles className="text-2xl text-white animate-pulse" />
                  </div>
                </div>
              </div>
              
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                Ready to Supercharge Your Learning?
              </h2>
              <p className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
                Join thousands of students who are already learning smarter with AI Study Buddy
              </p>
              
              {isAuthenticated ? (
                <Link to="/dashboard" className="inline-block">
                  <Button 
                    variant="primary" 
                    size="lg" 
                    className="group relative overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center">
                      Go to Dashboard <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </Button>
                </Link>
              ) : (
                <Link to="/register" className="inline-block">
                  <Button 
                    variant="primary" 
                    size="lg" 
                    className="group relative overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center">
                      Start Learning Now <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-md border-t border-gray-200 mt-20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p className="flex items-center justify-center gap-2">
              <span>&copy; 2024 AI Study Buddy. All rights reserved.</span>
              <span className="text-primary-500">•</span>
              <span className="text-sm">Made with ❤️ for students</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
