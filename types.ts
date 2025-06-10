
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
};
// All interface and type alias definitions (AppDefinition, WindowInstance, etc.) are removed
// as they are TypeScript features and would cause errors in a non-transpiled environment.
// The structural contracts they defined are now implicit.
