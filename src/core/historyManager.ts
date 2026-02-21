/**
 * ============================================================================
 * HISTORY MANAGER (Undo/Redo)
 * ============================================================================
 * 
 * PURPOSE:
 * This class manages the undo/redo history of the canvas. It handles:
 * - Saving canvas states for undo
 * - Restoring previous states
 * - Maintaining a history stack
 * - Managing the current position in history
 * 
 * WHY WE NEED IT:
 * Undo/redo is essential for a good user experience. Users make mistakes
 * and need to be able to go back. This class provides a clean, efficient
 * way to manage the history without cluttering other code.
 * 
 * HOW TO USE:
 * 1. Import: import { HistoryManager } from './core/historyManager';
 * 2. Create: const history = new HistoryManager(maxHistory: 50);
 * 3. Use: history.saveState(state); const prev = history.undo();
 * 
 * DEPENDENCIES:
 * - CanvasState: The state interface we're managing
 * - TypeScript: For type safety
 * 
 * BEGINNER TIPS:
 * - Think of history as a stack of snapshots
 * - Undo moves back one snapshot
 * - Redo moves forward one snapshot
 * - When you make a change, you push a new snapshot
 */

import { CanvasState } from '../types';

/**
 * HistoryManager: Manages undo/redo functionality
 * 
 * This class is responsible for:
 * 1. Saving canvas states at different points in time
 * 2. Undoing to previous states
 * 3. Redoing to states that were undone
 * 4. Managing the current position in history
 * 
 * DESIGN PATTERN:
 * This uses the Memento pattern - we save snapshots (mementos) of the
 * canvas state and can restore them later.
 */
export class HistoryManager {
  /**
   * Maximum number of history entries to keep
   * 
   * We limit this to prevent memory issues with very long history.
   * 2 is set to only keep current and previous state for single-level undo.
   * 
   * CUSTOMIZATION:
   * Change this value in the constructor for different limits.
   */
  private maxHistory: number;
  
  /**
   * Array of all history states
   * 
   * Each entry is a complete snapshot of the canvas at that point in time.
   * The array is ordered from oldest to newest.
   * 
   * BEGINNER TIP:
   * Think of this as a photo album. Each photo is a snapshot of
   * the canvas at a specific moment in time.
   */
  private history: CanvasState[] = [];
  
  /**
   * Current position in the history array
   * 
   * -1 means no history (new document)
   * 0 means at the oldest state
   * N means at the Nth state (0-indexed)
   * 
   * EXAMPLE:
   * If history has 5 states and currentIndex is 2, we're at the
   * 3rd state (index 2). We can undo to index 1 or redo to index 3.
   * 
   * BEGINNER TIP:
   * This tracks where we are in the "photo album". When we undo,
   * we move back one photo. When we redo, we move forward one photo.
   */
  private currentIndex: number = -1;

  /**
   * Creates a new HistoryManager instance
   * 
   * This manager maintains history for undo/redo functionality.
   * Each Ctrl+Z undoes only the last action.
   * 
   * USAGE EXAMPLE:
   * const history = new HistoryManager();
   * 
   * BEGINNER TIP:
   * Ctrl+Z undoes only the most recent action. To undo multiple actions,
   * press Ctrl+Z multiple times.
   */
  constructor(maxHistory: number = 2) {
    this.maxHistory = maxHistory; // Default 2 states for single-level undo
  }

