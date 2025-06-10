
import React from 'react';
import Desktop from './components/Desktop/Desktop';
import { WindowManagerProvider } from './contexts/WindowManagerContext';

const App = () => {
  return (
    React.createElement(WindowManagerProvider, null,
      React.createElement(Desktop)
    )
  );
};

export default App;