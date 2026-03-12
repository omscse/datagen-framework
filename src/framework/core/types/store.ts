export interface StoredDataRecord<T = unknown> {
  packName: string;
  data: T;
  createdAt: string;
}

export interface DataStore {
  save<T>(name: string, record: StoredDataRecord<T>): Promise<void> | void;
  get<T>(name: string): Promise<StoredDataRecord<T>> | StoredDataRecord<T>;
  has(name: string): Promise<boolean> | boolean;
  delete(name: string): Promise<void> | void;
  list?(): Promise<Array<StoredDataRecord & { key: string }>> | Array<StoredDataRecord & { key: string }>;
  clear?(): Promise<void> | void;
}
