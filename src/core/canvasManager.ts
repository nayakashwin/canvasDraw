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
    
    this.transformer = new Konva.Transformer({
      nodes: [],
      anchorStroke: '#0099ff',
      anchorFill: '#ffffff',
      anchorSize: 10,
      borderStroke: '#0099ff',
      borderDash: [3, 3],
      rotateEnabled: true,
      enabledAnchors: [
        'top-left', 'top-center', 'top-right',
        'middle-left', 'middle-right',
        'bottom-left', 'bottom-center', 'bottom-right'
      ]
    });
    this.layer.add(this.transformer);
    
    window.addEventListener('resize', () => this.resize());
    this.setupMouseEvents();
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
    const newScale = this.stage.scaleX() * scaleFactor;
    
    if (newScale < 0.1 || newScale > 10) {
      return;
    }
    
    if (centerX !== undefined && centerY !== undefined) {
      const oldPos = this.stage.getRelativePointerPosition();
      this.stage.scale({ x: newScale, y: newScale });
      const newPos = this.stage.getRelativePointerPosition();
      const dx = newPos!.x - oldPos!.x;
      const dy = newPos!.y - oldPos!.y;
      this.stage.x(this.stage.x() - dx * newScale);
      this.stage.y(this.stage.y() - dy * newScale);
    } else {
      this.stage.scale({ x: newScale, y: newScale });
    }
    
    this.currentZoom = newScale;
    this.currentPan = { x: this.stage.x(), y: this.stage.y() };
    this.layer.batchDraw();
    this.emit('zoom', { zoom: this.currentZoom, pan: this.currentPan });
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
    const nodes = Array.isArray(node) ? node : [node];
    this.transformer.nodes(nodes as Konva.Node[]);
    this.layer.batchDraw();
  }

  public deselectAll(): void {
    this.transformer.nodes([]);
    this.layer.batchDraw();
  }

  public clear(): void {
    this.layer.destroyChildren();
    this.layer.add(this.transformer);
    this.transformer.nodes([]);
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
  }

  public getBackgroundColor(): string {
    return this.backgroundColor;
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