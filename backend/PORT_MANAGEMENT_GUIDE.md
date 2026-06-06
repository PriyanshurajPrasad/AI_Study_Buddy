# Backend Port Management System - Complete Guide

## Issue Analysis

### What Process Was Using Port 5000?
The error "Port 5000 is already in use" was caused by:
- **Process Type**: Node.js process (node.exe)
- **Process ID**: 24332 (first instance), later 28868
- **Location**: `C:\Program Files\nodejs\node.exe`
- **Cause**: Previous backend server instances that were not properly terminated

### How to Free That Port?
You can free port 5000 using any of these methods:

**Windows Command Line:**
```bash
netstat -ano | findstr :5000
taskkill /PID <PROCESS_ID> /F
```

**Using the new utility scripts:**
```bash
cd backend
npm run kill-port
npm run port-info
```

**PowerShell:**
```powershell
Get-NetTCPConnection -LocalPort 5000 | Select-Object OwningProcess
Stop-Process -Id <PROCESS_ID> -Force
```

### Was Another Node.js Server Already Running?
Yes, multiple Node.js server instances were running simultaneously, likely due to:
- Previous development sessions not properly closed
- Multiple terminal windows running the server
- Nodemon instances that didn't terminate properly

## New Port Management System

### Key Features

1. **Automatic Port Detection**: Server checks if the configured port is available
2. **Intelligent Fallback**: If port is busy, automatically tries next available port (5001, 5002, etc.)
3. **Detailed Logging**: Comprehensive startup logs with debugging information
4. **Graceful Error Handling**: Proper handling of EADDRINUSE, MongoDB connection failures
5. **Production Ready**: Works in both development and production environments
6. **Nodemon Compatible**: Won't crash development workflow due to port conflicts

### New Files Created

#### `backend/utils/portUtils.js`
Utility module providing port management functions:
- `isPortAvailable(port)` - Check if a port is free
- `findAvailablePort(startPort, maxAttempts)` - Find next available port
- `getProcessUsingPort(port)` - Get process info using a port
- `killProcessUsingPort(port)` - Kill process using a port
- `logPortInfo(port)` - Log detailed port information

#### `backend/.env.example`
Updated configuration file with new options:
```env
PORT=5000                          # Base port to try first
MAX_PORT_ATTEMPTS=10              # Maximum ports to try (5000-5009)
NODE_ENV=development              # Environment mode
```

### Updated Files

#### `backend/server.js`
Complete rewrite with:
- Async startup function with proper error handling
- Automatic port detection and fallback
- Detailed console logging with emojis for readability
- Graceful shutdown handling (SIGTERM, SIGINT)
- MongoDB connection error handling
- Development mode awareness for nodemon

#### `backend/package.json`
New npm scripts added:
```json
"scripts": {
  "kill-port": "node -e \"require('./utils/portUtils').killProcessUsingPort(5000)\"",
  "port-info": "node -e \"require('./utils/portUtils').logPortInfo(5000)\""
}
```

## Usage Guide

### Starting the Server

**Development Mode (recommended):**
```bash
cd backend
npm run dev
```

**Production Mode:**
```bash
cd backend
NODE_ENV=production npm start
```

**Custom Port:**
```bash
cd backend
PORT=5000 npm start
```

### Managing Ports

**Check what's using port 5000:**
```bash
cd backend
npm run port-info
```

**Kill process on port 5000:**
```bash
cd backend
npm run kill-port
```

**Use a different base port:**
```bash
cd backend
PORT=6000 npm start
```

### Configuration Options

**In `.env` file:**
```env
PORT=5000                    # Starting port to try
MAX_PORT_ATTEMPTS=10        # How many ports to try (5000-5009)
NODE_ENV=development        # Environment (development/production)
```

**Environment variables override .env:**
```bash
PORT=5000 MAX_PORT_ATTEMPTS=20 npm start
```

## Startup Logs Explained

