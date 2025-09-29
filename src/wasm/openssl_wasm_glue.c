#include <openssl/opensslv.h>
#include <openssl/crypto.h>
#include <openssl/err.h>
#include <openssl/rand.h>
#include <openssl/evp.h>
#include <openssl/rsa.h>
#include <openssl/pem.h>
#include <openssl/bio.h>
#include <openssl/hmac.h>
#include <openssl/buffer.h>
#include <string.h>
#include <stdlib.h>

/**
 * Get OpenSSL version string
 */
const char* openssl_version() {
    return OpenSSL_version(OPENSSL_VERSION);
}

/**
 * Initialize OpenSSL
 */
int openssl_init() {
    return OPENSSL_init_crypto(OPENSSL_INIT_ADD_ALL_CIPHERS | 
                              OPENSSL_INIT_ADD_ALL_DIGESTS | 
                              OPENSSL_INIT_LOAD_CONFIG, 
                              NULL);
}

/**
 * Clean up OpenSSL
 */
void openssl_cleanup() {
    OPENSSL_cleanup();
}

/**
 * Generate random bytes
 */
int random_bytes(unsigned char* buf, int len) {
    return RAND_bytes(buf, len);
}

/**
 * Calculate SHA1 digest
 */
int sha1_digest(const unsigned char* data, size_t data_len, unsigned char* md) {
    const EVP_MD* sha1 = EVP_sha1();
    unsigned int md_len;
    EVP_MD_CTX* mdctx = EVP_MD_CTX_new();
    
    if (!mdctx) return 0;
    
    if (EVP_DigestInit_ex(mdctx, sha1, NULL) != 1 ||
        EVP_DigestUpdate(mdctx, data, data_len) != 1 ||
        EVP_DigestFinal_ex(mdctx, md, &md_len) != 1) {
        EVP_MD_CTX_free(mdctx);
        return 0;
    }
    
    EVP_MD_CTX_free(mdctx);
    return 1;
}

/**
 * Calculate SHA256 digest
 */
int sha256_digest(const unsigned char* data, size_t data_len, unsigned char* md) {
    const EVP_MD* sha256 = EVP_sha256();
    unsigned int md_len;
    EVP_MD_CTX* mdctx = EVP_MD_CTX_new();
    
    if (!mdctx) return 0;
    
    if (EVP_DigestInit_ex(mdctx, sha256, NULL) != 1 ||
        EVP_DigestUpdate(mdctx, data, data_len) != 1 ||
        EVP_DigestFinal_ex(mdctx, md, &md_len) != 1) {
        EVP_MD_CTX_free(mdctx);
        return 0;
    }
    
    EVP_MD_CTX_free(mdctx);
    return 1;
}

/**
 * Calculate SHA384 digest
 */
int sha384_digest(const unsigned char* data, size_t data_len, unsigned char* md) {
    const EVP_MD* sha384 = EVP_sha384();
    unsigned int md_len;
    EVP_MD_CTX* mdctx = EVP_MD_CTX_new();
    
    if (!mdctx) return 0;
    
    if (EVP_DigestInit_ex(mdctx, sha384, NULL) != 1 ||
        EVP_DigestUpdate(mdctx, data, data_len) != 1 ||
        EVP_DigestFinal_ex(mdctx, md, &md_len) != 1) {
        EVP_MD_CTX_free(mdctx);
        return 0;
    }
    
    EVP_MD_CTX_free(mdctx);
    return 1;
}

/**
 * Calculate SHA512 digest
 */
int sha512_digest(const unsigned char* data, size_t data_len, unsigned char* md) {
    const EVP_MD* sha512 = EVP_sha512();
    unsigned int md_len;
    EVP_MD_CTX* mdctx = EVP_MD_CTX_new();
    
    if (!mdctx) return 0;
    
    if (EVP_DigestInit_ex(mdctx, sha512, NULL) != 1 ||
        EVP_DigestUpdate(mdctx, data, data_len) != 1 ||
        EVP_DigestFinal_ex(mdctx, md, &md_len) != 1) {
        EVP_MD_CTX_free(mdctx);
        return 0;
    }
    
    EVP_MD_CTX_free(mdctx);
    return 1;
}

/**
 * Calculate MD5 digest
 */
int md5_digest(const unsigned char* data, size_t data_len, unsigned char* md) {
    const EVP_MD* md5 = EVP_md5();
    unsigned int md_len;
    EVP_MD_CTX* mdctx = EVP_MD_CTX_new();
    
    if (!mdctx) return 0;
    
    if (EVP_DigestInit_ex(mdctx, md5, NULL) != 1 ||
        EVP_DigestUpdate(mdctx, data, data_len) != 1 ||
        EVP_DigestFinal_ex(mdctx, md, &md_len) != 1) {
        EVP_MD_CTX_free(mdctx);
        return 0;
    }
    
    EVP_MD_CTX_free(mdctx);
    return 1;
}

/**
 * AES encryption context
 */
