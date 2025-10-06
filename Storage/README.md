# @chispecial/storage

A lightweight IndexedDB wrapper for storing, retrieving, and managing data in the browser with ease.

---

## 📦 Installation

````bash
npm install @chispecial/storage


import { indexDb } from '@chispecial/storage';

(async () => {
  // Initialize database
  const db = new indexDb('MyAppDB', 1);
  await db.open(['users']); // create/open store(s)

  // Insert data (key-value pairs)
  await db.set('users', 1, { name: 'Shadrach', age: 17 });
  await db.set('users', 2, { name: 'Chinemerem', age: 18 });

  // Fetch a single record by key
  const user = await db.get('users', 1);
  console.log('User:', user);

  // Get all records
  const users = await db.all('users');
  console.log('All users:', users);

  // Count total entries
  const count = await db.count('users');
  console.log('Total:', count);

  // Delete a record
  await db.del('users', 1);

  // Clear store
  await db.clear('users');

  // Drop the entire database
  await indexDb.drop('MyAppDB');
})();

````
