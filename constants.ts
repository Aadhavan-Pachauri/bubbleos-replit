
import React from 'react';
// AppDefinition type is effectively removed from types.ts, so its usage here is commented out or implicit.
import WebBrowser from './components/Applications/WebBrowser';

// Placeholder components for other apps
const NotepadApp = () => {
  return React.createElement('div', { className: "p-0 h-full bg-white flex flex-col" }, // Changed p-1 to p-0
    React.createElement('textarea', {
      className: "w-full h-full flex-grow bg-white text-black p-2 border-none focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none", // Removed border, rounded, added resize-none
      placeholder: "Type something..."
    })
  );
};

const SettingsApp = () => {
  return React.createElement('div', { className: "p-4 text-gray-800 bg-gray-100 h-full" },
    React.createElement('h2', { className: "text-2xl font-semibold mb-4" }, "System Settings"),
    React.createElement('p', null, "Settings Content Coming Soon..."),
    React.createElement('div', { className: "mt-4 p-2 border rounded" }, "More options will appear here.")
  );
};

const CalculatorApp = () => {
  const buttonBaseClass = "bg-slate-600 hover:bg-slate-500 text-white font-semibold py-2 rounded text-lg transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-sky-400";
  const operatorButtonClass = "bg-orange-500 hover:bg-orange-400 text-white font-semibold py-2 rounded text-lg transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-sky-400";
  
  return React.createElement('div', { className: "p-2 h-full bg-slate-700 text-white flex flex-col font-mono select-none" },
    React.createElement('div', { id: "calc-display", className: "bg-slate-800 text-right text-4xl p-4 rounded mb-2 overflow-x-auto h-20 flex items-center justify-end" }, "0"),
    React.createElement('div', { className: "grid grid-cols-4 gap-1 flex-grow" },
      React.createElement('button', { className: `${buttonBaseClass} bg-rose-500 hover:bg-rose-400 col-span-2` }, "AC"),
      React.createElement('button', { className: buttonBaseClass }, "%"),
      React.createElement('button', { className: operatorButtonClass }, "/"),

      React.createElement('button', { className: buttonBaseClass }, "7"),
      React.createElement('button', { className: buttonBaseClass }, "8"),
      React.createElement('button', { className: buttonBaseClass }, "9"),
      React.createElement('button', { className: operatorButtonClass }, "*"),

      React.createElement('button', { className: buttonBaseClass }, "4"),
      React.createElement('button', { className: buttonBaseClass }, "5"),
      React.createElement('button', { className: buttonBaseClass }, "6"),
      React.createElement('button', { className: operatorButtonClass }, "-"),

      React.createElement('button', { className: buttonBaseClass }, "1"),
      React.createElement('button', { className: buttonBaseClass }, "2"),
      React.createElement('button', { className: buttonBaseClass }, "3"),
      React.createElement('button', { className: operatorButtonClass }, "+"),

      React.createElement('button', { className: `${buttonBaseClass} col-span-2` }, "0"),
      React.createElement('button', { className: buttonBaseClass }, "."),
      React.createElement('button', { className: operatorButtonClass }, "=")
    )
  );
};

const FileExplorerApp = () => {
  return React.createElement('div', { className: "p-4 h-full bg-gray-50 text-gray-800 flex flex-col" },
    React.createElement('div', { className: "flex items-center justify-between pb-2 border-b mb-2" },
        React.createElement('h2', { className: "text-xl font-semibold" }, "File Explorer"),
        React.createElement('div', { className: "text-sm text-gray-500" }, "Path: /home/user")
    ),
    React.createElement('div', { className: "flex-grow overflow-y-auto" },
        React.createElement('p', {className: "text-gray-600"}, "File and folder listing would appear here."),
        React.createElement('ul', {className: "mt-2 space-y-1"},
            React.createElement('li', {className: "flex items-center p-1 hover:bg-gray-200 rounded cursor-default"}, React.createElement('span', {className: "mr-2 text-yellow-500"}, "📁"), "Documents"),
            React.createElement('li', {className: "flex items-center p-1 hover:bg-gray-200 rounded cursor-default"}, React.createElement('span', {className: "mr-2 text-yellow-500"}, "📁"), "Pictures"),
            React.createElement('li', {className: "flex items-center p-1 hover:bg-gray-200 rounded cursor-default"}, React.createElement('span', {className: "mr-2 text-blue-500"}, "📄"), "notes.txt")
        )
    )
  );
};


export const DEFAULT_APPS = [
  { id: 'browser', name: 'Web Browser', icon: '🌐', component: WebBrowser },
  { id: 'notepad', name: 'Notepad', icon: '📝', component: NotepadApp },
  { id: 'calculator', name: 'Calculator', icon: '🧮', component: CalculatorApp },
  { id: 'explorer', name: 'File Explorer', icon: '📁', component: FileExplorerApp },
  { id: 'settings', name: 'Settings', icon: '⚙️', component: SettingsApp },
];

export const WALLPAPER_URL = 'https://picsum.photos/1920/1080?grayscale&blur=2';
export const DEFAULT_WINDOW_WIDTH = 640;
export const DEFAULT_WINDOW_HEIGHT = 480;
export const TASKBAR_HEIGHT = 48; // in pixels
