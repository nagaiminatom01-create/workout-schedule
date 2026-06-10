export class Rect {
  x: number;
  y: number;
  width: number;
  height: number;

  constructor(x: number, y: number, width: number, height: number) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  static fromCenter(cx: number, cy: number, size: number): Rect {
    return new Rect(cx - size / 2, cy - size / 2, size, size);
  }

  get left(): number {
    return this.x;
  }

  get right(): number {
    return this.x + this.width;
  }

  get top(): number {
    return this.y;
  }

  get bottom(): number {
    return this.y + this.height;
  }

  get center(): { x: number; y: number } {
    return {
      x: this.x + this.width / 2,
      y: this.y + this.height / 2,
    };
  }

  set center(pos: { x: number; y: number }) {
    this.x = pos.x - this.width / 2;
    this.y = pos.y - this.height / 2;
  }

  copy(): Rect {
    return new Rect(this.x, this.y, this.width, this.height);
  }

  inflate(dx: number, dy: number): Rect {
    return new Rect(
      this.x - dx / 2,
      this.y - dy / 2,
      this.width + dx,
      this.height + dy,
    );
  }

  colliderect(other: Rect): boolean {
    return (
      this.left < other.right &&
      this.right > other.left &&
      this.top < other.bottom &&
      this.bottom > other.top
    );
  }
}
