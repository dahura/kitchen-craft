/**
 * Animation utilities for Kitchen-Craft
 * Provides easing functions and animation helpers for door interactions
 */

// ---------------------------------------------------------------------------
// Functional pattern matching helper
// ---------------------------------------------------------------------------

export type Pattern<V> = (v: V) => boolean;
export type Handler<V, R = unknown> = (v: V) => R;

interface Case<V, R> {
  pattern: Pattern<V>;
  handler: Handler<V, R>;
}

/**
 * Creates a simple pattern-matching builder for the supplied value.
 *
 * Example:
 *   match(x)
 *     .when(v => v < 0, () => 'negative')
 *     .when(v => v === 0, () => 'zero')
 *     ._(   () => 'positive')
 *     .run();
 */
export function match<T, R = unknown>(value: T) {
  let cases: Case<T, R>[] = [];

  const when = (predicate: Pattern<T>, execute: Handler<T, R>) => {
    cases = cases.concat({ pattern: predicate, handler: execute });
    return { when, _, run } as const;
  };

  const _ = (execute: Handler<T, R>) => {
    cases = cases.concat({ pattern: () => true, handler: execute });
    return { run } as const;
  };

  const run = () => cases.find(({ pattern }) => pattern(value))?.handler(value);

  return { when, _ } as const;
}

// ---------------------------------------------------------------------------
// Easing Functions
// ---------------------------------------------------------------------------

export const easeInOutCubic = (t: number): number =>
  match(t)
    .when(
      (t) => t < 0.5,
      (t) => 4 * t * t * t,
    )
    ._(() => 1 - Math.pow(-2 * t + 2, 3) / 2)
    .run() as number;

export const easeOutElastic = (t: number): number =>
  match(t)
    .when(
      (t) => t === 0,
      () => 0,
    )
    .when(
      (t) => t === 1,
      () => 1,
    )
    ._(() => {
      const c4 = (2 * Math.PI) / 3;
      return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
    })
    .run() as number;

export const easeOutBounce = (t: number): number => {
  return match(t)
    .when(
      (t) => t < 1 / 2.75,
      (t) => 7.5625 * t * t,
    )
    .when(
      (t) => t < 2 / 2.75,
      (t) => 7.5625 * (t -= 1.5 / 2.75) * t + 0.75,
    )
    .when(
      (t) => t < 2.5 / 2.75,
      (t) => 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375,
    )
    ._((t) => 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375)
    .run() as number;
};

// ---------------------------------------------------------------------------
// Animation Function
// ---------------------------------------------------------------------------

export function animate(
  duration: number,
  easingFunction: (t: number) => number,
  callback: (progress: number) => void,
) {
  const start = performance.now();

  function step(currentTime: number) {
    const elapsed = currentTime - start;
    const t = Math.min(elapsed / duration, 1); // Normalize time to [0, 1]
    const easedValue = easingFunction(t);

    callback(easedValue);

    if (t < 1) {
      requestAnimationFrame(step);
    }
  }

  requestAnimationFrame(step);
}

// ---------------------------------------------------------------------------
// Door Animation Types
// ---------------------------------------------------------------------------

export interface DoorAnimationState {
  isOpen: boolean;
  isAnimating: boolean;
  rotation: number; // Current rotation in radians
  targetRotation: number; // Target rotation in radians
}

export interface DoorAnimationConfig {
  openAngle: number; // Maximum open angle in radians (default: Math.PI / 2)
  duration: number; // Animation duration in milliseconds
  easing: (t: number) => number; // Easing function
  playSound?: boolean; // Whether to play sound effects
}

export const DEFAULT_DOOR_CONFIG: DoorAnimationConfig = {
  openAngle: Math.PI / 2, // 90 degrees
  duration: 800, // 800ms
  easing: easeInOutCubic,
  playSound: true,
};

// ---------------------------------------------------------------------------
// Door Animation Controller
// ---------------------------------------------------------------------------

export class DoorAnimationController {
  private state: DoorAnimationState;
  private config: DoorAnimationConfig;
  private onStateChange?: (state: DoorAnimationState) => void;
  private currentAnimationId?: number;

  constructor(
    config: Partial<DoorAnimationConfig> = {},
    onStateChange?: (state: DoorAnimationState) => void,
  ) {
    this.config = { ...DEFAULT_DOOR_CONFIG, ...config };
    this.onStateChange = onStateChange;
    this.state = {
      isOpen: false,
      isAnimating: false,
      rotation: 0,
      targetRotation: 0,
    };
  }

  public getState(): DoorAnimationState {
    return { ...this.state };
  }

  public toggle(): void {
    if (this.state.isAnimating) return;

    const newTargetRotation = this.state.isOpen ? 0 : this.config.openAngle;
    this.animateTo(newTargetRotation, !this.state.isOpen);
  }

  public open(): void {
    if (this.state.isOpen || this.state.isAnimating) return;
    this.animateTo(this.config.openAngle, true);
  }

  public close(): void {
    if (!this.state.isOpen || this.state.isAnimating) return;
    this.animateTo(0, false);
  }

  private animateTo(targetRotation: number, willBeOpen: boolean): void {
    if (this.currentAnimationId) {
      cancelAnimationFrame(this.currentAnimationId);
    }

    const startRotation = this.state.rotation;
    const rotationDelta = targetRotation - startRotation;

    this.state = {
      ...this.state,
      isAnimating: true,
      targetRotation,
    };

    this.notifyStateChange();

    // Play opening sound if configured
    if (this.config.playSound && willBeOpen) {
      this.playSound("open");
    }

    animate(this.config.duration, this.config.easing, (progress) => {
      this.state.rotation = startRotation + rotationDelta * progress;
      this.notifyStateChange();

      if (progress === 1) {
        this.state = {
          ...this.state,
          isOpen: willBeOpen,
          isAnimating: false,
          rotation: targetRotation,
        };

        // Play closing sound if configured
        if (this.config.playSound && !willBeOpen) {
          this.playSound("close");
        }

        this.notifyStateChange();
      }
    });
  }

  private playSound(type: "open" | "close"): void {
    // Create a simple audio context for sound effects
    try {
      const audioContext = new (
        window.AudioContext || (window as any).webkitAudioContext
      )();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Different frequencies for open/close sounds
      oscillator.frequency.setValueAtTime(
        type === "open" ? 800 : 400,
        audioContext.currentTime,
      );
      oscillator.type = "sine";

      // Quick fade in/out
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(
        0.1,
        audioContext.currentTime + 0.01,
      );
      gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.1);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch (error) {
      // Silently fail if audio context is not available
      console.debug("Audio context not available for door sounds");
    }
  }

  private notifyStateChange(): void {
    if (this.onStateChange) {
      this.onStateChange(this.getState());
    }
  }

  public dispose(): void {
    if (this.currentAnimationId) {
      cancelAnimationFrame(this.currentAnimationId);
    }
  }
}
