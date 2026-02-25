/**
 * ============================================================================
 * GLOBAL TYPE DEFINITIONS
 * ============================================================================
 * 
 * This file contains all the TypeScript interfaces and types used throughout
 * the application. Having all types in one place makes them easy to find and
 * maintain.
 * 
 * BEGINNER GUIDE TO TYPESCRIPT TYPES:
 * - Interfaces define the shape of objects (what properties they have)
 * - Types can be used for simple values, unions, or more complex structures
 * - Enums define a set of named constants
 * - Using types helps catch errors at compile time
 * 
 * HOW TO USE:
 * import { ObjectType, CanvasObject, Point } from '../types';
 */

/**
 * ============================================================================
 * OBJECT TYPES
 * ============================================================================
 */

/**
 * ObjectType: Enumeration of all possible object types on the canvas
 * 
 * ENUMS are a way to define named constants.
 * They make code more readable and prevent typos.
 * 
 * EXAMPLE USAGE:
 * const type: ObjectType = ObjectType.CLASS;
 * if (type === ObjectType.CLASS) { /* handle class * / }
 * 
 * CUSTOMIZATION:
 * Add new object types here when extending the application
 */
export enum ObjectType {
  // UML Diagram Types
  CLASS = 'class',           // UML Class box
  USE_CASE = 'use_case',     // UML Use case ellipse
  SEQUENCE = 'sequence',     // UML Sequence diagram element
  
  // Workflow Diagram Types
  PROCESS = 'process',       // Rectangle for workflow step
  DECISION = 'decision',     // Diamond for decision point
  TERMINATOR = 'terminator', // Rounded rectangle for start/end
  
  // Freehand and Text Types
  FREEHAND = 'freehand',     // Freehand drawing path
  TEXT = 'text',             // Text box
  COMMENT = 'comment',       // Sticky note comment
  
  // Connector Types
  ARROW = 'arrow',           // Arrow connector
  LINE = 'line',             // Straight line connector
  CURVED_LINE = 'curved_line' // Curved bezier line
}

/**
 * DrawingMode: Enumeration of all drawing modes
 * 
 * Modes determine what tools and shapes are available to the user.
 * Each mode has its own set of tools and behaviors.
 * 
 * CUSTOMIZATION:
 * Add new modes here when extending the application
 */
export enum DrawingMode {
  UML = 'uml',                   // UML diagram mode
  WORKFLOW = 'workflow',         // Workflow diagram mode
  FREEHAND = 'freehand',         // Freehand drawing mode
  TEXT_COMMENT = 'text_comment'  // Text and comments mode
}

/**
 * ToolType: Enumeration of all available tools
 * 
 * Tools are the actual drawing instruments users interact with.
 * Different tools create different types of objects.
 * 
 * CUSTOMIZATION:
 * Add new tools here when extending the application
 */
export enum ToolType {
  PEN = 'pen',                   // Freehand pen tool
  ERASER = 'eraser',             // Eraser tool
  HAND = 'hand',                 // Hand tool for panning canvas
  SELECTION = 'selection',       // Selection and move tool
  RECTANGLE = 'rectangle',       // Rectangle shape tool
  CIRCLE = 'circle',             // Circle/ellipse shape tool
  DIAMOND = 'diamond',           // Diamond shape tool
  TEXT = 'text',                 // Text tool
  ARROW = 'arrow',               // Arrow connector tool
  LINE = 'line'                  // Line connector tool
}

/**
 * ============================================================================
 * BASIC DATA STRUCTURES
 * ============================================================================
 */

/**
 * Point: Represents a 2D point with x and y coordinates
 * 
 * Used throughout the application for positions, sizes, and vectors.
 * 
 * BEGINNER TIP:
 * Points are the basic building blocks for all canvas operations.
 * Every object has a position (point), and many operations use points.
 * 
 * EXAMPLE:
 * const point: Point = { x: 100, y: 200 };
 */