### Successful Startup Example:
```
🚀 Starting AI Study Buddy Backend Server...

============================================================
📅 2026-05-28T16:37:32.667Z
🖥️  Platform: win32
🔧 Node Version: v22.18.0
🌍 Environment: development
============================================================

🔍 Configuring server startup...
   Base Port: 5000
   Max Attempts: 10

📡 Connecting to MongoDB...
MongoDB Connected: localhost
✅ MongoDB connection successful

🔍 Finding available port...
🔍 Checking port availability starting from 5000...
✅ Port 5000 is available
✅ Port selected: 5000

📋 Port Information:
   Port: 5000
   Platform: win32
   Status: Available

🚀 Starting Express server...

============================================================
✅ SERVER STARTED SUCCESSFULLY
============================================================
🌐 Server running on port: 5000
🔗 Local URL: http://localhost:5000
🔗 Health Check: http://localhost:5000/api/health
🔗 API Base: http://localhost:5000/api

📡 MongoDB Connected: localhost
🌍 Environment: development
============================================================
```

### Port Fallback Example:
```
🔍 Finding available port...
🔍 Checking port availability starting from 5000...
⚠️  Port 5000 is in use, trying next port...
⚠️  Port 5001 is in use, trying next port...
✅ Port 5002 is available
✅ Port selected: 5002
```

### Error Handling Example:
```
❌ STARTUP FAILED
============================================================
❌ Error: No available ports found between 5000 and 5009

💡 No available ports found in the configured range
💡 Try increasing MAX_PORT_ATTEMPTS in .env
💡 Or manually kill processes using ports in the range
============================================================
```

## Error Scenarios

### EADDRINUSE (Port Already in Use)
**Before:** Server would crash with cryptic error
**Now:** 
- Automatically tries next available port
- Logs which port was in use
- Continues startup successfully
- In dev mode, nodemon can retry without manual intervention

### MongoDB Connection Failure
**Before:** Server would hang or crash
**Now:**
- Catches MongoDB connection errors
- Logs helpful error message
- Provides troubleshooting suggestions
- Exits gracefully in production, retries in development

### Server Startup Failure
**Before:** Would exit with no explanation
**Now:**
- Detailed error logging
- Specific error messages for different failure types
- Helpful suggestions for resolution
- Environment-aware handling (dev vs production)

## Graceful Shutdown

The server now handles graceful shutdown properly:

**Signals handled:**
- `SIGTERM` - Termination signal
- `SIGINT` - Interrupt signal (Ctrl+C)

**Shutdown process:**
1. Logs shutdown initiation
2. Closes HTTP server gracefully
3. Allows existing requests to complete
4. Exits after 10 seconds if not complete

**Example:**
```
⚠️  Received SIGINT, starting graceful shutdown...
🛑 Closing HTTP server...
✅ HTTP server closed
👋 Goodbye!
```

## Troubleshooting

### Server still won't start

1. **Check all ports in range:**
```bash
for %i in (5000,5001,5002,5003,5004,5005) do netstat -ano | findstr :%i
```

2. **Kill all Node.js processes:**
```bash
taskkill /IM node.exe /F
```

3. **Increase port attempt range:**
```bash
MAX_PORT_ATTEMPTS=20 npm start
```

4. **Use a completely different port range:**
```bash
PORT=8000 npm start
```

### Nodemon keeps restarting

1. **Check if nodemon is detecting file changes:**
```bash
# Add nodemon.json if not present
{
  "watch": ["server.js", "routes/", "controllers/", "models/"],
  "ext": "js,json",
  "ignore": ["node_modules/", "*.test.js"]
}
```

2. **Use standard npm start instead:**
```bash
npm start  # instead of npm run dev
```

### Port still shows as in use after killing process

1. **Wait a few seconds for OS to release port**
2. **Restart your terminal/command prompt**
3. **Restart your computer if persistent**
4. **Use different port range**

## Production Considerations

### Recommended Production Configuration

**`.env` file:**
```env
PORT=5000
MAX_PORT_ATTEMPTS=3
NODE_ENV=production
```

