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
      (t) => 4 * t * t * t
    )
    ._(() => 1 - Math.pow(-2 * t + 2, 3) / 2)
    .run() as number;

export const easeOutElastic = (t: number): number =>
  match(t)
    .when(
      (t) => t === 0,
      () => 0
    )
    .when(
      (t) => t === 1,
      () => 1
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
      (t) => 7.5625 * t * t
    )
    .when(
      (t) => t < 2 / 2.75,
      (t) => {
        // Original algorithm uses: 7.5625 * (t -= 1.5 / 2.75) * t + 0.75
        // biome-ignore lint: matches original Svelte algorithm behavior
        t -= 1.5 / 2.75;
        return 7.5625 * t * t + 0.75;
      }
    )
    .when(
      (t) => t < 2.5 / 2.75,
      (t) => {
        // Original algorithm uses: 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375
        // biome-ignore lint: matches original Svelte algorithm behavior
        t -= 2.25 / 2.75;
        return 7.5625 * t * t + 0.9375;
      }
    )
    ._((t) => {
      // Original algorithm uses: 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375
      // biome-ignore lint: matches original Svelte algorithm behavior
      t -= 2.625 / 2.75;
      return 7.5625 * t * t + 0.984375;
    })
    .run() as number;
};
// ---------------------------------------------------------------------------
// Animation Function
// ---------------------------------------------------------------------------

export function animate(
  duration: number,
  easingFunction: (t: number) => number,
  callback: (progress: number) => void
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
  duration: 1000, // 1000ms (as in Svelte example)
  easing: easeInOutCubic,
  playSound: true,
};

// ---------------------------------------------------------------------------
// Sound System
// ---------------------------------------------------------------------------

class SoundManager {
  private sounds: Map<string, HTMLAudioElement> = new Map();
  private audioContext: AudioContext | null = null;

  constructor() {
    // Initialize audio context on first user interaction
    if (typeof window !== "undefined") {
      // Try to create audio context (may require user interaction)
      try {
        this.audioContext = new (window.AudioContext ||
          // biome-ignore lint/suspicious/noExplicitAny: webkitAudioContext is not in types
          (window as any).webkitAudioContext)();
      } catch {
        console.debug("Audio context not available");
      }
    }
  }

  loadSound(name: string, url: string): void {
    if (typeof window === "undefined") return;

    const audio = new Audio(url);
    audio.preload = "auto";
    this.sounds.set(name, audio);
  }

  playSound(name: string): void {
    const audio = this.sounds.get(name);
    if (audio) {
      // Reset audio to start and play
      audio.currentTime = 0;
      audio.play().catch((error) => {
        console.debug(`Failed to play sound ${name}:`, error);
      });
    }
  }
}

// Global sound manager instance
export const soundManager = new SoundManager();

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
    onStateChange?: (state: DoorAnimationState) => void
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

    // Sound timing configuration
    const ANIMATION_DURATION = this.config.duration;
    const SOUND_DURATION = 100;
    const SOUND_DELAY = 0;
    const SOUND_START_OFFSET =
      ANIMATION_DURATION - (SOUND_DURATION - SOUND_DELAY);

    let soundPlayed = false;

    this.state = {
      ...this.state,
      isAnimating: true,
      targetRotation,
    };

    this.notifyStateChange();

    // Play opening sound at start if configured
    if (this.config.playSound && willBeOpen) {
      soundManager.playSound("doorOpen");
    }

    animate(this.config.duration, this.config.easing, (progress) => {
      this.state.rotation = startRotation + rotationDelta * progress;
      this.notifyStateChange();

      // Play closing sound slightly before animation ends
      if (
        this.config.playSound &&
        !willBeOpen &&
        !soundPlayed &&
        progress >= SOUND_START_OFFSET / ANIMATION_DURATION
      ) {
        soundManager.playSound("doorClose");
        soundPlayed = true;
      }

      if (progress === 1) {
        this.state = {
          ...this.state,
          isOpen: willBeOpen,
          isAnimating: false,
          rotation: targetRotation,
        };

        this.notifyStateChange();
      }
    });
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

// ---------------------------------------------------------------------------
// Double Door Animation Controller (Left/Right)
// ---------------------------------------------------------------------------

export interface DoubleDoorAnimationState {
  leftDoor: {
    isOpen: boolean;
    isAnimating: boolean;
    rotation: number;
  };
  rightDoor: {
    isOpen: boolean;
    isAnimating: boolean;
    rotation: number;
  };
}

export interface DoubleDoorAnimationConfig extends DoorAnimationConfig {
  // Inherits all door config options
}

export class DoubleDoorAnimationController {
  private leftDoorRotation: number = 0;
  private rightDoorRotation: number = 0;
  private isLeftDoorOpen: boolean = false;
  private isRightDoorOpen: boolean = false;
  private config: DoubleDoorAnimationConfig;
  private onStateChange?: (state: DoubleDoorAnimationState) => void;
  private MAX_ROTATION: number;

  constructor(
    config: Partial<DoubleDoorAnimationConfig> = {},
    onStateChange?: (state: DoubleDoorAnimationState) => void
  ) {
    this.config = { ...DEFAULT_DOOR_CONFIG, ...config };
    this.onStateChange = onStateChange;
    this.MAX_ROTATION = this.config.openAngle;
  }