  /**
   * Saves a new state to history
   * 
   * @param state - The canvas state to save
   * 
   * HOW IT WORKS:
   * 1. If we're not at the end of history, remove all states after current
   * 2. Add the new state
   * 3. If we exceed max history, remove oldest state
   * 4. Update current index
   * 
   * USAGE EXAMPLE:
   * const newState = getCurrentCanvasState();
   * history.saveState(newState);
   * 
   * IMPORTANT:
   * This should be called AFTER every user action that changes the canvas:
   * - Drawing a shape
   * - Moving an object
   * - Deleting an object
   * - Changing properties (color, size, etc.)
   * 
   * BEGINNER TIP:
   * When you make a change to the canvas, save the state BEFORE the change
   * and also save the new state AFTER the change. This creates a complete
   * history of all changes.
   */
  public saveState(state: CanvasState): void {
    /**
     * Step 1: If we're not at the end of history, remove newer states
     * 
     * This is important! If we undo a few steps, then make a new change,
     * we need to remove all the "future" states that we undid past.
     * 
     * EXAMPLE:
     * History: [A, B, C, D, E], Current: C
     * New change: We remove D and E, then add new state F
     * Result: [A, B, C, F], Current: F
     * 
     * BEGINNER TIP:
     * Think of it like editing a document. If you undo to an earlier
     * version, then type new text, the text you undid is gone.
     */
    if (this.currentIndex < this.history.length - 1) {
      /**
       * Remove all states after the current index
       * 
       * slice(0, this.currentIndex + 1) keeps everything up to current
       * Then we add the new state
       */
      this.history = this.history.slice(0, this.currentIndex + 1);
    }
    
    /**
     * Step 2: Add the new state to history
     * 
     * We make a deep copy of the state to prevent reference issues.
     * JSON.parse(JSON.stringify()) is a simple way to deep copy.
     * 
     * BEGINNER TIP:
     * Deep copy means we create a completely independent copy.
     * Changes to the new state won't affect the old state in history.
     */
    const stateCopy = JSON.parse(JSON.stringify(state)) as CanvasState;
    this.history.push(stateCopy);
    
    /**
     * Step 3: If we exceed max history, remove oldest state
     * 
     * This prevents memory from growing unbounded.
     * We keep only the most recent maxHistory states.
     * 
     * EXAMPLE:
     * maxHistory: 5, history: [A, B, C, D, E, F]
     * After shift(): [B, C, D, E, F]
     * 
     * BEGINNER TIP:
     * Like a FIFO queue - first in, first out.
     * When we have too many, we drop the oldest.
     */
    if (this.history.length > this.maxHistory) {
      this.history.shift(); // Remove oldest state
      this.currentIndex--; // Adjust index since we removed first element
    }
    
    /**
     * Step 4: Update current index to point to the new state
     * 
     * The new state is always the last element in the array.
     */
    this.currentIndex = this.history.length - 1;
  }

  /**
   * Undoes to the previous state
   * 
   * @returns The previous state, or null if no undo available
   * 
   * HOW IT WORKS:
   * 1. Check if we can undo (must have at least one state)
   * 2. Move current index back by 1
   * 3. Return the state at the new index
   * 
   * USAGE EXAMPLE:
   * const previousState = history.undo();
   * if (previousState) {
   *   restoreCanvas(previousState);
   * }
   * 
   * BEGINNER TIP:
   * Undo moves back one step in history. With maxHistory=2, you can only
   * undo once - back to the previous state.
   */
  public undo(): CanvasState | null {
    /**
     * Step 1: Check if we can undo
     * 
     * We can undo if:
     * - We have at least one state in history
     * - We're not at the beginning of history (index > 0)
     * 
     * currentIndex === -1 means no history (new document)
     * currentIndex === 0 means we're at the first state, can't undo further
     */
    if (this.history.length === 0 || this.currentIndex < 0) {
      return null;
    }
    
    /**
     * Step 2: Move current index back by 1
     * 
     * This moves us to the previous state in history.
     * 
     * EXAMPLE:
     * history: [A, B], currentIndex: 1 (at B)
     * After undo: currentIndex: 0 (at A)
     * 
     * BEGINNER TIP:
     * We're moving the "current position" marker back one photo
     * in the album.
     */
    this.currentIndex--;
    
    /**
     * Step 3: Check if we went too far back
     * 
     * This can happen if currentIndex was 0 and we tried to undo.
     * In that case, stay at index 0.
     */
    if (this.currentIndex < 0) {
      this.currentIndex = 0;
    }
    
    /**
     * Step 4: Return a copy of the state at the new index
     * 
     * We return a copy to prevent modification of the history.
     * 
     * BEGINNER TIP:
     * Always return a copy so the calling code can modify the state
     * without affecting the history.
     */
    const state = this.history[this.currentIndex];
    return JSON.parse(JSON.stringify(state)) as CanvasState;
  }

