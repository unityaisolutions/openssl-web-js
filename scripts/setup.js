#!/usr/bin/env node
/**
 * OpenSSL-WASM-JS Setup Script
 *
 * This script installs all the dependencies required to build OpenSSL-WASM-JS:
 * - System dependencies (Node.js, CMake, Python)
 * - Emscripten SDK (emsdk) via git submodule
 * - npm dependencies
 *
 * Usage:
 *   node scripts/setup.js
 *   npm run setup
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const os = require('os');

// Configuration
const SCRIPT_DIR = __dirname;
const ROOT_DIR = path.resolve(SCRIPT_DIR, '..');
const EMSDK_DIR = path.resolve(ROOT_DIR, 'emsdk');

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bright: '\x1b[1m'
};

// Helper functions
function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function exec(command, cwd = process.cwd(), silent = false) {
  try {
    if (!silent) {
      log(`Executing: ${command}`, colors.blue);
    }
    return execSync(command, {
      cwd,
      stdio: silent ? 'pipe' : 'inherit',
      encoding: 'utf8'
    });
  } catch (error) {
    log(`Command failed: ${command}`, colors.red);
    if (silent) {
      log(error.stdout || error.message, colors.red);
    }
    throw error;
  }
}

function checkCommand(command) {
  try {
    execSync(command, { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
}

function getPlatformInfo() {
  const platform = os.platform();
  const isWindows = platform === 'win32';
  const isMacOS = platform === 'darwin';
  const isLinux = platform === 'linux';
  
  return { isWindows, isMacOS, isLinux };
}

function checkSystemDependencies() {
  log('\n🔍 Checking system dependencies...', colors.bright);
  
  const dependencies = [
    { name: 'Node.js', command: 'node --version', required: true },
    { name: 'npm', command: 'npm --version', required: true },
    { name: 'CMake', command: 'cmake --version', required: true },
    { name: 'Python', command: 'python3 --version', required: true },
    { name: 'Git', command: 'git --version', required: true },
    { name: 'curl', command: 'curl --version', required: true }
  ];

  const missing = [];
  
  dependencies.forEach(dep => {
    const available = checkCommand(dep.command);
    if (available) {
      log(`✅ ${dep.name} is available`, colors.green);
    } else {
      if (dep.required) {
        log(`❌ ${dep.name} is missing`, colors.red);
        missing.push(dep.name);
      } else {
        log(`⚠️  ${dep.name} is missing (optional)`, colors.yellow);
      }
    }
  });

  if (missing.length > 0) {
    log(`\n📦 Please install the following dependencies:`, colors.yellow);
    missing.forEach(dep => {
      log(`   - ${dep}`, colors.yellow);
    });
    
    const { isWindows, isMacOS, isLinux } = getPlatformInfo();
    
    log(`\n💡 Installation hints:`, colors.blue);
    if (isMacOS) {
      log(`   - Node.js: brew install node`, colors.blue);
      log(`   - CMake: brew install cmake`, colors.blue);
      log(`   - Python: brew install python3`, colors.blue);
    } else if (isLinux) {
      log(`   - Node.js: curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash - && sudo apt-get install -y nodejs`, colors.blue);
      log(`   - CMake: sudo apt-get install cmake`, colors.blue);
      log(`   - Python: sudo apt-get install python3`, colors.blue);
    } else if (isWindows) {
      log(`   - Node.js: Download from https://nodejs.org/`, colors.blue);
      log(`   - CMake: Download from https://cmake.org/download/`, colors.blue);
      log(`   - Python: Download from https://python.org/`, colors.blue);
    }
    return false;
  }

  log(`\n🎉 All required system dependencies are available!`, colors.green);
  return true;
}

function setupEmsdk() {
  log('\n🔧 Setting up Emscripten SDK (emsdk)...', colors.bright);
  
  // Check if emsdk directory exists
  if (!fs.existsSync(EMSDK_DIR)) {
    log('❌ emsdk directory not found!', colors.red);
    log('Please make sure the emsdk git submodule is properly initialized.', colors.yellow);
    log('Run: git submodule update --init --recursive', colors.blue);
    return false;
  }

  // Install emsdk tools first
  log('📥 Installing emsdk tools...', colors.blue);
  try {
    exec('./emsdk install latest', EMSDK_DIR);
    log('✅ emsdk tools installed successfully', colors.green);
  } catch (error) {
    log('❌ Failed to install emsdk tools', colors.red);
    log('💡 This might be due to:', colors.yellow);
    log('   - Missing system dependencies (git, python3, etc.)', colors.yellow);
    log('   - Network connectivity issues', colors.yellow);
    log('   - Insufficient disk space', colors.yellow);
    log('💡 Try running manually:', colors.blue);
    log('   cd emsdk && ./emsdk install latest', colors.blue);
    return false;
  }

  // Activate emsdk
  log('🔄 Activating emsdk...', colors.blue);
  try {
    exec('./emsdk activate latest', EMSDK_DIR);
    log('✅ emsdk activated successfully', colors.green);
  } catch (error) {
    log('❌ Failed to activate emsdk', colors.red);
    log('💡 This might be due to:', colors.yellow);
    log('   - Tools not properly installed (run install first)', colors.yellow);
    log('   - Version compatibility issues', colors.yellow);
    log('   - Platform-specific requirements', colors.yellow);
    log('💡 Try running manually:', colors.blue);
    log('   cd emsdk && ./emsdk install latest && ./emsdk activate latest', colors.blue);
    return false;
  }

  // Set up environment
  log('⚙️  Setting up emsdk environment...', colors.blue);
  try {
    const emsdkEnvScript = path.resolve(EMSDK_DIR, 'emsdk_env.sh');
    if (fs.existsSync(emsdkEnvScript)) {
      log('✅ emsdk environment script found', colors.green);
      log('💡 To activate the emsdk environment, run:', colors.bright + colors.yellow);
      log(`   source ${emsdkEnvScript}`, colors.bright + colors.blue);
      log('   # Or from the project root: source ./emsdk/emsdk_env.sh', colors.blue);
      
      // Try to activate in current shell for immediate use
      log('🔄 Attempting to activate environment in current shell...', colors.blue);
      try {
        // This will only work if we're in a bash shell and the source works
        exec(`bash -c "source ${emsdkEnvScript} >/dev/null 2>&1 && echo 'sourced'"`, ROOT_DIR, true);
        log('✅ Environment script is ready to use', colors.green);
      } catch (error) {
        // This is expected - sourcing doesn't persist across different shell invocations
        log('ℹ️  Environment activation requires manual sourcing', colors.blue);
      }
      
      log('💡 Note: Source this in every new terminal session before building', colors.yellow);
    } else {
      log('❌ emsdk environment script not found', colors.red);
    }
  } catch (error) {
    log('⚠️  Could not verify emsdk environment setup', colors.yellow);
  }

  log('🎉 Emscripten SDK setup completed!', colors.green);
  return true;
}

function installNpmDependencies() {
  log('\n📦 Installing npm dependencies...', colors.bright);
  
  const packageJsonPath = path.resolve(ROOT_DIR, 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    log('❌ package.json not found!', colors.red);
    return false;
  }

  log('📥 Running npm install...', colors.blue);
  exec('npm install', ROOT_DIR);
  log('🎉 npm dependencies installed successfully!', colors.green);
  return true;
}

function verifySetup() {
  log('\n🔍 Verifying setup...', colors.bright);
  
  const verifications = [
    { name: 'Node.js version', command: 'node --version' },
    { name: 'npm version', command: 'npm --version' },
    { name: 'CMake version', command: 'cmake --version' },
    { name: 'Python version', command: 'python3 --version' }
  ];

  let allPassed = true;
  
  verifications.forEach(verification => {
    try {
      const output = exec(verification.command, ROOT_DIR, true).trim();
      log(`✅ ${verification.name}: ${output}`, colors.green);
    } catch (error) {
      log(`❌ ${verification.name}: Failed`, colors.red);
      allPassed = false;
    }
  });

  // Check Emscripten separately since it requires environment activation
  log('\n🔍 Checking Emscripten (requires environment activation)...', colors.bright);
  try {
    const output = exec('emcc --version', ROOT_DIR, true).trim();
    log(`✅ Emscripten compiler: ${output}`, colors.green);
  } catch (error) {
    log(`❌ Emscripten compiler: Not available - emsdk environment not activated`, colors.red);
    log('💡 This is expected. You need to manually activate the environment first:', colors.yellow);
    log('   source ./emsdk/emsdk_env.sh', colors.blue);
    allPassed = false;
  }

  if (allPassed) {
    log('\n🎉 Setup verification completed successfully!', colors.green);
  } else {
    log('\n⚠️  Some verifications failed. Please check the errors above.', colors.yellow);
  }
  
  return allPassed;
}

function showNextSteps() {
  log('\n📋 Next Steps to Complete Setup:', colors.bright + colors.green);
  log('=====================================\n', colors.bright + colors.green);
  
  log('🔧 Step 1: Activate the emsdk environment (REQUIRED for building)', colors.bright);
  log('   source ./emsdk/emsdk_env.sh', colors.blue);
  log('   💡 Note: You must do this in every new terminal session\n', colors.yellow);
  
  log('🔍 Step 2: Verify Emscripten is working', colors.bright);
  log('   emcc --version', colors.blue);
  log('   💡 This should show the Emscripten compiler version\n', colors.yellow);
  
  log('🏗️  Step 3: Build the project', colors.bright);
  log('   npm run build', colors.blue);
  log('   💡 This will compile OpenSSL to WebAssembly\n', colors.yellow);
  
  log('🧪 Step 4: Run tests', colors.bright);
  log('   npm test', colors.blue);
  log('   💡 Verify everything is working correctly\n', colors.yellow);
  
  log('🌐 Step 5: Try the examples', colors.bright);
  log('   Open examples/ directory in your browser', colors.blue);
  log('   💡 See OpenSSL-WASM-JS in action\n', colors.yellow);
  
  log('📖 Additional Resources:', colors.bright);
  log('   - docs/SETUP.md - Detailed setup guide', colors.blue);
  log('   - docs/BUILD.md - Build process details', colors.blue);
  log('   - docs/API.md - API reference', colors.blue);
  
  log('\n⚠️  Important Notes:', colors.bright + colors.yellow);
  log('   • Always activate emsdk environment before building: source ./emsdk/emsdk_env.sh', colors.yellow);
  log('   • The environment activation is only valid for the current terminal session', colors.yellow);
  log('   • If you get "emcc: command not found", you forgot to activate the environment', colors.yellow);
}

// Main setup process
async function main() {
  log('🚀 OpenSSL-WASM-JS Setup Script', colors.bright + colors.green);
  log('================================\n', colors.bright + colors.green);
  
  try {
    // Change to root directory
    process.chdir(ROOT_DIR);

    // Check system dependencies
    if (!checkSystemDependencies()) {
      log('\n❌ Setup failed due to missing system dependencies.', colors.red);
      process.exit(1);
    }

    // Setup emsdk
    if (!setupEmsdk()) {
      log('\n❌ Setup failed during emsdk configuration.', colors.red);
      process.exit(1);
    }

    // Install npm dependencies
    if (!installNpmDependencies()) {
      log('\n❌ Setup failed during npm dependency installation.', colors.red);
      process.exit(1);
    }

    // Verify setup
    verifySetup();

    // Show next steps
    showNextSteps();

    log('\n✅ Setup dependencies completed successfully!', colors.green + colors.bright);
    log('🔄 Follow the next steps above to complete the build process.', colors.blue);
    process.exit(0);
    
  } catch (error) {
    log(`\n💥 Setup failed with error: ${error.message}`, colors.red + colors.bright);
    process.exit(1);
  }
}

// Run the setup
main();