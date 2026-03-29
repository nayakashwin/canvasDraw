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
import { ToolType, Point } from '../types';

/**
 * UIManager: Manages all UI elements
 */
export class UIManager {
  private containerId: string;
  private app: App;
  private toolbar: HTMLElement | null = null;
  private colorPicker: HTMLInputElement | null = null;
  private strokeWidthSelect: HTMLSelectElement | null = null;
  private backgroundColorPicker: HTMLInputElement | null = null;
  private currentToolDisplay: HTMLElement | null = null;
  private zoomDisplay: HTMLElement | null = null;
  private positioningCallback: ((position: Point) => void) | null = null;

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
            <img src="/icons/hand.svg" alt="Hand Tool" width="20" height="20"/>
          </button>
          <button class="tool-btn" data-tool="selection" title="Selection Tool (S)">
            <img src="/icons/selection.svg" alt="Selection Tool" width="20" height="20"/>
          </button>
          <button class="tool-btn" data-tool="pen" title="Pen Tool (P)">
            <img src="/icons/pen.svg" alt="Pen Tool" width="20" height="20"/>
          </button>
          <button class="tool-btn" data-tool="text" title="Text Tool (T)">
            <img src="/icons/text.svg" alt="Text Tool" width="20" height="20"/>
          </button>
          <button class="tool-btn" data-tool="rectangle" title="Rectangle Tool (R)">
            <img src="/icons/rectangle.svg" alt="Rectangle Tool" width="20" height="20"/>
          </button>
          <button class="tool-btn" data-tool="circle" title="Circle Tool (C)">
            <img src="/icons/circle.svg" alt="Circle Tool" width="20" height="20"/>
          </button>
          <button class="tool-btn" data-tool="diamond" title="Diamond Tool (D)">
            <img src="/icons/diamond.svg" alt="Diamond Tool" width="20" height="20"/>
          </button>
          <button class="tool-btn" data-tool="arrow" title="Arrow Tool (A)">
            <img src="/icons/arrow.svg" alt="Arrow Tool" width="20" height="20"/>
          </button>
          <button class="tool-btn" data-tool="line" title="Line Tool (L)">
            <img src="/icons/line.svg" alt="Line Tool" width="20" height="20"/>
          </button>
        </div>
      </div>

      <div class="toolbar-section">
        <span class="toolbar-label">Tool Color</span>
        <input type="color" id="color-picker" value="#000000" title="Choose Tool Color" class="color-picker"/>
      </div>

      <div class="toolbar-section">
        <span class="toolbar-label">Background Color</span>
        <input type="color" id="background-color-picker" value="#ffffff" title="Choose Background Color" class="color-picker"/>
      </div>

      <div class="toolbar-section">
        <span class="toolbar-label">Stroke</span>
        <select id="stroke-width" class="stroke-width-select" title="Stroke Width">
          <option value="1">1px</option>
          <option value="2" selected>2px</option>
          <option value="4">4px</option>
          <option value="8">8px</option>
          <option value="12">12px</option>
          <option value="14">14px</option>
          <option value="16">16px</option>
          <option value="18">18px</option>
          <option value="20">20px</option>
          <option value="24">24px</option>
          <option value="28">28px</option>
          <option value="32">32px</option>
          <option value="36">36px</option>
          <option value="40">40px</option>
          <option value="48">48px</option>
        </select>
      </div>

      <div class="toolbar-section">
        <span class="toolbar-label">Line Style</span>
        <select id="line-style" class="line-style-select" title="Line Style">
          <option value="" selected>Solid</option>
          <option value="5,5">Dashed</option>
          <option value="2,2">Dotted</option>
          <option value="10,5">Long Dash</option>
          <option value="10,2,2,2">Dash Dotted</option>
          <option value="1,5">Sparse Dots</option>
          <option value="5,5,2,5">Dash Double Dot</option>
          <option value="20,10,5,10">Long Dash Short Gap</option>
        </select>
      </div>

      <div class="toolbar-section">
        <span class="toolbar-label">Looney</span>
        <input type="checkbox" id="looney-mode" title="Enable hand-drawn style" />
      </div>

      <div class="toolbar-section" id="text-section">
        <span class="toolbar-label">Text</span>
        <select id="font-family" class="font-family-select" title="Font Family">
          <option value="Arial, sans-serif" selected>Arial</option>
          <option value="Times New Roman, serif">Times New Roman</option>
          <option value="Georgia, serif">Georgia</option>
          <option value="Courier New, monospace">Courier New</option>
          <option value="Verdana, sans-serif">Verdana</option>
          <option value="Tahoma, sans-serif">Tahoma</option>
          <option value="Trebuchet MS, sans-serif">Trebuchet MS</option>
          <option value="Comic Sans MS, cursive">Comic Sans MS</option>
        </select>
        <select id="font-size" class="font-size-select" title="Font Size">
          <option value="12">12px</option>
          <option value="14">14px</option>
          <option value="16" selected>16px</option>
          <option value="18">18px</option>
          <option value="20">20px</option>
          <option value="24">24px</option>
          <option value="28">28px</option>
          <option value="32">32px</option>
          <option value="36">36px</option>
          <option value="40">40px</option>
          <option value="48">48px</option>
          <option value="56">56px</option>
          <option value="64">64px</option>
          <option value="72">72px</option>
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

      <div class="toolbar-section">
        <span class="toolbar-label">Export/Import</span>
        <button class="action-btn" id="export-json" title="Export as JSON">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7,10 12,15 17,10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
        </button>
        <button class="action-btn" id="import-json" title="Import from JSON">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17,8 12,3 7,8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
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
    this.backgroundColorPicker = this.toolbar.querySelector('#background-color-picker') as HTMLInputElement;
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