EVP_CIPHER_CTX* aes_encrypt_init(const unsigned char* key, int key_len, const unsigned char* iv) {
    EVP_CIPHER_CTX* ctx = EVP_CIPHER_CTX_new();
    const EVP_CIPHER* cipher = NULL;
    
    if (!ctx) return NULL;
    
    switch (key_len) {
        case 16: cipher = EVP_aes_128_cbc(); break;
        case 24: cipher = EVP_aes_192_cbc(); break;
        case 32: cipher = EVP_aes_256_cbc(); break;
        default: 
            EVP_CIPHER_CTX_free(ctx);
            return NULL;
    }
    
    if (EVP_EncryptInit_ex(ctx, cipher, NULL, key, iv) != 1) {
        EVP_CIPHER_CTX_free(ctx);
        return NULL;
    }
    
    return ctx;
}

/**
 * AES encryption update
 */
int aes_encrypt_update(EVP_CIPHER_CTX* ctx, const unsigned char* in, int in_len, unsigned char* out, int* out_len) {
    return EVP_EncryptUpdate(ctx, out, out_len, in, in_len);
}

/**
 * AES encryption final
 */
int aes_encrypt_final(EVP_CIPHER_CTX* ctx, unsigned char* out, int* out_len) {
    int ret = EVP_EncryptFinal_ex(ctx, out, out_len);
    EVP_CIPHER_CTX_free(ctx);
    return ret;
}

/**
 * AES decryption context
 */
EVP_CIPHER_CTX* aes_decrypt_init(const unsigned char* key, int key_len, const unsigned char* iv) {
    EVP_CIPHER_CTX* ctx = EVP_CIPHER_CTX_new();
    const EVP_CIPHER* cipher = NULL;
    
    if (!ctx) return NULL;
    
    switch (key_len) {
        case 16: cipher = EVP_aes_128_cbc(); break;
        case 24: cipher = EVP_aes_192_cbc(); break;
        case 32: cipher = EVP_aes_256_cbc(); break;
        default: 
            EVP_CIPHER_CTX_free(ctx);
            return NULL;
    }
    
    if (EVP_DecryptInit_ex(ctx, cipher, NULL, key, iv) != 1) {
        EVP_CIPHER_CTX_free(ctx);
        return NULL;
    }
    
    return ctx;
}

/**
 * AES decryption update
 */
int aes_decrypt_update(EVP_CIPHER_CTX* ctx, const unsigned char* in, int in_len, unsigned char* out, int* out_len) {
    return EVP_DecryptUpdate(ctx, out, out_len, in, in_len);
}

/**
 * AES decryption final
 */
int aes_decrypt_final(EVP_CIPHER_CTX* ctx, unsigned char* out, int* out_len) {
    int ret = EVP_DecryptFinal_ex(ctx, out, out_len);
    EVP_CIPHER_CTX_free(ctx);
    return ret;
}

/**
 * RSA key generation
 */
RSA* rsa_generate_key(int bits) {
    BIGNUM* bn = BN_new();
    RSA* rsa = NULL;
    
    if (!bn) return NULL;
    
    if (BN_set_word(bn, RSA_F4) != 1) {
        BN_free(bn);
        return NULL;
    }
    
    rsa = RSA_new();
    if (!rsa) {
        BN_free(bn);
        return NULL;
    }
    
    if (RSA_generate_key_ex(rsa, bits, bn, NULL) != 1) {
        RSA_free(rsa);
        BN_free(bn);
        return NULL;
    }
    
    BN_free(bn);
    return rsa;
}

/**
 * RSA public key encryption
 */
int rsa_public_encrypt(int flen, const unsigned char* from, unsigned char* to, RSA* rsa, int padding) {
    return RSA_public_encrypt(flen, from, to, rsa, padding);
}

/**
 * RSA private key decryption
 */
int rsa_private_decrypt(int flen, const unsigned char* from, unsigned char* to, RSA* rsa, int padding) {
    return RSA_private_decrypt(flen, from, to, rsa, padding);
}

/**
 * RSA private key encryption (for signing)
 */
int rsa_private_encrypt(int flen, const unsigned char* from, unsigned char* to, RSA* rsa, int padding) {
    return RSA_private_encrypt(flen, from, to, rsa, padding);
}

/**
 * RSA public key decryption (for verification)
 */
int rsa_public_decrypt(int flen, const unsigned char* from, unsigned char* to, RSA* rsa, int padding) {
    return RSA_public_decrypt(flen, from, to, rsa, padding);
}

/**
 * RSA sign
 */
int rsa_sign(int type, const unsigned char* m, unsigned int m_len, unsigned char* sigret, unsigned int* siglen, RSA* rsa) {
    return RSA_sign(type, m, m_len, sigret, siglen, rsa);
}

/**
 * RSA verify
 */
int rsa_verify(int type, const unsigned char* m, unsigned int m_len, const unsigned char* sigbuf, unsigned int siglen, RSA* rsa) {
    return RSA_verify(type, m, m_len, sigbuf, siglen, rsa);
}

/**
 * Read private key from PEM
 */
