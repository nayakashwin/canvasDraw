import Konva from 'konva';
import { Point, CanvasMouseEvent } from '../types';

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
    if (!container) throw new Error(`Container element with id '${containerId}' not found`);
    
    this.stage = new Konva.Stage({ container: containerId, width: container.clientWidth, height: container.clientHeight });
    this.layer = new Konva.Layer();
    this.stage.add(this.layer);
    this.createTransformer();
    window.addEventListener('resize', () => this.resize());
    this.setupMouseEvents();
  }

  private createTransformer(): void {
    this.transformer = new Konva.Transformer({
      nodes: [], anchorStroke: '#0099ff', anchorFill: '#ffffff', anchorSize: 10,
      borderStroke: '#0099ff', borderStrokeWidth: 2, borderDash: [6, 6],
      rotateEnabled: true, centeredScaling: true,
      enabledAnchors: ['top-left', 'top-center', 'top-right', 'middle-left', 'middle-right', 'bottom-left', 'bottom-center', 'bottom-right']
    });
    this.layer.add(this.transformer);
    this.transformer.on('transform', () => this.transformer.nodes().forEach(node => node?.getLayer()?.batchDraw()));
    this.transformer.on('transformend', () => this.layer.batchDraw());
  }

  private setupMouseEvents(): void {
    this.stage.on('mousedown', (e) => this.emit('mousedown', this.createCanvasMouseEvent(e.evt)));
    this.stage.on('mousemove', (e) => this.emit('mousemove', this.createCanvasMouseEvent(e.evt)));
    this.stage.on('mouseup', (e) => this.emit('mouseup', this.createCanvasMouseEvent(e.evt)));
    this.stage.on('wheel', (e) => {
      e.evt.preventDefault();
      const pointer = this.stage.getPointerPosition();
      if (pointer) this.zoom(e.evt.deltaY > 0 ? 0.9 : 1.1, pointer.x, pointer.y);
    });
  }

  private createCanvasMouseEvent(evt: MouseEvent): CanvasMouseEvent {
    const pos = this.stage.getRelativePointerPosition();
    return {
      originalEvent: evt, screenPosition: { x: evt.clientX, y: evt.clientY },
      canvasPosition: { x: pos?.x ?? 0, y: pos?.y ?? 0 },
      button: evt.button, shiftKey: evt.shiftKey, ctrlKey: evt.ctrlKey || evt.metaKey, altKey: evt.altKey, metaKey: evt.metaKey
    };
  }

  public zoom(scaleFactor: number, centerX?: number, centerY?: number): void {
    const oldScale = this.stage.scaleX();
    const newScale = Math.max(0.1, Math.min(10, oldScale * scaleFactor));
    const selectedNodes = this.transformer.nodes();
    this.transformer.nodes([]);
    
    if (centerX !== undefined && centerY !== undefined) {
      const mouse = this.stage.getPointerPosition();
      if (mouse) {
        this.stage.scale({ x: newScale, y: newScale });
        this.stage.x(mouse.x - (mouse.x - this.stage.x()) * newScale / oldScale);
        this.stage.y(mouse.y - (mouse.y - this.stage.y()) * newScale / oldScale);
      }
    } else {
      this.stage.scale({ x: newScale, y: newScale });
    }
    
    this.currentZoom = newScale;
    this.currentPan = { x: this.stage.x(), y: this.stage.y() };
    this.layer.batchDraw();
    this.emit('zoom', { zoom: this.currentZoom, pan: this.currentPan });
    if (selectedNodes.length > 0) requestAnimationFrame(() => this.selectNode(selectedNodes));
  }

  public pan(dx: number, dy: number): void {
    this.stage.x(this.stage.x() + dx);
    this.stage.y(this.stage.y() + dy);
    this.currentPan = { x: this.stage.x(), y: this.stage.y() };
    this.layer.batchDraw();
    this.emit('pan', { zoom: this.currentZoom, pan: this.currentPan });
  }

  public setZoom(zoomLevel: number): void { this.zoom(zoomLevel / this.currentZoom); }
  public setPan(x: number, y: number): void { this.pan(x - this.currentPan.x, y - this.currentPan.y); }
  public getZoom(): number { return this.currentZoom; }
  public getPan(): Point { return { ...this.currentPan }; }

  public resize(): void {
    const container = document.getElementById(this.containerId);
    if (container) { this.stage.width(container.clientWidth); this.stage.height(container.clientHeight); this.layer.batchDraw(); }
  }

  public addNode(node: Konva.Node): void { this.layer.add(node as any); }
  public removeNode(node: Konva.Node): void { node.destroy(); this.layer.batchDraw(); }

  public selectNode(node: Konva.Node | Konva.Node[]): void {
    try {
      const nodes = (Array.isArray(node) ? node : [node]).filter(n => n?.getParent());
      if (nodes.length === 0) { this.deselectAll(); return; }
      this.transformer.nodes(nodes as Konva.Node[]);
      this.layer.batchDraw();
    } catch { this.deselectAll(); }
  }

  public deselectAll(): void { this.transformer.nodes([]); this.layer.batchDraw(); }

  public clear(): void {
    this.transformer.nodes([]);
    this.transformer.destroy();
    this.layer.destroyChildren();
    this.createTransformer();
    this.layer.batchDraw();
  }

  public getStage(): Konva.Stage { return this.stage; }
  public getLayer(): Konva.Layer { return this.layer; }
  public getTransformer(): Konva.Transformer { return this.transformer; }

  public setBackgroundColor(color: string): void {
    this.backgroundColor = color;
    (document.getElementById(this.containerId)!).style.backgroundColor = color;
    this.updateTransformerColor();
  }

  public getBackgroundColor(): string { return this.backgroundColor; }

  private getComplementaryColor(): string {
    const map: { [k: string]: string } = {
      '#ffffff': '#0099ff', '#000000': '#ff6600', 'white': '#0099ff', 'black': '#ff6600',
      '#ff0000': '#00ffff', '#00ff00': '#ff00ff', '#0000ff': '#ffff00'
    };
    return map[this.backgroundColor.toLowerCase()] || '#0099ff';
  }

  private updateTransformerColor(): void {
    const color = this.getComplementaryColor();
    this.transformer.anchorStroke(color);
    this.transformer.borderStroke(color);
    this.layer.batchDraw();
  }

  public on(eventName: string, callback: Function): void {
    if (!this.eventListeners.has(eventName)) this.eventListeners.set(eventName, []);
    this.eventListeners.get(eventName)!.push(callback);
  }

  public off(eventName: string, callback?: Function): void {
    if (!this.eventListeners.has(eventName)) return;
    if (callback) {
      const idx = this.eventListeners.get(eventName)!.indexOf(callback);
      if (idx > -1) this.eventListeners.get(eventName)!.splice(idx, 1);
    } else this.eventListeners.delete(eventName);
  }

  private emit(eventName: string, data?: any): void {
    this.eventListeners.get(eventName)?.forEach(cb => cb(data));
  }
}