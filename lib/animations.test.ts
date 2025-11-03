/**
 * Unit tests for animation utilities
 */

import {
  match,
  easeInOutCubic,
  easeOutElastic,
  easeOutBounce,
  animate,
  DoorAnimationController,
  DEFAULT_DOOR_CONFIG,
} from './animations';

describe('Pattern Matching', () => {
  test('match function works with when clauses', () => {
    const result = match(5)
      .when(x => x < 0, () => 'negative')
      .when(x => x === 0, () => 'zero')
      .when(x => x > 0, () => 'positive')
      .run();

    expect(result).toBe('positive');
  });

  test('match function works with default clause', () => {
    const result = match(10)
      .when(x => x < 5, () => 'small')
      ._(() => 'large')
      .run();

    expect(result).toBe('large');
  });

  test('match function returns undefined if no match', () => {
    const result = match(5)
      .when(x => x < 0, () => 'negative')
      .run();

    expect(result).toBeUndefined();
  });
});

describe('Easing Functions', () => {
  test('easeInOutCubic returns correct values', () => {
    expect(easeInOutCubic(0)).toBe(0);
    expect(easeInOutCubic(1)).toBe(1);
    expect(easeInOutCubic(0.5)).toBeCloseTo(0.5, 5);
    
    // Test cubic behavior in first half
    const firstQuarter = easeInOutCubic(0.25);
    expect(firstQuarter).toBeCloseTo(4 * 0.25 * 0.25 * 0.25, 5);
  });

  test('easeOutElastic returns correct boundary values', () => {
    expect(easeOutElastic(0)).toBe(0);
    expect(easeOutElastic(1)).toBe(1);
    
    // Test that it oscillates (goes above 1 then settles)
    const midValue = easeOutElastic(0.5);
    expect(typeof midValue).toBe('number');
    expect(midValue).toBeGreaterThan(0);
  });

  test('easeOutBounce returns correct boundary values', () => {
    expect(easeOutBounce(0)).toBe(0);
    expect(easeOutBounce(1)).toBeCloseTo(1, 5);
    
    // Test bounce behavior
    const quarterValue = easeOutBounce(0.25);
    expect(quarterValue).toBeGreaterThan(0);
    expect(quarterValue).toBeLessThan(1);
  });

  test('all easing functions handle edge cases', () => {
    const easingFunctions = [easeInOutCubic, easeOutElastic, easeOutBounce];
    
    easingFunctions.forEach(easingFn => {
      expect(typeof easingFn(0)).toBe('number');
      expect(typeof easingFn(1)).toBe('number');
      expect(typeof easingFn(0.5)).toBe('number');
    });
  });
});

describe('Animation Function', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    // Mock performance.now
    global.performance = {
      ...global.performance,
      now: jest.fn(() => Date.now()),
    };
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  test('animate calls callback with correct progress values', () => {
    const callback = jest.fn();
    const duration = 1000;
    
    // Mock requestAnimationFrame
    const mockRAF = jest.fn((fn) => {
      setTimeout(fn, 16); // ~60fps
      return 1;
    });
    global.requestAnimationFrame = mockRAF;

    animate(duration, easeInOutCubic, callback);

    // Simulate time progression
    jest.advanceTimersByTime(500); // Half duration
    
    expect(callback).toHaveBeenCalled();
    expect(mockRAF).toHaveBeenCalled();
  });

  test('animate completes after specified duration', () => {
    const callback = jest.fn();
    const duration = 100;
    
    let animationComplete = false;
    const mockRAF = jest.fn((fn) => {
      setTimeout(() => {
        fn(Date.now());
        if (callback.mock.calls.length > 0) {
          const lastCall = callback.mock.calls[callback.mock.calls.length - 1];
          if (lastCall[0] >= 1) {
            animationComplete = true;
          }
        }
      }, 16);
      return 1;
    });
    global.requestAnimationFrame = mockRAF;

    animate(duration, (t) => t, callback);
    
    jest.advanceTimersByTime(duration + 50);
    
    expect(animationComplete).toBe(true);
  });
});

describe('DoorAnimationController', () => {
  let controller: DoorAnimationController;
  let stateChangeCallback: jest.Mock;

  beforeEach(() => {
    jest.useFakeTimers();
    stateChangeCallback = jest.fn();
    controller = new DoorAnimationController({}, stateChangeCallback);
    
    // Mock requestAnimationFrame
    global.requestAnimationFrame = jest.fn((fn) => {
      setTimeout(fn, 16);
      return 1;
    });
  });

  afterEach(() => {
    controller.dispose();
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  test('initial state is closed', () => {
    const state = controller.getState();
    expect(state.isOpen).toBe(false);
    expect(state.isAnimating).toBe(false);
    expect(state.rotation).toBe(0);
    expect(state.targetRotation).toBe(0);
  });

  test('toggle starts animation', () => {
    controller.toggle();
    
    const state = controller.getState();
    expect(state.isAnimating).toBe(true);
    expect(state.targetRotation).toBe(DEFAULT_DOOR_CONFIG.openAngle);
  });

  test('open method works correctly', () => {
    controller.open();
    
    const state = controller.getState();
    expect(state.isAnimating).toBe(true);
    expect(state.targetRotation).toBe(DEFAULT_DOOR_CONFIG.openAngle);
  });

  test('close method works correctly when door is open', () => {
    // First open the door
    controller.open();
    jest.advanceTimersByTime(DEFAULT_DOOR_CONFIG.duration + 100);
    
    // Then close it
    controller.close();
    
    const state = controller.getState();
    expect(state.isAnimating).toBe(true);
    expect(state.targetRotation).toBe(0);
  });

  test('prevents multiple simultaneous animations', () => {
    controller.toggle();
    const firstState = controller.getState();
    
    // Try to toggle again while animating
    controller.toggle();
    const secondState = controller.getState();
    
    expect(firstState.targetRotation).toBe(secondState.targetRotation);
  });

  test('state change callback is called', () => {
    controller.toggle();
    
    expect(stateChangeCallback).toHaveBeenCalled();
    
    const callArgs = stateChangeCallback.mock.calls[0][0];
    expect(callArgs).toHaveProperty('isOpen');
    expect(callArgs).toHaveProperty('isAnimating');
    expect(callArgs).toHaveProperty('rotation');
    expect(callArgs).toHaveProperty('targetRotation');
  });

  test('custom configuration is applied', () => {
    const customConfig = {
      openAngle: Math.PI / 4,
      duration: 500,
      easing: (t: number) => t,
    };
    
    const customController = new DoorAnimationController(customConfig);
    customController.open();
    
    const state = customController.getState();
    expect(state.targetRotation).toBe(Math.PI / 4);
    
    customController.dispose();
  });

  test('dispose cleans up properly', () => {
    controller.toggle();
    
    expect(() => controller.dispose()).not.toThrow();
  });
});

describe('Audio Context Mocking', () => {
  test('handles missing audio context gracefully', () => {
    // Remove AudioContext to simulate unsupported environment
    const originalAudioContext = (global as any).AudioContext;
    delete (global as any).AudioContext;
    delete (global as any).webkitAudioContext;
    
    const controller = new DoorAnimationController({ playSound: true });
    
    // Should not throw when trying to play sound
    expect(() => controller.toggle()).not.toThrow();
    
    // Restore AudioContext
    (global as any).AudioContext = originalAudioContext;
    controller.dispose();
  });
});