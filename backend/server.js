const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const path = require('path');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Log when server starts
console.log('🚀 Starting AI Study Buddy Backend Server...');

// Connect to MongoDB with logging
console.log('📡 Connecting to MongoDB...');
connectDB().then(() => {
  console.log('✅ MongoDB connected successfully!');
  console.log('📊 Database ready for operations');
}).catch((err) => {
  console.error('❌ MongoDB connection error:', err.message);
  console.error('🔒 Please ensure MongoDB is running and your connection string is correct');
  process.exit(1);
});

// Middleware
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:5173",
  process.env.CLIENT_URL,
  "https://ai-study-buddy-git-main-priyanshurajs-projects.vercel.app",
  "https://ai-study-buddy-8mm5xz9u-priyanshurajs-projects.vercel.app"
].filter(Boolean);

const corsOptions = {
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Log CORS configuration for debugging
console.log('🌍 CORS Configuration:');
console.log('   CLIENT_URL:', process.env.CLIENT_URL || 'Not set');
console.log('   Allowed Origins:', allowedOrigins);
console.log('   Credentials:', corsOptions.credentials);
console.log('   Methods:', corsOptions.methods.join(', '));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/notes', require('./routes/noteRoutes'));
app.use('/api/quiz', require('./routes/quizRoutes'));
app.use('/api/progress', require('./routes/progressRoutes'));
app.use('/api/bookmarks', require('./routes/bookmarkRoutes'));
app.use('/api/ai-history', require('./routes/aiHistoryRoutes'));
app.use('/api/profile', require('./routes/profileRoutes'));

// Health check route
app.get('/health', (req, res) => {
  res.json({ success: true, message: 'Server is running' });
});

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Backend running' });
});

// Error handling middleware (must be last)
app.use(errorHandler);

/**
 * Start server with automatic port management
 */
async function startServer() {
  console.log('\n🚀 Starting AI Study Buddy Backend Server...\n');
  console.log('='.repeat(60));
  console.log(`📅 ${new Date().toISOString()}`);
  console.log(`🖥️  Platform: ${process.platform}`);
  console.log(`🔧 Node Version: ${process.version}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('='.repeat(60));
  console.log('');

  // Use fixed port 5000 regardless of .env
  const PORT = 5000;

  console.log(`🔍 Configuring server startup...`);
  console.log(`   Port: ${PORT}`);
  console.log('');

  try {
    // Connect to MongoDB
    console.log('📡 Connecting to MongoDB...');
    await connectDB();
    console.log('✅ MongoDB connection successful');
    console.log('');

    // Start server on fixed port
    console.log('🚀 Starting Express server...');
    const server = app.listen(PORT, () => {
      console.log('');
      console.log('='.repeat(60));
      console.log('✅ SERVER STARTED SUCCESSFULLY');
      console.log('='.repeat(60));
      console.log(`🌐 Server running on port: ${PORT}`);
      console.log(`🔗 Local URL: http://localhost:${PORT}`);
      console.log(`🔗 Health Check: http://localhost:${PORT}/api/health`);
      console.log(`🔗 API Base: http://localhost:${PORT}/api`);
      console.log('');
      console.log(`📡 MongoDB Connected: localhost`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log('='.repeat(60));
      console.log('');
    });

    // Handle server errors gracefully
    server.on('error', (err) => {
      console.error('');
      console.error('❌ SERVER ERROR');
      console.error('='.repeat(60));
      
      if (err.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use`);
        console.error(`💡 Try killing the process using port ${PORT}`);
        console.error(`💡 Or configure a different PORT in .env file`);
      } else if (err.code === 'EACCES') {
        console.error(`❌ Permission denied for port ${PORT}`);
        console.error(`💡 Try running with elevated privileges or use a port > 1024`);
      } else {
        console.error(`❌ Server error: ${err.message}`);
      }
      
      console.error('='.repeat(60));
      console.error('');
      
      // Don't exit immediately in development with nodemon
      if (process.env.NODE_ENV !== 'production') {
        console.log('⚠️  Development mode: Not exiting, nodemon will retry...');
      } else {
        process.exit(1);
      }
    });

    // Handle graceful shutdown
    const gracefulShutdown = (signal) => {
      console.log('');
      console.log(`⚠️  Received ${signal}, starting graceful shutdown...`);
      console.log('🛑 Closing HTTP server...');
      
      server.close(() => {
        console.log('✅ HTTP server closed');
        console.log('👋 Goodbye!');
        process.exit(0);
      });

      // Force close after 10 seconds
      setTimeout(() => {
        console.error('❌ Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    console.error('');
    console.error('❌ STARTUP FAILED');
    console.error('='.repeat(60));
    console.error(`❌ Error: ${error.message}`);
    console.error('');

    if (error.message.includes('MongoDB')) {
      console.error('💡 MongoDB connection failed');
      console.error('💡 Ensure MongoDB is running and accessible');
      console.error('💡 Check your MongoDB connection string in .env');
    } else if (error.code === 'EADDRINUSE') {
      console.error(`💡 Port ${PORT} is already in use`);
      console.error('💡 Kill the process using that port or change PORT in .env');
    } else {
      console.error('💡 Check the error details above');
    }

    console.error('='.repeat(60));
    console.error('');

    // Don't exit in development with nodemon
    if (process.env.NODE_ENV !== 'production') {
      console.log('⚠️  Development mode: Not exiting, nodemon will retry...');
    } else {
      process.exit(1);
    }
  }
}

// Start the server
startServer().catch((error) => {
  console.error('❌ Unhandled error during startup:', error);
  process.exit(1);
});

module.exports = app;
