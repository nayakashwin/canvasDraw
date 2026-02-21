/**
 * ============================================================================
 * APPLICATION CLASS
 * ============================================================================
 * 
 * PURPOSE:
 * This is the main application class that coordinates all components. It handles:
 * - Initializing all managers (canvas, objects, history, storage)
 * - Managing application state
 * - Coordinating between components
 * - Handling user interactions
 * 
 * WHY WE NEED IT:
 * The App class is the "brain" of the application. It connects all
 * the specialized managers and coordinates their interactions. Without it,
 * the managers would be disconnected and couldn't work together.
 * 
 * HOW TO USE:
 * In main.ts:
 * const app = new App('app-container');
 * app.initialize();
 * 
 * DEPENDENCIES:
 * - CanvasManager: For canvas operations
 * - ObjectManager: For object management
 * - HistoryManager: For undo/redo
 * - StorageManager: For persistence
 * - UIManager: For user interface
 * - TypeScript: For type safety
 * 
 * BEGINNER TIPS:
 * - This is the entry point for the application
 * - It initializes everything and makes it work together
 * - Think of it as the conductor of an orchestra
 */

import { CanvasManager } from './canvasManager';
import { ObjectManager } from './objectManager';
import { HistoryManager } from './historyManager';
import { StorageManager } from './storageManager';
import { UIManager } from './uiManager';
import { CanvasState, Point, Size, ObjectType, ObjectProperties, TextProperties, PathProperties, ToolType } from '../types';
import Konva from 'konva';

/**
 * App: Main application class
 * 
 * This class is responsible for:
 * 1. Initializing all managers
 * 2. Managing current application state
 * 3. Handling user interactions
 * 4. Coordinating between components
 * 
 * DESIGN PATTERN:
 * This uses Facade pattern - it provides a simple interface
 * to a complex subsystem of managers.
 */
export class App {
  /**
   * Canvas container ID
   * 
   * The HTML ID of the div that will contain the canvas.
   */
  private containerId: string;
  
  /**
   * Canvas Manager instance
   * 
   * Handles all canvas operations (zoom, pan, rendering).
   */
  private canvasManager: CanvasManager | null = null;
  
  /**
   * Change history array
   * 
   * Tracks all changes made to the canvas for display in the history panel.
   */
  private changeHistory: Array<{
    timestamp: number;
    action: string;
    details: string;
  }> = [];
  
  /**
   * Event listeners for change history
   */
  private changeHistoryListeners: Function[] = [];
  
  /**
   * Object Manager instance
   * 
   * Handles all object operations (create, delete, select).
   */
  private objectManager: ObjectManager | null = null;
  
  /**
   * History Manager instance
   * 
   * Handles undo/redo functionality.
   */
  private historyManager: HistoryManager | null = null;
  
  /**
   * Storage Manager instance
   * 
   * Handles IndexedDB storage.
   */
  private storageManager: StorageManager | null = null;
  
  /**
   * UI Manager instance
   * 
   * Handles the user interface (toolbar, colors, buttons).
   */
  private uiManager: UIManager | null = null;
  
  /**
   * Current application state
   * 
   * This tracks the complete state of the application.
   */
  private currentState: CanvasState;

  /**
   * Currently selected tool
   * 
   * Default is hand tool for panning.
   */
  private currentTool: ToolType = ToolType.HAND;

  /**
   * Currently selected color
   * 
   * Default is black.
   */
  private currentColor: string = 'black';

  /**
   * Currently selected stroke width
   * 
   * Default is 2 pixels.
   */
  private currentStrokeWidth: number = 2;

  /**
   * Drawing state for pen tool
   * 
   * Tracks the current drawing when using the pen tool.
   */
  private isDrawing: boolean = false;
  private currentLine: Konva.Line | null = null;
  private currentPoints: Point[] = [];

  /**
   * Panning state for hand tool
   * 
   * Tracks panning when using the hand tool.
   */
  private isPanning: boolean = false;
  private lastPanPosition: Point | null = null;

  /**
   * Drawing state for shape tools (rectangle, circle, diamond, arrow, line)
   * 
   * Tracks the current shape being drawn.
   */
  private isDrawingShape: boolean = false;
  private currentShape: Konva.Node | null = null;
  private shapeStartPoint: Point | null = null;
  private drawingLayer: Konva.Layer | null = null;

