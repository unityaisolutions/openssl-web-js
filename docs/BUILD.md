# Building OpenSSL-WASM-JS

This document explains the build process for OpenSSL-WASM-JS, a WebAssembly port of OpenSSL with a JavaScript wrapper.

## Prerequisites

Before building the project, ensure you have the following installed:

- **Node.js** (v14 or later)
- **npm** (usually comes with Node.js)
- **Emscripten SDK** (emsdk)
- **CMake** (3.14 or later)
- **Python** (3.6 or later)

### Installing Emscripten

Emscripten is required to compile C/C++ code to WebAssembly. Follow these steps to install it:

```bash
# Clone the Emscripten repository
git clone https://github.com/emscripten-core/emsdk.git

# Enter the directory
cd emsdk

# Download and install the latest SDK tools
./emsdk install latest

# Activate the latest SDK
./emsdk activate latest

# Set up the environment variables
source ./emsdk_env.sh  # On Windows, use: emsdk_env.bat
```

## Build Process Overview

The build process consists of several steps:

1. **Download and patch OpenSSL**: The build script downloads the specified version of OpenSSL and applies necessary patches to make it compatible with WebAssembly.

2. **Compile OpenSSL to WebAssembly**: Using Emscripten, the patched OpenSSL is compiled to WebAssembly with specific flags to disable features that aren't compatible with the browser environment.

3. **Build the JavaScript wrapper**: The TypeScript wrapper code is compiled and bundled with the WebAssembly module using Rollup.

4. **Generate distribution files**: The build process creates various distribution formats (UMD, CommonJS, ES Module) and generates TypeScript declaration files.

## Build Commands

### Full Build

To perform a complete build of the project:

```bash
npm run build
```

This command runs both the WebAssembly compilation and JavaScript bundling steps.

### WebAssembly Build Only

To only build the WebAssembly module:

```bash
npm run build:wasm
```

This command:
1. Downloads OpenSSL if not already present
2. Applies patches from the `src/patches` directory
3. Configures OpenSSL with appropriate flags for WebAssembly
4. Compiles OpenSSL to WebAssembly using Emscripten
5. Generates the final WebAssembly module with the C glue code

### JavaScript Build Only

To only build the JavaScript wrapper (assuming the WebAssembly module is already built):

```bash
npm run build:js
```

This command:
1. Compiles TypeScript code to JavaScript
2. Bundles the code with Rollup
3. Creates UMD, CommonJS, and ES Module versions
4. Generates TypeScript declaration files

## Build Configuration

### OpenSSL Version

The OpenSSL version used in the build is specified in `scripts/build-wasm.js`:

```javascript
const OPENSSL_VERSION = '3.0.9';
```

To use a different version, update this constant.

### Emscripten Flags

The Emscripten compilation flags are also defined in `scripts/build-wasm.js`:

```javascript
const emscriptenEnv = {
  CROSS_COMPILE: '',
  CC: 'emcc',
  CXX: 'em++',
  CFLAGS: '-Oz -Werror -Qunused-arguments -Wno-shift-count-overflow',
  CPPFLAGS: '-D BSD_SOURCE -D WASI_EMULATED_GETPID -Dgetuid=getpagesize -Dgetgid=getpagesize -Dgeteuid=getpagesize -Dgetegid=getpagesize',
  LDFLAGS: '-s WASM=1 -s ALLOW_MEMORY_GROWTH=1 -s MODULARIZE=1 -s EXPORT_ES6=1 -s EXPORT_NAME=OpenSSLWasm -s ENVIRONMENT=web',
};
```

These flags control various aspects of the WebAssembly compilation, such as optimization level, exported functions, and memory management.

### Exported Functions

The functions exported from the WebAssembly module are specified in `scripts/exported_functions.json`. This file lists all the C functions that should be accessible from JavaScript.

## Customizing the Build

### Adding New OpenSSL Functions

To expose additional OpenSSL functions:

1. Add the function to `src/wasm/openssl_wasm_glue.c`
2. Add the function name to `scripts/exported_functions.json` (prefixed with underscore)
3. Add the corresponding TypeScript wrapper in `src/index.ts`

### Modifying Patches

The patches applied to OpenSSL are stored in the `src/patches` directory. To modify or add patches:

1. Create a new patch file in the `src/patches` directory
2. The build script will automatically apply all `.patch` files in this directory

### Changing Optimization Level

To change the optimization level of the WebAssembly module, modify the `CFLAGS` in `scripts/build-wasm.js`:

- `-O0`: No optimization (fastest build, largest and slowest output)
- `-O1`: Basic optimizations
- `-O2`: More optimizations
- `-O3`: Even more optimizations
- `-Oz`: Size optimizations (smallest output)

## Troubleshooting

### Common Build Issues

1. **Emscripten not found**: Ensure Emscripten is properly installed and activated. Run `emcc --version` to verify.

2. **OpenSSL compilation errors**: Check if the patches are compatible with the specified OpenSSL version.

3. **Missing dependencies**: Ensure all required development tools are installed.

4. **Memory errors during build**: Increase the available memory for Node.js with `NODE_OPTIONS=--max_old_space_size=4096 npm run build`.

### Getting Help

If you encounter issues not covered here, please:

1. Check the [GitHub issues](https://github.com/yourusername/openssl-wasm-js/issues) for similar problems
2. Create a new issue with detailed information about the error and your environment
