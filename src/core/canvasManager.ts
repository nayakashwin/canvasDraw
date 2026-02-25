/**
 * ============================================================================
 * CANVAS MANAGER
 * ============================================================================
 * 
 * PURPOSE:
 * This class manages the HTML5 Canvas using Konva.js library. It handles:
 * - Creating and managing the drawing surface (Stage and Layer)
 * - Zoom in/out functionality
 * - Panning (moving) around the canvas
 * - Rendering objects on the canvas
 * - Converting between screen and canvas coordinates
 * 
 * WHY WE NEED IT:
 * Without this class, canvas operations would be scattered throughout the code.
 * By centralizing all canvas logic here, other parts of the app can use simple
 * methods like canvas.zoom() without worrying about complex implementation.
 * 
 * HOW TO USE:
 * 1. Import: import { CanvasManager } from './core/canvasManager';
 * 2. Create: const canvas = new CanvasManager('container-id');
 * 3. Use: canvas.zoom(1.5); canvas.pan(100, 200);
 * 
 * DEPENDENCIES:
 * - Konva.js: The 2D canvas library we're using
 * - TypeScript: For type safety
 * 
 * BEGINNER TIPS:
 * - The canvas is like an infinite piece of paper
 * - Zoom changes how big things appear
 * - Pan moves your view around the canvas
 * - Screen coordinates = pixels on your monitor
 * - Canvas coordinates = adjusted for zoom and pan
 */

import Konva from 'konva';
import { Point, CanvasMouseEvent } from '../types';

