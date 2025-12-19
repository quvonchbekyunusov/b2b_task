/**
 * SQLite Storage Implementation
 * Uses react-native-sqlite-storage for persistent local storage
 * Better performance for large datasets compared to AsyncStorage
 * 
 * NOTE: This is a simplified implementation. For production use,
 * consider using a more robust solution like WatermelonDB or Realm.
 */
// @ts-ignore
import SQLite from 'react-native-sqlite-storage';

export interface IDatabase {
  setItem(key: string, value: string): Promise<void>;
  getItem(key: string): Promise<string | null>;
  removeItem(key: string): Promise<void>;
  clear(): Promise<void>;
  multiSet(items: [string, string][]): Promise<void>;
  multiGet(keys: string[]): Promise<(string | null)[]>;
}

/**
 * SQLiteStorage - Simplified persistent storage using SQLite
 * Falls back to in-memory storage if SQLite is not available
 */
export class SQLiteStorage implements IDatabase {
  private db: any = null;
  private inMemoryFallback: Map<string, string> = new Map();
  private useFallback = false;

  constructor() {
    this.initializeDatabase();
  }

  private async initializeDatabase(): Promise<void> {
    try {
      SQLite.DEBUG(false);
      SQLite.enablePromise(true);

      this.db = await SQLite.openDatabase({
        name: 'events.db',
        location: 'default',
      });

      // Create table
      await this.db.executeSql(
        `CREATE TABLE IF NOT EXISTS kv_store (
          key TEXT PRIMARY KEY,
          value TEXT
        )`,
        [],
      );

      console.log('✓ SQLite initialized');
    } catch (error) {
      console.warn('⚠️ SQLite initialization failed, using in-memory fallback:', error);
      this.useFallback = true;
      this.db = null;
    }
  }

  private async ensureDb(): Promise<void> {
    if (!this.db && !this.useFallback) {
      await this.initializeDatabase();
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      await this.ensureDb();
      
      if (this.useFallback) {
        this.inMemoryFallback.set(key, value);
        return;
      }

      if (!this.db) return;
      
      await this.db.executeSql(
        'INSERT OR REPLACE INTO kv_store (key, value) VALUES (?, ?)',
        [key, value],
      );
    } catch (error) {
      console.error('setItem error:', error);
      this.inMemoryFallback.set(key, value);
    }
  }

  async getItem(key: string): Promise<string | null> {
    try {
      await this.ensureDb();
      
      if (this.useFallback) {
        return this.inMemoryFallback.get(key) ?? null;
      }

      if (!this.db) return null;
      
      const result = await this.db.executeSql(
        'SELECT value FROM kv_store WHERE key = ?',
        [key],
      );

      if (result?.[0]?.rows?.length > 0) {
        return result[0].rows.item(0).value;
      }

      return null;
    } catch (error) {
      console.error('getItem error:', error);
      return this.inMemoryFallback.get(key) ?? null;
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      await this.ensureDb();
      
      if (this.useFallback) {
        this.inMemoryFallback.delete(key);
        return;
      }

      if (!this.db) return;
      
      await this.db.executeSql('DELETE FROM kv_store WHERE key = ?', [key]);
    } catch (error) {
      console.error('removeItem error:', error);
      this.inMemoryFallback.delete(key);
    }
  }

  async clear(): Promise<void> {
    try {
      await this.ensureDb();
      
      if (this.useFallback) {
        this.inMemoryFallback.clear();
        return;
      }

      if (!this.db) return;
      
      await this.db.executeSql('DELETE FROM kv_store', []);
    } catch (error) {
      console.error('clear error:', error);
      this.inMemoryFallback.clear();
    }
  }

  async multiSet(items: [string, string][]): Promise<void> {
    try {
      await this.ensureDb();
      
      if (this.useFallback) {
        items.forEach(([k, v]) => this.inMemoryFallback.set(k, v));
        return;
      }

      if (!this.db) return;
      
      for (const [key, value] of items) {
        await this.db.executeSql(
          'INSERT OR REPLACE INTO kv_store (key, value) VALUES (?, ?)',
          [key, value],
        );
      }
    } catch (error) {
      console.error('multiSet error:', error);
      items.forEach(([k, v]) => this.inMemoryFallback.set(k, v));
    }
  }

  async multiGet(keys: string[]): Promise<(string | null)[]> {
    try {
      await this.ensureDb();
      
      if (this.useFallback) {
        return keys.map(k => this.inMemoryFallback.get(k) ?? null);
      }

      if (!this.db) return keys.map(() => null);
      
      const results: (string | null)[] = [];
      for (const key of keys) {
        const result = await this.db.executeSql(
          'SELECT value FROM kv_store WHERE key = ?',
          [key],
        );

        if (result?.[0]?.rows?.length > 0) {
          results.push(result[0].rows.item(0).value);
        } else {
          results.push(null);
        }
      }
      return results;
    } catch (error) {
      console.error('multiGet error:', error);
      return keys.map(k => this.inMemoryFallback.get(k) ?? null);
    }
  }
}
