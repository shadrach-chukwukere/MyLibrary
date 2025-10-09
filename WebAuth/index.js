export class WebAuthManager {
  constructor(rpName = "My App", timeout = 60000) {
    this.rpName = rpName;
    this.timeout = timeout;
    this.isSupported = !!window.PublicKeyCredential;
    this.hasCredentialsAPI = !!navigator.credentials;

    if (!this.isSupported) {
      console.warn("⚠️ WebAuthn not supported in this browser.");
    }
  }

  /** Generate secure random bytes */
  static randomBytes(length = 32) {
    const arr = new Uint8Array(length);
    if (crypto?.getRandomValues) crypto.getRandomValues(arr);
    else console.warn("⚠️ crypto.getRandomValues not supported.");
    return arr;
  }

  /** Base64URL → Uint8Array */
  static base64ToUint8Array(base64 = "") {
    try {
      const b64 = (base64 + "===".slice((base64.length + 3) % 4))
        .replace(/-/g, "+")
        .replace(/_/g, "/");
      return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
    } catch (err) {
      console.error("Invalid base64 input:", err);
      return new Uint8Array();
    }
  }

  /** Uint8Array → Base64URL (useful for backend communication) */
  static uint8ArrayToBase64(array) {
    return btoa(String.fromCharCode(...array))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  }

  /** Create a new WebAuthn credential */
  async createCredential({
    challengeStr,
    username = "",
    displayName,
    timeout = this.timeout,
  } = {}) {
    if (!this.isSupported) return null;

    try {
      const challenge = challengeStr
        ? WebAuthManager.base64ToUint8Array(challengeStr)
        : WebAuthManager.randomBytes(32);

      const userId = WebAuthManager.randomBytes(16);

      const publicKey = {
        challenge,
        rp: { name: this.rpName },
        user: {
          id: userId,
          name: username,
          displayName: displayName || username,
        },
        pubKeyCredParams: [
          { type: "public-key", alg: -7 }, // ES256
          { type: "public-key", alg: -257 }, // RS256
        ],
        authenticatorSelection: {
          residentKey: "preferred",
          userVerification: "required",
        },
        timeout,
        attestation: "none", // faster and more privacy-friendly
      };

      const credential = await navigator.credentials.create({ publicKey });
      console.info("✅ Credential created successfully.");
      return credential;
    } catch (err) {
      console.error("❌ Failed to create credential:", err);
      return null;
    }
  }

  /** Retrieve an existing WebAuthn credential */
  async getCredential({
    challengeStr,
    allowCredentials = [],
    timeout = this.timeout,
  } = {}) {
    if (!this.isSupported) return null;

    try {
      const challenge = challengeStr
        ? WebAuthManager.base64ToUint8Array(challengeStr)
        : WebAuthManager.randomBytes(32);

      const publicKey = {
        challenge,
        allowCredentials,
        timeout,
        userVerification: "required",
      };

      const assertion = await navigator.credentials.get({ publicKey });
      console.info("✅ Credential retrieved successfully.");
      return assertion;
    } catch (err) {
      console.error("❌ Failed to get credential:", err);
      return null;
    }
  }

  /** Store a password credential using Credential Management API */
  async storeCredential({ id, password }) {
    if (!this.hasCredentialsAPI) {
      console.warn("⚠️ Credentials API not supported.");
      return null;
    }

    try {
      const cred = new PasswordCredential({ id, password });
      const stored = await navigator.credentials.store(cred);
      console.info("✅ Password credential stored successfully.");
      return stored;
    } catch (err) {
      console.error("❌ Failed to store credential:", err);
      return null;
    }
  }
}
