#!/usr/bin/env node

/**
 * build-wasm.js
 * 
 * This script handles the process of downloading, patching, and compiling
 * OpenSSL to WebAssembly using Emscripten.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const os = require('os');

// Configuration
const OPENSSL_VERSION = '3.0.9';
const OPENSSL_URL = `https://www.openssl.org/source/openssl-${OPENSSL_VERSION}.tar.gz`;
const BUILD_DIR = path.resolve(__dirname, '../build');
const DIST_DIR = path.resolve(__dirname, '../dist');
const PATCHES_DIR = path.resolve(__dirname, '../src/patches');
const OPENSSL_DIR = path.resolve(BUILD_DIR, `openssl-${OPENSSL_VERSION}`);
const EMSCRIPTEN_OUTPUT = path.resolve(BUILD_DIR, 'openssl-wasm');

// Ensure build directory exists
if (!fs.existsSync(BUILD_DIR)) {
  fs.mkdirSync(BUILD_DIR, { recursive: true });
}

// Ensure dist directory exists
if (!fs.existsSync(DIST_DIR)) {
  fs.mkdirSync(DIST_DIR, { recursive: true });
}

// Helper function to execute commands and log output
function exec(command, cwd = process.cwd()) {
  console.log(`Executing: ${command}`);
  try {
    execSync(command, { cwd, stdio: 'inherit' });
  } catch (error) {
    console.error(`Command failed: ${command}`);
    console.error(error);
    process.exit(1);
  }
}

// Check if Emscripten is available
try {
  execSync('emcc --version', { stdio: 'ignore' });
} catch (error) {
  console.error('Emscripten not found. Please install and activate the Emscripten SDK.');
  console.error('See: https://emscripten.org/docs/getting_started/downloads.html');
  process.exit(1);
}

// Download and extract OpenSSL if not already present
if (!fs.existsSync(OPENSSL_DIR)) {
  console.log(`Downloading OpenSSL ${OPENSSL_VERSION}...`);
  exec(`curl -L ${OPENSSL_URL} | tar xz -C ${BUILD_DIR}`);
}

// Apply patches
console.log('Applying patches...');
if (fs.existsSync(PATCHES_DIR)) {
  const patches = fs.readdirSync(PATCHES_DIR).filter(file => file.endsWith('.patch'));
  
  for (const patch of patches) {
    console.log(`Applying patch: ${patch}`);
    exec(`patch -p1 < ${path.join(PATCHES_DIR, patch)}`, OPENSSL_DIR);
  }
}

// Configure OpenSSL for WebAssembly
console.log('Configuring OpenSSL for WebAssembly...');
const configureArgs = [
  'no-asm',
  'no-async',
  'no-dgram',
  'no-ktls',
  'no-module',
  'no-posix-io',
  'no-secure-memory',
  'no-shared',
  'no-sock',
  'no-stdio',
  'no-threads',
  'no-ui-console',
  '--prefix=/usr',
  '--openssldir=/etc/ssl',
  'wasm32-wasi'
].join(' ');

// Determine number of CPU cores for parallel build
const numCPUs = os.cpus().length;

// Set up Emscripten environment variables
const emscriptenEnv = {
  CROSS_COMPILE: '',
  CC: 'emcc',
  CXX: 'em++',
  CFLAGS: '-Oz -Werror -Qunused-arguments -Wno-shift-count-overflow',
  CPPFLAGS: '-D BSD_SOURCE -D WASI_EMULATED_GETPID -Dgetuid=getpagesize -Dgetgid=getpagesize -Dgeteuid=getpagesize -Dgetegid=getpagesize',
  LDFLAGS: '-s WASM=1 -s ALLOW_MEMORY_GROWTH=1 -s MODULARIZE=1 -s EXPORT_ES6=1 -s EXPORT_NAME=OpenSSLWasm -s ENVIRONMENT=web',
};

const envString = Object.entries(emscriptenEnv)
  .map(([key, value]) => `${key}="${value}"`)
  .join(' ');

// Configure and build OpenSSL with Emscripten
exec(`${envString} ./Configure ${configureArgs}`, OPENSSL_DIR);
exec(`${envString} make -j${numCPUs} build_libs`, OPENSSL_DIR);

// Create the output directory
if (!fs.existsSync(EMSCRIPTEN_OUTPUT)) {
  fs.mkdirSync(EMSCRIPTEN_OUTPUT, { recursive: true });
}

// Copy the compiled libraries
console.log('Copying compiled libraries...');
exec(`cp ${OPENSSL_DIR}/libcrypto.a ${EMSCRIPTEN_OUTPUT}/`);
exec(`cp ${OPENSSL_DIR}/libssl.a ${EMSCRIPTEN_OUTPUT}/`);

// Compile the final WebAssembly module
console.log('Compiling final WebAssembly module...');
exec(`
  emcc -Oz \
  -s WASM=1 \
  -s ALLOW_MEMORY_GROWTH=1 \
  -s MODULARIZE=1 \
  -s EXPORT_ES6=1 \
  -s EXPORT_NAME=OpenSSLWasm \
  -s ENVIRONMENT=web \
  -s EXPORTED_FUNCTIONS=@${path.resolve(__dirname, 'exported_functions.json')} \
  -s EXPORTED_RUNTIME_METHODS='["ccall", "cwrap", "getValue", "setValue", "UTF8ToString", "stringToUTF8"]' \
  -I${OPENSSL_DIR}/include \
  ${path.resolve(__dirname, '../src/wasm/openssl_wasm_glue.c')} \
  ${EMSCRIPTEN_OUTPUT}/libcrypto.a \
  ${EMSCRIPTEN_OUTPUT}/libssl.a \
  -o ${DIST_DIR}/openssl-wasm.js
`);

console.log('WebAssembly build completed successfully!');
