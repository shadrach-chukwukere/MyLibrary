class WebAuthManager {
  constructor(rpName = "Web Auth ", timeout = 60000) {
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
    if (crypto?.getRandomValues) {
      crypto.getRandomValues(arr);
    } else {
      console.warn("⚠️ crypto.getRandomValues not supported.");
    }
    return arr.buffer; // Return as ArrayBuffer for credential options
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

  /** Create a new WebAuthn credential (Passkey Registration) */
  async createCredential({
    challengeStr,
    username = "",
    displayName,
    timeout = this.timeout,
  } = {}) {
    if (!this.isSupported) return null;

    try {
      const challenge = challengeStr
        ? WebAuthManager.base64ToUint8Array(challengeStr).buffer
        : WebAuthManager.randomBytes(32);

      const userId = WebAuthManager.randomBytes(16);

      const publicKey = {
        challenge,
        rp: { name: this.rpName, id: window.location.hostname || "localhost" },
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
          authenticatorAttachment: "cross-platform",
        },
        timeout,
        attestation: "none", // faster and privacy-friendly
      };

      console.log(
        `📤 Sending request to create Passkey for user: ${username}...`
      );
      const credential = await navigator.credentials.create({ publicKey });

      if (credential) {
        console.log("✅ Credential created successfully.");
        console.log(
          `Raw ID (Base64URL): ${WebAuthManager.uint8ArrayToBase64(
            new Uint8Array(credential.rawId)
          )}`
        );
        return credential;
      }

      return null;
    } catch (err) {
      console.warn(
        `❌ Failed to create credential: ${err.name} - ${err.message}`
      );
      return null;
    }
  }

  /** Retrieve an existing WebAuthn credential (Passkey Authentication) */
  async getCredential({
    challengeStr,
    allowCredentials = [],
    timeout = this.timeout,
  } = {}) {
    if (!this.isSupported) return null;

    try {
      const challenge = challengeStr
        ? WebAuthManager.base64ToUint8Array(challengeStr).buffer
        : WebAuthManager.randomBytes(32);

      const publicKey = {
        challenge,
        rpId: window.location.hostname || "localhost",
        allowCredentials,
        timeout,
        userVerification: "required",
      };

      console.log("📤 Sending request to authenticate with Passkey...");
      const assertion = await navigator.credentials.get({ publicKey });

      if (assertion) {
        console.log("✅ Credential retrieved successfully.");
        console.log(
          `Raw ID (Base64URL): ${WebAuthManager.uint8ArrayToBase64(
            new Uint8Array(assertion.rawId)
          )}`
        );
        return assertion;
      }

      return null;
    } catch (err) {
      console.warn(`❌ Failed to get credential: ${err.name} - ${err.message}`);
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
      console.log(`📤 Requesting browser to store password for ID: ${id}...`);
      const stored = await navigator.credentials.store(cred);
      console.log("✅ Password credential stored successfully.");
      return stored;
    } catch (err) {
      console.warn(
        `❌ Failed to store credential: ${err.name} - ${err.message}`
      );
      return null;
    }
  }

  /** Retrieve a password credential using Credential Management API */
  async getPasswordCredential() {
    if (!this.hasCredentialsAPI) {
      console.warn("⚠️ Credentials API not supported.");
      return null;
    }

    try {
      console.log("📥 Requesting browser to retrieve password credential...");
      const cred = await navigator.credentials.get({
        password: true,
        mediation: "optional",
      });

      if (cred && cred.type === "password") {
        console.log("✅ Password credential retrieved successfully.");
        console.log(`Retrieved Username (ID): ${cred.id}`);
        return cred;
      }

      console.warn("⚠️ No Password Credential found or user cancelled.");
      return null;
    } catch (err) {
      console.warn(
        `❌ Failed to retrieve password credential: ${err.name} - ${err.message}`
      );
      return null;
    }
  }
}
