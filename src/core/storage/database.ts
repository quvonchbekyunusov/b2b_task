import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * AsyncStorage Storage Implementation
 * Default persistent storage using React Native's AsyncStorage
 * Reliable key-value storage for most use cases
 */

export interface IDatabase {
  setItem(key: string, value: string): Promise<void>;
  getItem(key: string): Promise<string | null>;
  removeItem(key: string): Promise<void>;
  clear(): Promise<void>;
  multiSet(items: [string, string][]): Promise<void>;
  multiGet(keys: string[]): Promise<(string | null)[]>;
}

export class Database implements IDatabase {
  async setItem(key: string, value: string): Promise<void> {
    await AsyncStorage.setItem(key, value);
  }

  async getItem(key: string): Promise<string | null> {
    return AsyncStorage.getItem(key);
  }

  async removeItem(key: string): Promise<void> {
    await AsyncStorage.removeItem(key);
  }

  async clear(): Promise<void> {
    await AsyncStorage.clear();
  }

  async multiSet(items: [string, string][]): Promise<void> {
    await AsyncStorage.multiSet(items);
  }

  async multiGet(keys: string[]): Promise<(string | null)[]> {
    const result = await AsyncStorage.multiGet(keys);
    return result.map(item => item[1]);
  }
}
