# OpenSSL-WASM-JS API Reference

This document provides a comprehensive reference for the OpenSSL-WASM-JS library API.

## Table of Contents

- [Initialization](#initialization)
- [Core Functions](#core-functions)
- [Hash Functions](#hash-functions)
- [Encryption Functions](#encryption-functions)
- [RSA Functions](#rsa-functions)
- [Utility Functions](#utility-functions)

## Initialization

Before using any cryptographic functions, you must initialize the OpenSSL WASM module.

```javascript
// Import the library
import OpenSSLWasmJS from 'openssl-wasm-js';

// Initialize the module
const openssl = await OpenSSLWasmJS.initialize();
```

## Core Functions

### version()

Returns the OpenSSL version string.

```javascript
const version = openssl.version();
console.log(version); // e.g., "OpenSSL 3.0.9 30 May 2023"
```

### cleanup()

Cleans up OpenSSL resources. Call this when you're done using the library to free resources.

```javascript
openssl.cleanup();
```

### randomBytes(length)

Generates cryptographically secure random bytes.

**Parameters:**
- `length` (number): The number of random bytes to generate

**Returns:**
- `Uint8Array`: The generated random bytes

```javascript
const randomData = openssl.randomBytes(32);
```

## Hash Functions

### sha1(data)

Calculates the SHA-1 hash of the input data.

**Parameters:**
- `data` (Uint8Array | string): The data to hash

**Returns:**
- `Uint8Array`: The 20-byte SHA-1 digest

```javascript
const hash = openssl.sha1('Hello, world!');
const hashHex = openssl.toHex(hash);
```

### sha256(data)

Calculates the SHA-256 hash of the input data.

**Parameters:**
- `data` (Uint8Array | string): The data to hash

**Returns:**
- `Uint8Array`: The 32-byte SHA-256 digest

```javascript
const hash = openssl.sha256('Hello, world!');
const hashHex = openssl.toHex(hash);
```

### sha384(data)

Calculates the SHA-384 hash of the input data.

**Parameters:**
- `data` (Uint8Array | string): The data to hash

**Returns:**
- `Uint8Array`: The 48-byte SHA-384 digest

```javascript
const hash = openssl.sha384('Hello, world!');
const hashHex = openssl.toHex(hash);
```

### sha512(data)

Calculates the SHA-512 hash of the input data.

**Parameters:**
- `data` (Uint8Array | string): The data to hash

**Returns:**
- `Uint8Array`: The 64-byte SHA-512 digest

```javascript
const hash = openssl.sha512('Hello, world!');
const hashHex = openssl.toHex(hash);
```

### md5(data)

Calculates the MD5 hash of the input data.

**Parameters:**
- `data` (Uint8Array | string): The data to hash

**Returns:**
- `Uint8Array`: The 16-byte MD5 digest

```javascript
const hash = openssl.md5('Hello, world!');
const hashHex = openssl.toHex(hash);
```

## Encryption Functions

### aesEncrypt(data, key, iv)

Encrypts data using AES in CBC mode.

**Parameters:**
- `data` (Uint8Array | string): The data to encrypt
- `key` (Uint8Array): The encryption key (16, 24, or 32 bytes for AES-128, AES-192, or AES-256)
- `iv` (Uint8Array): The initialization vector (16 bytes)

**Returns:**
- `Uint8Array`: The encrypted data

```javascript
const key = openssl.randomBytes(32); // AES-256
const iv = openssl.randomBytes(16);
const encrypted = openssl.aesEncrypt('Secret message', key, iv);
```

### aesDecrypt(data, key, iv)

Decrypts data using AES in CBC mode.

**Parameters:**
- `data` (Uint8Array): The data to decrypt
- `key` (Uint8Array): The encryption key (16, 24, or 32 bytes)
- `iv` (Uint8Array): The initialization vector (16 bytes)

**Returns:**
- `Uint8Array`: The decrypted data

```javascript
const decrypted = openssl.aesDecrypt(encrypted, key, iv);
const decryptedText = new TextDecoder().decode(decrypted);
```

## RSA Functions

### generateRsaKeyPair(bits)

Generates an RSA key pair.

**Parameters:**
- `bits` (number): The key size in bits (e.g., 2048, 4096)

**Returns:**
- `Object`: An object containing `publicKey` and `privateKey` as PEM strings

```javascript
const { publicKey, privateKey } = openssl.generateRsaKeyPair(2048);
```

### rsaEncrypt(data, publicKey)

Encrypts data using an RSA public key.

**Parameters:**
- `data` (Uint8Array | string): The data to encrypt
- `publicKey` (string): The PEM-encoded public key

**Returns:**
- `Uint8Array`: The encrypted data

```javascript
const encrypted = openssl.rsaEncrypt('Secret message', publicKey);
```

### rsaDecrypt(data, privateKey)

Decrypts data using an RSA private key.

**Parameters:**
- `data` (Uint8Array): The data to decrypt
- `privateKey` (string): The PEM-encoded private key

**Returns:**
- `Uint8Array`: The decrypted data

```javascript
const decrypted = openssl.rsaDecrypt(encrypted, privateKey);
const decryptedText = new TextDecoder().decode(decrypted);
```

### rsaSign(data, privateKey, algorithm = 'sha256')

Signs data using an RSA private key.

**Parameters:**
- `data` (Uint8Array | string): The data to sign
- `privateKey` (string): The PEM-encoded private key
- `algorithm` (string, optional): The hash algorithm to use (default: 'sha256')

**Returns:**
- `Uint8Array`: The signature

```javascript
const signature = openssl.rsaSign('Message to sign', privateKey);
```

### rsaVerify(data, signature, publicKey, algorithm = 'sha256')

Verifies an RSA signature.

**Parameters:**
- `data` (Uint8Array | string): The original data
- `signature` (Uint8Array): The signature to verify
- `publicKey` (string): The PEM-encoded public key
- `algorithm` (string, optional): The hash algorithm used (default: 'sha256')

**Returns:**
- `boolean`: `true` if the signature is valid, `false` otherwise

```javascript
const isValid = openssl.rsaVerify('Message to sign', signature, publicKey);
```

## Utility Functions

### base64Encode(data)

Encodes data as Base64.

**Parameters:**
- `data` (Uint8Array | string): The data to encode

**Returns:**
- `string`: The Base64-encoded string

```javascript
const encoded = openssl.base64Encode('Hello, world!');
```

### base64Decode(data)

Decodes Base64 data.

**Parameters:**
- `data` (string): The Base64-encoded string

**Returns:**
- `Uint8Array`: The decoded data

```javascript
const decoded = openssl.base64Decode(encoded);
const text = new TextDecoder().decode(decoded);
```

### toHex(data)

Converts a Uint8Array to a hexadecimal string.

**Parameters:**
- `data` (Uint8Array): The data to convert

**Returns:**
- `string`: The hexadecimal representation

```javascript
const hex = openssl.toHex(hash);
```

### fromHex(hex)

Converts a hexadecimal string to a Uint8Array.

**Parameters:**
- `hex` (string): The hexadecimal string

**Returns:**
- `Uint8Array`: The decoded data

```javascript
const data = openssl.fromHex('48656c6c6f2c20776f726c6421'); // "Hello, world!"
```
