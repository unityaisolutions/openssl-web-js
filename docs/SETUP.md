# Setup Guide

This document explains how to set up the development environment for OpenSSL-WASM-JS using the automated setup script.

## Quick Start

The easiest way to set up the project is to use the provided setup script:

```bash
npm run setup
```

This script will:
1. ✅ Check for required system dependencies
2. 🔧 Set up the Emscripten SDK (emsdk) submodule
3. 📦 Install npm dependencies
4. 🔍 Verify the setup
5. 📋 Show next steps

## Manual Setup

If you prefer to set up the environment manually, follow these steps:

### 1. Prerequisites

Ensure you have the following installed on your system:

- **Node.js** (v14 or later) - [Download](https://nodejs.org/)
- **npm** (usually comes with Node.js)
- **CMake** (3.14 or later) - [Download](https://cmake.org/download/)
- **Python** (3.6 or later) - [Download](https://python.org/)
- **Git** - [Download](https://git-scm.com/)
- **curl** (usually pre-installed on macOS and Linux)

### 2. Clone the Repository

```bash
git clone https://github.com/yourusername/openssl-wasm-js.git
cd openssl-wasm-js
```

### 3. Initialize Git Submodules

The Emscripten SDK is included as a git submodule:

```bash
git submodule update --init --recursive
```

### 4. Set Up Emscripten SDK

```bash
cd emsdk

# Install the latest SDK tools
./emsdk install latest

# Activate the installed SDK
./emsdk activate latest

# Set up the environment (do this in every new terminal)
source ./emsdk_env.sh  # Linux/macOS
# or
emsdk_env.bat         # Windows

cd ..
```

**Important**: You must source the environment script in every new terminal session before building the project. The setup script will provide clear instructions on how to do this.

### 5. Install Dependencies

```bash
npm install
```

### 6. Verify Setup

You can verify that everything is set up correctly by running:

```bash
node scripts/setup.js --verify
```

Or check manually:

```bash
# Check Node.js
node --version

# Check Emscripten
emcc --version

# Check CMake
cmake --version

# Check Python
python3 --version
```

## Platform-Specific Instructions

### macOS

Using Homebrew:

```bash
# Install dependencies
brew install node cmake python3

# Clone and setup
git clone https://github.com/yourusername/openssl-wasm-js.git
cd openssl-wasm-js
git submodule update --init --recursive
cd emsdk && ./emsdk install latest && ./emsdk activate latest && cd ..
npm install
```

### Linux (Ubuntu/Debian)

```bash
# Install dependencies
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs cmake python3 build-essential

# Clone and setup
git clone https://github.com/yourusername/openssl-wasm-js.git
cd openssl-wasm-js
git submodule update --init --recursive
cd emsdk && ./emsdk install latest && ./emsdk activate latest && cd ..
npm install
```

### Windows

1. Install dependencies using the official installers:
   - [Node.js](https://nodejs.org/)
   - [CMake](https://cmake.org/download/)
   - [Python](https://python.org/)
   - [Git](https://git-scm.com/)

2. Clone and setup:
   ```cmd
   git clone https://github.com/yourusername/openssl-wasm-js.git
   cd openssl-wasm-js
   git submodule update --init --recursive
   cd emsdk && emsdk install latest && emsdk activate latest && cd ..
   npm install
   ```

## Troubleshooting

### Common Issues

#### Emscripten Not Found
```
Error: Emscripten not found. Please install and activate the Emscripten SDK.
```

**Solution**: Make sure you've activated emsdk in your current shell session:
```bash
cd emsdk
source ./emsdk_env.sh  # Linux/macOS
# or
emsdk_env.bat         # Windows
```

#### emsdk Activation Failed
```
error: tool is not installed and therefore cannot be activated: 'node-22.16.0-64bit'
Command failed: ./emsdk activate latest
```

**Solution**: This error occurs when trying to activate emsdk before installing the tools. Always run install before activate:
```bash
cd emsdk
./emsdk install latest    # Install first
./emsdk activate latest   # Then activate
source ./emsdk_env.sh     # Set up environment
```

#### Missing System Dependencies
```
❌ CMake is missing
❌ Python is missing
```

**Solution**: Install the missing dependencies using your platform's package manager or download them from the official websites.

#### Permission Errors
```
Error: EACCES: permission denied
```

**Solution**: Make sure you have write permissions in the project directory, or run the command with appropriate permissions.

#### Build Memory Issues
```
JavaScript heap out of memory
```

**Solution**: Increase Node.js memory limit:
```bash
NODE_OPTIONS=--max_old_space_size=4096 npm run build
```

### Getting Help

If you encounter issues not covered here:

1. Check the [GitHub issues](https://github.com/yourusername/openssl-wasm-js/issues) for similar problems
2. Create a new issue with:
   - Your operating system and version
   - Node.js version (`node --version`)
   - Error messages and stack traces
   - Steps you've already tried

## Environment Activation

**Important**: Before building or developing, you must activate the emsdk environment in every terminal session:

```bash
# Activate emsdk environment
source ./emsdk/emsdk_env.sh

# Now you can build the project
npm run build
```

The setup script will remind you of this requirement and provide the exact command to run.

## Development Workflow

After successful setup and environment activation:

1. **Activate emsdk environment** (required for every terminal session):
   ```bash
   source ./emsdk/emsdk_env.sh
   ```

2. **Build the project**:
   ```bash
   npm run build
   ```

3. **Run tests**:
   ```bash
   npm test
   ```

4. **Development mode** (watches for changes):
   ```bash
   npm run dev
   ```

5. **Try the examples**:
   Open the `examples/` directory files in your browser

## Environment Variables

The setup script respects these environment variables:

- `NODE_OPTIONS` - Node.js runtime options (e.g., memory limits)
- `CI` - Set to `true` to disable interactive prompts
- `VERBOSE` - Set to `true` for more detailed output

Example:
```bash
CI=true npm run setup