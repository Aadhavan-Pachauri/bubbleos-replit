import React, { createContext, useContext, Dispatch } from "react";
import { useWindowManagerReducer } from "../hooks/useWindowManager";
import {
  WindowManagerActionType,
  WindowManagerState,
  WindowManagerAction,
} from "../types";

interface WindowInstance {
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

interface DragState {
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

interface WindowManagerContextType {
  state: WindowManagerState;
  dispatch: Dispatch<WindowManagerAction>;
}

const WindowManagerContext = createContext<
  WindowManagerContextType | undefined
>(undefined);

export const WindowManagerProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [state, dispatch] = useWindowManagerReducer();

  return React.createElement(
    WindowManagerContext.Provider,
    { value: { state, dispatch } },
    children,
  );
};

export const useWindowManager = () => {
  const context = useContext(WindowManagerContext);
  if (!context) {
    throw new Error(
      "useWindowManager must be used within a WindowManagerProvider",
    );
  }
  return context;
};
