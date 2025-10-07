export class WebAuthnManager {
  constructor(rpName = "My App", timeout = 60000) {
    this.rpName = rpName;
    this.timeout = timeout;
    this.isSupported = !!window.PublicKeyCredential;
    this.hasCredentialsAPI = !!navigator.credentials;

    if (!this.isSupported)
      console.warn("WebAuthn not supported in this browser.");
  }

  static randomBytes(len = 32) {
    if (!window.crypto?.getRandomValues) {
      console.warn("⚠️ Secure random not supported, WebAuthn may fail.");
      return new Uint8Array(len);
    }
    const arr = new Uint8Array(len);
    window.crypto.getRandomValues(arr);
    return arr;
  }

  static base64ToUint8Array(base64 = "") {
    try {
      const pad = "=".repeat((4 - (base64.length % 4)) % 4);
      const b64 = (base64 + pad).replace(/-/g, "+").replace(/_/g, "/");
      return new Uint8Array([...atob(b64)].map((c) => c.charCodeAt(0)));
    } catch {
      return new Uint8Array();
    }
  }

  async createCredential({
    challengeStr = null,
    username = "",
    displayName = null,
    timeout = this.timeout,
  } = {}) {
    if (!this.isSupported) return null;

    try {
      const challenge = challengeStr
        ? WebAuthnManager.base64ToUint8Array(challengeStr).slice().buffer
        : WebAuthnManager.randomBytes(32).slice().buffer;

      const userId = WebAuthnManager.randomBytes(16).slice().buffer;

      return await navigator.credentials.create({
        publicKey: {
          challenge,
          rp: { name: this.rpName },
          user: {
            id: userId,
            name: username,
            displayName: displayName || username,
          },
          pubKeyCredParams: [{ alg: -7, type: "public-key" }],
          authenticatorSelection: { userVerification: "required" },
          timeout,
          attestation: "direct",
        },
      });
    } catch (err) {
      console.error("Error creating credential:", err);
      return null;
    }
  }

  async getCredential({
    challengeStr = null,
    allowCredentials = [],
    timeout = this.timeout,
  } = {}) {
    if (!this.isSupported) return null;

    try {
      const challenge = challengeStr
        ? WebAuthnManager.base64ToUint8Array(challengeStr).slice().buffer
        : WebAuthnManager.randomBytes(32).slice().buffer;

      return await navigator.credentials.get({
        publicKey: {
          challenge,
          allowCredentials,
          timeout,
          userVerification: "required",
        },
      });
    } catch (err) {
      console.error("Error getting credential:", err);
      return null;
    }
  }

  async storeCredential({ id, password }) {
    if (!this.hasCredentialsAPI) return null;

    try {
      const cred = new PasswordCredential({ id, password });
      await navigator.credentials.store(cred);
      return cred;
    } catch (err) {
      console.error("Error storing credential:", err);
      return null;
    }
  }
}