  /**
   * Text input for text tool
   * 
   * The input element for adding text.
   */
  private textInput: HTMLInputElement | null = null;

  /**
   * Creates a new App instance
   * 
   * @param containerId - The HTML ID of the canvas container
   * 
   * USAGE EXAMPLE:
   * const app = new App('app-container');
   * await app.initialize();
   * 
   * BEGINNER TIP:
   * Make sure your HTML has a div with this ID:
   * <div id="app-container"></div>
   */
  constructor(containerId: string) {
    this.containerId = containerId;
    
    /**
     * Initialize default state
     * 
     * This is the starting state of the application.
     */
    this.currentState = {
      zoom:1.0,
      pan: { x: 0, y: 0 },
      objects: [],
      selectedIds: [],
      groupedIds: [],
      history: [],
      historyIndex: -1
    };
  }

  /**
   * Initializes the application
   * 
   * This method sets up all managers and event listeners.
   * It should be called after creating an App instance.
   * 
   * USAGE EXAMPLE:
   * const app = new App('app-container');
   * await app.initialize();
   * 
   * BEGINNER TIP:
   * This is an async method because it initializes
   * IndexedDB, which is asynchronous.
   */
  public async initialize(): Promise<void> {
    /**
     * Step 1: Create Canvas Manager
     */
    this.canvasManager = new CanvasManager(this.containerId);
    
    /**
     * Step 2: Create Object Manager
     */
    this.objectManager = new ObjectManager(this.canvasManager);
    
    /**
     * Step 3: Create History Manager with multi-level undo (maxHistory=50)
     * Each Ctrl+Z undoes the last action. Multiple Ctrl+Z presses undo
     * multiple actions in reverse order.
     */
    this.historyManager = new HistoryManager(50);
    
    /**
     * Step 4: Create Storage Manager
     */
    this.storageManager = new StorageManager();
    await this.storageManager.init();
    
    /**
     * Step 5: Create UI Manager
     */
    this.uiManager = new UIManager(this.containerId, this);
    
    /**
     * Step 6: Set up canvas event listeners
     */
    this.setupEventListeners();
    
    /**
     * Step 7: Initialize UI
     */
    this.uiManager!.initialize();
    
    /**
     * Step 8: Try to load saved state from IndexedDB
     */
    const savedState = await this.storageManager!.loadState();
    if (savedState) {
      this.restoreState(savedState);
      console.log('Restored saved state');
    } else {
      console.log('No saved state found, starting fresh');
    }
    
    /**
     * Step 9: Enable auto-save (every 5 minutes)
     */
    this.storageManager!.enableAutoSave(this.currentState, 300000);
    
    /**
     * Step 10: Hide loading screen
     */
    const loading = document.getElementById('loading');
    if (loading) {
      loading.remove();
    }
    
    console.log('Canvas Draw initialized successfully!');
  }

  /**
   * Sets up event listeners for canvas interactions
   * 
   * This method registers listeners for mouse events on the canvas.
   */
  private setupEventListeners(): void {
    if (!this.canvasManager) return;

    /**
     * mousedown: Start drawing or selecting
     */
    this.canvasManager.on('mousedown', (event: any) => {
      this.handleMouseDown(event);
    });

    /**
     * mousemove: Continue drawing or dragging
     */
    this.canvasManager.on('mousemove', (event: any) => {
      this.handleMouseMove(event);
    });

    /**
     * mouseup: Finish drawing or dragging
     */
    this.canvasManager.on('mouseup', (event: any) => {
      this.handleMouseUp(event);
    });

    /**
     * zoom: Handle zoom changes
     */
    this.canvasManager.on('zoom', (data: any) => {
      this.currentState.zoom = data.zoom;
      this.currentState.pan = data.pan;
      this.updateState();
      // Update UI zoom display
      this.uiManager?.updateZoomDisplay(data.zoom);
    });

    /**
     * pan: Handle pan changes
     */
    this.canvasManager.on('pan', (data: any) => {
      this.currentState.pan = data.pan;
      this.updateState();
    });
  }

