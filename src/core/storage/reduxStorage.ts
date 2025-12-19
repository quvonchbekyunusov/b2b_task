/**
 * Redux Storage Implementation
 * Stores data in Redux store's storage object
 * Useful for integrating storage with Redux state management
 */
import { Store } from '@reduxjs/toolkit';
import {
  setStorageItem,
  removeStorageItem,
  clearStorage,
} from '../../store/eventSlice';

export interface IDatabase {
  setItem(key: string, value: string): Promise<void>;
  getItem(key: string): Promise<string | null>;
  removeItem(key: string): Promise<void>;
  clear(): Promise<void>;
  multiSet(items: [string, string][]): Promise<void>;
  multiGet(keys: string[]): Promise<(string | null)[]>;
}

/**
 * ReduxStorage - Uses Redux store for persistent key-value storage
 * All operations are dispatched as Redux actions for proper state management
 */
export class ReduxStorage implements IDatabase {
  constructor(private store: Store) {}

  async setItem(key: string, value: string): Promise<void> {
    try {
      this.store.dispatch(setStorageItem({ key, value }));
    } catch (error) {
      console.error('setItem error:', error);
    }
  }

  async getItem(key: string): Promise<string | null> {
    try {
      const state: any = this.store.getState();
      const storage = state.events?.storage || {};
      return storage[key] ?? null;
    } catch (error) {
      console.error('getItem error:', error);
      return null;
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      this.store.dispatch(removeStorageItem(key));
    } catch (error) {
      console.error('removeItem error:', error);
    }
  }

  async clear(): Promise<void> {
    try {
      this.store.dispatch(clearStorage());
    } catch (error) {
      console.error('clear error:', error);
    }
  }

  async multiSet(items: [string, string][]): Promise<void> {
    try {
      for (const [key, value] of items) {
        this.store.dispatch(setStorageItem({ key, value }));
      }
    } catch (error) {
      console.error('multiSet error:', error);
    }
  }

  async multiGet(keys: string[]): Promise<(string | null)[]> {
    try {
      const state: any = this.store.getState();
      const storage = state.events?.storage || {};
      return keys.map(key => storage[key] ?? null);
    } catch (error) {
      console.error('multiGet error:', error);
      return keys.map(() => null);
    }
  }
}