export interface Point {
  x: number;
  y: number;
}

/**
 * Size: Represents width and height dimensions
 * 
 * Used for object sizes, canvas dimensions, and UI element sizes.
 * 
 * EXAMPLE:
 * const size: Size = { width: 200, height: 100 };
 */
export interface Size {
  width: number;
  height: number;
}

/**
 * Color: Represents a color
 * 
 * Can be either:
 * - A named color (e.g., 'red', 'blue')
 * - A hex color (e.g., '#FF0000', '#00FF00')
 * - An RGB/RGBA color (e.g., 'rgb(255, 0, 0)', 'rgba(255, 0, 0, 0.5)')
 * 
 * EXAMPLE:
 * const color: Color = '#FF0000';
 * const color2: Color = 'blue';
 */
export type Color = string;

/**
 * ============================================================================
 * CANVAS OBJECT INTERFACES
 * ============================================================================
 */

/**
 * ObjectProperties: Common properties for all canvas objects
 * 
 * These properties apply to most objects on the canvas.
 * Some objects may have additional properties specific to their type.
 * 
 * CUSTOMIZATION:
 * Add more properties here when extending object functionality
 */
export interface ObjectProperties {
  /** Stroke color (outline color) */
  stroke?: Color;
  
  /** Stroke width (thickness of outline) */
  strokeWidth?: number;
  
  /** Fill color (inside color) */
  fill?: Color;
  
  /** Opacity (0 = transparent, 1 = opaque) */
  opacity?: number;
  
  /** Rotation angle in degrees (0 = no rotation) */
  rotation?: number;
  
  /** Whether the object is visible */
  visible?: boolean;
  
  /** Whether the object can be selected */
  selectable?: boolean;
  
  /** Whether the object can be dragged */
  draggable?: boolean;
  
  /** Dash pattern for line styles (e.g., [5, 5] for dashed, [2, 2] for dotted) */
  dash?: number[];
}

/**
 * TextProperties: Properties specific to text objects
 * 
 * These properties apply only to text and comment objects.
 * 
 * CUSTOMIZATION:
 * Add more text properties here (font family, line height, etc.)
 */
export interface TextProperties extends ObjectProperties {
  /** Text content */
  text: string;
  
  /** Font size in pixels */
  fontSize?: number;
  
  /** Font family (e.g., 'Arial', 'Times New Roman') */
  fontFamily?: string;
  
  /** Font style ('normal', 'italic', 'bold', 'bold italic') */
  fontStyle?: string;
  
  /** Text alignment ('left', 'center', 'right') */
  align?: 'left' | 'center' | 'right';
  
  /** Line height multiplier (e.g., 1.5 = 1.5x font size) */
  lineHeight?: number;
}

/**
 * PathProperties: Properties specific to path objects (freehand drawings)
 * 
 * These properties apply only to freehand drawing paths.
 */
export interface PathProperties extends ObjectProperties {
  /** Array of points that make up the path */
  points: Point[];
  
  /** Whether to close the path (connect last point to first) */
  closed?: boolean;
  
  /** Line tension for smooth curves (0 = straight lines, higher = smoother) */
  tension?: number;
}

/**
 * ConnectorProperties: Properties specific to connector objects (arrows, lines)
 * 
 * These properties apply only to connector objects that link other objects.
 */
export interface ConnectorProperties extends ObjectProperties {
  /** ID of the object the connector starts from */
  fromId?: string;
  
  /** ID of the object the connector ends at */
  toId?: string;
  
  /** Starting point (if not connected to an object) */
  fromPoint?: Point;
  
  /** Ending point (if not connected to an object) */
  toPoint?: Point;
  
  /** Whether the connector has an arrow at the start */
  hasStartArrow?: boolean;
  
  /** Whether the connector has an arrow at the end */
  hasEndArrow?: boolean;
  
  /** Type of connector (straight, curved, orthogonal) */
  connectorType?: 'straight' | 'curved' | 'orthogonal';
}