  /**
   * Handles mouse down events
   * 
   * @param event - The mouse event
   */
  private handleMouseDown(event: any): void {
    const { canvasPosition, screenPosition, button } = event;

    /**
     * Left click: Select or start drawing
     */
    if (button === 0) {
      if (this.currentTool === ToolType.HAND) {
        // Hand tool: start panning
        this.isPanning = true;
        this.lastPanPosition = screenPosition;
      } else if (this.currentTool === ToolType.SELECTION) {
        // Selection tool: check if clicking on an object
        this.objectManager!.deselectAll();
      } else if (this.currentTool === ToolType.PEN) {
        // Pen tool: start freehand drawing
        this.startDrawing(canvasPosition);
      } else if (this.currentTool === ToolType.TEXT) {
        // Text tool: create text input
        this.createTextInput(screenPosition, canvasPosition);
      } else if (this.currentTool === ToolType.RECTANGLE || 
                 this.currentTool === ToolType.CIRCLE ||
                 this.currentTool === ToolType.DIAMOND ||
                 this.currentTool === ToolType.ARROW ||
                 this.currentTool === ToolType.LINE) {
        // Shape tools: start drawing shape
        this.startShapeDrawing(canvasPosition);
      }
    }
  }

  /**
   * Handles mouse move events
   * 
   * @param event - The mouse event
   */
  private handleMouseMove(event: any): void {
    const { canvasPosition, screenPosition } = event;

    /**
     * Continue panning if hand tool is active
     */
    if (this.currentTool === ToolType.HAND && this.isPanning && this.lastPanPosition) {
      const dx = screenPosition.x - this.lastPanPosition.x;
      const dy = screenPosition.y - this.lastPanPosition.y;
      
      this.canvasManager!.pan(dx, dy);
      
      this.lastPanPosition = screenPosition;
    }

    /**
     * Continue drawing if pen tool is active
     */
    if (this.currentTool === ToolType.PEN && this.isDrawing) {
      this.continueDrawing(canvasPosition);
    }

    /**
     * Continue drawing shape if shape tool is active
     */
    if ((this.currentTool === ToolType.RECTANGLE || 
         this.currentTool === ToolType.CIRCLE ||
         this.currentTool === ToolType.DIAMOND ||
         this.currentTool === ToolType.ARROW ||
         this.currentTool === ToolType.LINE) && this.isDrawingShape) {
      this.continueShapeDrawing(canvasPosition);
    }
  }

  /**
   * Handles mouse up events
   * 
   * @param event - The mouse event
   */
  private handleMouseUp(event: any): void {
    /**
     * Stop panning if hand tool is active
     */
    if (this.currentTool === ToolType.HAND && this.isPanning) {
      this.isPanning = false;
      this.lastPanPosition = null;
    }

    /**
     * Finish drawing if pen tool is active
     */
    if (this.currentTool === ToolType.PEN && this.isDrawing) {
      this.finishDrawing();
    }

    /**
     * Finish drawing shape if shape tool is active
     */
    if (this.isDrawingShape) {
      this.finishShapeDrawing();
    }
  }

  /**
   * Starts a freehand drawing
   * 
   * @param position - The starting position
   */
  private startDrawing(position: Point): void {
    this.isDrawing = true;
    this.currentPoints = [position];
    
    const stage = this.canvasManager!.getStage();
    if (!stage) return;

    // Get or create a drawing layer
    let drawingLayer = stage.findOne('#drawing-layer') as Konva.Layer;
    if (!drawingLayer) {
      drawingLayer = new Konva.Layer({ id: 'drawing-layer' });
      stage.add(drawingLayer);
    }

    // Create a new line for freehand drawing (temporary visualization)
    this.currentLine = new Konva.Line({
      points: [position.x, position.y],
      stroke: this.currentColor,
      strokeWidth: this.currentStrokeWidth,
      lineCap: 'round',
      lineJoin: 'round',
      tension: 0.5,
      globalCompositeOperation: 'source-over'
    });

    drawingLayer.add(this.currentLine);
    drawingLayer.batchDraw();
  }

  /**
   * Continues a freehand drawing
   * 
   * @param position - The current position
   */
  private continueDrawing(position: Point): void {
    if (!this.currentLine || !this.isDrawing) return;

    this.currentPoints.push(position);
    
    // Update line points
    const points = this.currentPoints.flatMap(p => [p.x, p.y]);
    this.currentLine.points(points);
    
    // Redraw the layer
    const layer = this.currentLine.getLayer();
    if (layer) {
      layer.batchDraw();
    }
  }