EVP_PKEY* pem_read_bio_private_key(BIO* bp, const char* password) {
    return PEM_read_bio_PrivateKey(bp, NULL, NULL, (void*)password);
}

/**
 * Read public key from PEM
 */
EVP_PKEY* pem_read_bio_pubkey(BIO* bp) {
    return PEM_read_bio_PUBKEY(bp, NULL, NULL, NULL);
}

/**
 * Write private key to PEM
 */
int pem_write_bio_private_key(BIO* bp, EVP_PKEY* key, const char* password) {
    if (password && *password) {
        return PEM_write_bio_PKCS8PrivateKey(bp, key, EVP_aes_256_cbc(), (char*)password, strlen(password), NULL, NULL);
    } else {
        return PEM_write_bio_PrivateKey(bp, key, NULL, NULL, 0, NULL, NULL);
    }
}

/**
 * Write public key to PEM
 */
int pem_write_bio_pubkey(BIO* bp, EVP_PKEY* key) {
    return PEM_write_bio_PUBKEY(bp, key);
}

/**
 * HMAC initialization
 */
HMAC_CTX* hmac_init(const unsigned char* key, int key_len, const EVP_MD* md) {
    HMAC_CTX* ctx = HMAC_CTX_new();
    
    if (!ctx) return NULL;
    
    if (HMAC_Init_ex(ctx, key, key_len, md, NULL) != 1) {
        HMAC_CTX_free(ctx);
        return NULL;
    }
    
    return ctx;
}

/**
 * HMAC update
 */
int hmac_update(HMAC_CTX* ctx, const unsigned char* data, int len) {
    return HMAC_Update(ctx, data, len);
}

/**
 * HMAC final
 */
int hmac_final(HMAC_CTX* ctx, unsigned char* md, unsigned int* len) {
    int ret = HMAC_Final(ctx, md, len);
    HMAC_CTX_free(ctx);
    return ret;
}

/**
 * Base64 encode
 */
char* base64_encode(const unsigned char* in, int in_len, int* out_len) {
    BIO* b64 = BIO_new(BIO_f_base64());
    BIO* bmem = BIO_new(BIO_s_mem());
    BUF_MEM* bptr;
    char* buf;
    
    BIO_push(b64, bmem);
    BIO_set_flags(b64, BIO_FLAGS_BASE64_NO_NL);
    BIO_write(b64, in, in_len);
    BIO_flush(b64);
    BIO_get_mem_ptr(b64, &bptr);
    
    buf = malloc(bptr->length + 1);
    if (!buf) {
        BIO_free_all(b64);
        return NULL;
    }
    
    memcpy(buf, bptr->data, bptr->length);
    buf[bptr->length] = 0;
    *out_len = bptr->length;
    
    BIO_free_all(b64);
    return buf;
}

/**
 * Base64 decode
 */
unsigned char* base64_decode(const char* in, int in_len, int* out_len) {
    BIO* b64 = BIO_new(BIO_f_base64());
    BIO* bmem = BIO_new_mem_buf(in, in_len);
    unsigned char* buf = malloc(in_len);
    
    if (!buf) {
        BIO_free_all(b64);
        BIO_free(bmem);
        return NULL;
    }
    
    bmem = BIO_push(b64, bmem);
    BIO_set_flags(bmem, BIO_FLAGS_BASE64_NO_NL);
    *out_len = BIO_read(bmem, buf, in_len);
    
    BIO_free_all(bmem);
    return buf;
}

/**
 * Create a memory BIO
 */
BIO* bio_new_mem_buf(const void* buf, int len) {
    return BIO_new_mem_buf(buf, len);
}

/**
 * Free a BIO
 */
void bio_free(BIO* bio) {
    BIO_free(bio);
}

/**
 * Read from a BIO
 */
int bio_read(BIO* bio, void* data, int len) {
    return BIO_read(bio, data, len);
}

/**
 * Write to a BIO
 */
int bio_write(BIO* bio, const void* data, int len) {
    return BIO_write(bio, data, len);
}

/**
 * Get data from a memory BIO
 */
long bio_get_mem_data(BIO* bio, char** pp) {
    return BIO_get_mem_data(bio, pp);
}

/**
 * Free an EVP_PKEY
 */
void evp_pkey_free(EVP_PKEY* pkey) {
    EVP_PKEY_free(pkey);
}

/**
 * Free an EVP_MD_CTX
 */
void evp_md_ctx_free(EVP_MD_CTX* ctx) {
    EVP_MD_CTX_free(ctx);
}

/**
 * Free an EVP_CIPHER_CTX
 */
void evp_cipher_ctx_free(EVP_CIPHER_CTX* ctx) {
    EVP_CIPHER_CTX_free(ctx);
}

/**
 * Get OpenSSL error string
 */
const char* get_error_string() {
    static char error_string[256];
    unsigned long err = ERR_get_error();
    
    if (err == 0) {
        return NULL;
    }
    
    ERR_error_string_n(err, error_string, sizeof(error_string));
    return error_string;
}
