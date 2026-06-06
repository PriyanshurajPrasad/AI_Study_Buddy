const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);
const fs = require('fs');
const path = require('path');

/**
 * Check if a port is in use and return process information
 */
async function checkPort(port) {
  try {
    const { stdout } = await execPromise(`netstat -ano | findstr :${port}`);
    const lines = stdout.trim().split('\n');
    
    if (lines.length === 0 || !lines[0].includes('LISTENING')) {
      return { inUse: false };
    }

    // Extract PID from netstat output
    const match = lines[0].match(/\s+(\d+)\s*$/);
    if (!match) {
      return { inUse: true, pid: null, processName: null };
    }

    const pid = match[1];
    
    // Get process name
    try {
      const { stdout: processOutput } = await execPromise(`tasklist | findstr ${pid}`);
      const processName = processOutput.trim().split(/\s+/)[0];
      
      return {
        inUse: true,
        pid: pid,
        processName: processName,
        isNode: processName.toLowerCase().includes('node')
      };
    } catch (error) {
      return { inUse: true, pid: pid, processName: 'Unknown', isNode: false };
    }
  } catch (error) {
    return { inUse: false };
  }
}

/**
 * Kill a process by PID
 */
async function killProcess(pid) {
  try {
    await execPromise(`taskkill /PID ${pid} /F`);
    console.log(`✓ Killed process ${pid}`);
    return true;
  } catch (error) {
    console.error(`✗ Failed to kill process ${pid}:`, error.message);
    return false;
  }
}

/**
 * Find next available port starting from given port
 */
async function findAvailablePort(startPort) {
  for (let port = startPort; port < startPort + 10; port++) {
    const portInfo = await checkPort(port);
    if (!portInfo.inUse) {
      return port;
    }
  }
  return null;
}

/**
 * Update .env file with new port
 */
function updateEnvPort(newPort) {
  const envPath = path.join(__dirname, '.env');
  
  if (!fs.existsSync(envPath)) {
    console.log('Creating .env file...');
    fs.writeFileSync(envPath, `PORT=${newPort}\n`);
    return true;
  }

  let envContent = fs.readFileSync(envPath, 'utf8');
  
  if (envContent.includes('PORT=')) {
    envContent = envContent.replace(/PORT=.*/g, `PORT=${newPort}`);
    fs.writeFileSync(envPath, envContent);
    console.log(`✓ Updated .env PORT to ${newPort}`);
    return true;
  } else {
    envContent += `\nPORT=${newPort}\n`;
    fs.writeFileSync(envPath, envContent);
    console.log(`✓ Added PORT=${newPort} to .env`);
    return true;
  }
}

/**
 * Main function to check and resolve port conflicts
 */
async function resolvePortConflict(desiredPort = 5000) {
  console.log(`Checking port ${desiredPort}...`);
  
  const portInfo = await checkPort(desiredPort);
  
  if (!portInfo.inUse) {
    console.log(`✓ Port ${desiredPort} is available`);
    return desiredPort;
  }

  console.log(`⚠ Port ${desiredPort} is in use:`);
  console.log(`  PID: ${portInfo.pid}`);
  console.log(`  Process: ${portInfo.processName}`);
  console.log(`  Is Node.js: ${portInfo.isNode}`);

  // Check if it's a Node.js process
  if (portInfo.isNode) {
    // Check if this is our backend by testing the health endpoint
    try {
      const { stdout } = await execPromise(`curl -s http://localhost:${desiredPort}/api/health`, {
        timeout: 2000
      });
      
      if (stdout.includes('Backend running') || stdout.includes('success')) {
        console.log(`✓ Backend is already running on port ${desiredPort}`);
        console.log('✓ No action needed - your application is running');
        return desiredPort;
      }
    } catch (error) {
      // Health check failed, might be a different Node.js app
      console.log('⚠ Node.js process found but it does not appear to be your backend');
      console.log('Attempting to kill the process...');
      
      const killed = await killProcess(portInfo.pid);
      if (killed) {
        // Wait a moment for the port to be released
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log(`✓ Port ${desiredPort} is now available`);
        return desiredPort;
      }
    }
  } else {
    console.log(`⚠ Port is used by ${portInfo.processName} (non-Node.js)`);
    console.log('Cannot automatically kill non-Node.js processes');
  }

  // If we can't use the desired port, find an alternative
  console.log('Searching for alternative port...');
  const availablePort = await findAvailablePort(desiredPort + 1);
  
  if (availablePort) {
    console.log(`✓ Found available port: ${availablePort}`);
    updateEnvPort(availablePort);
    return availablePort;
  } else {
    console.error('✗ No available ports found');
    return null;
  }
}

// Export functions for use in other scripts
module.exports = {
  checkPort,
  killProcess,
  findAvailablePort,
  updateEnvPort,
  resolvePortConflict
};

// Run if executed directly
if (require.main === module) {
  const desiredPort = process.argv[2] ? parseInt(process.argv[2]) : 5000;
  resolvePortConflict(desiredPort)
    .then(port => {
      if (port) {
        console.log(`\n✓ Ready to use port: ${port}`);
        process.exit(0);
      } else {
        console.log('\n✗ Failed to resolve port conflict');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('Error:', error);
      process.exit(1);
    });
}