/**
 * CanvasObject: Base interface for all objects on the canvas
 * 
 * This is the main interface for any object that can be drawn on the canvas.
 * All canvas objects must implement this interface.
 * 
 * BEGINNER TIP:
 * Every shape, line, text, and connector on the canvas is a CanvasObject.
 * The application tracks all objects and their properties using this interface.
 * 
 * CUSTOMIZATION:
 * Add more object types by extending this interface
 */
export interface CanvasObject {
  /** Unique identifier for this object */
  id: string;
  
  /** Type of object (from ObjectType enum) */
  type: ObjectType;
  
  /** Position of the object's top-left corner */
  position: Point;
  
  /** Size of the object (width and height) */
  size: Size;
  
  /** General object properties */
  properties: ObjectProperties | TextProperties | PathProperties | ConnectorProperties;
  
  /** Layer index (higher numbers appear on top) */
  layer?: number;
  
  /** Array of object IDs that are grouped with this object */
  groupIds?: string[];
  
  /** When the object was created */
  createdAt?: Date;
  
  /** When the object was last modified */
  updatedAt?: Date;
}

/**
 * ============================================================================
 * CANVAS STATE INTERFACES
 * ============================================================================
 */

/**
 * CanvasState: Represents the complete state of the canvas
 * 
 * This interface captures everything needed to save/restore the canvas.
 * It's used for undo/redo, auto-save, and export functionality.
 * 
 * BEGINNER TIP:
 * Think of CanvasState as a "snapshot" of your entire drawing.
 * It contains every object, the zoom level, pan position, etc.
 * 
 * CUSTOMIZATION:
 * Add more state properties here when extending functionality
 */
export interface CanvasState {
  /** Current zoom level (1.0 = 100%, 2.0 = 200%, 0.5 = 50%) */
  zoom: number;
  
  /** Current pan position (how much the canvas is shifted) */
  pan: Point;
  
  /** All objects on the canvas */
  objects: CanvasObject[];
  
  /** IDs of currently selected objects */
  selectedIds: string[];
  
  /** Groups of object IDs (each array is a group) */
  groupedIds: string[][];
  
  /** History of canvas states for undo/redo */
  history: CanvasState[];
  
  /** Current position in the history array */
  historyIndex: number;
}

/**
 * ============================================================================
 * UI INTERFACES
 * ============================================================================
 */

/**
 * ToolbarButton: Configuration for a toolbar button
 * 
 * Used to dynamically generate toolbar buttons.
 * 
 * CUSTOMIZATION:
 * Add more button properties here (icons, tooltips, etc.)
 */
export interface ToolbarButton {
  /** Unique identifier for the button */
  id: string;
  
  /** Display label for the button */
  label: string;
  
  /** Icon or symbol to display */
  icon?: string;
  
  /** Tool or action this button activates */
  action: ToolType | DrawingMode | 'zoom-in' | 'zoom-out' | 'export' | 'undo' | 'redo';
  
  /** Whether the button is currently active */
  active?: boolean;
  
  /** Whether the button is disabled */
  disabled?: boolean;
  
  /** Tooltip text to show on hover */
  tooltip?: string;
  
  /** Keyboard shortcut (e.g., 'Ctrl+Z') */
  shortcut?: string;
}

/**
 * ColorOption: Configuration for a color in the color picker
 * 
 * Used to define available colors in the color palette.
 * 
 * CUSTOMIZATION:
 * Add more colors or change the default colors here
 */
export interface ColorOption {
  /** Color value (hex, named, or RGB) */
  color: Color;
  
  /** Display name for the color */
  name: string;
}

/**
 * ============================================================================
 * EVENT INTERFACES
 * ============================================================================
 */