  public getState(): DoubleDoorAnimationState {
    return {
      leftDoor: {
        isOpen: this.isLeftDoorOpen,
        isAnimating: false, // Tracked per animation
        rotation: this.leftDoorRotation,
      },
      rightDoor: {
        isOpen: this.isRightDoorOpen,
        isAnimating: false, // Tracked per animation
        rotation: this.rightDoorRotation,
      },
    };
  }

  public toggleLeft(): void {
    this.toggle("left");
  }

  public toggleRight(): void {
    this.toggle("right");
  }

  private toggle(door: "left" | "right"): void {
    const ANIMATION_DURATION = this.config.duration;
    const SOUND_DURATION = 100;
    const SOUND_DELAY = 0;
    const SOUND_START_OFFSET =
      ANIMATION_DURATION - (SOUND_DURATION - SOUND_DELAY);

    let soundPlayed = false;

    if (door === "left") {
      const isOpen = this.isLeftDoorOpen;

      if (!isOpen) {
        // Opening left door (rotates negative)
        soundPlayed = false;
        animate(ANIMATION_DURATION, this.config.easing, (progress) => {
          this.leftDoorRotation = -progress * this.MAX_ROTATION;
          this.notifyStateChange();

          if (progress === 1) {
            this.isLeftDoorOpen = true;
            this.notifyStateChange();
          }
        });
      } else {
        // Closing left door
        soundPlayed = false;
        animate(ANIMATION_DURATION, this.config.easing, (progress) => {
          this.leftDoorRotation = (1 - progress) * -this.MAX_ROTATION;
          this.notifyStateChange();

          // Play closing sound slightly before animation ends
          if (
            this.config.playSound &&
            !soundPlayed &&
            progress >= SOUND_START_OFFSET / ANIMATION_DURATION
          ) {
            soundManager.playSound("doorClose");
            soundPlayed = true;
          }

          if (progress === 1) {
            this.isLeftDoorOpen = false;
            this.notifyStateChange();
          }
        });
      }
    } else if (door === "right") {
      const isOpen = this.isRightDoorOpen;

      if (!isOpen) {
        // Opening right door (rotates positive)
        soundPlayed = false;
        animate(ANIMATION_DURATION, this.config.easing, (progress) => {
          this.rightDoorRotation = progress * this.MAX_ROTATION;
          this.notifyStateChange();

          if (progress === 1) {
            this.isRightDoorOpen = true;
            this.notifyStateChange();
          }
        });
      } else {
        // Closing right door
        soundPlayed = false;
        animate(ANIMATION_DURATION, this.config.easing, (progress) => {
          this.rightDoorRotation = (1 - progress) * this.MAX_ROTATION;
          this.notifyStateChange();

          // Play closing sound slightly before animation ends
          if (
            this.config.playSound &&
            !soundPlayed &&
            progress >= SOUND_START_OFFSET / ANIMATION_DURATION
          ) {
            soundManager.playSound("doorClose");
            soundPlayed = true;
          }

          if (progress === 1) {
            this.isRightDoorOpen = false;
            this.notifyStateChange();
          }
        });
      }
    }
  }

  private notifyStateChange(): void {
    if (this.onStateChange) {
      this.onStateChange(this.getState());
    }
  }

  public dispose(): void {
    // Cleanup if needed
  }
}

// ---------------------------------------------------------------------------
// Drawer Animation Types and Controller
// ---------------------------------------------------------------------------

export interface DrawerAnimationConfig {
  duration: number; // Animation duration in milliseconds
  easing: (t: number) => number; // Easing function
  playSound?: boolean; // Whether to play sound effects
}

export const DEFAULT_DRAWER_CONFIG: DrawerAnimationConfig = {
  duration: 1140, // As in Svelte example
  easing: easeInOutCubic,
  playSound: true,
};

export interface ToggleDrawerAnimationProps {
  from: number;
  to: number;
  onUpdate: (position: number) => void;
}

export class DrawerAnimationController {
  private config: DrawerAnimationConfig;
  private drawerPosition: number = 0;

  constructor(config: Partial<DrawerAnimationConfig> = {}) {
    this.config = { ...DEFAULT_DRAWER_CONFIG, ...config };
  }

  public getPosition(): number {
    return this.drawerPosition;
  }

  public toggleDrawer({
    from,
    to,
    onUpdate,
  }: ToggleDrawerAnimationProps): Promise<void> {
    return new Promise((resolve) => {
      const ANIMATION_DURATION = this.config.duration;
      const SOUND_DURATION = 1140;
      const SOUND_DELAY = 0;
      const SOUND_START_OFFSET =
        ANIMATION_DURATION - (SOUND_DURATION - SOUND_DELAY);

      let soundPlayed = false;

      animate(ANIMATION_DURATION, this.config.easing, (progress) => {
        const currentPosition = from + (to - from) * progress;
        this.drawerPosition = currentPosition;
        onUpdate(currentPosition);

        const isOpening = to > from;
        if (
          this.config.playSound &&
          progress >= SOUND_START_OFFSET / ANIMATION_DURATION &&
          !soundPlayed
        ) {
          soundManager.playSound(isOpening ? "drawerOpen" : "drawerClose");
          soundPlayed = true;
        }

        if (progress === 1) {
          resolve();
        }
      });
    });
  }
}

// Note: React hooks for these controllers should be created in component files
// where React is available