  /**
   * Finishes a freehand drawing
   */
  private finishDrawing(): void {
    if (!this.currentLine || !this.isDrawing) return;

    this.isDrawing = false;
    
    // Remove the temporary line from the drawing layer
    const drawingLayer = this.currentLine.getLayer();
    if (drawingLayer) {
      this.currentLine.remove();
      drawingLayer.batchDraw();
    }

    // Calculate bounding box for the freehand drawing
    if (this.currentPoints.length > 0) {
      const xs = this.currentPoints.map(p => p.x);
      const ys = this.currentPoints.map(p => p.y);
      const minX = Math.min(...xs);
      const maxX = Math.max(...xs);
      const minY = Math.min(...ys);
      const maxY = Math.max(...ys);
      
      const position = { x: minX, y: minY };
      const size = { width: maxX - minX, height: maxY - minY };
      
      // Create a proper FREEHAND object through ObjectManager
      const properties = {
        stroke: this.currentColor,
        strokeWidth: this.currentStrokeWidth,
        fill: 'transparent',
        points: this.currentPoints,
        tension: 0.5,
        closed: false
      };
      
      const id = this.objectManager!.createObject(
        ObjectType.FREEHAND,
        position,
        size,
        properties
      );
      
      // Save the drawing to history
      this.saveState();
      
      // Log change
      this.logChange('Freehand Drawing', `Created drawing with ${this.currentColor} color`);
      
      // Update UI object count
      this.uiManager?.updateObjectCount();
      
      console.log(`Finished freehand drawing with ID: ${id}`);
    }
    
    this.currentLine = null;
    this.currentPoints = [];
  }

  /**
   * Starts drawing a shape (rectangle, circle, diamond, arrow, line)
   * 
   * @param position - The starting position
   */
  private startShapeDrawing(position: Point): void {
    this.isDrawingShape = true;
    this.shapeStartPoint = position;
    
    const stage = this.canvasManager!.getStage();
    if (!stage) return;

    // Get or create a drawing layer
    this.drawingLayer = stage.findOne('#drawing-layer') as Konva.Layer;
    if (!this.drawingLayer) {
      this.drawingLayer = new Konva.Layer({ id: 'drawing-layer' });
      stage.add(this.drawingLayer);
    }

    // Create the appropriate shape based on the current tool
    let shape: Konva.Node;
    
    if (this.currentTool === ToolType.RECTANGLE) {
      shape = new Konva.Rect({
        x: position.x,
        y: position.y,
        width: 0,
        height: 0,
        stroke: this.currentColor,
        strokeWidth: this.currentStrokeWidth,
        fill: 'transparent',
        draggable: false
      });
    } else if (this.currentTool === ToolType.CIRCLE) {
      shape = new Konva.Ellipse({
        x: position.x,
        y: position.y,
        radiusX: 0,
        radiusY: 0,
        stroke: this.currentColor,
        strokeWidth: this.currentStrokeWidth,
        fill: 'transparent',
        draggable: false
      });
    } else if (this.currentTool === ToolType.DIAMOND) {
      shape = new Konva.Tag({
        x: position.x,
        y: position.y,
        width: 0,
        height: 0,
        rotation: 45,
        stroke: this.currentColor,
        strokeWidth: this.currentStrokeWidth,
        fill: 'transparent',
        draggable: false
      });
    } else if (this.currentTool === ToolType.ARROW) {
      shape = new Konva.Arrow({
        points: [position.x, position.y, position.x, position.y],
        pointerLength: 10,
        pointerWidth: 10,
        stroke: this.currentColor,
        strokeWidth: this.currentStrokeWidth,
        fill: this.currentColor,
        draggable: false
      });
    } else if (this.currentTool === ToolType.LINE) {
      shape = new Konva.Line({
        points: [position.x, position.y, position.x, position.y],
        stroke: this.currentColor,
        strokeWidth: this.currentStrokeWidth,
        draggable: false
      });
    } else {
      return;
    }

    this.currentShape = shape;
    this.drawingLayer.add(shape);
    this.drawingLayer.batchDraw();
  }

