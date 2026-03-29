import { CanvasState } from '../types';

export class HistoryManager {
  private maxHistory: number;
  private history: CanvasState[] = [];
  private currentIndex: number = -1;

  constructor(maxHistory: number = 2) {
    this.maxHistory = maxHistory;
  }

  public saveState(state: CanvasState): void {
    if (this.currentIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.currentIndex + 1);
    }
    
    const stateCopy = JSON.parse(JSON.stringify(state)) as CanvasState;
    this.history.push(stateCopy);
    
    if (this.history.length > this.maxHistory) {
      this.history.shift();
      this.currentIndex--;
    }
    
    this.currentIndex = this.history.length - 1;
  }

  public undo(): CanvasState | null {
    if (this.history.length === 0 || this.currentIndex < 0) return null;
    
    this.currentIndex--;
    if (this.currentIndex < 0) this.currentIndex = 0;
    
    return JSON.parse(JSON.stringify(this.history[this.currentIndex])) as CanvasState;
  }

  public redo(): CanvasState | null {
    if (this.history.length === 0 || this.currentIndex >= this.history.length - 1) return null;
    
    this.currentIndex++;
    return JSON.parse(JSON.stringify(this.history[this.currentIndex])) as CanvasState;
  }

  public getCurrentState(): CanvasState | null {
    if (this.history.length === 0 || this.currentIndex < 0) return null;
    return JSON.parse(JSON.stringify(this.history[this.currentIndex])) as CanvasState;
  }

  public canUndo(): boolean {
    return this.history.length > 0 && this.currentIndex > 0;
  }

  public canRedo(): boolean {
    return this.history.length > 0 && this.currentIndex < this.history.length - 1;
  }

  public clear(): void {
    this.history = [];
    this.currentIndex = -1;
  }

  public getCurrentIndex(): number {
    return this.currentIndex;
  }

  public getHistoryLength(): number {
    return this.history.length;
  }
}