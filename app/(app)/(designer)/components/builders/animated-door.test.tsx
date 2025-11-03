/**
 * Unit tests for AnimatedDoor component
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { Canvas } from '@react-three/fiber';
import { AnimatedDoor, DoubleDoor, useDoorAnimation } from './animated-door';
import { DEFAULT_DOOR_CONFIG } from '../../../../../lib/animations';

// Mock Three.js and React Three Fiber
jest.mock('@react-three/fiber', () => ({
  ...jest.requireActual('@react-three/fiber'),
  useFrame: jest.fn((callback) => {
    // Mock useFrame to call the callback immediately for testing
    callback();
  }),
}));

jest.mock('@react-three/drei', () => ({
  Box: ({ children, onClick, onPointerOver, onPointerOut, ...props }: any) => (
    <div
      data-testid="mock-box"
      onClick={onClick}
      onMouseEnter={onPointerOver}
      onMouseLeave={onPointerOut}
      {...props}
    >
      {children}
    </div>
  ),
}));

// Mock requestAnimationFrame
global.requestAnimationFrame = jest.fn((callback) => {
  setTimeout(callback, 16);
  return 1;
});

const TestCanvas: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div data-testid="test-canvas">{children}</div>
);

describe('AnimatedDoor Component', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  test('renders without crashing', () => {
    const { container } = render(
      <TestCanvas>
        <AnimatedDoor
          width={50}
          height={70}
          depth={2}
          position={[0, 0, 0]}
        />
      </TestCanvas>
    );

    expect(container).toBeInTheDocument();
  });

  test('renders with custom color', () => {
    const { container } = render(
      <TestCanvas>
        <AnimatedDoor
          width={50}
          height={70}
          depth={2}
          position={[0, 0, 0]}
          color="#FF0000"
        />
      </TestCanvas>
    );

    expect(container).toBeInTheDocument();
  });

  test('handles click events', () => {
    const mockOnClick = jest.fn();
    
    const { getAllByTestId } = render(
      <TestCanvas>
        <AnimatedDoor
          width={50}
          height={70}
          depth={2}
          position={[0, 0, 0]}
          onClick={mockOnClick}
        />
      </TestCanvas>
    );

    const boxes = getAllByTestId('mock-box');
    fireEvent.click(boxes[0]); // Click on pivot cube

    expect(mockOnClick).toHaveBeenCalled();
  });

  test('handles hover events', () => {
    const { getAllByTestId } = render(
      <TestCanvas>
        <AnimatedDoor
          width={50}
          height={70}
          depth={2}
          position={[0, 0, 0]}
        />
      </TestCanvas>
    );

    const boxes = getAllByTestId('mock-box');
    
    fireEvent.mouseEnter(boxes[0]);
    expect(document.body.style.cursor).toBe('pointer');
    
    fireEvent.mouseLeave(boxes[0]);
    expect(document.body.style.cursor).toBe('auto');
  });

  test('calls animation state change callback', () => {
    const mockStateChange = jest.fn();
    
    render(
      <TestCanvas>
        <AnimatedDoor
          width={50}
          height={70}
          depth={2}
          position={[0, 0, 0]}
          onAnimationStateChange={mockStateChange}
        />
      </TestCanvas>
    );

    // The callback should be called during initialization
    expect(mockStateChange).toHaveBeenCalled();
  });

  test('applies custom configuration', () => {
    const customConfig = {
      openAngle: Math.PI / 4,
      duration: 500,
    };

    const { container } = render(
      <TestCanvas>
        <AnimatedDoor
          width={50}
          height={70}
          depth={2}
          position={[0, 0, 0]}
          config={customConfig}
        />
      </TestCanvas>
    );

    expect(container).toBeInTheDocument();
  });
});

describe('DoubleDoor Component', () => {
  test('renders without crashing', () => {
    const { container } = render(
      <TestCanvas>
        <DoubleDoor
          width={100}
          height={70}
          depth={2}
          position={[0, 0, 0]}
        />
      </TestCanvas>
    );

    expect(container).toBeInTheDocument();
  });

  test('renders with custom gap', () => {
    const { container } = render(
      <TestCanvas>
        <DoubleDoor
          width={100}
          height={70}
          depth={2}
          position={[0, 0, 0]}
          gap={5}
        />
      </TestCanvas>
    );

    expect(container).toBeInTheDocument();
  });

  test('applies custom configuration to both doors', () => {
    const customConfig = {
      openAngle: Math.PI / 6,
      duration: 300,
    };

    const { container } = render(
      <TestCanvas>
        <DoubleDoor
          width={100}
          height={70}
          depth={2}
          position={[0, 0, 0]}
          config={customConfig}
        />
      </TestCanvas>
    );

    expect(container).toBeInTheDocument();
  });
});

describe('useDoorAnimation Hook', () => {
  const TestComponent: React.FC<{ config?: any }> = ({ config }) => {
    const { state, toggle, open, close } = useDoorAnimation(config);
    
    return (
      <div>
        <div data-testid="is-open">{state.isOpen.toString()}</div>
        <div data-testid="is-animating">{state.isAnimating.toString()}</div>
        <div data-testid="rotation">{state.rotation}</div>
        <button data-testid="toggle-btn" onClick={toggle}>Toggle</button>
        <button data-testid="open-btn" onClick={open}>Open</button>
        <button data-testid="close-btn" onClick={close}>Close</button>
      </div>
    );
  };

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('initializes with correct default state', () => {
    const { getByTestId } = render(<TestComponent />);
    
    expect(getByTestId('is-open')).toHaveTextContent('false');
    expect(getByTestId('is-animating')).toHaveTextContent('false');
    expect(getByTestId('rotation')).toHaveTextContent('0');
  });

  test('toggle function works', () => {
    const { getByTestId } = render(<TestComponent />);
    
    fireEvent.click(getByTestId('toggle-btn'));
    
    expect(getByTestId('is-animating')).toHaveTextContent('true');
  });

  test('open function works', () => {
    const { getByTestId } = render(<TestComponent />);
    
    fireEvent.click(getByTestId('open-btn'));
    
    expect(getByTestId('is-animating')).toHaveTextContent('true');
  });

  test('close function works when door is open', async () => {
    const { getByTestId } = render(<TestComponent />);
    
    // First open the door
    fireEvent.click(getByTestId('open-btn'));
    
    // Wait for animation to complete
    jest.advanceTimersByTime(DEFAULT_DOOR_CONFIG.duration + 100);
    
    await waitFor(() => {
      expect(getByTestId('is-animating')).toHaveTextContent('false');
      expect(getByTestId('is-open')).toHaveTextContent('true');
    });
    
    // Then close it
    fireEvent.click(getByTestId('close-btn'));
    
    expect(getByTestId('is-animating')).toHaveTextContent('true');
  });

  test('applies custom configuration', () => {
    const customConfig = {
      openAngle: Math.PI / 3,
      duration: 200,
    };
    
    const { getByTestId } = render(<TestComponent config={customConfig} />);
    
    fireEvent.click(getByTestId('open-btn'));
    
    expect(getByTestId('is-animating')).toHaveTextContent('true');
  });

  test('cleans up on unmount', () => {
    const { unmount } = render(<TestComponent />);
    
    // Should not throw when unmounting
    expect(() => unmount()).not.toThrow();
  });
});

describe('Component Integration', () => {
  test('AnimatedDoor integrates with useDoorAnimation hook', () => {
    const TestIntegration: React.FC = () => {
      const { state, toggle } = useDoorAnimation();
      
      return (
        <TestCanvas>
          <AnimatedDoor
            width={50}
            height={70}
            depth={2}
            position={[0, 0, 0]}
            onClick={toggle}
          />
          <div data-testid="hook-state">{state.isOpen.toString()}</div>
        </TestCanvas>
      );
    };

    const { getByTestId, getAllByTestId } = render(<TestIntegration />);
    
    expect(getByTestId('hook-state')).toHaveTextContent('false');
    
    const boxes = getAllByTestId('mock-box');
    fireEvent.click(boxes[0]);
    
    expect(getByTestId('hook-state')).toHaveTextContent('false'); // Still false until animation completes
  });
});