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
        const rect = new Konva.Rect({
          x: position.x,
          y: position.y,
          width: size.width,
          height: size.height,
          stroke: (properties as ObjectProperties).stroke || 'black',
          strokeWidth: (properties as ObjectProperties).strokeWidth || 2,
          fill: (properties as ObjectProperties).fill || 'white',
          opacity: (properties as ObjectProperties).opacity || 1,
          draggable: true,
          name: canvasObject.id // Use ID as name for easy lookup
        });
        
        // Add text if it's a class or process
        if ((properties as TextProperties).text) {
          const text = new Konva.Text({
            x: position.x,
            y: position.y,
            text: (properties as TextProperties).text || '',
            fontSize: (properties as TextProperties).fontSize || 16,
            fontFamily: (properties as TextProperties).fontFamily || 'Arial',
            fill: (properties as ObjectProperties).stroke || 'black',
            width: size.width,
            align: (properties as TextProperties).align || 'center',
            padding: 10
          });
          
          // Center the text in the rectangle
          text.offsetX(text.width() / 2);
          text.offsetY(text.height() / 2);
          text.position({
            x: position.x + size.width / 2,
            y: position.y + size.height / 2
          });
          
          // Group the rectangle and text
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
        const ellipse = new Konva.Ellipse({
          x: position.x + size.width / 2,
          y: position.y + size.height / 2,
          radiusX: size.width / 2,
          radiusY: size.height / 2,
          stroke: (properties as ObjectProperties).stroke || 'black',
          strokeWidth: (properties as ObjectProperties).strokeWidth || 2,
          fill: (properties as ObjectProperties).fill || 'white',
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
        const diamond = new Konva.Tag({
          x: position.x + size.width / 2,
          y: position.y + size.height / 2,
          width: size.width,
          height: size.height,
          rotation: 45,
          stroke: (properties as ObjectProperties).stroke || 'black',
          strokeWidth: (properties as ObjectProperties).strokeWidth || 2,
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
        const line = new Konva.Line({
          points: pathProps.points.flatMap(p => [p.x, p.y]),
          stroke: (properties as ObjectProperties).stroke || 'black',
          strokeWidth: (properties as ObjectProperties).strokeWidth || 2,
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
        const connProps = properties as ConnectorProperties;
        const arrow = new Konva.Arrow({
          points: [0, 0, size.width, size.height],
          x: position.x,
          y: position.y,
          pointerLength: 10,
          pointerWidth: 10,
          fill: (properties as ObjectProperties).stroke || 'black',
          stroke: (properties as ObjectProperties).stroke || 'black',
          strokeWidth: (properties as ObjectProperties).strokeWidth || 2,
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
        const connProps = properties as ConnectorProperties;
        const line = new Konva.Line({
          points: [0, 0, size.width, size.height],
          x: position.x,
          y: position.y,
          stroke: (properties as ObjectProperties).stroke || 'black',
          strokeWidth: (properties as ObjectProperties).strokeWidth || 2,
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
    
    /**
     * Step 4: Remove the object from our tracking
     */
    this.objects.delete(id);
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
    this.selectedIds.clear();
    this.canvasManager.deselectAll();
  }

  /**
   * Updates the selection handles (transformer)
   * 
   * This is called whenever the selection changes to update the visual
   * selection handles on the canvas.
   */
  private updateSelection(): void {
    /**
     * Get all selected nodes
     */
    const selectedNodes = Array.from(this.selectedIds)
      .map(id => this.nodes.get(id))
      .filter((node): node is Konva.Node => node !== undefined);
    
    /**
     * Update the transformer
     */
    if (selectedNodes.length > 0) {
      this.canvasManager.selectNode(selectedNodes);
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
}