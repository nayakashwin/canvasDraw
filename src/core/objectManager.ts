import Konva from 'konva';
import { CanvasManager } from './canvasManager';
import { CanvasObject, ObjectType, Point, Size, ObjectProperties, TextProperties, PathProperties } from '../types';

export class ObjectManager {
  private canvasManager: CanvasManager;
  private objects: Map<string, CanvasObject> = new Map();
  private nodes: Map<string, Konva.Node> = new Map();
  private selectedIds: Set<string> = new Set();
  private dragStartPositions: Map<string, Point> = new Map();
  private onObjectMoveComplete?: () => void;
  private looneyEnabled: boolean = false;
  private looneySeed: number = Math.random() * 1000;

  constructor(canvasManager: CanvasManager) { this.canvasManager = canvasManager; }

  public setLooneyMode(enabled: boolean): void {
    this.looneyEnabled = enabled;
    if (enabled) this.looneySeed = Math.random() * 1000;
  }

  private looneyRandom(): number {
    this.looneySeed = (this.looneySeed * 9301 + 49297) % 233280;
    return this.looneySeed / 233280;
  }

  private makeWavyPoints(points: number[], amplitude: number = 3): number[] {
    if (!this.looneyEnabled || points.length < 4) return points;
    const wavy: number[] = [];
    for (let i = 0; i < points.length - 2; i += 2) {
      const [x, y, x2, y2] = [points[i], points[i + 1], points[i + 2], points[i + 3]];
      const len = Math.sqrt((x2 - x) ** 2 + (y2 - y) ** 2) || 1;
      const numSteps = Math.max(4, Math.floor(len / 4));
      for (let j = 0; j <= numSteps; j++) {
        const t = j / numSteps;
        const noise = Math.sin((i / 2 + t) * 2.5 + this.looneySeed) * amplitude +
                      Math.sin((i / 2 + t) * 4.7 + this.looneySeed * 1.3) * amplitude * 0.5;
        wavy.push(x + (x2 - x) * t + (-(y2 - y) / len) * noise, y + (y2 - y) * t + ((x2 - x) / len) * noise);
      }
    }
    return wavy;
  }

