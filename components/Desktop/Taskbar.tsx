
import React, { useState, useEffect, useRef } from 'react';
import StartMenu from './StartMenu';
import { useWindowManager } from '../../contexts/WindowManagerContext';
import { WindowManagerActionType } from '../../types'; // WindowInstance removed
import AppIcon from '../Applications/AppIcon';
import { TASKBAR_HEIGHT } from '../../constants.tsx';

const SystemTray = () => {
  const [dateTime, setDateTime] = useState(new Date());

  useEffect(() => {
    const timerId = setInterval(() => setDateTime(new Date()), 1000); // Update every second
    return () => clearInterval(timerId);
  }, []);
  
  const formattedTime = dateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const formattedDate = dateTime.toLocaleDateString([], { month: '2-digit', day: '2-digit', year: 'numeric' });

  const iconBaseStyle = "w-5 h-5 opacity-90 hover:opacity-100 cursor-default transition-opacity";
  const networkIconUrl = "https://api.iconify.design/fluent/wifi-1-20-filled.svg?color=00A9E0"; // Primary Accent
  const volumeIconUrl = "https://api.iconify.design/fluent/speaker-2-20-filled.svg?color=00A9E0";
  const batteryIconUrl = "https://api.iconify.design/fluent/battery-7-20-filled.svg?color=00A9E0"; // Placeholder battery

  return (
    React.createElement('div', { className: "flex items-center space-x-3 text-xs px-3", style: { color: 'var(--text-primary)' } },
      React.createElement('img', { src: networkIconUrl, alt: "Network", title: "Network: Connected", className: iconBaseStyle }),
      React.createElement('img', { src: volumeIconUrl, alt: "Volume", title: "Volume: 75%", className: iconBaseStyle }),
      React.createElement('img', { src: batteryIconUrl, alt: "Battery", title: "Battery: 90%", className: iconBaseStyle }),
      React.createElement('div', { className: "text-right" },
        React.createElement('div', { className: "font-medium" }, formattedTime),
        React.createElement('div', { className: "text-xs opacity-80" }, formattedDate)
      )
    )
  );
};

const Taskbar = () => {
  const [isStartMenuOpen, setIsStartMenuOpen] = useState(false);
  const { state, dispatch } = useWindowManager();
  const startMenuRef = useRef/*<HTMLDivElement>*/(null);
  const startButtonRef = useRef/*<HTMLButtonElement>*/(null);

  const toggleStartMenu = () => setIsStartMenuOpen(prev => !prev);

  const handleAppIconClick = (windowInstance/*: WindowInstance*/) => {
    if (windowInstance.isMinimized || !windowInstance.isFocused) { 
       dispatch({ type: WindowManagerActionType.FOCUS_WINDOW, payload: { id: windowInstance.id } }); 
    } else {
      dispatch({ type: WindowManagerActionType.MINIMIZE_WINDOW, payload: { id: windowInstance.id } });
    }
  };
  
  useEffect(() => {
    const handleClickOutside = (event/*: MouseEvent*/) => {
      if (isStartMenuOpen && 
          startMenuRef.current && 
          !startMenuRef.current.contains(event.target /*as Node*/) &&
          startButtonRef.current &&
          !startButtonRef.current.contains(event.target /*as Node*/)
          ) {
        setIsStartMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isStartMenuOpen]);

  const bubbleLogoSvg = React.createElement("svg", {
    viewBox: "0 0 24 24",
    className: "w-6 h-6 group-hover:opacity-90 transition-opacity duration-150",
    fill: "none",
    stroke: "currentColor", // Will use text color from parent
    strokeWidth: "1.5",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  },
    // Main bubble
    React.createElement("circle", { cx: "12", cy: "12", r: "8", style: { fill: 'var(--primary-accent)', stroke: 'none' } }),
    // Smaller accent bubbles
    React.createElement("circle", { cx: "7", cy: "9", r: "2.5", style: { fill: 'var(--secondary-accent)', stroke: 'none', opacity: 0.8 }}),
    React.createElement("circle", { cx: "16", cy: "15", r: "2", style: { fill: 'var(--highlight-accent)', stroke: 'none', opacity: 0.7 }})
  );
  

  return (
    React.createElement('div', {
      className: "absolute bottom-0 left-0 right-0 backdrop-blur-xl flex items-center justify-between shadow-2xl select-none border-t",
      style: { 
        height: `${TASKBAR_HEIGHT}px`,
        backgroundColor: 'var(--taskbar-bg)',
        borderColor: 'var(--border-color)',
        color: 'var(--text-primary)',
        '--tw-backdrop-blur': 'blur(var(--glass-blur))'
      }
    },
      React.createElement('div', { className: "flex items-center h-full" },
        React.createElement('button', {
          ref: startButtonRef,
          onClick: toggleStartMenu,
          className: `group px-3 py-2 hover:opacity-80 transition-colors duration-150 focus:outline-none h-full flex items-center`, 
          style: { backgroundColor: isStartMenuOpen ? 'var(--secondary-accent)' : 'transparent', ringColor: 'var(--focus-ring)' },
          "aria-label": "Start Menu",
          title: "Start"
        }, bubbleLogoSvg),
        React.createElement('div', { className: "flex items-center space-x-0.5 px-1 h-full" }, 
          ...state.windows.map((win) => (
            React.createElement(AppIcon, {
              key: win.id,
              app: { id: win.appId, name: win.title, icon: win.icon, component: () => null }, // Dummy component
              onClick: () => handleAppIconClick(win),
              isActive: win.isFocused && !win.isMinimized, 
              isMinimized: win.isMinimized,
              showTitle: false,
              className: `p-2 h-[calc(100%-4px)] w-14 flex justify-center items-center transition-all duration-150 rounded-md relative` 
            })
          ))
        )
      ),
      React.createElement(SystemTray),
      isStartMenuOpen && React.createElement(StartMenu, { ref: startMenuRef, toggleMenu: toggleStartMenu })
    )
  );
};

export default Taskbar;