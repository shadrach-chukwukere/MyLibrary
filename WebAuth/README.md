# @chispecial/web_auth

A lightweight wrapper for WebAuthn and PasswordCredential APIs for secure registration, authentication, and password storage in the browser.

---

## 📦 Installation

```bash
npm install @chispecial/web_auth
```

---

```js
import { WebAuthnManager } from "@chispecial/web_auth";

(async () => {
  const webAuthn = new WebAuthnManager("My Awesome App");

  // ===== Register / Create a credential =====
  const credential = await webAuthn.createCredential({
    username: "shadrach@example.com",
    displayName: "Shadrach",
  });
  console.log("Registered credential:", credential);

  // ===== Authenticate / Get an existing credential =====
  const authResult = await webAuthn.getCredential({
    allowCredentials: credential
      ? [{ id: credential.rawId, type: "public-key" }]
      : [],
  });
  console.log("Authentication result:", authResult);

  // ===== Store a password-based credential =====
  const stored = await webAuthn.storeCredential({
    id: "shadrach@example.com",
    password: "1234567890",
  });
  console.log("Stored credential:", stored);
})();
```

---

## ⚙️ Features

- ✅ Create WebAuthn credentials (biometrics, PINs, security keys)
- ✅ Authenticate users with existing WebAuthn credentials
- ✅ Store PasswordCredential safely in browser (id + password)
- ✅ Works with most modern browsers supporting WebAuthn & Credential Management API
- ⚠️ Browser fallback: warns if `PublicKeyCredential` or `navigator.credentials` is not supported

---

## 🛠 API

### `constructor(rpName = "My App", timeout = 60000)`

- `rpName` – Displayed name for your application (Relying Party)
- `timeout` – Default timeout in milliseconds for credential operations

### `createCredential({ username, displayName})`

- Creates a new WebAuthn credential for the user
- Returns a `PublicKeyCredential` or `null` on failure

### `getCredential({ allowCredentials})`

- Authenticates a user with an existing WebAuthn credential
- Returns a `PublicKeyCredential` or `null`

### `storeCredential({ id, password })`

- Stores a password-based credential in the browser
- Returns a `PasswordCredential` object or `null`

## ⚡ Example UI

```jsx
import { useState } from "react";
import { WebAuthnManager } from "@chispecial/web_auth";

export default function WebAuthnDemo() {
  const [username, setUsername] = useState("");
  const [credential, setCredential] = useState(null);
  const webAuthn = new WebAuthnManager("My Awesome App");

  const register = async () => {
    const cred = await webAuthn.createCredential({ username });
    setCredential(cred);
  };

  const authenticate = async () => {
    if (!credential) return;
    const auth = await webAuthn.getCredential({
      allowCredentials: [{ id: credential.rawId, type: "public-key" }],
    });
    console.log(auth);
  };

  return (
    <div>
      <input
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <button onClick={register}>Register</button>
      <button onClick={authenticate} disabled={!credential}>
        Authenticate
      </button>
    </div>
  );
}
```