  /**
   * Redoes to the next state
   * 
   * @returns The next state, or null if no redo available
   * 
   * HOW IT WORKS:
   * 1. Check if we can redo (must have states after current)
   * 2. Move current index forward by 1
   * 3. Return the state at the new index
   * 
   * USAGE EXAMPLE:
   * const nextState = history.redo();
   * if (nextState) {
   *   restoreCanvas(nextState);
   * }
   * 
   * BEGINNER TIP:
   * Redo moves forward one step in history. You can only redo if
   * you've previously undone something.
   */
  public redo(): CanvasState | null {
    /**
     * Step 1: Check if we can redo
     * 
     * We can redo if:
     * - We have at least one state in history
     * - We're not at the end of history (index < length - 1)
     * 
     * EXAMPLE:
     * history: [A, B], currentIndex: 0 (at A)
     * We can redo to B (index 1)
     * 
     * currentIndex === length - 1 means we're at the newest state
     */
    if (this.history.length === 0 || this.currentIndex >= this.history.length - 1) {
      return null;
    }
    
    /**
     * Step 2: Move current index forward by 1
     * 
     * This moves us to the next state in history.
     * 
     * EXAMPLE:
     * history: [A, B], currentIndex: 0 (at A)
     * After redo: currentIndex: 1 (at B)
     * 
     * BEGINNER TIP:
     * We're moving the "current position" marker forward one photo
     * in the album.
     */
    this.currentIndex++;
    
    /**
     * Step 3: Return a copy of the state at the new index
     */
    const state = this.history[this.currentIndex];
    return JSON.parse(JSON.stringify(state)) as CanvasState;
  }

  /**
   * Gets the current state
   * 
   * @returns The current state, or null if no history
   * 
   * USAGE EXAMPLE:
   * const currentState = history.getCurrentState();
   * if (currentState) {
   *   console.log('Current zoom:', currentState.zoom);
   * }
   * 
   * BEGINNER TIP:
   * This gets the state at the current position in history.
   * It's the most recent state that hasn't been undone.
   */
  public getCurrentState(): CanvasState | null {
    if (this.history.length === 0 || this.currentIndex < 0) {
      return null;
    }
    
    const state = this.history[this.currentIndex];
    return JSON.parse(JSON.stringify(state)) as CanvasState;
  }

  /**
   * Checks if undo is available
   * 
   * @returns true if we can undo, false otherwise
   * 
   * USAGE EXAMPLE:
   * if (history.canUndo()) {
   *   undoButton.enable();
   * } else {
   *   undoButton.disable();
   * }
   * 
   * BEGINNER TIP:
   * Use this to enable/disable the undo button in the UI.
   * When canUndo() is false, the undo button should be grayed out.
   */
  public canUndo(): boolean {
    /**
     * We can undo if:
     * - We have at least one state in history
     * - We're not at the beginning (index > 0)
     * 
     * Special case: If we have exactly 1 state and index is 0,
     * we're at the first state, can't undo.
     */
    return this.history.length > 0 && this.currentIndex > 0;
  }

  /**
   * Checks if redo is available
   * 
   * @returns true if we can redo, false otherwise
   * 
   * USAGE EXAMPLE:
   * if (history.canRedo()) {
   *   redoButton.enable();
   * } else {
   *   redoButton.disable();
   * }
   * 
   * BEGINNER TIP:
   * Use this to enable/disable the redo button in the UI.
   * When canRedo() is false, the redo button should be grayed out.
   */
  public canRedo(): boolean {
    /**
     * We can redo if:
     * - We have at least one state in history
     * - We're not at the end (index < length - 1)
     */
    return this.history.length > 0 && this.currentIndex < this.history.length - 1;
  }

  /**
   * Clears all history
   * 
   * USAGE EXAMPLE:
   * history.clear();
   * 
   * BEGINNER TIP:
   * This removes all history. Use this when starting a new document
   * or clearing the canvas. After calling this, canUndo() and canRedo()
   * will both return false.
   */
  public clear(): void {
    this.history = [];
    this.currentIndex = -1;
  }

  /**
   * Gets the current history index
   * 
   * @returns The current index in the history array
   * 
   * USAGE EXAMPLE:
   * const index = history.getCurrentIndex();
   * console.log(`At state ${index + 1} of ${history.getHistoryLength()}`);
   * 
   * BEGINNER TIP:
   * This is useful for displaying history information to the user,
   * like "Undo 1/2" meaning we're at the 1st state out of 2.
   */
  public getCurrentIndex(): number {
    return this.currentIndex;
  }

  /**
   * Gets the total number of history states
   * 
   * @returns The number of states in history
   * 
   * USAGE EXAMPLE:
   * const total = history.getHistoryLength();
   * console.log(`History has ${total} states`);
   * 
   * BEGINNER TIP:
   * This tells you how many snapshots are stored in history.
   * Useful for debugging or displaying to users.
   */
  public getHistoryLength(): number {
    return this.history.length;
  }
}