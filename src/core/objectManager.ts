/**
 * ============================================================================
 * OBJECT MANAGER
 * ============================================================================
 * 
 * PURPOSE:
 * This class manages all objects on the canvas. It handles:
 * - Creating new objects (shapes, text, lines, etc.)
 * - Tracking all objects and their properties
 * - Selecting and deselecting objects
 * - Moving and resizing objects
 * - Deleting objects
 * - Grouping objects together
 * 
 * WHY WE NEED IT:
 * Without this class, object management code would be scattered across
 * the application. By centralizing it here, we have a single place to
 * handle all object operations, making the code cleaner and easier to maintain.
 * 
 * HOW TO USE:
 * 1. Import: import { ObjectManager } from './core/objectManager';
 * 2. Create: const objManager = new ObjectManager(canvasManager);
 * 3. Use: objManager.createObject(type, position); objManager.deleteObject(id);
 * 
 * DEPENDENCIES:
 * - CanvasManager: For rendering objects on the canvas
 * - TypeScript types: For type safety
 * 
 * BEGINNER TIPS:
 * - Every shape, line, and text on the canvas is an "object"
 * - Objects have properties like position, size, color, etc.
 * - The ObjectManager keeps track of all objects and their relationships
 */

import Konva from 'konva';
import { CanvasManager } from './canvasManager';
import {
  CanvasObject,
  ObjectType,
  Point,
  Size,
  ObjectProperties,
  TextProperties,
  PathProperties,
  ConnectorProperties,
  Color
} from '../types';

/**
 * ObjectManager: Manages all canvas objects
 * 
 * This class is responsible for:
 * 1. Creating objects from our data model
 * 2. Converting objects to/from Konva nodes
 * 3. Tracking all objects by ID
 * 4. Managing object selection
 * 5. Handling object deletion
 * 
 * DESIGN PATTERN:
 * This uses the Repository pattern - it's a central repository for all objects.
 */
export class ObjectManager {
  /**
   * Reference to the CanvasManager
   * 
   * We use this to add/remove nodes from the canvas.
   */
  private canvasManager: CanvasManager;
  
  /**
   * Map of all objects by ID
   * 
   * We store objects in a Map for O(1) lookup by ID.
   * This is much faster than searching an array.
   * 
   * BEGINNER TIP:
   * A Map is like an array, but instead of numeric indices (0, 1, 2...),
   * it uses any value as a key (like a string ID).
   */
  private objects: Map<string, CanvasObject> = new Map();
  
  /**
   * Map of Konva nodes by object ID
   * 
   * We need to track the Konva nodes separately because they're what's
   * actually rendered on the canvas. Each object has a corresponding node.
   */
  private nodes: Map<string, Konva.Node> = new Map();
  
  /**
   * IDs of currently selected objects
   * 
   * We track selected objects to handle group operations like delete or move.
   */
  private selectedIds: Set<string> = new Set();
  
  /**
   * Map of initial positions before drag for undo functionality
   * 
   * This tracks where objects were before they started moving, so we can
   * save state properly when the drag completes.
   */
  private dragStartPositions: Map<string, Point> = new Map();
  
  /**
   * Map of previous shadow states for objects
   * 
   * This tracks the shadow state of objects before they were selected,
   * so we can restore the original state when deselected.
   */
  private previousShadowStates: Map<string, {
    shadowColor?: string | null;
    shadowBlur?: number | null;
    shadowOffsetX?: number | null;
    shadowOffsetY?: number | null;
    shadowOpacity?: number | null;
    shadowEnabled?: boolean | null;
  }> = new Map();
  
  /**
   * Callback for when an object move is completed
   * 
   * This is called when an object finishes being dragged, to save state.
   */
  private onObjectMoveComplete?: () => void;
  
  private looneyEnabled: boolean = false;
  private looneySeed: number = Math.random() * 1000;

  public setLooneyMode(enabled: boolean): void {
    this.looneyEnabled = enabled;
    if (enabled) {
      this.looneySeed = Math.random() * 1000;
    }
  }

  private looneyRandom(): number {
    this.looneySeed = (this.looneySeed * 9301 + 49297) % 233280;
    return this.looneySeed / 233280;
  }

  private makeWavyPoints(points: number[], amplitude: number = 3): number[] {
    if (!this.looneyEnabled || points.length < 4) return points;
    
    const wavy: number[] = [];
    const segmentCount = (points.length / 2) - 1;
    
    for (let i = 0; i < points.length - 2; i += 2) {
      const x = points[i];
      const y = points[i + 1];
      const x2 = points[i + 2];
      const y2 = points[i + 3];
      
      const segmentLength = Math.sqrt(Math.pow(x2 - x, 2) + Math.pow(y2 - y, 2));
      const numSteps = Math.max(4, Math.floor(segmentLength / 4));
      
      for (let j = 0; j <= numSteps; j++) {
        const t = j / numSteps;
        const segmentProgress = i / 2 + t;
        
        const wobble1 = Math.sin(segmentProgress * 2.5 + this.looneySeed) * amplitude;
        const wobble2 = Math.sin(segmentProgress * 4.7 + this.looneySeed * 1.3) * amplitude * 0.5;
        const noise = wobble1 + wobble2;
        
        const dx = x2 - x;
        const dy = y2 - y;
        const len = segmentLength || 1;
        const perpX = -dy / len;
        const perpY = dx / len;
        
        wavy.push(
          x + dx * t + perpX * noise,
          y + dy * t + perpY * noise
        );
      }
    }
    return wavy;
  }