**Process Manager (PM2):**
```bash
npm install -g pm2
pm2 start server.js --name "ai-study-buddy" --env production
pm2 save
pm2 startup
```

**Docker:**
```dockerfile
# In Dockerfile
ENV PORT=5000
ENV MAX_PORT_ATTEMPTS=3
ENV NODE_ENV=production
```

### Load Balancing

In production with multiple instances:
```bash
# Instance 1
PORT=5000 npm start

# Instance 2  
PORT=5001 npm start

# Instance 3
PORT=5002 npm start
```

Then configure your load balancer to distribute traffic across all ports.

## Testing

### Test Port Fallback
```bash
# Terminal 1: Start first instance
PORT=5000 npm start

# Terminal 2: Start second instance (should use 5001)
PORT=5000 npm start

# Terminal 3: Start third instance (should use 5002)
PORT=5000 npm start
```

### Test Error Handling
```bash
# Test MongoDB failure
# Stop MongoDB service, then start server
# Should show helpful error message

# Test port exhaustion
# Use ports 5000-5009, then start server
# Should show "No available ports" error
```

### Test Graceful Shutdown
```bash
# Start server
npm start

# Press Ctrl+C
# Should see graceful shutdown messages
```

## Frontend Configuration

Since the backend now uses dynamic ports, the frontend needs to know which port the backend is running on.

### Automatic Configuration

The easiest way is to use the auto-detection script:

```bash
cd backend
npm run configure-frontend
```

This will:
1. Detect which port the backend is running on
2. Automatically update `frontend/.env` with the correct API URL
3. Display the configuration details

### Manual Configuration

Edit `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

If the backend is running on a different port (e.g., 5001):
```env
VITE_API_URL=http://localhost:5001/api
```

### Environment Variable

You can also set it when starting the frontend:
```bash
cd frontend
VITE_API_URL=http://localhost:5001/api npm run dev
```

### Detecting Backend Port

Use the detection script to find which port the backend is using:
```bash
cd backend
npm run detect-port
```

This will scan ports 5000-5019 and find your backend server.

### Example Workflow

1. **Start backend (it will find an available port):**
```bash
cd backend
npm start
# Output: Server running on port: 5001
```

2. **Configure frontend to use detected port:**
```bash
cd backend
npm run configure-frontend
# Output: Frontend configured to use: http://localhost:5001/api
```

3. **Start frontend:**
```bash
cd frontend
npm run dev
```

### Current Frontend Axios Configuration

The frontend uses environment-aware configuration:
```javascript
// frontend/src/services/axios.js
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  // ...
});
```

This means:
- If `VITE_API_URL` is set in `.env`, it uses that
- Otherwise, it falls back to `http://localhost:5000/api`
- The environment variable takes precedence

## Complete Development Workflow

### First Time Setup
```bash
# Terminal 1: Start backend
cd backend
npm start

# Terminal 2: Configure frontend (after backend starts)
cd backend
npm run configure-frontend

# Terminal 3: Start frontend
cd frontend
npm run dev
```

### Daily Development
```bash
# Terminal 1: Start backend
cd backend
npm run dev  # Uses nodemon for auto-restart

# Terminal 2: Start frontend
cd frontend
npm run dev  # Uses Vite for hot reload
```

### If Port Changes
```bash
# When backend starts on different port
cd backend
npm run configure-frontend  # Updates frontend .env

# Restart frontend to pick up new port
# (Ctrl+C in frontend terminal, then npm run dev again)
```

## Summary

The new port management system provides:
- ✅ Automatic port detection and fallback
- ✅ Detailed logging and debugging information  
- ✅ Comprehensive error handling
- ✅ Graceful shutdown support
- ✅ Development and production modes
- ✅ Nodemon compatibility
- ✅ Utility scripts for port management
- ✅ Production-ready configuration
- ✅ Frontend auto-configuration
- ✅ Cross-platform support (Windows, Mac, Linux)

No more "Port already in use" errors stopping your development workflow!