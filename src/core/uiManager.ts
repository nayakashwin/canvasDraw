/**
 * ============================================================================
 * UI MANAGER
 * ============================================================================
 * 
 * PURPOSE:
 * This class manages user interface elements including:
 * - Toolbar with tool buttons
 * - Color picker
 * - Stroke width selector
 * - Zoom controls
 * - Undo/redo buttons
 * - Clear button
 * 
 * WHY WE NEED IT:
 * The application needs a visual interface for users to interact with.
 * Without this, users would have to use console commands to do anything.
 * 
 * HOW TO USE:
 * const ui = new UIManager('app-container', app);
 * ui.initialize();
 * 
 * DEPENDENCIES:
 * - App: The main application instance
 * - TypeScript: For type safety
 * 
 * BEGINNER TIP:
 * This creates all of buttons, dropdowns, and controls
 * that users see and interact with in the browser.
 */

import { App } from './app';
import { ToolType } from '../types';

/**
 * UIManager: Manages all UI elements
 */
export class UIManager {
  private containerId: string;
  private app: App;
  private toolbar: HTMLElement | null = null;
  private colorPicker: HTMLInputElement | null = null;
  private strokeWidthSelect: HTMLSelectElement | null = null;
  private currentToolDisplay: HTMLElement | null = null;
  private zoomDisplay: HTMLElement | null = null;
  private historyList: HTMLElement | null = null;

  constructor(containerId: string, app: App) {
    this.containerId = containerId;
    this.app = app;
  }

  /**
   * Initializes UI
   * 
   * This creates all UI elements and sets up event listeners.
   */
  public initialize(): void {
    this.createToolbar();
    this.setupEventListeners();
    this.setupHistoryPanel();
    console.log('UI Manager initialized');
  }