/**
 * CanvasManager: Manages all canvas operations using Konva.js
 */
  export class CanvasManager {
  private stage: Konva.Stage;
  private layer: Konva.Layer;
  private transformer: Konva.Transformer;
  private currentZoom: number = 1.0;
  private currentPan: Point = { x: 0, y: 0 };
  private containerId: string;
  private eventListeners: Map<string, Function[]> = new Map();
  private backgroundColor: string = '#ffffff';

  constructor(containerId: string) {
    this.containerId = containerId;
    
    const container = document.getElementById(containerId);
    if (!container) {
      throw new Error(
        `Container element with id '${containerId}' not found. ` +
        'Make sure you have a div with this id in your HTML.'
      );
    }
    
    this.stage = new Konva.Stage({
      container: containerId,
      width: container.clientWidth,
      height: container.clientHeight
    });
    
    this.layer = new Konva.Layer();
    this.stage.add(this.layer);
    
    this.createTransformer();
    
    window.addEventListener('resize', () => this.resize());
    this.setupMouseEvents();
  }

  private createTransformer(): void {
    this.transformer = new Konva.Transformer({
      nodes: [],
      anchorStroke: '#0099ff',
      anchorFill: '#ffffff',
      anchorSize: 10,
      borderStroke: '#0099ff',
      borderStrokeWidth: 2,
      borderDash: [6, 6],
      rotateEnabled: true,
      centeredScaling: true,
      enabledAnchors: [
        'top-left', 'top-center', 'top-right',
        'middle-left', 'middle-right',
        'bottom-left', 'bottom-center', 'bottom-right'
      ]
    });
    this.layer.add(this.transformer);
    this.setupTransformerEvents();
  }

  private setupTransformerEvents(): void {
    this.transformer.on('transform', () => {
      const nodes = this.transformer.nodes();
      nodes.forEach(node => {
        if (node && node.getParent()) {
          node.batchDraw();
        }
      });
    });

    this.transformer.on('transformend', () => {
      this.layer.batchDraw();
    });
  }

  private setupMouseEvents(): void {
    this.stage.on('mousedown', (e: Konva.KonvaEventObject<MouseEvent>) => {
      const event = this.createCanvasMouseEvent(e.evt);
      this.emit('mousedown', event);
    });
    
    this.stage.on('mousemove', (e: Konva.KonvaEventObject<MouseEvent>) => {
      const event = this.createCanvasMouseEvent(e.evt);
      this.emit('mousemove', event);
    });
    
    this.stage.on('mouseup', (e: Konva.KonvaEventObject<MouseEvent>) => {
      const event = this.createCanvasMouseEvent(e.evt);
      this.emit('mouseup', event);
    });
    
    this.stage.on('wheel', (e: Konva.KonvaEventObject<WheelEvent>) => {
      e.evt.preventDefault();
      const scaleFactor = e.evt.deltaY > 0 ? 0.9 : 1.1;
      const pointer = this.stage.getPointerPosition();
      if (pointer) {
        this.zoom(scaleFactor, pointer.x, pointer.y);
      }
    });
  }

  private createCanvasMouseEvent(evt: MouseEvent): CanvasMouseEvent {
    const screenPosition: Point = {
      x: evt.clientX,
      y: evt.clientY
    };
    
    const relativePos = this.stage.getRelativePointerPosition();
    const canvasPosition: Point = {
      x: relativePos?.x ?? 0,
      y: relativePos?.y ?? 0
    };
    
    return {
      originalEvent: evt,
      screenPosition,
      canvasPosition,
      button: evt.button,
      shiftKey: evt.shiftKey,
      ctrlKey: evt.ctrlKey || evt.metaKey,
      altKey: evt.altKey,
      metaKey: evt.metaKey
    };
  }

  public zoom(scaleFactor: number, centerX?: number, centerY?: number): void {
    const oldScale = this.stage.scaleX();
    const newScale = oldScale * scaleFactor;
    
    if (newScale < 0.1 || newScale > 10) {
      return;
    }
    
    // Store currently selected transformer nodes before zooming
    // This allows us to restore the selection after zoom completes
    let selectedNodes: Konva.Node[] = [];
    try {
      selectedNodes = this.transformer.nodes();
      // Clear the transformer nodes before zooming to prevent
      // the "anchor is undefined" error that occurs when the transformer
      // tries to update its anchors during the zoom operation
      this.transformer.nodes([]);
    } catch (error) {
      console.warn('Error clearing transformer nodes before zoom:', error);
      selectedNodes = [];
    }
    
    if (centerX !== undefined && centerY !== undefined) {
      // Get mouse position relative to stage before zooming
      const mouse = this.stage.getPointerPosition();
      if (!mouse) {
        // If we cleared the transformer but can't zoom, restore selection
        if (selectedNodes.length > 0) {
          try {
            this.transformer.nodes(selectedNodes);
          } catch (error) {
            console.warn('Error restoring transformer nodes:', error);
          }
        }
        return;
      }
      
      // Calculate position relative to stage origin (in stage coordinates)
      const stageX = mouse.x - this.stage.x();
      const stageY = mouse.y - this.stage.y();
      
      // Apply new scale
      this.stage.scale({ x: newScale, y: newScale });
      
      // Calculate new stage position to keep mouse over the same point
      // After scaling, the stage-relative position becomes: (stageX, stageY) * newScale / oldScale
      // We want: newStageX + (stageX * newScale / oldScale) = mouse.x
      // So: newStageX = mouse.x - (stageX * newScale / oldScale)
      const newX = mouse.x - (stageX * newScale / oldScale);
      const newY = mouse.y - (stageY * newScale / oldScale);
      
      this.stage.x(newX);
      this.stage.y(newY);
    } else {
      this.stage.scale({ x: newScale, y: newScale });
    }
    
    this.currentZoom = newScale;
    this.currentPan = { x: this.stage.x(), y: this.stage.y() };
    this.layer.batchDraw();
    this.emit('zoom', { zoom: this.currentZoom, pan: this.currentPan });
    
    // Restore the transformer selection after zoom completes
    // Use requestAnimationFrame to ensure the zoom is fully applied
    // before re-attaching the transformer
    if (selectedNodes.length > 0) {
      requestAnimationFrame(() => {
        try {
          // Validate nodes are still valid before re-attaching
          const validNodes = selectedNodes.filter(node => {
            try {
              return node && node.getLayer() && node.draggable();
            } catch {
              return false;
            }
          });
          
          if (validNodes.length > 0) {
            this.transformer.nodes(validNodes);
          }
        } catch (error) {
          console.warn('Error restoring transformer selection after zoom:', error);
          // If restoration fails, leave the transformer cleared to prevent further errors
        }
      });
    }
  }

  public pan(dx: number, dy: number): void {
    this.stage.x(this.stage.x() + dx);
    this.stage.y(this.stage.y() + dy);
    this.currentPan = { x: this.stage.x(), y: this.stage.y() };
    this.layer.batchDraw();
    this.emit('pan', { zoom: this.currentZoom, pan: this.currentPan });
  }

  public setZoom(zoomLevel: number): void {
    const factor = zoomLevel / this.currentZoom;
    this.zoom(factor);
  }

  public setPan(x: number, y: number): void {
    const dx = x - this.currentPan.x;
    const dy = y - this.currentPan.y;
    this.pan(dx, dy);
  }

  public getZoom(): number {
    return this.currentZoom;
  }

  public getPan(): Point {
    return { ...this.currentPan };
  }

  public resize(): void {
    const container = document.getElementById(this.containerId);
    if (container) {
      this.stage.width(container.clientWidth);
      this.stage.height(container.clientHeight);
      this.layer.batchDraw();
    }
  }

  public addNode(node: Konva.Node): void {
    this.layer.add(node as any);
  }

  public removeNode(node: Konva.Node): void {
    node.destroy();
    this.layer.batchDraw();
  }

  public selectNode(node: Konva.Node | Konva.Node[]): void {
    try {
      const nodes = Array.isArray(node) ? node : [node];
      
      const validNodes = nodes.filter(n => n !== null && n !== undefined && n.getParent() !== null);
      
      if (validNodes.length === 0) {
        console.warn('No valid nodes to select');
        this.deselectAll();
        return;
      }
      
      this.transformer.nodes(validNodes as Konva.Node[]);
      this.layer.batchDraw();
    } catch (error) {
      console.error('Error in selectNode:', error);
      this.deselectAll();
    }
  }

  public deselectAll(): void {
    this.transformer.nodes([]);
    this.layer.batchDraw();
  }

  public clear(): void {
    if (this.transformer) {
      this.transformer.nodes([]);
      this.transformer.destroy();
    }
    this.layer.destroyChildren();
    this.createTransformer();
    this.layer.batchDraw();
  }

  public getStage(): Konva.Stage {
    return this.stage;
  }

  public getLayer(): Konva.Layer {
    return this.layer;
  }

  public getTransformer(): Konva.Transformer {
    return this.transformer;
  }

  public setBackgroundColor(color: string): void {
    this.backgroundColor = color;
    const container = document.getElementById(this.containerId);
    if (container) {
      container.style.backgroundColor = color;
    }
    // Update transformer color to be complementary to background
    this.updateTransformerColor();
  }

  public getBackgroundColor(): string {
    return this.backgroundColor;
  }

  /**
   * Gets a complementary color for the selection box
   * 
   * @returns A color that contrasts well with the background
   */
  private getComplementaryColor(): string {
    // Predefined mappings for common colors
    const colorMap: { [key: string]: string } = {
      '#ffffff': '#0099ff',    // white → blue
      '#000000': '#ff6600',    // black → orange
      'white': '#0099ff',
      'black': '#ff6600',
      '#ff0000': '#00ffff',     // red → cyan
      '#00ff00': '#ff00ff',     // green → magenta
      '#0000ff': '#ffff00',     // blue → yellow
      '#ffff00': '#0066ff',     // yellow → dark blue
      '#00ffff': '#ff0000',     // cyan → red
      '#ff00ff': '#00ff00',     // magenta → green
    };
    
    const lowerColor = this.backgroundColor.toLowerCase();
    
    // Check predefined mappings first
    if (colorMap[lowerColor]) {
      return colorMap[lowerColor];
    }
    
    // Default to blue for any other color
    return '#0099ff';
  }

  /**
   * Updates the transformer color based on background color
   */
  private updateTransformerColor(): void {
    const complementaryColor = this.getComplementaryColor();
    this.transformer.anchorStroke(complementaryColor);
    this.transformer.borderStroke(complementaryColor);
    this.layer.batchDraw();
  }

  public on(eventName: string, callback: Function): void {
    if (!this.eventListeners.has(eventName)) {
      this.eventListeners.set(eventName, []);
    }
    this.eventListeners.get(eventName)!.push(callback);
  }

  public off(eventName: string, callback?: Function): void {
    if (!this.eventListeners.has(eventName)) {
      return;
    }
    
    const listeners = this.eventListeners.get(eventName)!;
    if (callback) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    } else {
      this.eventListeners.delete(eventName);
    }
  }

  private emit(eventName: string, data?: any): void {
    if (!this.eventListeners.has(eventName)) {
      return;
    }
    
    const listeners = this.eventListeners.get(eventName)!;
    listeners.forEach(callback => callback(data));
  }
}