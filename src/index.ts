/**
 * OpenSSL-WASM-JS
 * A minimal JavaScript and WebAssembly port of OpenSSL for web browsers
 */

// Import the WebAssembly module
import OpenSSLWasmModule from '../dist/openssl-wasm';

// Type definitions
export interface OpenSSLWasmInstance {
  ccall: (name: string, returnType: string, argTypes: string[], args: any[]) => any;
  cwrap: (name: string, returnType: string, argTypes: string[]) => Function;
  getValue: (ptr: number, type: string) => any;
  setValue: (ptr: number, value: any, type: string) => void;
  UTF8ToString: (ptr: number) => string;
  stringToUTF8: (str: string, outPtr: number, maxBytesToWrite: number) => void;
  _malloc: (size: number) => number;
  _free: (ptr: number) => void;
  HEAPU8: Uint8Array;
}

export interface OpenSSLWasm {
  // Core functions
  initialize(): Promise<OpenSSL>;
}

/**
 * Main OpenSSL class that provides cryptographic functionality
 */
export class OpenSSL {
  private instance: OpenSSLWasmInstance;
  private initialized: boolean = false;

  // Function wrappers
  private _openssl_version: () => string;
  private _openssl_init: () => number;
  private _openssl_cleanup: () => void;
  private _random_bytes: (ptr: number, len: number) => number;
  private _sha1_digest: (dataPtr: number, dataLen: number, mdPtr: number) => number;
  private _sha256_digest: (dataPtr: number, dataLen: number, mdPtr: number) => number;
  private _sha384_digest: (dataPtr: number, dataLen: number, mdPtr: number) => number;
  private _sha512_digest: (dataPtr: number, dataLen: number, mdPtr: number) => number;
  private _md5_digest: (dataPtr: number, dataLen: number, mdPtr: number) => number;
  private _base64_encode: (inPtr: number, inLen: number, outLenPtr: number) => number;
  private _base64_decode: (inPtr: number, inLen: number, outLenPtr: number) => number;
  private _get_error_string: () => number;

  /**
   * Constructor - should not be called directly, use OpenSSLWasm.initialize() instead
   */
  constructor(instance: OpenSSLWasmInstance) {
    this.instance = instance;
    
    // Initialize function wrappers
    this._openssl_version = this.instance.cwrap('openssl_version', 'string', []);
    this._openssl_init = this.instance.cwrap('openssl_init', 'number', []);
    this._openssl_cleanup = this.instance.cwrap('openssl_cleanup', 'void', []);
    this._random_bytes = this.instance.cwrap('random_bytes', 'number', ['number', 'number']);
    this._sha1_digest = this.instance.cwrap('sha1_digest', 'number', ['number', 'number', 'number']);
    this._sha256_digest = this.instance.cwrap('sha256_digest', 'number', ['number', 'number', 'number']);
    this._sha384_digest = this.instance.cwrap('sha384_digest', 'number', ['number', 'number', 'number']);
    this._sha512_digest = this.instance.cwrap('sha512_digest', 'number', ['number', 'number', 'number']);
    this._md5_digest = this.instance.cwrap('md5_digest', 'number', ['number', 'number', 'number']);
    this._base64_encode = this.instance.cwrap('base64_encode', 'number', ['number', 'number', 'number']);
    this._base64_decode = this.instance.cwrap('base64_decode', 'number', ['number', 'number', 'number']);
    this._get_error_string = this.instance.cwrap('get_error_string', 'string', []);
    
    // Initialize OpenSSL
    const result = this._openssl_init();
    if (result !== 1) {
      throw new Error('Failed to initialize OpenSSL');
    }
    
    this.initialized = true;
  }

  /**
   * Get the OpenSSL version string
   */
  version(): string {
    return this._openssl_version();
  }

  /**
   * Clean up OpenSSL resources
   */
  cleanup(): void {
    if (this.initialized) {
      this._openssl_cleanup();
      this.initialized = false;
    }
  }

