/**
 * ============================================================================
 * STORAGE MANAGER (IndexedDB)
 * ============================================================================
 * 
 * PURPOSE:
 * This class manages storage operations. It handles:
 * - Saving canvas state to IndexedDB (browser storage)
 * - Loading canvas state from IndexedDB
 * - Auto-saving every 5 minutes
 * 
 * WHY WE NEED IT:
 * Persistent storage is essential for user data. Users need to save
 * their work and recover it after browser crashes or refreshes.
 * 
 * HOW TO USE:
 * 1. Import: import { StorageManager } from './core/storageManager';
 * 2. Create: const storage = new StorageManager();
 * 3. Use: storage.saveState(state);
 * 
 * DEPENDENCIES:
 * - CanvasState: The state interface we're storing
 * - IndexedDB: Browser storage API
 * 
 * BEGINNER TIPS:
 * - IndexedDB is like localStorage but more powerful
 * - It can store complex objects (not just strings)
 * - Auto-save prevents data loss from crashes
 */

import { CanvasState } from '../types';

/**
 * StorageManager: Manages IndexedDB storage
 * 
 * This class is responsible for:
 * 1. Opening and managing IndexedDB database
 * 2. Saving/loading canvas states
 * 3. Auto-saving on a timer
 * 
 * DESIGN PATTERN:
 * This uses Singleton pattern for IndexedDB (only one DB connection).
 */
export class StorageManager {
  /**
   * Database name
   * 
   * This is the name of the IndexedDB database.
   * All data for this app is stored under this name.
   * 
   * BEGINNER TIP:
   * This is like a folder name on your computer. All files
   * (data) for this app are stored in this folder.
   */
  private static readonly DB_NAME = 'CanvasDrawDB';
  
  /**
   * Database version
   * 
   * Used for schema migrations. If you change the structure
   * of stored data, increment this number.
   * 
   * BEGINNER TIP:
   * Think of this like version control for your database schema.
   * Version 1: initial structure
   * Version 2: added new field, etc.
   */
  private static readonly DB_VERSION = 1;
  
  /**
   * Store name for canvas states
   * 
   * In IndexedDB, stores are like tables in SQL databases.
   * This store contains our canvas states.
   * 
   * BEGINNER TIP:
   * A store is like a table. Each store holds a specific type of data.
   * We have one store for canvas states.
   */
  private static readonly STORE_NAME = 'canvasStates';
  
  /**
   * IndexedDB database instance
   * 
   * This is our connection to the browser's IndexedDB.
   * All IndexedDB operations go through this.
   */
  private db: IDBDatabase | null = null;
  
  /**
   * Auto-save timer ID
   * 
   * We use setInterval to auto-save every 5 minutes.
   * This stores the timer ID so we can clear it if needed.
   */
  private autoSaveTimer: number | null = null;
  
  /**
   * Current state to auto-save
   * 
   * We store the current state so the auto-save function can access it.
   */
  private currentState: CanvasState | null = null;

  /**
   * Creates a new StorageManager instance
   * 
   * Opens the IndexedDB database.
   * 
   * BEGINNER TIP:
   * The constructor initializes the database asynchronously.
   * Call init() before using the storage manager.
   */
  constructor() {
    // Database will be initialized when init() is called
  }

  /**
   * Initializes the database
   * 
   * This method should be called before using the storage manager.
   * 
   * @returns Promise that resolves when database is ready
   */
  public async init(): Promise<void> {
    await this.initDatabase();
  }