  public createObject(type: ObjectType, position: Point, size: Size, properties: ObjectProperties | TextProperties | PathProperties): string {
    const id = `obj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const canvasObject: CanvasObject = { id, type, position, size, properties, layer: 0, groupIds: [], createdAt: new Date(), updatedAt: new Date() };
    const node = this.createNodeFromObject(canvasObject);
    this.objects.set(id, canvasObject);
    this.nodes.set(id, node);
    this.canvasManager.addNode(node);
    return id;
  }

  private createNodeFromObject(obj: CanvasObject): Konva.Node {
    const { type, position, size, properties } = obj;
    const stroke = (properties as ObjectProperties).stroke || 'black';
    const strokeWidth = (properties as ObjectProperties).strokeWidth || 2;
    const fill = (properties as ObjectProperties).fill || 'white';
    const dash = (properties as ObjectProperties).dash;
    const opacity = (properties as ObjectProperties).opacity || 1;

    switch (type) {
      case ObjectType.CLASS:
      case ObjectType.PROCESS:
      case ObjectType.TERMINATOR: {
        if (this.looneyEnabled) return this.createLooneyRect(position, size, stroke, strokeWidth, fill, obj.id);
        const rect = new Konva.Rect({ x: position.x, y: position.y, width: size.width, height: size.height, stroke, strokeWidth, dash, fill, opacity, draggable: true, name: obj.id });
        const text = (properties as TextProperties).text;
        if (text) {
          const textNode = new Konva.Text({ text, fontSize: (properties as TextProperties).fontSize || 16, fontFamily: (properties as TextProperties).fontFamily || 'Arial', fill: stroke, width: size.width, align: 'center', padding: 10 });
          const group = new Konva.Group({ x: position.x, y: position.y, draggable: true, name: obj.id });
          rect.x(0); rect.y(0);
          group.add(rect);
          textNode.position({ x: size.width / 2 - textNode.width() / 2, y: size.height / 2 - textNode.height() / 2 });
          group.add(textNode);
          return group;
        }
        return rect;
      }
      case ObjectType.USE_CASE: {
        if (this.looneyEnabled) return this.createLooneyEllipse(position, size, stroke, strokeWidth, fill, obj.id);
        return new Konva.Ellipse({ x: position.x + size.width / 2, y: position.y + size.height / 2, radiusX: size.width / 2, radiusY: size.height / 2, stroke, strokeWidth, dash, fill, opacity, draggable: true, name: obj.id });
      }
      case ObjectType.DECISION: {
        if (this.looneyEnabled) return this.createLooneyDiamond(position, size, stroke, strokeWidth, fill, obj.id);
        return new Konva.Tag({ x: position.x + size.width / 2, y: position.y + size.height / 2, width: size.width, height: size.height, rotation: 45, stroke, strokeWidth, dash, fill, opacity, draggable: true, name: obj.id });
      }
      case ObjectType.FREEHAND: {
        const pathProps = properties as PathProperties;
        const pts = pathProps.points.flatMap(p => [p.x, p.y]);
        if (this.looneyEnabled) return this.createLooneyFreehand(pts, stroke, strokeWidth, obj.id);
        return new Konva.Line({ points: pts, stroke, strokeWidth, dash, fill, opacity, tension: pathProps.tension || 0, closed: pathProps.closed || false, draggable: true, name: obj.id });
      }
      case ObjectType.TEXT:
      case ObjectType.COMMENT: {
        const tp = properties as TextProperties;
        const textNode = new Konva.Text({ x: position.x, y: position.y, text: tp.text || '', fontSize: tp.fontSize || 16, fontFamily: tp.fontFamily || 'Arial', fontStyle: tp.fontStyle || 'normal', fill: stroke, opacity, draggable: true, name: obj.id });
        if (type === ObjectType.COMMENT) {
          const rect = new Konva.Rect({ x: position.x - 5, y: position.y - 5, width: textNode.width() + 10, height: textNode.height() + 10, fill: '#ffffcc', stroke: '#cccc00', strokeWidth: 1, cornerRadius: 5 });
          const group = new Konva.Group({ draggable: true, name: obj.id });
          group.add(rect); group.add(textNode);
          return group;
        }
        return textNode;
      }
      case ObjectType.ARROW: {
        if (this.looneyEnabled) return this.createLooneyLine([0, 0, size.width, size.height], position, stroke, strokeWidth, true, obj.id);
        return new Konva.Arrow({ points: [0, 0, size.width, size.height], x: position.x, y: position.y, pointerLength: 10, pointerWidth: 10, fill: stroke, stroke, strokeWidth, dash, opacity, draggable: true, name: obj.id });
      }
      case ObjectType.LINE: {
        if (this.looneyEnabled) return this.createLooneyLine([0, 0, size.width, size.height], position, stroke, strokeWidth, false, obj.id);
        return new Konva.Line({ points: [0, 0, size.width, size.height], x: position.x, y: position.y, stroke, strokeWidth, dash, opacity, draggable: true, name: obj.id });
      }
      default: throw new Error(`Unknown object type: ${type}`);
    }
  }

  private createLooneyRect(pos: Point, size: Size, stroke: string, sw: number, fill: string, id: string): Konva.Node {
    const group = new Konva.Group({ x: pos.x, y: pos.y, draggable: true, name: id });
    const corners = [[0, 0], [size.width, 0], [size.width, size.height], [0, size.height]];
    const pts: number[] = [];
    corners.forEach(p => pts.push(p[0], p[1]));
    pts.push(pts[0], pts[1]);
    const wavy = this.makeWavyPoints(pts, 5);
    group.add(new Konva.Line({ points: wavy, stroke: fill, strokeWidth: sw * 8, lineCap: 'round', lineJoin: 'round', closed: true }));
    for (let i = 0; i < 3; i++) group.add(new Konva.Line({ points: wavy.map((v, idx) => v + (idx % 2 === 0 ? (this.looneyRandom() - 0.5) * 3 : (this.looneyRandom() - 0.5) * 3)), stroke, strokeWidth: sw * (i === 1 ? 1 : 0.6), lineCap: 'round', lineJoin: 'round', closed: true, opacity: i === 1 ? 1 : 0.5 }));
    return group;
  }

  private createLooneyEllipse(pos: Point, size: Size, stroke: string, sw: number, fill: string, id: string): Konva.Node {
    const group = new Konva.Group({ x: pos.x, y: pos.y, draggable: true, name: id });
    const [cx, cy, rx, ry] = [size.width / 2, size.height / 2, size.width / 2, size.height / 2];
    const pts: number[] = [];
    for (let i = 0; i <= 12; i++) { const a = (i / 12) * Math.PI * 2; pts.push(cx + Math.cos(a) * rx + (this.looneyRandom() - 0.5) * 4, cy + Math.sin(a) * ry + (this.looneyRandom() - 0.5) * 4); }
    group.add(new Konva.Line({ points: pts, stroke: fill, strokeWidth: sw * 8, lineCap: 'round', lineJoin: 'round', closed: true, tension: 0.3 }));
    for (let i = 0; i < 2; i++) group.add(new Konva.Line({ points: pts.map(v => v + (this.looneyRandom() - 0.5) * 2), stroke, strokeWidth: sw * (i === 0 ? 1.2 : 0.7), lineCap: 'round', lineJoin: 'round', closed: true, tension: 0.3, opacity: i === 0 ? 1 : 0.6 }));
    return group;
  }

  private createLooneyDiamond(pos: Point, size: Size, stroke: string, sw: number, fill: string, id: string): Konva.Node {
    const group = new Konva.Group({ x: pos.x + size.width / 2, y: pos.y + size.height / 2, draggable: true, name: id });
    const pts = this.makeWavyPoints([0, 0, size.width, 0, size.width, size.height, 0, size.height, 0, 0], 5);
    group.add(new Konva.Line({ points: pts, stroke: fill, strokeWidth: sw * 8, lineCap: 'round', lineJoin: 'round', closed: true }));
    for (let i = 0; i < 3; i++) group.add(new Konva.Line({ points: pts.map(v => v + (this.looneyRandom() - 0.5) * 2.5), stroke, strokeWidth: sw * (i === 1 ? 1 : 0.6), lineCap: 'round', lineJoin: 'round', closed: true, opacity: i === 1 ? 1 : 0.5 }));
    group.rotation(45);
    return group;
  }

  private createLooneyLine(pts: number[], pos: Point, stroke: string, sw: number, isArrow: boolean, id: string): Konva.Node {
    const group = new Konva.Group({ x: pos.x, y: pos.y, draggable: true, name: id });
    const wavy = this.makeWavyPoints(pts, 2);
    if (isArrow) group.add(new Konva.Arrow({ points: [pts[0], pts[1], (pts[0] + pts[2]) / 2 + (this.looneyRandom() - 0.5) * 8, (pts[1] + pts[3]) / 2 + (this.looneyRandom() - 0.5) * 8, pts[2], pts[3]], pointerLength: 14, pointerWidth: 14, fill: stroke, stroke, strokeWidth: sw, lineCap: 'round', lineJoin: 'round', tension: 0.5, bezier: true }));
    else for (let i = 0; i < 2; i++) group.add(new Konva.Line({ points: wavy.map(v => v + (this.looneyRandom() - 0.5) * 1), stroke, strokeWidth: sw * (i === 0 ? 1.2 : 0.8), lineCap: 'round', lineJoin: 'round', tension: 0.3, opacity: i === 0 ? 1 : 0.6 }));
    return group;
  }

  private createLooneyFreehand(pts: number[], stroke: string, sw: number, id: string): Konva.Node {
    const group = new Konva.Group({ draggable: true, name: id });
    const wavy = this.makeWavyPoints(pts, 3);
    for (let i = 0; i < 3; i++) group.add(new Konva.Line({ points: wavy.map(v => v + (this.looneyRandom() - 0.5) * 1.5), stroke, strokeWidth: sw * (i === 1 ? 1.2 : 0.7), lineCap: 'round', lineJoin: 'round', tension: 0.5, opacity: i === 1 ? 1 : 0.4 }));
    return group;
  }

  public deleteObject(id: string): void {
    if (!this.objects.has(id)) return;
    this.deselectObject(id);
    const node = this.nodes.get(id);
    if (node) { this.canvasManager.removeNode(node); this.nodes.delete(id); }
    this.objects.delete(id);
  }

  public deleteObjects(ids: string[]): void { ids.forEach(id => this.deleteObject(id)); }

  private applyDropShadow(node: Konva.Node): void {
    if (node instanceof Konva.Group) node.getChildren().forEach(c => c instanceof Konva.Shape && this.applyDropShadow(c));
    else if (node instanceof Konva.Shape) { node.shadowEnabled(true); node.shadowColor('rgba(0,0,0,0.4)'); node.shadowBlur(15); node.shadowOffsetX(5); node.shadowOffsetY(5); node.shadowOpacity(0.6); }
  }

  private removeDropShadow(node: Konva.Node): void {
    if (node instanceof Konva.Group) node.getChildren().forEach(c => c instanceof Konva.Shape && this.removeDropShadow(c));
    else if (node instanceof Konva.Shape) node.shadowEnabled(false);
  }

  public selectObject(id: string): void { if (this.objects.has(id)) { this.selectedIds.add(id); this.updateSelection(); } }
  public deselectObject(id: string): void { this.selectedIds.delete(id); this.updateSelection(); }
  public deselectAll(): void { this.nodes.forEach(n => this.removeDropShadow(n)); this.selectedIds.clear(); this.canvasManager.deselectAll(); }

  private updateSelection(): void {
    const selectedNodes = Array.from(this.selectedIds).map(id => this.nodes.get(id)).filter((n): n is Konva.Node => n !== undefined);
    this.nodes.forEach((node, id) => this.selectedIds.has(id) ? this.applyDropShadow(node) : this.removeDropShadow(node));
    if (selectedNodes.length > 0) requestAnimationFrame(() => this.canvasManager.selectNode(selectedNodes));
    else this.canvasManager.deselectAll();
  }

  public getObject(id: string): CanvasObject | undefined { return this.objects.get(id); }
  public getAllObjects(): CanvasObject[] { return Array.from(this.objects.values()); }
  public getNodes(): Map<string, Konva.Node> { return this.nodes; }
  public getSelectedIds(): string[] { return Array.from(this.selectedIds); }
  public getSelectedObjects(): CanvasObject[] { return Array.from(this.selectedIds).map(id => this.objects.get(id)).filter((o): o is CanvasObject => o !== undefined); }

  public groupObjects(ids: string[]): string {
    const groupId = `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    ids.forEach(id => { const obj = this.objects.get(id); if (obj) { if (!obj.groupIds) obj.groupIds = []; obj.groupIds.push(groupId); } });
    return groupId;
  }

