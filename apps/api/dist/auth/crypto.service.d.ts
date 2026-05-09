export declare class CryptoService {
    private readonly algorithm;
    private readonly key;
    private readonly ivLength;
    encrypt(text: string): string;
    decrypt(encryptedData: string): string;
    generateSecureToken(bytes?: number): string;
    hashSha256(data: string): string;
}
