import React, { createContext, useContext, Dispatch } from "react";
import { useWindowManagerReducer } from "../hooks/useWindowManager";
// WindowManagerState, WindowManagerAction types removed from types.ts

// interface WindowManagerContextType {
//   state: WindowManagerState;
//   dispatch: Dispatch<WindowManagerAction>;
// }

const WindowManagerContext = createContext(
  /*<WindowManagerContextType | undefined>*/ undefined,
);

export const WindowManagerProvider = (
  { children } /*: { children: React.ReactNode }*/,
) => {
  const [state, dispatch] = useWindowManagerReducer();

  return React.createElement(
    WindowManagerContext.Provider,
    { value: { state, dispatch } },
    children,
  );
};

export const useWindowManager = (/*: WindowManagerContextType*/) => {
  const context = useContext(WindowManagerContext);
  if (!context) {
    throw new Error(
      "useWindowManager must be used within a WindowManagerProvider",
    );
  }
  return context;
};