  /**
   * Initializes the IndexedDB database
   * 
   * HOW IT WORKS:
   * 1. Open database with name and version
   * 2. Create object store if it doesn't exist
   * 3. Set up auto-save timer
   * 
   * BEGINNER TIP:
   * IndexedDB operations are asynchronous. We use promises
   * to handle the async nature.
   */
  private async initDatabase(): Promise<void> {
    return new Promise((resolve, reject) => {
      /**
       * Step 1: Open the database
       * 
       * indexedDB.open() returns a request. We listen for events.
       * 
       * PARAMETERS:
       * - name: Database name
       * - version: Database version (increment when schema changes)
       */
      const request = indexedDB.open(StorageManager.DB_NAME, StorageManager.DB_VERSION);
      
      /**
       * Handle successful database opening
       * 
       * This fires when the database is successfully opened.
       * We save the database instance and resolve the promise.
       */
      request.onsuccess = (event: Event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        resolve();
      };
      
      /**
       * Handle database opening errors
       * 
       * This fires if the database can't be opened.
       * We reject the promise with the error.
       * 
       * BEGINNER TIP:
       * Always handle errors in IndexedDB operations.
       * They can fail for various reasons (quota exceeded, etc.)
       */
      request.onerror = (event: Event) => {
        reject((event.target as IDBOpenDBRequest).error);
      };
      
      /**
       * Handle database upgrades (schema changes)
       * 
       * This fires when:
       * 1. Database doesn't exist yet (first time)
       * 2. Database version is higher than current
       * 
       * This is where we create or update the object stores.
       */
      request.onupgradeneeded = (event: Event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        /**
         * Create object store if it doesn't exist
         * 
         * createObjectStore() creates a new store.
         * We use 'id' as the key path (primary key).
         * 
         * BEGINNER TIP:
         * The key path is like a primary key in SQL.
         * It uniquely identifies each record in the store.
         */
        if (!db.objectStoreNames.contains(StorageManager.STORE_NAME)) {
          db.createObjectStore(StorageManager.STORE_NAME, { keyPath: 'id' });
        }
      };
    });
  }

