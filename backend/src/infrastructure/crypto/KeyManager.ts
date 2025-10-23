import { generateKeyPairSync, KeyObject, createPrivateKey, createPublicKey } from 'crypto';
import { env } from '@config/env';

export interface KeyPair {
  privateKey: string;
  publicKey: string;
  kid: string;
}

export class KeyManager {
  private static instance: KeyManager;
  private currentKeyPair: KeyPair | null = null;

  constructor() {
    this.loadOrGenerateKeys();
  }

  public static getInstance(): KeyManager {
    if (!KeyManager.instance) {
      KeyManager.instance = new KeyManager();
    }
    return KeyManager.instance;
  }

  private loadOrGenerateKeys(): void {
    const privateKey = env.JWT_PRIVATE_KEY;
    const publicKey = env.JWT_PUBLIC_KEY;
    const kid = env.JWT_KID || 'default';

    if (privateKey && publicKey) {
      this.currentKeyPair = {
        privateKey,
        publicKey,
        kid,
      };
    } else {
      console.warn('JWT keys not found in environment, generating new keys...');
      this.generateNewKeyPair();
    }
  }

  public generateNewKeyPair(): KeyPair {
    const { publicKey, privateKey } = generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem',
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem',
      },
    });
    
    const keyPair: KeyPair = {
      privateKey: privateKey as string,
      publicKey: publicKey as string,
      kid: `key_${Date.now()}`,
    };

    this.currentKeyPair = keyPair;
    
    console.log('🔑 New key pair generated:');
    console.log('Private Key:', keyPair.privateKey);
    console.log('Public Key:', keyPair.publicKey);
    console.log('Key ID:', keyPair.kid);
    console.log('⚠️  Please update your environment variables with these keys!');
    
    return keyPair;
  }

  public getCurrentKeyPair(): KeyPair {
    if (!this.currentKeyPair) {
      throw new Error('No key pair available');
    }
    return this.currentKeyPair;
  }

  public getPrivateKey(): string {
    return this.getCurrentKeyPair().privateKey;
  }

  public getPublicKey(): string {
    return this.getCurrentKeyPair().publicKey;
  }

  public getKid(): string {
    return this.getCurrentKeyPair().kid;
  }

  public getPrivateKeyObject(): KeyObject {
    const privateKeyPem = this.getPrivateKey();
    return createPrivateKey(privateKeyPem);
  }

  public getPublicKeyObject(): KeyObject {
    const publicKeyPem = this.getPublicKey();
    return createPublicKey(publicKeyPem);
  }

  public rotateKeys(): KeyPair {
    console.log('🔄 Rotating keys...');
    const newKeyPair = this.generateNewKeyPair();
    
    this.logKeyRotation(newKeyPair);
    
    return newKeyPair;
  }

  private logKeyRotation(newKeyPair: KeyPair): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      action: 'key_rotation',
      oldKid: this.currentKeyPair?.kid,
      newKid: newKeyPair.kid,
      algorithm: 'RS256',
    };
    
    console.log('📊 Key rotation logged:', logEntry);
    
  }

  public validateKeys(): boolean {
    try {
      if (!this.currentKeyPair) {
        return false;
      }
      
      this.getPrivateKeyObject();
      this.getPublicKeyObject();
      
      return true;
    } catch (error) {
      console.error('❌ Invalid keys detected:', error);
      return false;
    }
  }

  public getKeyInfo(): { kid: string; algorithm: string; valid: boolean } {
    return {
      kid: this.currentKeyPair?.kid || 'none',
      algorithm: 'RS256',
      valid: this.validateKeys(),
    };
  }
}
