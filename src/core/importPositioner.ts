import { Point, CanvasObject } from '../types';

export class ImportPositioner {
  static calculateCenterPoint(objects: CanvasObject[]): Point {
    if (objects.length === 0) return { x: 0, y: 0 };

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    objects.forEach(obj => {
      minX = Math.min(minX, obj.position.x);
      minY = Math.min(minY, obj.position.y);
      maxX = Math.max(maxX, obj.position.x + obj.size.width);
      maxY = Math.max(maxY, obj.position.y + obj.size.height);
    });

    return { x: minX + (maxX - minX) / 2, y: minY + (maxY - minY) / 2 };
  }

  static calculateOffset(centerPoint: Point, targetPosition: Point): Point {
    return { x: targetPosition.x - centerPoint.x, y: targetPosition.y - centerPoint.y };
  }

  static applyOffset(objects: CanvasObject[], offset: Point): CanvasObject[] {
    return objects.map(obj => ({
      ...obj,
      position: { x: obj.position.x + offset.x, y: obj.position.y + offset.y }
    }));
  }
}