import { Injectable } from '@nestjs/common';
import { createCipheriv, createDecipheriv, randomBytes, randomFillSync } from 'crypto';

@Injectable()
export class CryptoService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly key = Buffer.from(process.env.AES_ENCRYPTION_KEY || randomBytes(32).toString('hex'), 'hex');
  private readonly ivLength = 12; // Standard for GCM

  encrypt(text: string): string {
    const iv = randomBytes(this.ivLength);
    const cipher = createCipheriv(this.algorithm, this.key, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag().toString('hex');
    
    // Return iv:authTag:encrypted
    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
  }

  decrypt(encryptedData: string): string {
    const [ivHex, authTagHex, encryptedText] = encryptedData.split(':');
    
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const decipher = createDecipheriv(this.algorithm, this.key, iv);
    
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  generateSecureToken(bytes = 32): string {
    return randomBytes(bytes).toString('hex');
  }

  hashSha256(data: string): string {
    const { createHash } = require('crypto');
    return createHash('sha256').update(data).digest('hex');
  }
}