  /**
   * Generate random bytes
   */
  randomBytes(length: number): Uint8Array {
    const ptr = this.instance._malloc(length);
    try {
      const result = this._random_bytes(ptr, length);
      if (result !== 1) {
        throw new Error(`Failed to generate random bytes: ${this._get_error_string()}`);
      }
      
      const output = new Uint8Array(length);
      output.set(new Uint8Array(this.instance.HEAPU8.buffer, ptr, length));
      return output;
    } finally {
      this.instance._free(ptr);
    }
  }

  /**
   * Calculate SHA-1 hash
   */
  sha1(data: Uint8Array | string): Uint8Array {
    const inputData = typeof data === 'string' ? new TextEncoder().encode(data) : data;
    const digestLength = 20; // SHA-1 digest length is 20 bytes
    
    const dataPtr = this.instance._malloc(inputData.length);
    const digestPtr = this.instance._malloc(digestLength);
    
    try {
      this.instance.HEAPU8.set(inputData, dataPtr);
      
      const result = this._sha1_digest(dataPtr, inputData.length, digestPtr);
      if (result !== 1) {
        throw new Error(`SHA-1 digest failed: ${this._get_error_string()}`);
      }
      
      const output = new Uint8Array(digestLength);
      output.set(new Uint8Array(this.instance.HEAPU8.buffer, digestPtr, digestLength));
      return output;
    } finally {
      this.instance._free(dataPtr);
      this.instance._free(digestPtr);
    }
  }

  /**
   * Calculate SHA-256 hash
   */
  sha256(data: Uint8Array | string): Uint8Array {
    const inputData = typeof data === 'string' ? new TextEncoder().encode(data) : data;
    const digestLength = 32; // SHA-256 digest length is 32 bytes
    
    const dataPtr = this.instance._malloc(inputData.length);
    const digestPtr = this.instance._malloc(digestLength);
    
    try {
      this.instance.HEAPU8.set(inputData, dataPtr);
      
      const result = this._sha256_digest(dataPtr, inputData.length, digestPtr);
      if (result !== 1) {
        throw new Error(`SHA-256 digest failed: ${this._get_error_string()}`);
      }
      
      const output = new Uint8Array(digestLength);
      output.set(new Uint8Array(this.instance.HEAPU8.buffer, digestPtr, digestLength));
      return output;
    } finally {
      this.instance._free(dataPtr);
      this.instance._free(digestPtr);
    }
  }

  /**
   * Calculate SHA-384 hash
   */
  sha384(data: Uint8Array | string): Uint8Array {
    const inputData = typeof data === 'string' ? new TextEncoder().encode(data) : data;
    const digestLength = 48; // SHA-384 digest length is 48 bytes
    
    const dataPtr = this.instance._malloc(inputData.length);
    const digestPtr = this.instance._malloc(digestLength);
    
    try {
      this.instance.HEAPU8.set(inputData, dataPtr);
      
      const result = this._sha384_digest(dataPtr, inputData.length, digestPtr);
      if (result !== 1) {
        throw new Error(`SHA-384 digest failed: ${this._get_error_string()}`);
      }
      
      const output = new Uint8Array(digestLength);
      output.set(new Uint8Array(this.instance.HEAPU8.buffer, digestPtr, digestLength));
      return output;
    } finally {
      this.instance._free(dataPtr);
      this.instance._free(digestPtr);
    }
  }

  /**
   * Calculate SHA-512 hash
   */
  sha512(data: Uint8Array | string): Uint8Array {
    const inputData = typeof data === 'string' ? new TextEncoder().encode(data) : data;
    const digestLength = 64; // SHA-512 digest length is 64 bytes
    
    const dataPtr = this.instance._malloc(inputData.length);
    const digestPtr = this.instance._malloc(digestLength);
    
    try {
      this.instance.HEAPU8.set(inputData, dataPtr);
      
      const result = this._sha512_digest(dataPtr, inputData.length, digestPtr);
      if (result !== 1) {
        throw new Error(`SHA-512 digest failed: ${this._get_error_string()}`);
      }
      
      const output = new Uint8Array(digestLength);
      output.set(new Uint8Array(this.instance.HEAPU8.buffer, digestPtr, digestLength));
      return output;
    } finally {
      this.instance._free(dataPtr);
      this.instance._free(digestPtr);
    }
  }

