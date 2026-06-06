const fs = require('fs');
const path = require('path');
const http = require('http');
const { findAvailablePort, isPortAvailable } = require('./portUtils');

/**
 * Find which port the backend is actually running on
 * by checking common ports from 5000 to 5010
 */
async function detectBackendPort() {
  const startPort = 5000;
  const maxAttempts = 20;
  
  console.log('🔍 Detecting backend server port...\n');
  
  for (let port = startPort; port < startPort + maxAttempts; port++) {
    try {
      const isAvailable = await isPortAvailable(port);
      
      if (!isAvailable) {
        // Port is in use, check if it's our backend server
        const isBackend = await checkIfBackendServer(port);
        
        if (isBackend) {
          console.log(`✅ Backend server detected on port ${port}`);
          return port;
        }
      }
    } catch (error) {
      // Continue to next port
    }
  }
  
  console.log('⚠️  No backend server detected on ports 5000-5019');
  return null;
}

/**
 * Check if a port is running our backend server
 */
function checkIfBackendServer(port) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: port,
      path: '/api/health',
      method: 'GET',
      timeout: 2000
    };
    
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.success && (parsed.message === 'Backend running' || parsed.message === 'Server is running')) {
            resolve(true);
          } else {
            resolve(false);
          }
        } catch {
          resolve(false);
        }
      });
    });
    
    req.on('error', () => resolve(false));
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
    
    req.end();
  });
}

/**
 * Update frontend .env file with detected backend port
 */
async function updateFrontendEnv(backendPort) {
  if (!backendPort) {
    console.log('⚠️  No backend port detected, skipping frontend .env update');
    return;
  }
  
  const frontendEnvPath = path.join(__dirname, '../../frontend/.env');
  const newApiUrl = `http://localhost:${backendPort}/api`;
  
  try {
    let envContent = '';
    
    // Read existing .env file if it exists
    if (fs.existsSync(frontendEnvPath)) {
      envContent = fs.readFileSync(frontendEnvPath, 'utf8');
    }
    
    // Update or add VITE_API_URL
    const lines = envContent.split('\n').filter(line => line.trim() !== '' && !line.startsWith('VITE_API_URL'));
    lines.push(`VITE_API_URL=${newApiUrl}`);
    
    // Write updated content
    fs.writeFileSync(frontendEnvPath, lines.join('\n'));
    
    console.log(`✅ Updated frontend .env with backend URL: ${newApiUrl}`);
    console.log(`📝 File: ${frontendEnvPath}`);
  } catch (error) {
    console.error(`❌ Failed to update frontend .env: ${error.message}`);
  }
}

/**
 * Main function
 */
async function main() {
  console.log('='.repeat(60));
  console.log('🔧 Backend Port Detection & Frontend Configuration');
  console.log('='.repeat(60));
  console.log('');
  
  const backendPort = await detectBackendPort();
  
  if (backendPort) {
    await updateFrontendEnv(backendPort);
    
    console.log('');
    console.log('='.repeat(60));
    console.log('✅ Configuration Complete');
    console.log('='.repeat(60));
    console.log(`🔗 Backend running on: http://localhost:${backendPort}`);
    console.log(`🔗 API endpoint: http://localhost:${backendPort}/api`);
    console.log(`🔗 Frontend configured to use: http://localhost:${backendPort}/api`);
    console.log('');
    console.log('💡 Restart your frontend development server to apply changes:');
    console.log('   cd frontend && npm run dev');
    console.log('='.repeat(60));
  } else {
    console.log('');
    console.log('='.repeat(60));
    console.log('⚠️  Backend Not Detected');
    console.log('='.repeat(60));
    console.log('💡 Make sure the backend server is running first:');
    console.log('   cd backend && npm start');
    console.log('='.repeat(60));
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { detectBackendPort, updateFrontendEnv, checkIfBackendServer };