  /**
   * Continues drawing a shape
   * 
   * @param position - The current position
   */
  private continueShapeDrawing(position: Point): void {
    if (!this.currentShape || !this.shapeStartPoint || !this.isDrawingShape) return;

    const startX = this.shapeStartPoint.x;
    const startY = this.shapeStartPoint.y;
    const endX = position.x;
    const endY = position.y;

    if (this.currentTool === ToolType.RECTANGLE) {
      const rect = this.currentShape as Konva.Rect;
      const x = Math.min(startX, endX);
      const y = Math.min(startY, endY);
      const width = Math.abs(endX - startX);
      const height = Math.abs(endY - startY);
      rect.x(x);
      rect.y(y);
      rect.width(width);
      rect.height(height);
    } else if (this.currentTool === ToolType.CIRCLE) {
      const ellipse = this.currentShape as Konva.Ellipse;
      const width = Math.abs(endX - startX);
      const height = Math.abs(endY - startY);
      ellipse.x(startX);
      ellipse.y(startY);
      ellipse.radiusX(width / 2);
      ellipse.radiusY(height / 2);
    } else if (this.currentTool === ToolType.DIAMOND) {
      const tag = this.currentShape as Konva.Tag;
      const width = Math.abs(endX - startX);
      const height = Math.abs(endY - startY);
      tag.x(startX);
      tag.y(startY);
      tag.width(width);
      tag.height(height);
    } else if (this.currentTool === ToolType.ARROW) {
      const arrow = this.currentShape as Konva.Arrow;
      arrow.points([startX, startY, endX, endY]);
    } else if (this.currentTool === ToolType.LINE) {
      const line = this.currentShape as Konva.Line;
      line.points([startX, startY, endX, endY]);
    }

    this.drawingLayer!.batchDraw();
  }

  /**
   * Finishes drawing a shape
   */
  private finishShapeDrawing(): void {
    if (!this.currentShape || !this.shapeStartPoint || !this.isDrawingShape) return;

    this.isDrawingShape = false;
    
    // Store the tool before we remove the shape
    const tool = this.currentTool;
    
    // Remove the temporary shape from the drawing layer
    if (this.drawingLayer) {
      this.currentShape.remove();
      this.drawingLayer.batchDraw();
    }

    let objType: ObjectType;
    let position: Point;
    let size: Size;
    let properties: ObjectProperties;

    if (tool === ToolType.RECTANGLE) {
      objType = ObjectType.PROCESS;
      const rect = this.currentShape as Konva.Rect;
      position = { x: rect.x(), y: rect.y() };
      size = { width: rect.width(), height: rect.height() };
      properties = {
        stroke: this.currentColor,
        strokeWidth: this.currentStrokeWidth,
        fill: 'transparent'
      };
    } else if (tool === ToolType.CIRCLE) {
      objType = ObjectType.USE_CASE;
      const ellipse = this.currentShape as Konva.Ellipse;
      position = { x: ellipse.x() - ellipse.radiusX(), y: ellipse.y() - ellipse.radiusY() };
      size = { width: ellipse.radiusX() * 2, height: ellipse.radiusY() * 2 };
      properties = {
        stroke: this.currentColor,
        strokeWidth: this.currentStrokeWidth,
        fill: 'transparent'
      };
    } else if (tool === ToolType.DIAMOND) {
      objType = ObjectType.DECISION;
      const tag = this.currentShape as Konva.Tag;
      position = { x: tag.x() - tag.width() / 2, y: tag.y() - tag.height() / 2 };
      size = { width: tag.width(), height: tag.height() };
      properties = {
        stroke: this.currentColor,
        strokeWidth: this.currentStrokeWidth,
        fill: 'transparent'
      };
    } else if (tool === ToolType.ARROW) {
      objType = ObjectType.ARROW;
      const arrow = this.currentShape as Konva.Arrow;
      const points = arrow.points();
      position = { x: points[0], y: points[1] };
      size = { width: points[2] - points[0], height: points[3] - points[1] };
      properties = {
        stroke: this.currentColor,
        strokeWidth: this.currentStrokeWidth,
        fill: this.currentColor
      };
    } else if (tool === ToolType.LINE) {
      objType = ObjectType.LINE;
      const line = this.currentShape as Konva.Line;
      const points = line.points();
      position = { x: points[0], y: points[1] };
      size = { width: points[2] - points[0], height: points[3] - points[1] };
      properties = {
        stroke: this.currentColor,
        strokeWidth: this.currentStrokeWidth,
        fill: 'transparent'
      };
    } else {
      this.currentShape = null;
      this.shapeStartPoint = null;
      return;
    }

    // Create the final object through ObjectManager
    const id = this.objectManager!.createObject(objType, position, size, properties);
    
    // Save to history
    this.saveState();
    
    // Log change
    this.logChange('Shape Created', `Created ${tool} shape`);
    
    // Update UI object count
    this.uiManager?.updateObjectCount();
    
    console.log(`Finished drawing ${tool} with ID: ${id}`);
    
    this.currentShape = null;
    this.shapeStartPoint = null;
  }