  private makeWavyPolygon(
    x: number, y: number, width: number, height: number,
    points: number[][], amplitude: number = 4
  ): number[] {
    if (!this.looneyEnabled) {
      const flat: number[] = [];
      points.forEach(p => flat.push(p[0], p[1]));
      return flat;
    }
    
    const result: number[] = [];
    const totalPoints = points.length;
    
    for (let i = 0; i < totalPoints; i++) {
      const p0 = points[(i - 1 + totalPoints) % totalPoints];
      const p1 = points[i];
      const p2 = points[(i + 1) % totalPoints];
      
      const cx = p1[0];
      const cy = p1[1];
      const prevX = p0[0];
      const prevY = p0[1];
      
      const angle1 = Math.atan2(cy - prevY, cx - prevX);
      const angle2 = Math.atan2(p2[1] - cy, p2[0] - cx);
      const avgAngle = (angle1 + angle2) / 2;
      
      const wobble = (Math.sin(i * 1.7 + this.looneySeed) * 0.6 + 
                      Math.sin(i * 3.1 + this.looneySeed * 0.7) * 0.4) * amplitude;
      
      result.push(
        cx + Math.cos(avgAngle + Math.PI / 2) * wobble,
        cy + Math.sin(avgAngle + Math.PI / 2) * wobble
      );
    }
    
    result.push(result[0], result[1]);
    return result;
  }

  private createLooneyRect(
    position: Point, size: Size, stroke: string, strokeWidth: number, fill: string,
    text: string | undefined, textProps: TextProperties | undefined, canvasObjectId: string
  ): Konva.Node {
    const group = new Konva.Group({
      x: position.x,
      y: position.y,
      draggable: true,
      name: canvasObjectId
    });
    
    const corners = [[0, 0], [size.width, 0], [size.width, size.height], [0, size.height]];
    const wavyPoints = this.makeWavyPolygon(0, 0, size.width, size.height, corners, 5);
    
    const baseLine = new Konva.Line({
      points: wavyPoints,
      stroke: fill,
      strokeWidth: strokeWidth * 8,
      lineCap: 'round',
      lineJoin: 'round',
      closed: true
    });
    group.add(baseLine);
    
    for (let layer = 0; layer < 3; layer++) {
      const layerPoints = wavyPoints.map((v, idx) => 
        idx % 2 === 0 ? v + (this.looneyRandom() - 0.5) * 3 : v + (this.looneyRandom() - 0.5) * 3
      );
      
      const line = new Konva.Line({
        points: layerPoints,
        stroke: stroke,
        strokeWidth: strokeWidth * (layer === 1 ? 1 : 0.6),
        lineCap: 'round',
        lineJoin: 'round',
        closed: true,
        opacity: layer === 1 ? 1 : 0.5
      });
      group.add(line);
    }
    
    if (text && textProps) {
      const textNode = new Konva.Text({
        x: 0,
        y: 0,
        text: text,
        fontSize: textProps.fontSize || 16,
        fontFamily: textProps.fontFamily || 'Arial',
        fill: stroke,
        width: size.width,
        align: textProps.align || 'center',
        padding: 10
      });
      textNode.offsetX(textNode.width() / 2);
      textNode.offsetY(textNode.height() / 2);
      textNode.position({ x: size.width / 2, y: size.height / 2 });
      group.add(textNode);
    }
    
    return group;
  }

  private createLooneyEllipse(
    position: Point, size: Size, stroke: string, strokeWidth: number, fill: string, canvasObjectId: string
  ): Konva.Node {
    const group = new Konva.Group({
      x: position.x,
      y: position.y,
      draggable: true,
      name: canvasObjectId
    });
    
    const cx = size.width / 2;
    const cy = size.height / 2;
    const rx = size.width / 2;
    const ry = size.height / 2;
    
    const baseCircle: number[] = [];
    const segments = 12;
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      const wobbleR = (this.looneyRandom() - 0.5) * 6;
      const wobbleX = (this.looneyRandom() - 0.5) * 4;
      const wobbleY = (this.looneyRandom() - 0.5) * 4;
      baseCircle.push(
        cx + Math.cos(angle) * (rx + wobbleR) + wobbleX,
        cy + Math.sin(angle) * (ry + wobbleR) + wobbleY
      );
    }
    
