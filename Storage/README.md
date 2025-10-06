# @chispecial/storage

A lightweight IndexedDB wrapper for storing, retrieving, and managing data in the browser with ease.

---

## 📦 Installation

```bash
npm install @chispecial/storage



```

import { indexDb } from '@chispecial/storage';

(async () => {
// 🏗️ 1️⃣ Create a new instance of your IndexedDB wrapper
// Arguments:
// - 'MyAppDB' = Database name
// - 1 = Database version (used for migrations/upgrades)
const db = new indexDb('MyAppDB', 1);

// 🧱 2️⃣ Open the database and define object stores (tables)
// You can pass multiple store names as an array.
await db.open(['users']);

// 🧍 3️⃣ Add records (data) into the store
// Syntax: db.set(storeName, key, value)
// - storeName → the object store to save data in
// - key → unique identifier for the record
// - value → the object or data you want to store
await db.set('users', 1, { name: 'Shadrach', age: 17 }); // key = 1, value = user object
await db.set('users', 2, { name: 'Chinemerem', age: 18 }); // key = 2, value = user object

// 🔍 4️⃣ Retrieve a single record by key
// Syntax: db.get(storeName, key)
const user = await db.get('users', 1);
console.log('User with key 1:', user);
// Output example → { name: 'Shadrach', age: 17 }

// 📜 5️⃣ Retrieve all records in a store
// Syntax: db.all(storeName)
const allUsers = await db.all('users');
console.log('All Users:', allUsers);
// Output example → [{ name: 'Shadrach', age: 17 }, { name: 'Chinemerem', age: 18 }]

// 🔢 6️⃣ Count total number of records in a store
// Syntax: db.count(storeName)
const count = await db.count('users');
console.log('Total users:', count);
// Output example → 2

// ❌ 7️⃣ Delete a record by key
// Syntax: db.del(storeName, key)
await db.del('users', 1);
console.log('Deleted user with key 1');

// 🧹 8️⃣ Clear all records from a specific store
// Syntax: db.clear(storeName)
await db.clear('users');
console.log('All user records cleared');

// 💣 9️⃣ Delete the entire database
// Static method to completely remove the DB and its stores
// Syntax: indexDb.drop(databaseName)
await indexDb.drop('MyAppDB');
console.log('Database dropped successfully');
})();