/**
 * MouseEvent: Extended mouse event with additional canvas information
 * 
 * Provides mouse position in both screen and canvas coordinates.
 * 
 * BEGINNER TIP:
 * Screen coordinates are pixels on your monitor.
 * Canvas coordinates are adjusted for zoom and pan.
 * 
 * EXAMPLE:
 * const event: CanvasMouseEvent = {
 *   originalEvent: mouseEvent,
 *   screenPosition: { x: 100, y: 200 },
 *   canvasPosition: { x: 150, y: 250 }
 * };
 */
export interface CanvasMouseEvent {
  /** Original browser mouse event */
  originalEvent: MouseEvent;
  
  /** Mouse position in screen coordinates (pixels) */
  screenPosition: Point;
  
  /** Mouse position in canvas coordinates (adjusted for zoom/pan) */
  canvasPosition: Point;
  
  /** Which mouse button was pressed (0 = left, 1 = middle, 2 = right) */
  button: number;
  
  /** Which modifier keys were pressed */
  shiftKey: boolean;
  ctrlKey: boolean;
  altKey: boolean;
  metaKey: boolean;
}

/**
 * KeyboardEvent: Extended keyboard event with additional information
 * 
 * Provides keyboard shortcut information and context.
 */
export interface CanvasKeyboardEvent {
  /** Original browser keyboard event */
  originalEvent: KeyboardEvent;
  
  /** Key that was pressed */
  key: string;
  
  /** Key code (deprecated but still useful) */
  keyCode: number;
  
  /** Which modifier keys were pressed */
  shiftKey: boolean;
  ctrlKey: boolean;
  altKey: boolean;
  metaKey: boolean;
  
  /** Whether the event was prevented */
  prevented: boolean;
}

/**
 * ============================================================================
 * TOOL AND MODE INTERFACES
 * ============================================================================
 */

/**
 * ToolOptions: Configuration options for creating a tool
 * 
 * Passed to tool constructors to customize their behavior.
 * 
 * CUSTOMIZATION:
 * Add more tool options here when extending tools
 */
export interface ToolOptions {
  /** Default stroke color for the tool */
  strokeColor?: Color;
  
  /** Default stroke width for the tool */
  strokeWidth?: number;
  
  /** Default fill color for the tool */
  fillColor?: Color;
  
  /** Default font size (for text tools) */
  fontSize?: number;
  
  /** Additional tool-specific options */
  [key: string]: any;
}

/**
 * ModeOptions: Configuration options for creating a drawing mode
 * 
 * Passed to mode constructors to customize their behavior.
 * 
 * CUSTOMIZATION:
 * Add more mode options here when extending modes
 */
export interface ModeOptions {
  /** Default tool for this mode */
  defaultTool?: ToolType;
  
  /** Available tools in this mode */
  availableTools?: ToolType[];
  
  /** Available object types in this mode */
  availableObjectTypes?: ObjectType[];
  
  /** Additional mode-specific options */
  [key: string]: any;
}

/**
 * ============================================================================
 * EXPORT/IMPORT INTERFACES
 * ============================================================================
 */

  /**
   * ExportOptions: Configuration for exporting the canvas
   * 
   * Used when exporting to different file formats.
   * 
   * CUSTOMIZATION:
   * Add more export options here (format, quality, etc.)
   */
  export interface ExportOptions {
    /** Export format ('json', 'png', 'svg') */
    format: 'json' | 'png' | 'svg';
  
  /** Whether to include metadata (zoom, pan, etc.) */
  includeMetadata?: boolean;
  
  /** Whether to include only selected objects */
  selectedOnly?: boolean;
  
  /** Scale factor for image exports (1 = original size) */
  scale?: number;
  
  /** File name for the export */
  filename?: string;
}

/**
 * ImportOptions: Configuration for importing files
 * 
 * Used when loading exported files back into the application.
 */
export interface ImportOptions {
  /** Import format */
  format: 'json';
  
  /** Whether to clear the canvas before importing */
  clearCanvas?: boolean;
  
  /** Whether to import metadata (zoom, pan, etc.) */
  importMetadata?: boolean;
}