  /**
   * Creates toolbar
   */
  private createToolbar(): void {
    const container = document.getElementById(this.containerId);
    if (!container) {
      console.error('Container not found for UI');
      return;
    }

    // Create toolbar container
    this.toolbar = document.createElement('div');
    this.toolbar.className = 'toolbar';
    this.toolbar.innerHTML = `
      <div class="toolbar-section">
        <span class="toolbar-label">Tools</span>
        <div class="toolbar-tools">
          <button class="tool-btn active" data-tool="hand" title="Hand Tool (H)">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0a2 2 0 0 0-2 2v0a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-5M12 18v-5m0 0h-2m2 0h2m-2 0h2"/>
            </svg>
          </button>
          <button class="tool-btn" data-tool="selection" title="Selection Tool (S)">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"/>
            </svg>
          </button>
          <button class="tool-btn" data-tool="pen" title="Pen Tool (P)">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 19l7-7 3 3-7-7M18 13l-1.5-7.5L2 2l3.5 1.5L13 18l5-5z"/>
            </svg>
          </button>
          <button class="tool-btn" data-tool="text" title="Text Tool (T)">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 7V4h16v3M9 20h6M12 4v16"/>
            </svg>
          </button>
          <button class="tool-btn" data-tool="rectangle" title="Rectangle Tool (R)">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            </svg>
          </button>
          <button class="tool-btn" data-tool="circle" title="Circle Tool (C)">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="9"/>
            </svg>
          </button>
          <button class="tool-btn" data-tool="diamond" title="Diamond Tool (D)">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2L22 12l-10 10L2 12z"/>
            </svg>
          </button>
          <button class="tool-btn" data-tool="arrow" title="Arrow Tool (A)">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
          <button class="tool-btn" data-tool="line" title="Line Tool (L)">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="5" y1="19" x2="19" y2="5"/>
            </svg>
          </button>
        </div>
      </div>

      <div class="toolbar-section">
        <span class="toolbar-label">Color</span>
        <input type="color" id="color-picker" value="#000000" title="Choose Color" class="color-picker"/>
        <div class="color-palette">
          <button class="color-btn active" data-color="#000000" style="background-color: #000000"></button>
          <button class="color-btn" data-color="#FF0000" style="background-color: #FF0000"></button>
          <button class="color-btn" data-color="#00FF00" style="background-color: #00FF00"></button>
          <button class="color-btn" data-color="#0000FF" style="background-color: #0000FF"></button>
          <button class="color-btn" data-color="#FFFF00" style="background-color: #FFFF00"></button>
          <button class="color-btn" data-color="#FF00FF" style="background-color: #FF00FF"></button>
          <button class="color-btn" data-color="#00FFFF" style="background-color: #00FFFF"></button>
          <button class="color-btn" data-color="#FFA500" style="background-color: #FFA500"></button>
          <button class="color-btn" data-color="#800080" style="background-color: #800080"></button>
          <button class="color-btn" data-color="#FFFFFF" style="background-color: #FFFFFF"></button>
        </div>
      </div>

      <div class="toolbar-section">
        <span class="toolbar-label">Stroke</span>
        <select id="stroke-width" class="stroke-width-select" title="Stroke Width">
          <option value="1">Thin (1px)</option>
          <option value="2" selected>Medium (2px)</option>
          <option value="4">Thick (4px)</option>
          <option value="8">Extra Thick (8px)</option>
        </select>
      </div>

      <div class="toolbar-section">
        <span class="toolbar-label">Zoom</span>
        <button class="zoom-btn" id="zoom-out" title="Zoom Out (-)">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="M21 21l-4.35-4.35M8 11H3"/>
          </svg>
        </button>
        <span class="zoom-level" id="zoom-level">100%</span>
        <button class="zoom-btn" id="zoom-in" title="Zoom In (+)">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="M21 21l-4.35-4.35M11 8v6M8 11h6"/>
          </svg>
        </button>
        <button class="zoom-btn" id="zoom-reset" title="Reset Zoom (0)">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 12a9 9 0 1 0 9-9 9 9 0 0 0-9 9"/>
            <path d="M12 8v4M12 16h4M12 16l-2.5-2.5M12 16l2.5-2.5"/>
          </svg>
        </button>
      </div>

      <div class="toolbar-section">
        <span class="toolbar-label">Actions</span>
        <button class="action-btn" id="undo" title="Undo (Ctrl+Z)">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 10h10a5 5 0 0 1 5 5v2a5 5 0 0 1-5 5H6a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5h2"/>
          </svg>
        </button>
        <button class="action-btn" id="redo" title="Redo (Ctrl+Y)">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 10H11a5 5 0 0 0-5 5v2a5 5 0 0 0 5 5V7a5 5 0 0 0-5-5h-2"/>
          </svg>
        </button>
        <button class="action-btn" id="clear" title="Clear Canvas">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          </svg>
        </button>
      </div>

      <div class="toolbar-section toolbar-info">
        <span class="info-text" id="current-tool">Tool: Selection</span>
        <span class="info-text" id="object-count">Objects: 0</span>
      </div>
    `;

    // Insert toolbar before canvas
    const canvasContainer = container.querySelector('div.konvajs-content');
    if (canvasContainer) {
      container.insertBefore(this.toolbar, canvasContainer);
    } else {
      container.appendChild(this.toolbar);
    }

    // Cache references to UI elements
    this.colorPicker = this.toolbar.querySelector('#color-picker') as HTMLInputElement;
    this.strokeWidthSelect = this.toolbar.querySelector('#stroke-width') as HTMLSelectElement;
    this.currentToolDisplay = this.toolbar.querySelector('#current-tool') as HTMLElement;
    this.zoomDisplay = this.toolbar.querySelector('#zoom-level') as HTMLElement;
  }