  /**
   * Calculate MD5 hash
   */
  md5(data: Uint8Array | string): Uint8Array {
    const inputData = typeof data === 'string' ? new TextEncoder().encode(data) : data;
    const digestLength = 16; // MD5 digest length is 16 bytes
    
    const dataPtr = this.instance._malloc(inputData.length);
    const digestPtr = this.instance._malloc(digestLength);
    
    try {
      this.instance.HEAPU8.set(inputData, dataPtr);
      
      const result = this._md5_digest(dataPtr, inputData.length, digestPtr);
      if (result !== 1) {
        throw new Error(`MD5 digest failed: ${this._get_error_string()}`);
      }
      
      const output = new Uint8Array(digestLength);
      output.set(new Uint8Array(this.instance.HEAPU8.buffer, digestPtr, digestLength));
      return output;
    } finally {
      this.instance._free(dataPtr);
      this.instance._free(digestPtr);
    }
  }

  /**
   * Base64 encode data
   */
  base64Encode(data: Uint8Array | string): string {
    const inputData = typeof data === 'string' ? new TextEncoder().encode(data) : data;
    
    const dataPtr = this.instance._malloc(inputData.length);
    const outLenPtr = this.instance._malloc(4); // 4 bytes for int
    
    try {
      this.instance.HEAPU8.set(inputData, dataPtr);
      
      const resultPtr = this._base64_encode(dataPtr, inputData.length, outLenPtr);
      if (resultPtr === 0) {
        throw new Error(`Base64 encoding failed: ${this._get_error_string()}`);
      }
      
      const result = this.instance.UTF8ToString(resultPtr);
      this.instance._free(resultPtr);
      return result;
    } finally {
      this.instance._free(dataPtr);
      this.instance._free(outLenPtr);
    }
  }

  /**
   * Base64 decode data
   */
  base64Decode(data: string): Uint8Array {
    const dataPtr = this.instance._malloc(data.length);
    const outLenPtr = this.instance._malloc(4); // 4 bytes for int
    
    try {
      this.instance.stringToUTF8(data, dataPtr, data.length + 1);
      
      const resultPtr = this._base64_decode(dataPtr, data.length, outLenPtr);
      if (resultPtr === 0) {
        throw new Error(`Base64 decoding failed: ${this._get_error_string()}`);
      }
      
      const outLen = this.instance.getValue(outLenPtr, 'i32');
      const output = new Uint8Array(outLen);
      output.set(new Uint8Array(this.instance.HEAPU8.buffer, resultPtr, outLen));
      
      this.instance._free(resultPtr);
      return output;
    } finally {
      this.instance._free(dataPtr);
      this.instance._free(outLenPtr);
    }
  }

  /**
   * Convert a Uint8Array to a hex string
   */
  toHex(data: Uint8Array): string {
    return Array.from(data)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  /**
   * Convert a hex string to a Uint8Array
   */
  fromHex(hex: string): Uint8Array {
    if (hex.length % 2 !== 0) {
      throw new Error('Hex string must have an even number of characters');
    }
    
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
      bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
    }
    
    return bytes;
  }
}

/**
 * Main entry point for the library
 */
const OpenSSLWasmJS: OpenSSLWasm = {
  /**
   * Initialize the OpenSSL WASM module
   */
  async initialize(): Promise<OpenSSL> {
    const wasmModule = await OpenSSLWasmModule();
    return new OpenSSL(wasmModule);
  }
};

export default OpenSSLWasmJS;
