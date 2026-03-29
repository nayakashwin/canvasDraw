export enum ObjectType {
  CLASS = 'class',
  USE_CASE = 'use_case',
  SEQUENCE = 'sequence',
  TERMINATOR = 'terminator',
  PROCESS = 'process',
  DECISION = 'decision',
  DIAMOND = 'diamond',
  FREEHAND = 'freehand',
  TEXT = 'text',
  COMMENT = 'comment',
  ARROW = 'arrow',
  LINE = 'line',
  CURVED_LINE = 'curved_line',
  CONNECTOR = 'connector'
}

export enum ToolType {
  PEN = 'pen',
  ERASER = 'eraser',
  HAND = 'hand',
  SELECTION = 'selection',
  RECTANGLE = 'rectangle',
  CIRCLE = 'circle',
  DIAMOND = 'diamond',
  TEXT = 'text',
  ARROW = 'arrow',
  LINE = 'line'
}

export interface Point { x: number; y: number; }

export interface Size { width: number; height: number; }

export interface Color {
  type: 'solid' | 'gradient';
  value: string;
  gradient?: { type: 'linear' | 'radial'; start: Point; end: Point; stops: { offset: number; color: string }[] };
}

export interface ObjectProperties {
  id: string;
  type: ObjectType;
  position: Point;
  size: Size;
  rotation: number;
  stroke: string;
  strokeWidth: number;
  fill: string;
  opacity: number;
  dash?: number[];
  zIndex?: number;
}

export interface TextProperties extends ObjectProperties {
  type: ObjectType.TEXT;
  text: string;
  fontSize: number;
  fontFamily: string;
  fontStyle: string;
  align: 'left' | 'center' | 'right';
  verticalAlign: 'top' | 'middle' | 'bottom';
}

export interface PathProperties extends ObjectProperties {
  type: ObjectType.FREEHAND | ObjectType.LINE | ObjectType.CURVED_LINE;
  points: Point[];
  tension?: number;
  lineCap?: 'butt' | 'round' | 'square';
  lineJoin?: 'round' | 'bevel' | 'miter';
  closed?: boolean;
}

export interface ConnectorProperties extends ObjectProperties {
  type: ObjectType.CONNECTOR | ObjectType.ARROW;
  startPoint: Point;
  endPoint: Point;
  connectorType: 'straight' | 'curved' | 'orthogonal';
  startArrow?: boolean;
  endArrow?: boolean;
}

export interface CanvasObject {
  id: string;
  type: ObjectType;
  position: Point;
  size: Size;
  properties: ObjectProperties | TextProperties | PathProperties;
  layer: number;
  groupIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CanvasState {
  objects: CanvasObject[];
  backgroundColor: string;
  zoom: number;
  pan: Point;
}

export interface CanvasMouseEvent {
  originalEvent: MouseEvent;
  screenPosition: Point;
  canvasPosition: Point;
  button: number;
  shiftKey: boolean;
  ctrlKey: boolean;
  altKey: boolean;
  metaKey: boolean;
}

export interface HistoryState {
  objects: CanvasObject[];
  timestamp: number;
  action?: string;
}

export interface ExportOptions {
  format: 'png' | 'jpeg' | 'svg' | 'json';
  quality?: number;
  pixelRatio?: number;
  backgroundColor?: string;
}

export interface ImportOptions {
  position?: 'center' | 'cursor' | 'origin';
  scale?: number;
  replace?: boolean;
}