  /**
   * Sets up event listeners for UI elements
   */
  private setupEventListeners(): void {
    if (!this.toolbar) return;

    // Tool buttons
    const toolButtons = this.toolbar.querySelectorAll('.tool-btn');
    toolButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const tool = btn.getAttribute('data-tool') as ToolType;
        if (tool) {
          this.selectTool(tool, btn as HTMLElement);
        }
      });
    });

    // Color palette buttons
    const colorButtons = this.toolbar.querySelectorAll('.color-btn');
    colorButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const color = btn.getAttribute('data-color');
        if (color) {
          this.setColor(color);
          // Update all color buttons
          colorButtons.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          // Update color picker
          if (this.colorPicker) {
            this.colorPicker.value = color;
          }
        }
      });
    });

    // Color picker
    if (this.colorPicker) {
      this.colorPicker.addEventListener('input', () => {
        this.setColor(this.colorPicker!.value);
        // Remove active state from palette buttons
        colorButtons.forEach(b => b.classList.remove('active'));
      });
    }

    // Stroke width
    if (this.strokeWidthSelect) {
      this.strokeWidthSelect.addEventListener('change', () => {
        const width = parseInt(this.strokeWidthSelect!.value);
        this.app['setStrokeWidth'](width);
      });
    }

    // Zoom buttons
    const zoomIn = this.toolbar.querySelector('#zoom-in');
    const zoomOut = this.toolbar.querySelector('#zoom-out');
    const zoomReset = this.toolbar.querySelector('#zoom-reset');

    if (zoomIn) zoomIn.addEventListener('click', () => this.app.zoomIn());
    if (zoomOut) zoomOut.addEventListener('click', () => this.app.zoomOut());
    if (zoomReset) {
      zoomReset.addEventListener('click', () => {
        this.app['canvasManager'].setZoom(1.0);
        this.updateZoomDisplay(1.0);
      });
    }

    // Action buttons
    const undo = this.toolbar.querySelector('#undo');
    const redo = this.toolbar.querySelector('#redo');
    const clear = this.toolbar.querySelector('#clear');

    if (undo) undo.addEventListener('click', () => this.app.undo());
    if (redo) redo.addEventListener('click', () => this.app.redo());
    if (clear) clear.addEventListener('click', () => {
      if (confirm('Are you sure you want to clear the canvas?')) {
        this.app.clearCanvas();
        this.updateObjectCount();
      }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => this.handleKeyboard(e));
  }

  /**
   * Handles keyboard shortcuts
   */
  private handleKeyboard(e: KeyboardEvent): void {
    // Ctrl+Z: Undo
    if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
      e.preventDefault();
      this.app.undo();
    }

    // Ctrl+Y or Ctrl+Shift+Z: Redo
    if ((e.ctrlKey && e.key === 'y') || (e.ctrlKey && e.shiftKey && e.key === 'Z')) {
      e.preventDefault();
      this.app.redo();
    }

    // Delete: Delete selected
    if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault();
      this.app.deleteSelected();
      this.updateObjectCount();
    }

    // Escape: Deselect all
    if (e.key === 'Escape') {
      this.app['objectManager'].deselectAll();
    }

    // H: Hand tool
    if (e.key === 'h') {
      this.selectTool(ToolType.HAND, this.toolbar!.querySelector('[data-tool="hand"]') as HTMLElement);
    }

    // S: Selection tool
    if (e.key === 's') {
      this.selectTool(ToolType.SELECTION, this.toolbar!.querySelector('[data-tool="selection"]') as HTMLElement);
    }

    // P: Pen tool
    if (e.key === 'p') {
      this.selectTool(ToolType.PEN, this.toolbar!.querySelector('[data-tool="pen"]') as HTMLElement);
    }

    // T: Text tool
    if (e.key === 't') {
      this.selectTool(ToolType.TEXT, this.toolbar!.querySelector('[data-tool="text"]') as HTMLElement);
    }

    // R: Rectangle tool
    if (e.key === 'r') {
      this.selectTool(ToolType.RECTANGLE, this.toolbar!.querySelector('[data-tool="rectangle"]') as HTMLElement);
    }

    // C: Circle tool
    if (e.key === 'c') {
      this.selectTool(ToolType.CIRCLE, this.toolbar!.querySelector('[data-tool="circle"]') as HTMLElement);
    }

    // D: Diamond tool
    if (e.key === 'd') {
      this.selectTool(ToolType.DIAMOND, this.toolbar!.querySelector('[data-tool="diamond"]') as HTMLElement);
    }

    // A: Arrow tool
    if (e.key === 'a') {
      this.selectTool(ToolType.ARROW, this.toolbar!.querySelector('[data-tool="arrow"]') as HTMLElement);
    }

    // L: Line tool
    if (e.key === 'l') {
      this.selectTool(ToolType.LINE, this.toolbar!.querySelector('[data-tool="line"]') as HTMLElement);
    }

    // 0: Reset zoom
    if (e.key === '0') {
      this.app['canvasManager'].setZoom(1.0);
      this.updateZoomDisplay(1.0);
    }
  }

  /**
   * Selects a tool
   */
  private selectTool(tool: ToolType, button: HTMLElement): void {
    // Remove active class from all tool buttons
    const toolButtons = this.toolbar!.querySelectorAll('.tool-btn');
    toolButtons.forEach(btn => btn.classList.remove('active'));
    
    // Add active class to selected button
    button.classList.add('active');
    
    // Set tool in app
    this.app.setTool(tool);
    
    // Update display
    if (this.currentToolDisplay) {
      const toolNames: { [key in ToolType]: string } = {
        [ToolType.PEN]: 'Pen',
        [ToolType.ERASER]: 'Eraser',
        [ToolType.HAND]: 'Hand',
        [ToolType.SELECTION]: 'Selection',
        [ToolType.RECTANGLE]: 'Rectangle',
        [ToolType.CIRCLE]: 'Circle',
        [ToolType.DIAMOND]: 'Diamond',
        [ToolType.TEXT]: 'Text',
        [ToolType.ARROW]: 'Arrow',
        [ToolType.LINE]: 'Line'
      };
      this.currentToolDisplay.textContent = `Tool: ${toolNames[tool]}`;
    }

    console.log(`Selected tool: ${tool}`);
  }

  /**
   * Sets current color
   */
  private setColor(color: string): void {
    this.app.setColor(color);
    console.log(`Color changed to: ${color}`);
  }

  /**
   * Updates zoom display
   */
  public updateZoomDisplay(zoom: number): void {
    if (this.zoomDisplay) {
      const percentage = Math.round(zoom * 100);
      this.zoomDisplay.textContent = `${percentage}%`;
    }
  }

  /**
   * Updates object count display
   */
  public updateObjectCount(): void {
    const infoText = this.toolbar?.querySelector('#object-count') as HTMLElement;
    if (infoText) {
      const count = this.app.getObjectCount();
      infoText.textContent = `Objects: ${count}`;
    }
  }

  /**
   * Sets up the history panel
   */
  private setupHistoryPanel(): void {
    // Get reference to history list
    this.historyList = document.getElementById('history-list');
    
    // Subscribe to change history updates
    this.app.onChangeHistory((history: any[]) => {
      this.renderHistory(history);
    });

    // Set up clear history button
    const clearBtn = document.getElementById('clear-history');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear the history log?')) {
          this.app.clearChangeHistory();
        }
      });
    }
  }

  /**
   * Renders the history list
   */
  private renderHistory(history: Array<{ timestamp: number; action: string; details: string }>): void {
    if (!this.historyList) return;

    // Clear current list
    this.historyList.innerHTML = '';

    // Show empty state if no history
    if (history.length === 0) {
      this.historyList.innerHTML = `
        <div class="history-item empty-state">
          No changes yet
        </div>
      `;
      return;
    }

    // Render history items (newest first)
    const sortedHistory = [...history].reverse();
    sortedHistory.forEach(change => {
      const item = document.createElement('div');
      item.className = 'history-item';
      
      const time = new Date(change.timestamp).toLocaleTimeString();
      
      item.innerHTML = `
        <div class="history-item-time">${time}</div>
        <div class="history-item-action">${change.action}</div>
        <div class="history-item-details">${change.details}</div>
      `;
      
      this.historyList.appendChild(item);
    });
  }
}