  /**
   * Saves a canvas state to IndexedDB
   * 
   * @param state - The canvas state to save
   * @param id - Optional ID for the state (default: 'current')
   * 
   * HOW IT WORKS:
   * 1. Open a transaction
   * 2. Get the object store
   * 3. Put the state in the store
   * 
   * USAGE EXAMPLE:
   * await storage.saveState(canvasState, 'backup');
   * 
   * BEGINNER TIP:
   * This stores a complete snapshot of the canvas.
   * You can load it back later to restore the canvas.
   */
  public async saveState(state: CanvasState, id: string = 'current'): Promise<void> {
    /**
     * Wait for database to be initialized
     */
    if (!this.db) {
      await this.initDatabase();
    }
    
    return new Promise((resolve, reject) => {
      /**
       * Step 1: Open a transaction
       * 
       * Transactions ensure data consistency.
       * 'readwrite' mode allows both reading and writing.
       */
      const transaction = this.db!.transaction([StorageManager.STORE_NAME], 'readwrite');
      
      /**
       * Step 2: Get the object store
       * 
       * We get the store where canvas states are stored.
       */
      const store = transaction.objectStore(StorageManager.STORE_NAME);
      
      /**
       * Step 3: Put the state in the store
       * 
       * We add an 'id' field to identify the state.
       * The 'put' method either adds or updates the record.
       * 
       * BEGINNER TIP:
       * 'put' is like UPDATE or INSERT in SQL.
       * If the record exists, it's updated. If not, it's created.
       */
      const record = { ...state, id, timestamp: new Date().toISOString() };
      const request = store.put(record);
      
      /**
       * Handle successful save
       */
      request.onsuccess = () => resolve();
      
      /**
       * Handle save errors
       */
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Loads a canvas state from IndexedDB
   * 
   * @param id - ID of the state to load (default: 'current')
   * @returns The canvas state, or null if not found
   * 
   * USAGE EXAMPLE:
   * const state = await storage.loadState('backup');
   * if (state) {
   *   restoreCanvas(state);
   * }
   * 
   * BEGINNER TIP:
   * This retrieves a previously saved state.
   * Use it to restore the canvas after a crash or refresh.
   */
  public async loadState(id: string = 'current'): Promise<CanvasState | null> {
    /**
     * Wait for database to be initialized
     */
    if (!this.db) {
      await this.initDatabase();
    }
    
    return new Promise((resolve, reject) => {
      /**
       * Step 1: Open a transaction
       * 
       * 'readonly' mode allows only reading (faster and safer).
       */
      const transaction = this.db!.transaction([StorageManager.STORE_NAME], 'readonly');
      
      /**
       * Step 2: Get the object store
       */
      const store = transaction.objectStore(StorageManager.STORE_NAME);
      
      /**
       * Step 3: Get the state from the store
       * 
       * The 'get' method retrieves a record by key.
       * 
       * BEGINNER TIP:
       * 'get' is like SELECT in SQL.
       * It retrieves a single record by primary key.
       */
      const request = store.get(id);
      
      /**
       * Handle successful load
       */
      request.onsuccess = () => {
        const result = request.result;
        if (result) {
          // Remove the 'id' and 'timestamp' fields we added
          const { id: _, timestamp: __, ...state } = result;
          resolve(state as CanvasState);
        } else {
          resolve(null);
        }
      };
      
      /**
       * Handle load errors
       */
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Enables auto-save functionality
   * 
   * @param state - The state to auto-save
   * @param interval - Save interval in milliseconds (default: 5 minutes)
   * 
   * HOW IT WORKS:
   * 1. Clear existing auto-save timer (if any)
   * 2. Store the current state
   * 3. Set up interval to save every X milliseconds
   * 
   * USAGE EXAMPLE:
   * storage.enableAutoSave(canvasState, 300000); // Save every 5 minutes
   * 
   * BEGINNER TIP:
   * Auto-save prevents data loss from crashes.
   * It saves your work automatically in the background.
   */
  public enableAutoSave(state: CanvasState, interval: number = 300000): void {
    /**
     * Step 1: Clear existing timer if any
     * 
     * This prevents multiple auto-save timers running at once.
     */
    if (this.autoSaveTimer !== null) {
      clearInterval(this.autoSaveTimer);
    }
    
    /**
     * Step 2: Store the current state
     * 
     * We need to track the state so we can save it periodically.
     */
    this.currentState = state;
    
    /**
     * Step 3: Set up auto-save timer
     * 
     * setInterval calls the function every X milliseconds.
     * 
     * BEGINNER TIP:
     * 300000 milliseconds = 5 minutes
     * 60000 milliseconds = 1 minute
     * 1000 milliseconds = 1 second
     */
    this.autoSaveTimer = window.setInterval(async () => {
      if (this.currentState) {
        try {
          await this.saveState(this.currentState);
          console.log('Auto-saved at', new Date().toLocaleTimeString());
        } catch (error) {
          console.error('Auto-save failed:', error);
        }
      }
    }, interval);
  }

  /**
   * Disables auto-save functionality
   * 
   * USAGE EXAMPLE:
   * storage.disableAutoSave();
   * 
   * BEGINNER TIP:
   * Call this when closing the application or when
   * you don't want auto-save anymore.
   */
  public disableAutoSave(): void {
    if (this.autoSaveTimer !== null) {
      clearInterval(this.autoSaveTimer);
      this.autoSaveTimer = null;
    }
    this.currentState = null;
  }

  /**
   * Updates the state being auto-saved
   * 
   * @param state - The new state to auto-save
   * 
   * USAGE EXAMPLE:
   * storage.updateAutoSaveState(newState);
   * 
   * BEGINNER TIP:
   * Call this whenever the canvas state changes.
   * This ensures auto-save always saves the latest state.
   */
  public updateAutoSaveState(state: CanvasState): void {
    this.currentState = state;
  }

  /**
   * Deletes a saved state from IndexedDB
   * 
   * @param id - ID of the state to delete (default: 'current')
   * 
   * USAGE EXAMPLE:
   * await storage.deleteState('current');
   * 
   * BEGINNER TIP:
   * This removes a saved state from storage.
   * Useful for clearing old data or resetting the application.
   */
  public async deleteState(id: string = 'current'): Promise<void> {
    /**
     * Wait for database to be initialized
     */
    if (!this.db) {
      await this.initDatabase();
    }
    
    return new Promise((resolve, reject) => {
      /**
       * Step 1: Open a transaction
       * 
       * 'readwrite' mode allows both reading and writing.
       */
      const transaction = this.db!.transaction([StorageManager.STORE_NAME], 'readwrite');
      
      /**
       * Step 2: Get the object store
       */
      const store = transaction.objectStore(StorageManager.STORE_NAME);
      
      /**
       * Step 3: Delete the state from the store
       * 
       * The 'delete' method removes a record by key.
       * 
       * BEGINNER TIP:
       * 'delete' is like DELETE in SQL.
       * It removes a single record by primary key.
       */
      const request = store.delete(id);
      
      /**
       * Handle successful deletion
       */
      request.onsuccess = () => resolve();
      
      /**
       * Handle deletion errors
       */
      request.onerror = () => reject(request.error);
    });
  }
}
