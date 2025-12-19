/**
 * In-Memory Storage Implementation
 * Data is stored in a Map and lost on app restart
 * Useful for testing and development
 */

export interface IDatabase {
  setItem(key: string, value: string): Promise<void>;
  getItem(key: string): Promise<string | null>;
  removeItem(key: string): Promise<void>;
  clear(): Promise<void>;
  multiSet(items: [string, string][]): Promise<void>;
  multiGet(keys: string[]): Promise<(string | null)[]>;
}

export class MemoryStorage implements IDatabase {
  private store: Map<string, string> = new Map();

  async setItem(key: string, value: string): Promise<void> {
    this.store.set(key, value);
  }

  async getItem(key: string): Promise<string | null> {
    return this.store.get(key) ?? null;
  }

  async removeItem(key: string): Promise<void> {
    this.store.delete(key);
  }

  async clear(): Promise<void> {
    this.store.clear();
  }

  async multiSet(items: [string, string][]): Promise<void> {
    items.forEach(([key, value]) => {
      this.store.set(key, value);
    });
  }

  async multiGet(keys: string[]): Promise<(string | null)[]> {
    return keys.map(key => this.store.get(key) ?? null);
  }
}
