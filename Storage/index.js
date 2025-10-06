export class indexDb {
  constructor(name, version = 1) {
    this.name = name;
    this.version = version;
    this.db = null;
  }

  async open(stores = []) {
    if (this.db) return this.db;

    return new Promise((res, rej) => {
      const req = indexedDB.open(this.name, this.version);

      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        for (const s of stores) {
          if (!db.objectStoreNames.contains(s)) {
            db.createObjectStore(s);
          }
        }
      };

      req.onsuccess = (e) => {
        this.db = e.target.result;
        this.db.onversionchange = () => this.db.close();
        res(this.db);
      };

      req.onerror = () => rej(req.error);
    });
  }

  store(name, mode = "readonly") {
    if (!this.db) throw new Error("DB not open");
    return this.db.transaction(name, mode).objectStore(name);
  }

  has(name) {
    return this.db?.objectStoreNames.contains(name) ?? false;
  }

  async get(name, key) {
    return new Promise((res, rej) => {
      const req = this.store(name).get(key);
      req.onsuccess = () => res(req.result ?? null);
      req.onerror = () => rej(req.error);
    });
  }

  async all(name) {
    return new Promise((res, rej) => {
      const req = this.store(name).getAll();
      req.onsuccess = () => res(req.result);
      req.onerror = () => rej(req.error);
    });
  }

  async set(name, key, val) {
    return new Promise((res, rej) => {
      const req =
        key !== undefined
          ? this.store(name, "readwrite").put(val, key)
          : this.store(name, "readwrite").put(val);

      req.onsuccess = () => res(req.result);
      req.onerror = () => rej(req.error);
    });
  }

  async del(name, key) {
    return new Promise((res, rej) => {
      const req = this.store(name, "readwrite").delete(key);
      req.onsuccess = () => res();
      req.onerror = () => rej(req.error);
    });
  }

  async count(name) {
    return new Promise((res, rej) => {
      const req = this.store(name).count();
      req.onsuccess = () => res(req.result);
      req.onerror = () => rej(req.error);
    });
  }

  async clear(name) {
    return new Promise((res, rej) => {
      const req = this.store(name, "readwrite").clear();
      req.onsuccess = () => res();
      req.onerror = () => rej(req.error);
    });
  }

  async editKey(name, oldKey, newKey) {
    const rec = await this.get(name, oldKey);
    if (!rec) throw new Error("Not found");
    await this.del(name, oldKey);
    return this.set(name, newKey, rec);
  }

  async renameStore(oldName, newName) {
    if (!this.db) throw new Error("DB not open");
    this.version++;
    this.db.close();

    return new Promise((res, rej) => {
      const req = indexedDB.open(this.name, this.version);

      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (
          db.objectStoreNames.contains(oldName) &&
          !db.objectStoreNames.contains(newName)
        ) {
          const tmp = [];
          const oldTx = e.target.transaction?.objectStore(oldName);

          if (oldTx) {
            oldTx.openCursor().onsuccess = (ev) => {
              const cursor = ev.target.result;
              if (cursor) {
                tmp.push({ key: cursor.key, value: cursor.value });
                cursor.continue();
              } else {
                db.deleteObjectStore(oldName);
                const newStore = db.createObjectStore(newName);
                tmp.forEach(({ key, value }) => newStore.put(value, key));
              }
            };
          }
        }
      };

      req.onsuccess = (e) => {
        this.db = e.target.result;
        res();
      };

      req.onerror = () => rej(req.error);
    });
  }

  static async addStore(dbName, store) {
    return new Promise((res, rej) => {
      const req = indexedDB.open(dbName, Date.now());

      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(store)) db.createObjectStore(store);
      };

      req.onsuccess = () => {
        req.result.close();
        res();
      };

      req.onerror = () => rej(req.error);
    });
  }

  static async drop(dbName) {
    return new Promise((res, rej) => {
      const req = indexedDB.deleteDatabase(dbName);
      req.onsuccess = () => res();
      req.onerror = () => rej(req.error);
    });
  }
}
