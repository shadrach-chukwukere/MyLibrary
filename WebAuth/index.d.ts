// index.d.ts

/** Browser-native PasswordCredential (for Credential Management API) */
declare class PasswordCredential {
  constructor(init: {
    id: string;
    password: string;
    name?: string;
    iconURL?: string;
  });

  readonly id: string;
  readonly password: string;
  readonly name?: string;
  readonly iconURL?: string;
  readonly type: "password";
}

/** Options for creating a new WebAuthn credential */
export interface CredentialOptions {
  challengeStr?: string | null;
  username?: string;
  displayName?: string | null;
  timeout?: number;
}

/** Options for retrieving an existing WebAuthn credential */
export interface GetCredentialOptions {
  challengeStr?: string | null;
  allowCredentials?: PublicKeyCredentialDescriptor[];
  timeout?: number;
}

/** Options for storing a password credential */
export interface PasswordStoreOptions {
  id: string;
  password: string;
}

/** WebAuthManager main class definition */
export declare class WebAuthManager {
  rpName: string;
  timeout: number;
  isSupported: boolean;
  hasCredentialsAPI: boolean;

  constructor(rpName?: string, timeout?: number);

  /** Generate secure random bytes as ArrayBuffer (used for challenges, user IDs) */
  static randomBytes(len?: number): ArrayBuffer;

  /** Convert Base64URL string to Uint8Array */
  static base64ToUint8Array(base64?: string): Uint8Array;

  /** Convert Uint8Array to Base64URL string */
  static uint8ArrayToBase64(array: Uint8Array): string;

  /** Create a new WebAuthn credential (Passkey Registration) */
  createCredential(
    options?: CredentialOptions
  ): Promise<PublicKeyCredential | null>;

  /** Retrieve an existing WebAuthn credential (Passkey Authentication) */
  getCredential(
    options?: GetCredentialOptions
  ): Promise<PublicKeyCredential | null>;

  /** Store a password credential using Credential Management API */
  storeCredential(
    options: PasswordStoreOptions
  ): Promise<PasswordCredential | null>;

  /** Retrieve a password credential (if available) */
  getPasswordCredential(): Promise<PasswordCredential | null>;

}