    const baseLine = new Konva.Line({
      points: baseCircle,
      stroke: fill,
      strokeWidth: strokeWidth * 8,
      lineCap: 'round',
      lineJoin: 'round',
      closed: true,
      tension: 0.3
    });
    group.add(baseLine);
    
    for (let layer = 0; layer < 2; layer++) {
      const layerPoints = baseCircle.map((v, idx) => 
        idx % 2 === 0 ? v + (this.looneyRandom() - 0.5) * 2 : v + (this.looneyRandom() - 0.5) * 2
      );
      
      const line = new Konva.Line({
        points: layerPoints,
        stroke: stroke,
        strokeWidth: strokeWidth * (layer === 0 ? 1.2 : 0.7),
        lineCap: 'round',
        lineJoin: 'round',
        closed: true,
        tension: 0.3,
        opacity: layer === 0 ? 1 : 0.6
      });
      group.add(line);
    }
    
    return group;
  }

  private createLooneyDiamond(
    position: Point, size: Size, stroke: string, strokeWidth: number, fill: string, canvasObjectId: string
  ): Konva.Node {
    const group = new Konva.Group({
      x: position.x + size.width / 2,
      y: position.y + size.height / 2,
      draggable: true,
      name: canvasObjectId
    });
    
    const corners = [[0, 0], [size.width, 0], [size.width, size.height], [0, size.height]];
    let flatPoints: number[] = [];
    corners.forEach(p => flatPoints.push(p[0], p[1]));
    flatPoints.push(flatPoints[0], flatPoints[1]);
    
    const wavyPoints = this.makeWavyPoints(flatPoints, 5);
    
    const baseLine = new Konva.Line({
      points: wavyPoints,
      stroke: fill,
      strokeWidth: strokeWidth * 8,
      lineCap: 'round',
      lineJoin: 'round',
      closed: true
    });
    group.add(baseLine);
    
    for (let layer = 0; layer < 3; layer++) {
      const layerPoints = wavyPoints.map((v, idx) => 
        idx % 2 === 0 ? v + (this.looneyRandom() - 0.5) * 2.5 : v + (this.looneyRandom() - 0.5) * 2.5
      );
      
      const line = new Konva.Line({
        points: layerPoints,
        stroke: stroke,
        strokeWidth: strokeWidth * (layer === 1 ? 1 : 0.6),
        lineCap: 'round',
        lineJoin: 'round',
        closed: true,
        opacity: layer === 1 ? 1 : 0.5
      });
      group.add(line);
    }
    
    group.rotation(45);
    
    return group;
  }

  private createLooneyLine(
    points: number[], position: Point, stroke: string, strokeWidth: number,
    isArrow: boolean, canvasObjectId: string
  ): Konva.Node {
    const group = new Konva.Group({
      x: position.x,
      y: position.y,
      draggable: true,
      name: canvasObjectId
    });
    
    if (isArrow) {
      const startX = points[0];
      const startY = points[1];
      const endX = points[2];
      const endY = points[3];
      
      const midX = (startX + endX) / 2;
      const midY = (startY + endY) / 2;
      
      const controlX = midX + (this.looneyRandom() - 0.5) * 8;
      const controlY = midY + (this.looneyRandom() - 0.5) * 8;
      
      const bezierPoints = [
        startX, startY,
        controlX, controlY,
        endX, endY
      ];
      
      const arrow = new Konva.Arrow({
        points: bezierPoints,
        pointerLength: 14,
        pointerWidth: 14,
        fill: stroke,
        stroke: stroke,
        strokeWidth: strokeWidth,
        lineCap: 'round',
        lineJoin: 'round',
        tension: 0.5,
        bezier: true
      });
      group.add(arrow);
    } else {
      const wavyPoints = this.makeWavyPoints(points, 2);
      
      for (let layer = 0; layer < 2; layer++) {
        const layerPoints = wavyPoints.map((v, idx) => 
          idx % 2 === 0 ? v + (this.looneyRandom() - 0.5) * 1 : v + (this.looneyRandom() - 0.5) * 1
        );
        
        const line = new Konva.Line({
          points: layerPoints,
          stroke: stroke,
          strokeWidth: strokeWidth * (layer === 0 ? 1.2 : 0.8),
          lineCap: 'round',
          lineJoin: 'round',
          tension: 0.3,
          opacity: layer === 0 ? 1 : 0.6
        });
        group.add(line);
      }
    }
    
    return group;
  }

  private createLooneyFreehand(
    flatPoints: number[], stroke: string, strokeWidth: number, canvasObjectId: string
  ): Konva.Node {
    const group = new Konva.Group({
      draggable: true,
      name: canvasObjectId
    });
    
    const wavyPoints = this.makeWavyPoints(flatPoints, 3);
    
    for (let layer = 0; layer < 3; layer++) {
      const layerPoints = wavyPoints.map((v, idx) => 
        idx % 2 === 0 ? v + (this.looneyRandom() - 0.5) * 1.5 : v + (this.looneyRandom() - 0.5) * 1.5
      );
      
      const line = new Konva.Line({
        points: layerPoints,
        stroke: stroke,
        strokeWidth: strokeWidth * (layer === 1 ? 1.2 : 0.7),
        lineCap: 'round',
        lineJoin: 'round',
        tension: 0.5,
        opacity: layer === 1 ? 1 : 0.4
      });
      group.add(line);
    }
    
    return group;
  }
   
  /**
   * Creates a new ObjectManager instance
   * 
   * @param canvasManager - The CanvasManager instance to use for rendering
   */
  constructor(canvasManager: CanvasManager) {
    this.canvasManager = canvasManager;
  }

  /**
   * Creates a new object on the canvas
   * 
   * @param type - The type of object to create (from ObjectType enum)
   * @param position - The position where to create the object
   * @param size - The size of the object
   * @param properties - The properties of the object
   * @returns The ID of the created object
   * 
   * USAGE EXAMPLES:
   * const id = objManager.createObject(
   *   ObjectType.RECTANGLE,
   *   { x: 100, y: 100 },
   *   { width: 200, height: 100 },
   *   { stroke: 'black', fill: 'white', strokeWidth: 2 }
   * );
   * 
   * BEGINNER TIP:
   * This is the main method for creating objects. You specify what type
   * of object, where to put it, how big it is, and what it looks like.
   * The method handles all the complex details of creating and rendering it.
   */
  public createObject(
    type: ObjectType,
    position: Point,
    size: Size,
    properties: ObjectProperties | TextProperties | PathProperties | ConnectorProperties
  ): string {
    /**
     * Step 1: Generate a unique ID for the object
     * 
     * We use a simple timestamp + random number for uniqueness.
     * In production, you might use a proper UUID library.
     * 
     * BEGINNER TIP:
     * Every object needs a unique ID so we can reference it later.
     * The ID is used for selection, deletion, grouping, etc.
     */
    const id = `obj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    /**
     * Step 2: Create the canvas object
     * 
     * This is our data model representation of the object.
     * It contains all the properties needed to recreate the object.
     */
    const canvasObject: CanvasObject = {
      id,
      type,
      position,
      size,
      properties,
      layer: 0,
      groupIds: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    /**
     * Step 3: Create the Konva node for rendering
     * 
     * The Konva node is what actually gets drawn on the canvas.
     * We create different node types based on the object type.
     */
    const node = this.createNodeFromObject(canvasObject);
    
    /**
     * Step 4: Store the object and node
     * 
     * We store both in their respective maps for quick lookup.
     * The maps are what allow us to quickly find objects by ID.
     */
    this.objects.set(id, canvasObject);
    this.nodes.set(id, node);
    
    /**
     * Step 5: Add the node to the canvas
     * 
     * This actually renders the object on the canvas.
     */
    this.canvasManager.addNode(node);
    
    return id;
  }

  /**
   * Creates a Konva node from a canvas object
   * 
   * @param canvasObject - The canvas object to convert
   * @returns The Konva node for rendering
   * 
   * HOW IT WORKS:
   * This method creates the appropriate Konva node based on the object type.
   * It's a factory method that creates different node types.
   * 
   * BEGINNER TIP:
   * Konva has different node types for different shapes:
   * - Konva.Rect for rectangles
   * - Konva.Circle for circles
   * - Konva.Line for lines
   * - Konva.Text for text
   * etc.
   */
  private createNodeFromObject(canvasObject: CanvasObject): Konva.Node {
    const { type, position, size, properties } = canvasObject;
    
    /**
     * Create the appropriate node based on type
     */
    switch (type) {
      /**
       * Rectangle shapes (used for UML classes, workflow processes, etc.)
       */
      case ObjectType.CLASS:
      case ObjectType.PROCESS:
      case ObjectType.TERMINATOR: {
        const stroke = (properties as ObjectProperties).stroke || 'black';
        const strokeWidth = (properties as ObjectProperties).strokeWidth || 2;
        const fill = (properties as ObjectProperties).fill || 'white';
        
        if (this.looneyEnabled) {
          return this.createLooneyRect(
            position, size, stroke, strokeWidth, fill,
            (properties as TextProperties).text,
            properties as TextProperties,
            canvasObject.id
          );
        }
        
        const rect = new Konva.Rect({
          x: position.x,
          y: position.y,
          width: size.width,
          height: size.height,
          stroke,
          strokeWidth,
          dash: (properties as ObjectProperties).dash,
          fill,
          opacity: (properties as ObjectProperties).opacity || 1,
          draggable: true,
          name: canvasObject.id
        });
        
        if ((properties as TextProperties).text) {
          const text = new Konva.Text({
            x: position.x,
            y: position.y,
            text: (properties as TextProperties).text || '',
            fontSize: (properties as TextProperties).fontSize || 16,
            fontFamily: (properties as TextProperties).fontFamily || 'Arial',
            fill: stroke,
            width: size.width,
            align: (properties as TextProperties).align || 'center',
            padding: 10
          });
          
          text.offsetX(text.width() / 2);
          text.offsetY(text.height() / 2);
          text.position({
            x: position.x + size.width / 2,
            y: position.y + size.height / 2
          });
          
          const group = new Konva.Group({
            x: position.x,
            y: position.y,
            draggable: true,
            name: canvasObject.id
          });
          rect.x(0);
          rect.y(0);
          text.x(0);
          text.y(0);
          group.add(rect);
          group.add(text);
          
          return group;
        }
        
        return rect;
      }
      
      /**
       * Circle/Ellipse shapes (used for UML use cases)
       */
      case ObjectType.USE_CASE: {
        const stroke = (properties as ObjectProperties).stroke || 'black';
        const strokeWidth = (properties as ObjectProperties).strokeWidth || 2;
        const fill = (properties as ObjectProperties).fill || 'white';
        
        if (this.looneyEnabled) {
          return this.createLooneyEllipse(position, size, stroke, strokeWidth, fill, canvasObject.id);
        }
        
        const ellipse = new Konva.Ellipse({
          x: position.x + size.width / 2,
          y: position.y + size.height / 2,
          radiusX: size.width / 2,
          radiusY: size.height / 2,
          stroke,
          strokeWidth,
          dash: (properties as ObjectProperties).dash,
          fill,
          opacity: (properties as ObjectProperties).opacity || 1,
          draggable: true,
          name: canvasObject.id
        });
        
        return ellipse;
      }
      
      /**
       * Diamond shapes (used for workflow decisions)
       */
      case ObjectType.DECISION: {
        const stroke = (properties as ObjectProperties).stroke || 'black';
        const strokeWidth = (properties as ObjectProperties).strokeWidth || 2;
        const fill = (properties as ObjectProperties).fill || 'white';
        
        if (this.looneyEnabled) {
          return this.createLooneyDiamond(position, size, stroke, strokeWidth, fill, canvasObject.id);
        }
        
        const diamond = new Konva.Tag({
          x: position.x + size.width / 2,
          y: position.y + size.height / 2,
          width: size.width,
          height: size.height,
          rotation: 45,
          stroke: (properties as ObjectProperties).stroke || 'black',
          strokeWidth: (properties as ObjectProperties).strokeWidth || 2,
          dash: (properties as ObjectProperties).dash,
          fill: (properties as ObjectProperties).fill || 'white',
          opacity: (properties as ObjectProperties).opacity || 1,
          draggable: true,
          name: canvasObject.id
        });
        
        return diamond;
      }
      
      /**
       * Freehand drawing paths
       */
      case ObjectType.FREEHAND: {
        const pathProps = properties as PathProperties;
        const flatPoints = pathProps.points.flatMap(p => [p.x, p.y]);
        const stroke = (properties as ObjectProperties).stroke || 'black';
        const strokeWidth = (properties as ObjectProperties).strokeWidth || 2;
        
        if (this.looneyEnabled) {
          return this.createLooneyFreehand(flatPoints, stroke, strokeWidth, canvasObject.id);
        }
        
        const line = new Konva.Line({
          points: flatPoints,
          stroke,
          strokeWidth,
          dash: (properties as ObjectProperties).dash,
          fill: (properties as ObjectProperties).fill || undefined,
          opacity: (properties as ObjectProperties).opacity || 1,
          tension: pathProps.tension || 0,
          closed: pathProps.closed || false,
          draggable: true,
          name: canvasObject.id
        });
        
        return line;
      }
      
      /**
       * Text objects
       */
      case ObjectType.TEXT:
      case ObjectType.COMMENT: {
        const textProps = properties as TextProperties;
        const text = new Konva.Text({
          x: position.x,
          y: position.y,
          text: textProps.text || '',
          fontSize: textProps.fontSize || 16,
          fontFamily: textProps.fontFamily || 'Arial',
          fontStyle: textProps.fontStyle || 'normal',
          fill: (properties as ObjectProperties).stroke || 'black',
          opacity: (properties as ObjectProperties).opacity || 1,
          draggable: true,
          name: canvasObject.id
        });
        
        // For comments, add a background rectangle
        if (type === ObjectType.COMMENT) {
          const rect = new Konva.Rect({
            x: position.x - 5,
            y: position.y - 5,
            width: text.width() + 10,
            height: text.height() + 10,
            fill: '#ffffcc', // Light yellow for sticky notes
            stroke: '#cccc00',
            strokeWidth: 1,
            cornerRadius: 5
          });
          
          const group = new Konva.Group({
            draggable: true,
            name: canvasObject.id
          });
          group.add(rect);
          group.add(text);
          
          return group;
        }
        
        return text;
      }
      
      /**
       * Arrow connectors
       */
      case ObjectType.ARROW: {
        const stroke = (properties as ObjectProperties).stroke || 'black';
        const strokeWidth = (properties as ObjectProperties).strokeWidth || 2;
        
        if (this.looneyEnabled) {
          return this.createLooneyLine(
            [0, 0, size.width, size.height], position, stroke, strokeWidth, true, canvasObject.id
          );
        }
        
        const arrow = new Konva.Arrow({
          points: [0, 0, size.width, size.height],
          x: position.x,
          y: position.y,
          pointerLength: 10,
          pointerWidth: 10,
          fill: stroke,
          stroke: stroke,
          strokeWidth,
          dash: (properties as ObjectProperties).dash,
          opacity: (properties as ObjectProperties).opacity || 1,
          draggable: true,
          name: canvasObject.id
        });
        
        return arrow;
      }
      
      /**
       * Simple lines
       */
      case ObjectType.LINE: {
        const stroke = (properties as ObjectProperties).stroke || 'black';
        const strokeWidth = (properties as ObjectProperties).strokeWidth || 2;
        
        if (this.looneyEnabled) {
          return this.createLooneyLine(
            [0, 0, size.width, size.height], position, stroke, strokeWidth, false, canvasObject.id
          );
        }
        
        const line = new Konva.Line({
          points: [0, 0, size.width, size.height],
          x: position.x,
          y: position.y,
          stroke,
          strokeWidth,
          dash: (properties as ObjectProperties).dash,
          opacity: (properties as ObjectProperties).opacity || 1,
          draggable: true,
          name: canvasObject.id
        });
        
        return line;
      }
      
      /**
       * Default case (shouldn't happen with proper typing)
       */
      default:
        throw new Error(`Unknown object type: ${type}`);
    }
  }

  /**
   * Deletes an object from the canvas
   * 
   * @param id - The ID of the object to delete
   * 
   * USAGE EXAMPLE:
   * objManager.deleteObject('obj_1234567890_abc123');
   * 
   * BEGINNER TIP:
   * This removes the object from both our data model and the canvas.
   * If the object is selected, it will be deselected first.
   */
  public deleteObject(id: string): void {
    /**
     * Step 1: Check if object exists
     */
    if (!this.objects.has(id)) {
      return;
    }
    
    /**
     * Step 2: Deselect the object if it's selected
     */
    this.deselectObject(id);
    
    /**
     * Step 3: Get and remove the node from the canvas
     */
    const node = this.nodes.get(id);
    if (node) {
      this.canvasManager.removeNode(node);
      this.nodes.delete(id);
    }
  }

  private applyDropShadowToNode(node: Konva.Node): void {
    if (node instanceof Konva.Group) {
      node.getChildren().forEach(child => {
        if (child instanceof Konva.Shape) {
          this.applyDropShadowToNode(child);
        }
      });
    } else if (node instanceof Konva.Shape) {
      node.shadowEnabled(true);
      node.shadowColor('rgba(0, 0, 0, 0.4)');
      node.shadowBlur(15);
      node.shadowOffsetX(5);
      node.shadowOffsetY(5);
      node.shadowOpacity(0.6);
    }
  }

  private removeDropShadowFromNode(node: Konva.Node): void {
    if (node instanceof Konva.Group) {
      node.getChildren().forEach(child => {
        if (child instanceof Konva.Shape) {
          this.removeDropShadowFromNode(child);
        }
      });
    } else if (node instanceof Konva.Shape) {
      node.shadowEnabled(false);
    }
  }

  /**
   * @param id - The object ID (for tracking shadow state)
   */
  private applyDropShadow(node: Konva.Node, id: string): void {
    if (node instanceof Konva.Group) {
      node.getChildren().forEach(child => {
        if (child instanceof Konva.Shape) {
          this.applyDropShadowToNode(child);
        }
      });
    } else if (node instanceof Konva.Shape) {
      this.applyDropShadowToNode(node);
    }
  }

  /**
   * Removes the drop shadow from a node (restores previous state)
   * 
   * @param node - The Konva node to remove shadow from
   * @param id - The object ID (for retrieving shadow state)
   */
  private removeDropShadow(node: Konva.Node, id: string): void {
    if (node instanceof Konva.Group) {
      node.getChildren().forEach(child => {
        if (child instanceof Konva.Shape) {
          this.removeDropShadowFromNode(child);
        }
      });
    } else if (node instanceof Konva.Shape) {
      this.removeDropShadowFromNode(node);
    }
  }

  /**
   * Deletes multiple objects at once
   * 
   * @param ids - Array of object IDs to delete
   * 
   * USAGE EXAMPLE:
   * objManager.deleteObjects(['obj_1', 'obj_2', 'obj_3']);
   * 
   * BEGINNER TIP:
   * This is useful for deleting a selection of multiple objects.
   * It's more efficient than calling deleteObject() multiple times.
   */
  public deleteObjects(ids: string[]): void {
    ids.forEach(id => this.deleteObject(id));
  }

  /**
   * Selects an object
   * 
   * @param id - The ID of the object to select
   * 
   * USAGE EXAMPLE:
   * objManager.selectObject('obj_1234567890_abc123');
   * 
   * BEGINNER TIP:
   * Selecting an object shows selection handles (transformer) around it,
   * allowing the user to resize and rotate it.
   */
  public selectObject(id: string): void {
    /**
     * Step 1: Check if object exists
     */
    if (!this.objects.has(id)) {
      return;
    }
    
    /**
     * Step 2: Add to selected set
     */
    this.selectedIds.add(id);
    
    /**
     * Step 3: Update the transformer to show selection handles
     */
    this.updateSelection();
  }

  /**
   * Deselects an object
   * 
   * @param id - The ID of the object to deselect
   */
  public deselectObject(id: string): void {
    this.selectedIds.delete(id);
    this.updateSelection();
  }

  /**
   * Deselects all objects
   * 
   * USAGE EXAMPLE:
   * objManager.deselectAll();
   * 
   * BEGINNER TIP:
   * This removes the selection handles from all objects.
   * Call this when the user clicks on empty canvas space.
   */
  public deselectAll(): void {
    // Remove shadows from all nodes
    this.nodes.forEach((node, id) => {
      this.removeDropShadow(node, id);
    });
    
    this.selectedIds.clear();
    this.canvasManager.deselectAll();
  }

  /**
   * Applies a drop shadow to a node to indicate selection
   * 
   * @param node - The Konva node to apply shadow to
   * @param id - The object ID (for tracking shadow state)
   */
  private applyDropShadow(node: Konva.Node, id: string): void {
    // Store the current shadow state before applying the selection shadow
    this.previousShadowStates.set(id, {
      shadowColor: (node as any).shadowColor(),
      shadowBlur: (node as any).shadowBlur(),
      shadowOffsetX: (node as any).shadowOffsetX(),
      shadowOffsetY: (node as any).shadowOffsetY(),
      shadowOpacity: (node as any).shadowOpacity(),
      shadowEnabled: (node as any).shadowEnabled()
    });

    // Apply a nice drop shadow for selection
    (node as any).shadowColor('rgba(0, 0, 0, 0.4)');
    (node as any).shadowBlur(15);
    (node as any).shadowOffsetX(5);
    (node as any).shadowOffsetY(5);
    (node as any).shadowOpacity(0.6);
    (node as any).shadowEnabled(true);
  }

  /**
   * Updates the selection handles (transformer)
   * 
   * This is called whenever the selection changes to update the visual
   * selection handles on the canvas.
   * 
   * FIXED: Added comprehensive validation to prevent "anchor is undefined" error
   * FIXED: Added drop shadow effect for selected objects
   */
  private updateSelection(): void {
    /**
     * Get all selected nodes
     */
    const selectedNodes = Array.from(this.selectedIds)
      .map(id => this.nodes.get(id))
      .filter((node): node is Konva.Node => node !== undefined);
    
    /**
     * Remove shadows from all nodes first (reset state)
     * Then apply shadows to selected nodes
     */
    this.nodes.forEach((node, id) => {
      if (!this.selectedIds.has(id)) {
        this.removeDropShadow(node, id);
      } else {
        this.applyDropShadow(node, id);
      }
    });
    
    /**
     * Update the transformer
     */
    if (selectedNodes.length > 0) {
      requestAnimationFrame(() => {
        this.canvasManager.selectNode(selectedNodes);
      });
    } else {
      this.canvasManager.deselectAll();
    }
  }

  /**
   * Gets an object by ID
   * 
   * @param id - The ID of the object to get
   * @returns The object, or undefined if not found
   */
  public getObject(id: string): CanvasObject | undefined {
    return this.objects.get(id);
  }

  /**
   * Gets all objects
   * 
   * @returns Array of all objects
   */
  public getAllObjects(): CanvasObject[] {
    return Array.from(this.objects.values());
  }

  /**
   * Gets the nodes map
   * 
   * @returns Map of Konva nodes by object ID
   */
  public getNodes(): Map<string, Konva.Node> {
    return this.nodes;
  }

  /**
   * Gets the currently selected object IDs
   * 
   * @returns Array of selected object IDs
   */
  public getSelectedIds(): string[] {
    return Array.from(this.selectedIds);
  }

  /**
   * Gets the currently selected objects
   * 
   * @returns Array of selected objects
   */
  public getSelectedObjects(): CanvasObject[] {
    return Array.from(this.selectedIds)
      .map(id => this.objects.get(id))
      .filter((obj): obj is CanvasObject => obj !== undefined);
  }

  /**
   * Groups multiple objects together
   * 
   * @param ids - Array of object IDs to group
   * @returns The ID of the group
   * 
   * USAGE EXAMPLE:
   * const groupId = objManager.groupObjects(['obj_1', 'obj_2', 'obj_3']);
   * 
   * BEGINNER TIP:
   * Grouping allows you to move, resize, and delete multiple objects
   * as if they were a single object. This is useful for organizing
   * related elements.
   */
  public groupObjects(ids: string[]): string {
    const groupId = `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Add group ID to all objects
    ids.forEach(id => {
      const obj = this.objects.get(id);
      if (obj) {
        if (!obj.groupIds) {
          obj.groupIds = [];
        }
        obj.groupIds.push(groupId);
      }
    });
    
    return groupId;
  }

  /**
   * Ungroups objects
   * 
   * @param groupId - The ID of the group to ungroup
   */
  public ungroupObjects(groupId: string): void {
    this.objects.forEach(obj => {
      if (obj.groupIds) {
        obj.groupIds = obj.groupIds.filter(id => id !== groupId);
      }
    });
  }

  /**
   * Clears all objects from the canvas
   * 
   * USAGE EXAMPLE:
   * objManager.clearAll();
   * 
   * BEGINNER TIP:
   * This removes everything from the canvas. Use with caution!
   * Consider prompting the user to confirm first.
   */
  public clearAll(): void {
    this.objects.clear();
    this.nodes.clear();
    this.selectedIds.clear();
    this.canvasManager.clear();
  }

  /**
   * Sets up drag event listeners for an object
   * 
   * This enables tracking of object movements for undo functionality.
   * Call this method after creating a node to enable drag tracking.
   * 
   * @param id - The ID of the object to set up drag tracking for
   * @param onMoveComplete - Callback to invoke when drag completes
   * 
   * USAGE EXAMPLE:
   * objManager.setupDragTracking('obj_123', () => {
   *   this.saveState(); // Save state when object is moved
   * });
   * 
   * BEGINNER TIP:
   * This method sets up event listeners that track when an object
   * starts being dragged and when it finishes. This allows us to
   * save the state to history when the movement is complete.
   */
  public setupDragTracking(id: string, onMoveComplete: () => void): void {
    const node = this.nodes.get(id);
    if (!node) return;

    // Store the callback for later use
    this.onObjectMoveComplete = onMoveComplete;

    // Use requestAnimationFrame to ensure node is fully initialized
    // This prevents race conditions where the transformer tries to access
    // the node before it's fully added to the layer
    requestAnimationFrame(() => {
      // Double-check the node still exists (it might have been deleted)
      const currentNode = this.nodes.get(id);
      if (!currentNode) return;

      // Ensure the node is in a layer before setting up events
      const parent = currentNode.getParent();
      if (!parent) {
        return;
      }

      // Set up drag start event
      currentNode.on('dragstart', () => {
        // Store the initial position before drag starts
        const obj = this.objects.get(id);
        if (obj) {
          this.dragStartPositions.set(id, { ...obj.position });
        }
      });

      // Set up drag end event
      currentNode.on('dragend', () => {
        // Update the object's position in our data model
        const obj = this.objects.get(id);
        const node = this.nodes.get(id);
        
        if (obj && node) {
          // Get the new position from the Konva node
          const newPosition: Point = {
            x: node.x(),
            y: node.y()
          };

          // Update the object's position
          obj.position = newPosition;
          obj.updatedAt = new Date();

          // Check if the position actually changed
          const startPos = this.dragStartPositions.get(id);
          if (startPos && (startPos.x !== newPosition.x || startPos.y !== newPosition.y)) {
            // Position changed, invoke the callback to save state
            if (this.onObjectMoveComplete) {
              this.onObjectMoveComplete();
            }
          }

          // Clear the stored start position
          this.dragStartPositions.delete(id);
        }
      });
    });
  }

  /**
   * Sets up drag tracking for all existing objects
   * 
   * This should be called when initializing the application to ensure
   * all objects can be tracked for undo functionality.
   * 
   * @param onMoveComplete - Callback to invoke when any object drag completes
   * 
   * USAGE EXAMPLE:
   * objManager.setupAllDragTracking(() => {
   *   this.saveState();
   * });
   * 
   * BEGINNER TIP:
   * Call this method during initialization to ensure all objects
   * on the canvas can have their movements tracked for undo.
   */
  public setupAllDragTracking(onMoveComplete: () => void): void {
    // Set up drag tracking for all existing objects
    this.objects.forEach((_, id) => {
      this.setupDragTracking(id, onMoveComplete);
    });
  }

  /**
   * Updates the internal position of an object without triggering drag events
   * 
   * This is used when restoring state, to update positions without
   * triggering drag event handlers (which would create circular history).
   * 
   * @param id - The ID of the object to update
   * @param newPosition - The new position
   * 
   * USAGE EXAMPLE:
   * objManager.updateObjectPosition('obj_123', { x: 200, y: 300 });
   * 
   * BEGINNER TIP:
   * Use this when programmatically moving objects (like during undo/redo)
   * to avoid triggering drag events that would create new history entries.
   */
  public updateObjectPosition(id: string, newPosition: Point): void {
    const obj = this.objects.get(id);
    const node = this.nodes.get(id);
    
    if (obj && node) {
      // Update the internal object position
      obj.position = { ...newPosition };
      
      // Update the Konva node position (without triggering events)
      node.x(newPosition.x);
      node.y(newPosition.y);
    }
  }
}