import React, { useReducer } from 'react';
import { WindowManagerActionType, WindowManagerState, WindowManagerAction, AppDefinition, WindowInstance } from '../types';
import { DEFAULT_WINDOW_WIDTH, DEFAULT_WINDOW_HEIGHT, TASKBAR_HEIGHT } from '../constants.tsx';
import { DEFAULT_APPS } from '../constants.tsx';

const initialState: WindowManagerState = {
  windows: [],
  activeWindowId: null,
  nextZIndex: 100,
  dragState: {},
  maximizedStateStore: {},
};

const windowManagerReducer = (state: WindowManagerState, action: WindowManagerAction): WindowManagerState => {
  switch (action.type) {
    case WindowManagerActionType.OPEN_WINDOW: {
      const { app } = action.payload as { app: AppDefinition };
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

      const newWindow: WindowInstance = {
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
      const { id } = action.payload as { id: string };
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
      const { id } = action.payload as { id: string };
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
      const { id } = action.payload as { id: string };
      return {
        ...state,
        windows: state.windows.map(w =>
          w.id === id ? { ...w, isMinimized: true, isFocused: false } : w
        ),
        activeWindowId: state.activeWindowId === id ? null : state.activeWindowId,
      };
    }
    case WindowManagerActionType.TOGGLE_MAXIMIZE_WINDOW: {
      const { id } = action.payload as { id: string };
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
    case WindowManagerActionType.START_DRAG: {
      console.log('REDUCER: START_DRAG', action.payload);
      return {
        ...state,
        dragState: {
          isDragging: true,
          windowId: action.payload.windowId,
          offsetX: action.payload.offsetX,
          offsetY: action.payload.offsetY,
        },
      };
    }
    case WindowManagerActionType.DRAG_WINDOW: {
      console.log('REDUCER: DRAG_WINDOW', action.payload);
      return {
        ...state,
        windows: state.windows.map(w =>
          w.id === action.payload.id ? { ...w, x: action.payload.x, y: action.payload.y } : w
        ),
      };
    }
    case WindowManagerActionType.END_DRAG: {
      console.log('REDUCER: END_DRAG');
      // Snap logic
      if (state.dragState.isDragging && state.dragState.windowId) {
        const snapTarget = action.payload && action.payload.snapTarget;
        const win = state.windows.find(w => w.id === state.dragState.windowId);
        if (win && win.appId !== 'calculator' && action.payload && action.payload.desktopBox && snapTarget) {
          const { width: boxWidth, height: boxHeight } = action.payload.desktopBox;
          let newX = win.x;
          let newY = win.y;
          let newWidth = win.width;
          let newHeight = win.height;
          switch (snapTarget) {
            case 'left':
              newX = 0;
              newY = 0;
              newWidth = Math.floor(boxWidth / 2);
              newHeight = boxHeight;
              break;
            case 'right':
              newX = Math.floor(boxWidth / 2);
              newY = 0;
              newWidth = Math.floor(boxWidth / 2);
              newHeight = boxHeight;
              break;
            case 'top':
              newX = 0;
              newY = 0;
              newWidth = boxWidth;
              newHeight = boxHeight;
              break;
            case 'topleft':
              newX = 0;
              newY = 0;
              newWidth = Math.floor(boxWidth / 2);
              newHeight = Math.floor(boxHeight / 2);
              break;
            case 'topright':
              newX = Math.floor(boxWidth / 2);
              newY = 0;
              newWidth = Math.floor(boxWidth / 2);
              newHeight = Math.floor(boxHeight / 2);
              break;
            case 'bottomleft':
              newX = 0;
              newY = Math.floor(boxHeight / 2);
              newWidth = Math.floor(boxWidth / 2);
              newHeight = Math.floor(boxHeight / 2);
              break;
            case 'bottomright':
              newX = Math.floor(boxWidth / 2);
              newY = Math.floor(boxHeight / 2);
              newWidth = Math.floor(boxWidth / 2);
              newHeight = Math.floor(boxHeight / 2);
              break;
            default:
              break;
          }
          return {
            ...state,
            windows: state.windows.map(w =>
              w.id === win.id ? { ...w, x: newX, y: newY, width: newWidth, height: newHeight } : w
            ),
            dragState: {},
          };
        }
      }
      return {
        ...state,
        dragState: {},
      };
    }
    case WindowManagerActionType.RESIZE_WINDOW: {
      const { id, width, height } = action.payload as { id: string; width: number; height: number };
      return {
        ...state,
        windows: state.windows.map(w =>
          w.id === id ? { ...w, width, height } : w
        ),
      };
    }
    case WindowManagerActionType.SET_WINDOWS:
      return { ...state, windows: action.payload as WindowInstance[] };
    default:
      return state;
  }
};

export const useWindowManagerReducer = () => {
  return useReducer(windowManagerReducer, initialState);
};