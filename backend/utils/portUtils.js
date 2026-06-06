const net = require('net');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

/**
 * Check if a port is available
 * @param {number} port - Port number to check
 * @returns {Promise<boolean>} - True if port is available, false if in use
 */
const isPortAvailable = (port) => {
  return new Promise((resolve) => {
    const server = net.createServer();
    
    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve(false);
      } else {
        resolve(true);
      }
    });
    
    server.once('listening', () => {
      server.close();
      resolve(true);
    });
    
    server.listen(port);
  });
};

/**
 * Find the next available port starting from a base port
 * @param {number} startPort - Starting port number
 * @param {number} maxAttempts - Maximum number of ports to try (default: 10)
 * @returns {Promise<number>} - Available port number
 */
const findAvailablePort = async (startPort, maxAttempts = 10) => {
  console.log(`🔍 Checking port availability starting from ${startPort}...`);
  
  for (let i = 0; i < maxAttempts; i++) {
    const port = startPort + i;
    const available = await isPortAvailable(port);
    
    if (available) {
      console.log(`✅ Port ${port} is available`);
      return port;
    } else {
      console.log(`⚠️  Port ${port} is in use, trying next port...`);
    }
  }
  
  throw new Error(`No available ports found between ${startPort} and ${startPort + maxAttempts - 1}`);
};

/**
 * Get process information using a port
 * @param {number} port - Port number
 * @returns {Promise<object>} - Process information
 */
const getProcessUsingPort = async (port) => {
  try {
    const platform = process.platform;
    let command;
    
    if (platform === 'win32') {
      command = `netstat -ano | findstr :${port}`;
    } else if (platform === 'darwin' || platform === 'linux') {
      command = `lsof -i :${port} | tail -n +2`;
    } else {
      return { error: 'Unsupported platform' };
    }
    
    const { stdout } = await execPromise(command);
    
    if (!stdout || stdout.trim() === '') {
      return { error: 'No process found using this port' };
    }
    
    // Parse the output based on platform
    if (platform === 'win32') {
      const lines = stdout.trim().split('\n');
      const pid = lines[0].trim().split(/\s+/).pop();
      return { pid, platform: 'windows' };
    } else {
      const lines = stdout.trim().split('\n');
      const parts = lines[0].trim().split(/\s+/);
      const pid = parts[1];
      return { pid, platform: 'unix' };
    }
  } catch (error) {
    return { error: error.message };
  }
};

/**
 * Kill process using a port
 * @param {number} port - Port number
 * @returns {Promise<boolean>} - True if successful
 */
const killProcessUsingPort = async (port) => {
  try {
    const processInfo = await getProcessUsingPort(port);
    
    if (processInfo.error || !processInfo.pid) {
      console.log(`❌ No process found on port ${port}`);
      return false;
    }
    
    const platform = process.platform;
    let command;
    
    if (platform === 'win32') {
      command = `taskkill /PID ${processInfo.pid} /F`;
    } else {
      command = `kill -9 ${processInfo.pid}`;
    }
    
    console.log(`🔨 Killing process ${processInfo.pid} using port ${port}...`);
    await execPromise(command);
    console.log(`✅ Successfully killed process ${processInfo.pid}`);
    
    // Wait a moment for the port to be released
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return true;
  } catch (error) {
    console.error(`❌ Failed to kill process: ${error.message}`);
    return false;
  }
};

/**
 * Log detailed port information
 * @param {number} port - Port number
 */
const logPortInfo = async (port) => {
  console.log('\n📋 Port Information:');
  console.log(`   Port: ${port}`);
  console.log(`   Platform: ${process.platform}`);
  
  const processInfo = await getProcessUsingPort(port);
  
  if (processInfo.error) {
    console.log(`   Status: Available`);
  } else {
    console.log(`   Status: In Use`);
    console.log(`   Process PID: ${processInfo.pid}`);
    console.log(`   Platform: ${processInfo.platform}`);
  }
  
  console.log('');
};

module.exports = {
  isPortAvailable,
  findAvailablePort,
  getProcessUsingPort,
  killProcessUsingPort,
  logPortInfo
};