import {
  STAMINA_DRAIN_PER_SECOND,
  STAMINA_MAX,
  STAMINA_RECOVERY_PER_SECOND,
} from "./settings";

export class Stamina {
  current: number = STAMINA_MAX;
  exhausted: boolean = false;

  get ratio(): number {
    return this.current / STAMINA_MAX;
  }

  get canDash(): boolean {
    return !this.exhausted && this.current > 0;
  }

  update(dt: number, isDashing: boolean): void {
    if (isDashing && this.canDash) {
      this.current -= STAMINA_DRAIN_PER_SECOND * dt;
      if (this.current <= 0) {
        this.current = 0;
        this.exhausted = true;
      }
    } else {
      this.current = Math.min(
        STAMINA_MAX,
        this.current + STAMINA_RECOVERY_PER_SECOND * dt,
      );
      if (this.exhausted && this.current >= STAMINA_MAX) {
        this.exhausted = false;
      }
    }
  }
}