    // Color picker
    if (this.colorPicker) {
      this.colorPicker.addEventListener('input', () => {
        this.setColor(this.colorPicker!.value);
      });
    }

    // Background color picker
    if (this.backgroundColorPicker) {
      this.backgroundColorPicker.addEventListener('input', () => {
        this.setBackgroundColor(this.backgroundColorPicker!.value);
      });
    }

    // Stroke width
    if (this.strokeWidthSelect) {
      this.strokeWidthSelect.addEventListener('change', () => {
        const width = parseInt(this.strokeWidthSelect!.value);
        this.app['setStrokeWidth'](width);
      });
    }

    // Line style
    const lineStyleSelect = this.toolbar.querySelector('#line-style') as HTMLSelectElement;
    if (lineStyleSelect) {
      lineStyleSelect.addEventListener('change', () => {
        const value = lineStyleSelect.value;
        const dashArray = value ? value.split(',').map(Number) : null;
        this.app['setLineStyle'](dashArray);
      });
    }

    // Looney mode
    const looneyCheckbox = this.toolbar.querySelector('#looney-mode') as HTMLInputElement;
    if (looneyCheckbox) {
      looneyCheckbox.addEventListener('change', () => {
        this.app['setLooneyMode'](looneyCheckbox.checked);
      });
    }

    // Font family
    const fontFamilySelect = this.toolbar.querySelector('#font-family') as HTMLSelectElement;
    if (fontFamilySelect) {
      fontFamilySelect.addEventListener('change', () => {
        this.app['setFontFamily'](fontFamilySelect.value);
      });
    }

    // Font size
    const fontSizeSelect = this.toolbar.querySelector('#font-size') as HTMLSelectElement;
    if (fontSizeSelect) {
      fontSizeSelect.addEventListener('change', () => {
        const size = parseInt(fontSizeSelect.value);
        this.app['setFontSize'](size);
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

    // Export/Import buttons
    const exportJson = this.toolbar.querySelector('#export-json');
    const importJson = this.toolbar.querySelector('#import-json');

    if (exportJson) exportJson.addEventListener('click', () => this.app['exportAsJson']());
    if (importJson) importJson.addEventListener('click', () => this.app['importFromJson']());

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => this.handleKeyboard(e));
  }

  /**
   * Handles keyboard shortcuts
   */
  private handleKeyboard(e: KeyboardEvent): void {
    // Check if text input is active - if so, skip tool shortcuts
    const isTypingText = this.app['isTextInputActive']();

    // Ctrl+Z: Undo (works even while typing)
    if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
      e.preventDefault();
      this.app.undo();
    }

    // Ctrl+Y or Ctrl+Shift+Z: Redo (works even while typing)
    if ((e.ctrlKey && e.key === 'y') || (e.ctrlKey && e.shiftKey && e.key === 'Z')) {
      e.preventDefault();
      this.app.redo();
    }

    // Delete: Delete selected (only when not typing)
    if (!isTypingText && (e.key === 'Delete' || e.key === 'Backspace')) {
      e.preventDefault();
      this.app.deleteSelected();
      this.updateObjectCount();
    }

    // Escape: Deselect all (works even while typing to cancel text input)
    if (e.key === 'Escape') {
      this.app['objectManager'].deselectAll();
    }

    // Tool shortcuts - only work when NOT typing in text input
    if (!isTypingText) {
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

      // Ctrl+E: Export
      if (e.ctrlKey && e.key === 'e') {
        e.preventDefault();
        this.app['exportAsJson']();
      }

      // Ctrl+I: Import
      if (e.ctrlKey && e.key === 'i') {
        e.preventDefault();
        this.app['importFromJson']();
      }
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
  }

  /**
   * Sets current color
   */
  private setColor(color: string): void {
    this.app.setColor(color);
  }

  /**
   * Sets background color
   */
  private setBackgroundColor(color: string): void {
    this.app['canvasManager'].setBackgroundColor(color);
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
   * Enables positioning mode for placing imported objects
   * 
   * @param callback - Function to call with the selected position
   */
  public enablePositioningMode(callback: (position: Point) => void): void {
    this.positioningCallback = callback;

    const canvasContainer = document.getElementById(this.containerId);
    if (!canvasContainer) return;

    canvasContainer.style.cursor = 'crosshair';

    const mouseHandler = (e: MouseEvent) => {
      const canvasManager = this.app['canvasManager'];
      if (!canvasManager) return;

      const stage = canvasManager.getStage();
      if (!stage) return;

      const pos = stage.getPointerPosition();
      if (!pos) return;

      const canvasPosition = {
        x: pos.x,
        y: pos.y
      };

      canvasContainer.style.cursor = '';
      canvasContainer.removeEventListener('click', mouseHandler);

      if (this.positioningCallback) {
        this.positioningCallback(canvasPosition);
        this.positioningCallback = null;
      }
    };

    setTimeout(() => {
      canvasContainer.addEventListener('click', mouseHandler);
    }, 100);

    document.addEventListener('keydown', this.escapeHandler);
  }

  private escapeHandler = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      this.disablePositioningMode();
    }
  };

  /**
   * Disables positioning mode
   */
  public disablePositioningMode(): void {
    if (this.positioningCallback) {
      this.positioningCallback = null;
    }

    const canvasContainer = document.getElementById(this.containerId);
    if (canvasContainer) {
      canvasContainer.style.cursor = '';
    }

    document.removeEventListener('keydown', this.escapeHandler);
  }
}
