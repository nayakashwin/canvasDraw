import { CanvasState } from '../types';

export class StorageManager {
  private static readonly DB_NAME = 'CanvasDrawDB';
  private static readonly DB_VERSION = 1;
  private static readonly STORE_NAME = 'canvasStates';
  
  private db: IDBDatabase | null = null;
  private autoSaveTimer: number | null = null;
  private currentState: CanvasState | null = null;

  public async init(): Promise<void> {
    await this.initDatabase();
  }

  private async initDatabase(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(StorageManager.DB_NAME, StorageManager.DB_VERSION);
      
      request.onsuccess = (event: Event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        resolve();
      };
      
      request.onerror = (event: Event) => {
        reject((event.target as IDBOpenDBRequest).error);
      };
      
      request.onupgradeneeded = (event: Event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(StorageManager.STORE_NAME)) {
          db.createObjectStore(StorageManager.STORE_NAME, { keyPath: 'id' });
        }
      };
    });
  }

  public async saveState(state: CanvasState, id: string = 'current'): Promise<void> {
    if (!this.db) await this.initDatabase();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([StorageManager.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(StorageManager.STORE_NAME);
      const record = { ...state, id, timestamp: new Date().toISOString() };
      const request = store.put(record);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  public async loadState(id: string = 'current'): Promise<CanvasState | null> {
    if (!this.db) await this.initDatabase();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([StorageManager.STORE_NAME], 'readonly');
      const store = transaction.objectStore(StorageManager.STORE_NAME);
      const request = store.get(id);
      
      request.onsuccess = () => {
        const result = request.result;
        if (result) {
          const { id: _, timestamp: __, ...state } = result;
          resolve(state as CanvasState);
        } else {
          resolve(null);
        }
      };
      
      request.onerror = () => reject(request.error);
    });
  }

  public enableAutoSave(state: CanvasState, interval: number = 300000): void {
    if (this.autoSaveTimer !== null) clearInterval(this.autoSaveTimer);
    
    this.currentState = state;
    this.autoSaveTimer = window.setInterval(async () => {
      if (this.currentState) {
        try {
          await this.saveState(this.currentState);
        } catch (error) {
          console.error('Auto-save failed:', error);
        }
      }
    }, interval);
  }

  public disableAutoSave(): void {
    if (this.autoSaveTimer !== null) {
      clearInterval(this.autoSaveTimer);
      this.autoSaveTimer = null;
    }
    this.currentState = null;
  }

  public updateAutoSaveState(state: CanvasState): void {
    this.currentState = state;
  }

  public async deleteState(id: string = 'current'): Promise<void> {
    if (!this.db) await this.initDatabase();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([StorageManager.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(StorageManager.STORE_NAME);
      const request = store.delete(id);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}