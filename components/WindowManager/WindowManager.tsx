
import React from 'react';
import { useWindowManager } from '../../contexts/WindowManagerContext';
import Window from './Window';

const WindowManager = () => {
  const { state } = useWindowManager();

  return (
    React.createElement(React.Fragment, null,
      ...state.windows.filter(win => !win.isMinimized).map((win) => (
        React.createElement(Window, { key: win.id, windowInstance: win })
      ))
    )
  );
};

export default WindowManager;