  public ungroupObjects(groupId: string): void { this.objects.forEach(obj => { if (obj.groupIds) obj.groupIds = obj.groupIds.filter(id => id !== groupId); }); }
  public clearAll(): void { this.objects.clear(); this.nodes.clear(); this.selectedIds.clear(); this.canvasManager.clear(); }

  public setupDragTracking(id: string, onMoveComplete: () => void): void {
    const node = this.nodes.get(id);
    if (!node) return;
    this.onObjectMoveComplete = onMoveComplete;
    requestAnimationFrame(() => {
      const n = this.nodes.get(id);
      if (!n || !n.getParent()) return;
      n.on('dragstart', () => { const obj = this.objects.get(id); if (obj) this.dragStartPositions.set(id, { ...obj.position }); });
      n.on('dragend', () => {
        const obj = this.objects.get(id);
        const node = this.nodes.get(id);
        if (obj && node) {
          obj.position = { x: node.x(), y: node.y() };
          obj.updatedAt = new Date();
          const startPos = this.dragStartPositions.get(id);
          if (startPos && (startPos.x !== obj.position.x || startPos.y !== obj.position.y) && this.onObjectMoveComplete) this.onObjectMoveComplete();
          this.dragStartPositions.delete(id);
        }
      });
    });
  }

  public setupAllDragTracking(onMoveComplete: () => void): void { this.objects.forEach((_, id) => this.setupDragTracking(id, onMoveComplete)); }
  public updateObjectPosition(id: string, pos: Point): void { const obj = this.objects.get(id); const node = this.nodes.get(id); if (obj && node) { obj.position = { ...pos }; node.x(pos.x); node.y(pos.y); } }
}