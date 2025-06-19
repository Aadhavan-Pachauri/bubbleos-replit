export const WindowManagerActionType = {
  OPEN_WINDOW: 'OPEN_WINDOW',
  CLOSE_WINDOW: 'CLOSE_WINDOW',
  FOCUS_WINDOW: 'FOCUS_WINDOW',
  MINIMIZE_WINDOW: 'MINIMIZE_WINDOW',
  TOGGLE_MAXIMIZE_WINDOW: 'TOGGLE_MAXIMIZE_WINDOW',
  START_DRAG: 'START_DRAG',
  DRAG_WINDOW: 'DRAG_WINDOW',
  END_DRAG: 'END_DRAG',
  START_RESIZE: 'START_RESIZE',
  RESIZE_WINDOW: 'RESIZE_WINDOW',
  END_RESIZE: 'END_RESIZE',
  SET_WINDOWS: 'SET_WINDOWS',
} as const;

export type WindowManagerActionType = typeof WindowManagerActionType[keyof typeof WindowManagerActionType];

export interface AppDefinition {
  id: string;
  name: string;
  icon: string;
  component: React.ComponentType<{ windowId: string }>;
  defaultWidth?: number;
  defaultHeight?: number;
}

export interface WindowInstance {
  id: string;
  appId: string;
  title: string;
  icon: string;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  isMinimized: boolean;
  isMaximized: boolean;
  isFocused: boolean;
  content: React.ReactNode;
}

export interface DragState {
  isDragging?: boolean;
  isResizing?: boolean;
  windowId?: string;
  offsetX?: number;
  offsetY?: number;
  originalX?: number;
  originalY?: number;
  originalWidth?: number;
  originalHeight?: number;
}

export interface WindowManagerState {
  windows: WindowInstance[];
  activeWindowId: string | null;
  nextZIndex: number;
  dragState: DragState;
  maximizedStateStore: Record<string, { x: number; y: number; width: number; height: number }>;
}

export type WindowManagerAction =
  | { type: typeof WindowManagerActionType.OPEN_WINDOW; payload: { app: AppDefinition } }
  | { type: typeof WindowManagerActionType.CLOSE_WINDOW; payload: { id: string } }
  | { type: typeof WindowManagerActionType.FOCUS_WINDOW; payload: { id: string } }
  | { type: typeof WindowManagerActionType.MINIMIZE_WINDOW; payload: { id: string } }
  | { type: typeof WindowManagerActionType.TOGGLE_MAXIMIZE_WINDOW; payload: { id: string } }
  | { type: typeof WindowManagerActionType.START_DRAG; payload: { windowId: string; offsetX: number; offsetY: number } }
  | { type: typeof WindowManagerActionType.DRAG_WINDOW; payload: { id: string; x: number; y: number } }
  | { type: typeof WindowManagerActionType.END_DRAG; payload?: any }
  | { type: typeof WindowManagerActionType.START_RESIZE; payload: { windowId: string; edge: string; startX: number; startY: number; startWidth: number; startHeight: number } }
  | { type: typeof WindowManagerActionType.RESIZE_WINDOW; payload: { id: string; width: number; height: number } }
  | { type: typeof WindowManagerActionType.END_RESIZE; payload?: any };

// All interface and type alias definitions (AppDefinition, WindowInstance, etc.) are removed
// as they are TypeScript features and would cause errors in a non-transpiled environment.
// The structural contracts they defined are now implicit.
