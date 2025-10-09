// index.d.ts

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

export interface CredentialOptions {
  challengeStr?: string | null;
  username?: string;
  displayName?: string | null;
  timeout?: number;
}

export interface GetCredentialOptions {
  challengeStr?: string | null;
  allowCredentials?: PublicKeyCredentialDescriptor[];
  timeout?: number;
}

export interface PasswordStoreOptions {
  id: string;
  password: string;
}

export declare class WebAuthManager {
  rpName: string;
  timeout: number;
  isSupported: boolean;
  hasCredentialsAPI: boolean;

  constructor(rpName?: string, timeout?: number);

  static randomBytes(len?: number): Uint8Array;
  static base64ToUint8Array(base64?: string): Uint8Array;

  createCredential(
    options?: CredentialOptions
  ): Promise<PublicKeyCredential | null>;
  getCredential(
    options?: GetCredentialOptions
  ): Promise<PublicKeyCredential | null>;
  storeCredential(
    options: PasswordStoreOptions
  ): Promise<PasswordCredential | null>;
  deleteCredential(): Promise<void>; // ← here
}