  /**
   * Creates a text input at specified position
   * 
   * @param screenPosition - The screen position for the HTML input element
   * @param canvasPosition - The canvas position for the text object
   */
  private createTextInput(screenPosition: Point, canvasPosition: Point): void {
    // Remove existing text input if any
    if (this.textInput) {
      this.textInput.remove();
    }

    const stage = this.canvasManager!.getStage();
    if (!stage) return;

    const container = stage.container();
    
    // Create text input element positioned at screen coordinates
    this.textInput = document.createElement('input');
    this.textInput.type = 'text';
    this.textInput.placeholder = 'Enter text...';
    this.textInput.style.position = 'absolute';
    this.textInput.style.left = screenPosition.x + 'px';
    this.textInput.style.top = screenPosition.y + 'px';
    this.textInput.style.padding = '5px';
    this.textInput.style.fontSize = '16px';
    this.textInput.style.fontFamily = 'Arial, sans-serif';
    this.textInput.style.border = '1px solid #ccc';
    this.textInput.style.borderRadius = '4px';
    this.textInput.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
    this.textInput.style.zIndex = '1001';
    this.textInput.style.minWidth = '200px';

    container!.appendChild(this.textInput);
    
    // Prevent event propagation to avoid immediate blur
    this.textInput.addEventListener('mousedown', (e) => {
      e.stopPropagation();
    });
    
    // Focus input after a small delay to ensure it's ready
    setTimeout(() => {
      this.textInput?.focus();
    }, 10);

    // Flag to track if we should save on blur
    let shouldSaveOnBlur = false;
    
    // Set flag after input has been active for a moment
    setTimeout(() => {
      shouldSaveOnBlur = true;
    }, 100);

    // Save text on Enter key or when input loses focus
    const saveText = () => {
      if (this.textInput && this.textInput.value.trim()) {
        // Create text object at canvas coordinates (not screen coordinates)
        this.createObject(ObjectType.TEXT, canvasPosition, { width: 200, height: 30 }, this.textInput.value);
      }
      if (this.textInput) {
        this.textInput.remove();
        this.textInput = null;
      }
    };

    this.textInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        saveText();
      } else if (e.key === 'Escape') {
        this.textInput?.remove();
        this.textInput = null;
      }
    });

    this.textInput.addEventListener('blur', () => {
      // Only save if the flag is set (prevents immediate blur on creation)
      if (shouldSaveOnBlur) {
        setTimeout(() => {
          if (this.textInput) {
            saveText();
          }
        }, 100);
      }
    });
  }

  /**
   * Creates a new object on the canvas
   * 
   * @param type - The type of object to create
   * @param position - The position where to create the object
   * @param size - The size of the object
   * @param text - Optional text content
   * 
   * USAGE EXAMPLE:
   * app.createObject(
   *   ObjectType.CLASS,
   *   { x: 100, y: 100 },
   *   { width: 200, height: 100 }
   * );
   */
  public createObject(type: ObjectType, position: Point, size: Size, text?: string): void {
    if (!this.objectManager) return;

    let properties: ObjectProperties | TextProperties;
    
    if (type === ObjectType.TEXT && text) {
      // For text objects, use TextProperties
      properties = {
        stroke: this.currentColor,
        strokeWidth: this.currentStrokeWidth,
        fill: 'transparent',
        text: text,
        fontSize: 16,
        fontFamily: 'Arial, sans-serif'
      };
    } else {
      // For other objects, use ObjectProperties
      properties = {
        stroke: this.currentColor,
        strokeWidth: this.currentStrokeWidth,
        fill: 'white'
      };
    }

    const id = this.objectManager.createObject(type, position, size, properties);
    this.saveState();
    
    // Log change
    if (type === ObjectType.TEXT) {
      this.logChange('Text Created', `Added text: "${text}"`);
    } else {
      this.logChange('Object Created', `Created ${type} object`);
    }
    
    // Update UI object count
    this.uiManager?.updateObjectCount();
    console.log(`Created ${type} object with ID: ${id}`);
  }

  /**
   * Deletes selected objects
   * 
   * USAGE EXAMPLE:
   * app.deleteSelected();
   */
  public deleteSelected(): void {
    if (!this.objectManager) return;

    const selectedIds = this.objectManager.getSelectedIds();
    if (selectedIds.length === 0) {
      console.log('No objects selected');
      return;
    }

    this.objectManager.deleteObjects(selectedIds);
    this.saveState();
    
    // Log change
    this.logChange('Objects Deleted', `Deleted ${selectedIds.length} object(s)`);
    
    // Update UI object count
    this.uiManager?.updateObjectCount();
    console.log(`Deleted ${selectedIds.length} object(s)`);
  }

  /**
   * Undoes the last action
   * 
   * USAGE EXAMPLE:
   * app.undo();
   */
  public undo(): void {
    if (!this.historyManager) return;

    const previousState = this.historyManager.undo();
    if (previousState) {
      this.restoreState(previousState);
      
      // Remove the most recent entry from change history
      this.removeMostRecentChange();
      
      console.log('Undone');
    } else {
      console.log('Nothing to undo');
    }
  }

  /**
   * Redoes the last undone action
   * 
   * USAGE EXAMPLE:
   * app.redo();
   */
  public redo(): void {
    if (!this.historyManager) return;

    const nextState = this.historyManager.redo();
    if (nextState) {
      this.restoreState(nextState);
      console.log('Redone');
    } else {
      console.log('Nothing to redo');
    }
  }

  /**
   * Clears the canvas
   * 
   * USAGE EXAMPLE:
   * app.clearCanvas();
   */
  public clearCanvas(): void {
    if (!this.objectManager || !this.historyManager) return;

    this.objectManager.clearAll();
    this.currentState.objects = [];
    this.currentState.selectedIds = [];
    this.currentState.groupedIds = [];
    this.historyManager.clear();
    this.saveState();
    
    // Log change
    this.logChange('Canvas Cleared', 'All objects removed from canvas');
    
    // Update UI object count
    this.uiManager?.updateObjectCount();
    console.log('Canvas cleared');
  }

  /**
   * Zooms in by 10%
   * 
   * USAGE EXAMPLE:
   * app.zoomIn();
   */
  public zoomIn(): void {
    if (this.canvasManager) {
      this.canvasManager.zoom(1.1);
      console.log('Zoomed in');
    }
  }

  /**
   * Zooms out by 10%
   * 
   * USAGE EXAMPLE:
   * app.zoomOut();
   */
  public zoomOut(): void {
    if (this.canvasManager) {
      this.canvasManager.zoom(0.9);
      console.log('Zoomed out');
    }
  }

  /**
   * Sets the current tool
   * 
   * @param tool - The tool to select
   * 
   * USAGE EXAMPLE:
   * app.setTool(ToolType.PEN);
   */
  public setTool(tool: ToolType): void {
    this.currentTool = tool;
    console.log(`Tool changed to: ${tool}`);
  }

  /**
   * Sets the current color
   * 
   * @param color - The color to use
   * 
   * USAGE EXAMPLE:
   * app.setColor('#FF0000'); // Red
   */
  public setColor(color: string): void {
    this.currentColor = color;
    console.log(`Color changed to: ${color}`);
  }

  /**
   * Sets the current stroke width
   * 
   * @param width - The stroke width in pixels
   * 
   * USAGE EXAMPLE:
   * app.setStrokeWidth(4);
   */
  public setStrokeWidth(width: number): void {
    this.currentStrokeWidth = width;
    console.log(`Stroke width changed to: ${width}px`);
  }

  /**
   * Saves the current state to history
   * 
   * This should be called after every action that changes the canvas.
   */
  private saveState(): void {
    if (!this.historyManager) return;

    // Sync current state with actual objects on canvas
    this.syncCurrentState();
    
    this.historyManager.saveState(this.currentState);
    
    // Update auto-save state
    if (this.storageManager) {
      this.storageManager.updateAutoSaveState(this.currentState);
    }
  }

  /**
   * Syncs current state with actual canvas state
   * 
   * This ensures the state object reflects the actual objects on the canvas.
   */
  private syncCurrentState(): void {
    if (!this.objectManager) return;

    // Get all actual objects from ObjectManager
    const allObjects = this.objectManager.getAllObjects();
    
    // Update current state with actual objects
    this.currentState.objects = allObjects;
    
    // Update selected IDs
    this.currentState.selectedIds = this.objectManager.getSelectedIds();
  }

  /**
   * Updates the current state
   * 
   * This is called when state changes (zoom, pan, etc.)
   */
  private updateState(): void {
    if (this.storageManager) {
      this.storageManager.updateAutoSaveState(this.currentState);
    }
  }

  /**
   * Restores a saved state
   * 
   * @param state - The state to restore
   */
  private restoreState(state: CanvasState): void {
    /**
     * Clear current objects
     */
    if (this.objectManager) {
      this.objectManager.clearAll();
    }

    /**
     * Restore zoom and pan
     */
    if (this.canvasManager) {
      this.canvasManager.setZoom(state.zoom);
      this.canvasManager.setPan(state.pan.x, state.pan.y);
      // Update UI zoom display
      this.uiManager?.updateZoomDisplay(state.zoom);
    }

    /**
     * Restore objects
     */
    if (this.objectManager) {
      state.objects.forEach(obj => {
        this.objectManager!.createObject(
          obj.type,
          obj.position,
          obj.size,
          obj.properties
        );
      });
    }

    /**
     * Update current state
     */
    this.currentState = { ...state };
    
    // Update UI object count
    this.uiManager?.updateObjectCount();
  }

  /**
   * Gets the current zoom level
   * 
   * @returns The current zoom level (e.g., 1.0 = 100%)
   */
  public getZoom(): number {
    return this.currentState.zoom;
  }

  /**
   * Gets the current pan position
   * 
   * @returns The current pan position
   */
  public getPan(): Point {
    return { ...this.currentState.pan };
  }

  /**
   * Gets the number of objects on the canvas
   * 
   * @returns The number of objects
   */
  public getObjectCount(): number {
    return this.currentState.objects.length;
  }

  /**
   * Checks if undo is available
   * 
   * @returns true if undo is available
   */
  public canUndo(): boolean {
    return this.historyManager?.canUndo() || false;
  }

  /**
   * Checks if redo is available
   * 
   * @returns true if redo is available
   */
  public canRedo(): boolean {
    return this.historyManager?.canRedo() || false;
  }

  /**
   * Logs a change to the change history
   * 
   * @param action - The type of action performed
   * @param details - Details about the action
   */
  private logChange(action: string, details: string): void {
    const change = {
      timestamp: Date.now(),
      action,
      details
    };
    
    this.changeHistory.push(change);
    
    // Notify listeners
    this.changeHistoryListeners.forEach(listener => listener(this.changeHistory));
    
    // Limit history to last 100 entries to prevent memory issues
    if (this.changeHistory.length > 100) {
      this.changeHistory.shift();
    }
  }

  /**
   * Gets the change history
   * 
   * @returns Array of changes
   */
  public getChangeHistory(): Array<{
    timestamp: number;
    action: string;
    details: string;
  }> {
    return [...this.changeHistory];
  }

  /**
   * Clears the change history
   */
  public clearChangeHistory(): void {
    this.changeHistory = [];
    this.changeHistoryListeners.forEach(listener => listener(this.changeHistory));
  }

  /**
   * Subscribes to change history updates
   * 
   * @param callback - Function to call when history changes
   */
  public onChangeHistory(callback: Function): void {
    this.changeHistoryListeners.push(callback);
  }

  /**
   * Removes the most recent entry from change history
   * 
   * This is called when undo is performed to keep the change history
   * in sync with the actual canvas state.
   */
  private removeMostRecentChange(): void {
    // Remove the last (most recent) entry
    if (this.changeHistory.length > 0) {
      this.changeHistory.pop();
      
      // Notify listeners that history has changed
      this.changeHistoryListeners.forEach(listener => listener(this.changeHistory));
    }
  }
}
