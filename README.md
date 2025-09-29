# OpenSSL-WASM-JS

A minimal JavaScript and WebAssembly port of OpenSSL for web browsers.

## Overview

OpenSSL-WASM-JS provides a lightweight, browser-compatible implementation of OpenSSL cryptographic functions through WebAssembly. This library enables secure cryptographic operations directly in the browser with performance close to native code.

## Features

- **Lightweight**: Minimized JavaScript wrapper with optimized WebAssembly binary
- **Comprehensive**: Supports essential OpenSSL cryptographic functions
- **Browser-compatible**: Works in all modern browsers that support WebAssembly
- **Easy to use**: Simple JavaScript API for common cryptographic operations
- **Secure**: Preserves the security properties of OpenSSL

## Installation

### For Users

```bash
npm install openssl-wasm-js
```

Or include directly in your HTML:

```html
<script src="https://cdn.example.com/openssl-wasm-js/dist/openssl.min.js"></script>
```

### For Developers

To set up the development environment:

```bash
# Clone the repository
git clone https://github.com/yourusername/openssl-wasm-js.git
cd openssl-wasm-js

# Run the automated setup script
npm run setup

# Or set up manually
npm install
```

See the [Setup Guide](./docs/SETUP.md) for detailed instructions.

## Usage

```javascript
// Basic usage
const opensslWasm = await OpenSSLWasm.initialize();

// Generate a random key
const key = opensslWasm.randomBytes(32);

// AES encryption
const encrypted = opensslWasm.aesEncrypt(data, key, iv);

// SHA-256 hash
const hash = opensslWasm.sha256(data);

// RSA operations
const { publicKey, privateKey } = opensslWasm.generateRsaKeyPair(2048);
const signature = opensslWasm.rsaSign(data, privateKey);
const isValid = opensslWasm.rsaVerify(data, signature, publicKey);
```

See the [documentation](./docs/API.md) for complete API details and the [examples](./examples/) directory for more usage examples.

## Building from Source

### Prerequisites

- Node.js (v14+)
- Emscripten SDK
- CMake (3.14+)
- Python (3.6+)

### Build Steps

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/openssl-wasm-js.git
   cd openssl-wasm-js
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the project:
   ```bash
   npm run build
   ```

The build process will:
1. Download and patch OpenSSL
2. Compile OpenSSL to WebAssembly using Emscripten
3. Generate the JavaScript wrapper
4. Create optimized and minified distribution files

## Documentation

- [Setup Guide](./docs/SETUP.md)
- [API Reference](./docs/API.md)
- [Build Process](./docs/BUILD.md)
- [Security Considerations](./docs/SECURITY.md)
- [Performance Benchmarks](./docs/PERFORMANCE.md)

## Examples

- [Basic Encryption/Decryption](./examples/basic-encryption.html)
- [File Hashing](./examples/file-hash.html)
- [Digital Signatures](./examples/signatures.html)
- [TLS Client](./examples/tls-client.html)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

OpenSSL is licensed under the Apache License 2.0. See [OpenSSL License](https://www.openssl.org/source/license.html) for details.

## Acknowledgments

- [OpenSSL Project](https://www.openssl.org/)
- [Emscripten](https://emscripten.org/)
- [WebAssembly](https://webassembly.org/)
