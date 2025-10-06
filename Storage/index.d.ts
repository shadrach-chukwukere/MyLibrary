export class indexDb {
  constructor(name: string, version?: number);
  open(stores?: string[]): Promise<IDBDatabase>;
  store(name: string, mode?: IDBTransactionMode): IDBObjectStore;
  has(name: string): boolean;
  get(name: string, key: IDBValidKey): Promise<any>;
  all(name: string): Promise<any[]>;
  set(name: string, key: IDBValidKey, val: any): Promise<IDBValidKey>;
  del(name: string, key: IDBValidKey): Promise<void>;
  count(name: string): Promise<number>;
  clear(name: string): Promise<void>;
  editKey(
    name: string,
    oldKey: IDBValidKey,
    newKey: IDBValidKey
  ): Promise<IDBValidKey>;
  renameStore(oldName: string, newName: string): Promise<void>;
  static addStore(dbName: string, store: string): Promise<void>;
  static drop(dbName: string): Promise<void>;
}
