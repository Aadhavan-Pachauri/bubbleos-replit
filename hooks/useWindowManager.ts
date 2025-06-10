
import React, { useReducer } from 'react';
import { WindowManagerActionType } from '../types'; // WindowInstance, AppDefinition, WindowManagerState, WindowManagerAction removed from types.ts
import { DEFAULT_WINDOW_WIDTH, DEFAULT_WINDOW_HEIGHT, TASKBAR_HEIGHT } from '../constants.tsx';

const initialState/*: WindowManagerState*/ = {
  windows: [],
  activeWindowId: null,
  nextZIndex: 100,
  dragState: {},
  maximizedStateStore: {},
};

const windowManagerReducer = (state/*: WindowManagerState*/, action/*: WindowManagerAction*/)/*: WindowManagerState*/ => {
  switch (action.type) {
    case WindowManagerActionType.OPEN_WINDOW: {
      const { app } = action.payload; // app was AppDefinition
      const newWindowId = `window-${app.id}-${Math.random().toString(36).substr(2, 9)}`;
      
      const existingWindow = state.windows.find(w => w.appId === app.id && !w.isMinimized);
      if (existingWindow) {
        return {
          ...state,
          windows: state.windows.map(w =>
            w.id === existingWindow.id ? { ...w, zIndex: state.nextZIndex + 1, isMinimized: false, isFocused: true } : {...w, isFocused: false}
          ),
          activeWindowId: existingWindow.id,
          nextZIndex: state.nextZIndex + 1,
        };
      }
      
      const windowWidth = app.defaultWidth || DEFAULT_WINDOW_WIDTH;
      const windowHeight = app.defaultHeight || DEFAULT_WINDOW_HEIGHT;

      const newWindow/*: WindowInstance*/ = {
        id: newWindowId,
        appId: app.id,
        title: app.name,
        icon: app.icon,
        x: Math.max(0, (window.innerWidth - windowWidth) / 2 + state.windows.length * 20),
        y: Math.max(0, (window.innerHeight - TASKBAR_HEIGHT - windowHeight) / 2 + state.windows.length * 20),
        width: windowWidth,
        height: windowHeight,
        zIndex: state.nextZIndex + 1,
        isMinimized: false,
        isMaximized: false,
        isFocused: true,
        content: React.createElement(app.component, { windowId: newWindowId }),
      };
      return {
        ...state,
        windows: [...state.windows.map(w => ({...w, isFocused: false})), newWindow],
        activeWindowId: newWindow.id,
        nextZIndex: state.nextZIndex + 1,
      };
    }
    case WindowManagerActionType.CLOSE_WINDOW: {
      const { id } = action.payload;
      const newMaximizedStateStore = { ...state.maximizedStateStore };
      delete newMaximizedStateStore[id];
      return {
        ...state,
        windows: state.windows.filter(w => w.id !== id),
        activeWindowId: state.activeWindowId === id ? null : state.activeWindowId,
        maximizedStateStore: newMaximizedStateStore
      };
    }
    case WindowManagerActionType.FOCUS_WINDOW: {
      const { id } = action.payload;
      if (state.activeWindowId === id && state.windows.find(w => w.id === id)?.isFocused) return state;
      return {
        ...state,
        windows: state.windows.map(w =>
          w.id === id ? { ...w, zIndex: state.nextZIndex + 1, isMinimized: false, isFocused: true } : {...w, isFocused: false}
        ),
        activeWindowId: id,
        nextZIndex: state.nextZIndex + 1,
      };
    }
    case WindowManagerActionType.MINIMIZE_WINDOW: {
      const { id } = action.payload;
      return {
        ...state,
        windows: state.windows.map(w =>
          w.id === id ? { ...w, isMinimized: true, isFocused: false } : w
        ),
        activeWindowId: state.activeWindowId === id ? null : state.activeWindowId,
      };
    }
    case WindowManagerActionType.TOGGLE_MAXIMIZE_WINDOW: {
      const { id } = action.payload;
      const targetWindow = state.windows.find(w => w.id === id);
      if (!targetWindow) return state;

      const appDefinition = DEFAULT_APPS.find(app => app.id === targetWindow.appId);
      const windowWidth = appDefinition?.defaultWidth || DEFAULT_WINDOW_WIDTH;
      const windowHeight = appDefinition?.defaultHeight || DEFAULT_WINDOW_HEIGHT;


      if (targetWindow.isMaximized) {
        const restoredState = state.maximizedStateStore[id] || { x: targetWindow.x, y: targetWindow.y, width: windowWidth, height: windowHeight };
        return {
          ...state,
          windows: state.windows.map(w =>
            w.id === id ? { ...w, ...restoredState, isMaximized: false, zIndex: state.nextZIndex +1, isFocused: true } : {...w, isFocused: false }
          ),
          activeWindowId: id,
          nextZIndex: state.nextZIndex + 1,
        };
      } else {
        const maximizedState = {
          x: 0,
          y: 0,
          width: window.innerWidth,
          height: window.innerHeight - TASKBAR_HEIGHT,
        };
        return {
          ...state,
          maximizedStateStore: { ...state.maximizedStateStore, [id]: { x: targetWindow.x, y: targetWindow.y, width: targetWindow.width, height: targetWindow.height } },
          windows: state.windows.map(w =>
            w.id === id ? { ...w, ...maximizedState, isMaximized: true, zIndex: state.nextZIndex + 1, isFocused: true } : {...w, isFocused: false}
          ),
          activeWindowId: id,
          nextZIndex: state.nextZIndex + 1,
        };
      }
    }
    case WindowManagerActionType.DRAG_WINDOW: {
      const { id, x, y } = action.payload;
      return {
        ...state,
        windows: state.windows.map(w =>
          w.id === id ? { ...w, x, y } : w
        ),
      };
    }
    case WindowManagerActionType.RESIZE_WINDOW: {
      const { id, width, height } = action.payload;
      return {
        ...state,
        windows: state.windows.map(w =>
          w.id === id ? { ...w, width, height } : w
        ),
      };
    }
     case WindowManagerActionType.SET_WINDOWS:
      return { ...state, windows: action.payload };
    default:
      return state;
  }
};

// Need to export DEFAULT_APPS from constants to use it here, or pass it down.
// For simplicity, importing here if it's only used for default sizes logic.
// This creates a circular dependency if constants.tsx imports from types.ts which might import from hooks.
// A better approach would be to not have app-specific logic like default sizes directly in the generic window manager hook
// or to pass such configurations. For now, let's assume constants.tsx can be imported.
import { DEFAULT_APPS } from '../constants.tsx';


export const useWindowManagerReducer = () => {
  return useReducer(windowManagerReducer, initialState);
};