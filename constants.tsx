
import React from 'react';
// AppDefinition type is effectively removed from types.ts, so its usage here is commented out or implicit.
import WebBrowser from './components/Applications/WebBrowser';
import AppStore from './components/Applications/AppStore'; // Added import

// --- Helper function for basic Markdown to HTML (simplified) ---
const basicMarkdownToHtml = (md) => {
  let html = md;
  // Headers (h1-h3)
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
  // Bold
  html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');
  html = html.replace(/__(.*?)__/gim, '<strong>$1</strong>');
  // Italic
  html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>');
  html = html.replace(/_(.*?)_/gim, '<em>$1</em>');
  // Links
  html = html.replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2" target="_blank" style="color: var(--secondary-accent); text-decoration: underline;">$1</a>');
  // Lists (simple unordered)
  html = html.replace(/^\s*[-*+] (.*)/gim, '<li>$1</li>');
  html = html.replace(/<\/li>\n<li>/gim, '</li><li>'); // Fix consecutive list items
  html = html.replace(/(<li>.*<\/li>)/gim, '<ul>$1</ul>'); // Wrap in <ul>
  html = html.replace(/<\/ul>\s*<ul>/gim, ''); // Combine adjacent <ul>
  // Newlines to <br>
  html = html.replace(/\n/gim, '<br />');
  return html;
};

// --- Sample Content ---
const sampleContents = {
  txt: "This is a plain text file.\nIt contains simple text content without any special formatting.\n\nPerfect for notes, logs, and basic information.",
  md: "# Sample Markdown\n\nThis is some **bold** and _italic_ text.\n\n- List item 1\n- List item 2\n\n[Visit Google](https://www.google.com)\n\n## Subheading\n\nMore text here.",
  html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Sample HTML Page</title>
    <style>
        body { font-family: sans-serif; margin: 20px; background-color: #f0f0f0; color: #333; }
        h1 { color: var(--primary-accent); } /* BubbleOS accent if !important or specific enough */
        .note { font-style: italic; color: #555; }
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400&display=swap');
        body { font-family: 'Roboto', sans-serif; }
    </style>
</head>
<body>
    <h1>Hello from HTML!</h1>
    <p>This is a paragraph rendered by the browser's engine.</p>
    <p>It supports <strong>strong tags</strong>, <em>emphasis</em>, and <a href="#" style="color: var(--secondary-accent);">links</a>.</p>
    <p class="note">This HTML is rendered inside a sandboxed iframe.</p>
</body>
</html>`,
  json: JSON.stringify({
    "name": "BubbleOS Sample Data",
    "version": "1.0",
    "features": ["Windowing", "Taskbar", "App Launcher"],
    "settings": { "theme": "dark", "fontSize": 14, "autoSave": true, "plugins": null }
  }, null, 2), // Initially pretty-printed for the raw view
  css: `body {
  font-family: Arial, sans-serif;
  margin: 0;
  padding: 20px;
  background-color: #f4f4f4;
}

h1 {
  color: var(--primary-accent); /* BubbleOS primary accent */
}

.container {
  max-width: 800px;
  margin: auto;
  background: #fff;
  padding: 20px;
  border-radius: 8px;
}`
};

// Application Components
const NotepadApp = () => {
  const [rawContent, setRawContent] = React.useState("Welcome to BubbleOS Notepad!\n\nUse 'File > Open Sample...' to load different text formats.");
  const [fileType, setFileType] = React.useState(null); // 'txt', 'md', 'html', 'json', 'css'
  const [viewMode, setViewMode] = React.useState('edit'); // 'edit', 'previewMD', 'previewHTML'
  const [showOpenDialog, setShowOpenDialog] = React.useState(false);

  const handleOpenSample = (type) => {
    setFileType(type);
    setRawContent(sampleContents[type]);
    setViewMode('edit'); // Default to edit view
    setShowOpenDialog(false);
  };

  const togglePreview = () => {
    if (fileType === 'md') {
      setViewMode(viewMode === 'previewMD' ? 'edit' : 'previewMD');
    } else if (fileType === 'html') {
      setViewMode(viewMode === 'previewHTML' ? 'edit' : 'previewHTML');
    }
  };
  
  const formatJSON = () => {
    if (fileType === 'json') {
      try {
        const parsed = JSON.parse(rawContent);
        setRawContent(JSON.stringify(parsed, null, 2));
      } catch (e) {
        alert("Invalid JSON content. Cannot format.");
      }
    }
  };

  const toolbarButtonClass = "px-3 py-1.5 text-xs rounded-md transition-colors duration-150 focus:outline-none focus:ring-1";
  const menuButtonClass = `${toolbarButtonClass} hover:bg-var-highlight-bg`;
  
  const renderContent = () => {
    if (viewMode === 'previewMD' && fileType === 'md') {
      return React.createElement('div', {
        className: "p-3.5 prose prose-sm max-w-none overflow-y-auto h-full", // TailwindCSS Prose for basic MD styling
        style: { color: 'var(--text-content)' },
        dangerouslySetInnerHTML: { __html: basicMarkdownToHtml(rawContent) }
      } as any);
    }
    if (viewMode === 'previewHTML' && fileType === 'html') {
      return React.createElement('iframe', {
        srcDoc: rawContent,
        className: "w-full h-full border-none",
        sandbox: "allow-scripts allow-same-origin" // Basic sandbox
      } as any);
    }
    // Default to textarea for editing or other file types
    return React.createElement('textarea', {
      value: rawContent,
      onChange: (e) => setRawContent((e.target as HTMLTextAreaElement).value),
      className: "w-full h-full flex-grow bg-transparent p-3.5 border-none focus:outline-none focus:ring-0 resize-none placeholder-var-text-placeholder text-sm font-mono leading-relaxed",
      style: { color: 'var(--text-content)', fontFamily: (fileType === 'json' || fileType === 'css') ? 'monospace' : 'sans-serif' },
      placeholder: "Content will appear here..."
    } as any);
  };

  const showPreviewButton = fileType === 'md' || fileType === 'html';
  const showFormatJsonButton = fileType === 'json' && viewMode === 'edit';


  return React.createElement('div', { className: "p-0 h-full flex flex-col", style: { backgroundColor: 'var(--content-bg)' } },
    // Toolbar
    React.createElement('div', {
      className: "px-2 py-1.5 border-b flex items-center space-x-2 select-none",
      style: { borderColor: 'rgba(0,0,0,0.08)', backgroundColor: 'var(--secondary-bg)', color: 'var(--text-primary)' }
    } as any, // Removed comma here
      React.createElement('div', { className: "relative group" } as any,
        React.createElement('button', {
          className: menuButtonClass,
           style: {color: 'var(--text-primary)'},
           onMouseEnter: e => e.currentTarget.style.backgroundColor = 'var(--highlight-bg)',
           onMouseLeave: e => e.currentTarget.style.backgroundColor = 'transparent',
        } as any, "File"),
        React.createElement('div', { className: "absolute left-0 mt-1 w-48 rounded-md shadow-lg py-1 bg-var-secondary-bg ring-1 ring-black ring-opacity-5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-150 pointer-events-none group-hover:pointer-events-auto", style: {backgroundColor: 'var(--secondary-bg)', zIndex: 10} } as any,
          React.createElement('a', { href: "#", onClick: (e) => { e.preventDefault(); setShowOpenDialog(true); }, className: "block px-4 py-2 text-xs hover:bg-var-highlight-bg", style: {color: 'var(--text-primary)'} } as any, "Open Sample...")
          // Future: Save, Save As...
        )
      ),
      showPreviewButton && React.createElement('button', {
        onClick: togglePreview,
        className: `${toolbarButtonClass} ${ (viewMode === 'previewMD' || viewMode === 'previewHTML') ? 'bg-var-primary-accent text-var-primary-bg' : 'hover:bg-var-highlight-bg'}`,
        style: (viewMode === 'previewMD' || viewMode === 'previewHTML') ? {backgroundColor: 'var(--primary-accent)', color: 'var(--primary-bg)'} : {color: 'var(--text-primary)', '--hover-bg-var-highlight-bg': 'var(--highlight-bg)'},
        onMouseEnter: e => { if(!(viewMode === 'previewMD' || viewMode === 'previewHTML')) e.currentTarget.style.backgroundColor = 'var(--highlight-bg)'; },
        onMouseLeave: e => { if(!(viewMode === 'previewMD' || viewMode === 'previewHTML')) e.currentTarget.style.backgroundColor = 'transparent'; },
      } as any, (viewMode === 'previewMD' || viewMode === 'previewHTML') ? 'View Raw' : `Preview ${fileType.toUpperCase()}`),
      showFormatJsonButton && React.createElement('button', {
        onClick: formatJSON,
        className: menuButtonClass,
        style: {color: 'var(--text-primary)'},
        onMouseEnter: e => e.currentTarget.style.backgroundColor = 'var(--highlight-bg)',
        onMouseLeave: e => e.currentTarget.style.backgroundColor = 'transparent',
      } as any, "Format JSON")
    ), // End of Toolbar div
    // Content Area
    renderContent(),
    // Open Sample Dialog (Modal)
    showOpenDialog && React.createElement('div', {
        className: "absolute inset-0 bg-black/50 flex items-center justify-center z-20",
        onClick: () => setShowOpenDialog(false)
      } as any,
      React.createElement('div', {
          className: "bg-var-secondary-bg p-5 rounded-lg shadow-xl w-full max-w-sm",
          style: {backgroundColor: 'var(--secondary-bg)', color: 'var(--text-primary)'},
          onClick: e => e.stopPropagation() // Prevent closing modal when clicking inside
        } as any,
        React.createElement('h3', { className: "text-lg font-semibold mb-4" }, "Open Sample File"),
        React.createElement('div', { className: "grid grid-cols-1 gap-2" } as any,
          React.createElement('button', { onClick: () => handleOpenSample('txt'), className: menuButtonClass + " w-full text-left", style:{color: 'var(--text-primary)'} } as any, "Plain Text (sample.txt)"),
          React.createElement('button', { onClick: () => handleOpenSample('md'), className: menuButtonClass + " w-full text-left", style:{color: 'var(--text-primary)'} } as any, "Markdown (readme.md)"),
          React.createElement('button', { onClick: () => handleOpenSample('html'), className: menuButtonClass + " w-full text-left", style:{color: 'var(--text-primary)'} } as any, "HTML (page.html)"),
          React.createElement('button', { onClick: () => handleOpenSample('json'), className: menuButtonClass + " w-full text-left", style:{color: 'var(--text-primary)'} } as any, "JSON (data.json)"),
          React.createElement('button', { onClick: () => handleOpenSample('css'), className: menuButtonClass + " w-full text-left", style:{color: 'var(--text-primary)'} } as any, "CSS (styles.css)")
        ),
        React.createElement('button', {
          onClick: () => setShowOpenDialog(false),
          className: "mt-4 " + toolbarButtonClass + " bg-var-danger-accent text-white w-full",
          style: {backgroundColor: 'var(--danger-accent)', color: 'white'}
        } as any, "Cancel")
      )
    )
  );
};

const SettingsApp = () => {
  const settingItemStyle = "p-3.5 border-b flex items-center space-x-3.5 cursor-pointer transition-colors duration-150"; 
  const settingIconStyle = "w-5 h-5 flex-shrink-0"; 
  const settingTextStyle = "text-sm font-medium";
  const settingDescriptionStyle = "text-xs opacity-80";

  const settingsItems = [
    { id: 'display', name: 'Display', description: 'Wallpaper, resolution, themes', icon: 'https://api.iconify.design/fluent/desktop-pulse-24-regular.svg?color=64FFDA' },
    { id: 'network', name: 'Network & Internet', description: 'Wi-Fi, Ethernet, VPN', icon: 'https://api.iconify.design/fluent/wifi-1-24-regular.svg?color=64FFDA' },
    { id: 'storage', name: 'Storage', description: 'Manage local and P2P storage', icon: 'https://api.iconify.design/fluent/data-usage-settings-24-regular.svg?color=64FFDA' },
    { id: 'privacy', name: 'Privacy & Security', description: 'Permissions, encryption', icon: 'https://api.iconify.design/fluent/shield-keyhole-24-regular.svg?color=64FFDA' },
    { id: 'apps', name: 'Applications', description: 'Manage installed applications', icon: 'https://api.iconify.design/fluent/apps-24-regular.svg?color=64FFDA' },
    { id: 'about', name: 'About BubbleOS', description: 'Version, updates, credits', icon: 'https://api.iconify.design/fluent/info-24-regular.svg?color=64FFDA' },
  ];

  return React.createElement('div', { className: "p-0 h-full overflow-y-auto", style: { backgroundColor: 'var(--content-bg)', color: 'var(--text-content)' } },
    React.createElement('h2', { className: "text-lg font-semibold p-4 border-b sticky top-0 z-10", style: { color: 'var(--primary-accent)', borderColor: 'rgba(0,0,0,0.08)', backgroundColor: 'var(--content-bg)' } }, "System Settings"),
    React.createElement('div', { className: "space-y-0" }, 
      settingsItems.map(item => 
        React.createElement('div', { 
            key: item.id, 
            className: settingItemStyle, 
            style: { borderColor: 'rgba(0,0,0,0.05)'},
            onMouseEnter: (e) => e.currentTarget.style.backgroundColor = 'var(--highlight-bg)',
            onMouseLeave: (e) => e.currentTarget.style.backgroundColor = 'transparent',
            onClick: () => alert(`Navigating to ${item.name} settings (not implemented).`),
            tabIndex: 0,
            role: "button",
            "aria-label": item.name
        } as any,
          React.createElement('img', { src: item.icon, alt: "", className: settingIconStyle }), // Alt can be empty as text is present
          React.createElement('div', null,
            React.createElement('h3', { className: settingTextStyle, style: { color: 'var(--text-content)' } }, item.name),
            React.createElement('p', { className: settingDescriptionStyle, style: { color: 'var(--text-placeholder)'} }, item.description)
          )
        )
      )
    )
  );
};

const CalculatorApp = () => {
  const [displayValue, setDisplayValue] = React.useState("0");
  const [prevValue, setPrevValue] = React.useState(null);
  const [operator, setOperator] = React.useState(null);
  const [waitingForOperand, setWaitingForOperand] = React.useState(false);

  const inputDigit = (digit) => {
    if (displayValue.length >= 16 && !waitingForOperand) return; 
    if (waitingForOperand) {
      setDisplayValue(String(digit));
      setWaitingForOperand(false);
    } else {
      setDisplayValue(displayValue === "0" || displayValue === "Error: Div by 0" ? String(digit) : displayValue + digit);
    }
  };

  const inputDecimal = () => {
    if(displayValue === "Error: Div by 0") return;
    if (waitingForOperand) {
      setDisplayValue("0.");
      setWaitingForOperand(false);
      return;
    }
    if (!displayValue.includes(".")) {
      setDisplayValue(displayValue + ".");
    }
  };

  const clearAll = () => {
    setDisplayValue("0");
    setPrevValue(null);
    setOperator(null);
    setWaitingForOperand(false);
  };
  
  const performOperation = (nextOperator) => {
    if(displayValue === "Error: Div by 0" && nextOperator !== "AC") return;
    const inputValue = parseFloat(displayValue);

    if (prevValue === null) {
      setPrevValue(inputValue);
    } else if (operator) {
      const currentValue = prevValue || 0;
      let result;
      switch (operator) {
        case '+': result = currentValue + inputValue; break;
        case '-': result = currentValue - inputValue; break;
        case '*': result = currentValue * inputValue; break;
        case '/': result = inputValue === 0 ? 'Error: Div by 0' : currentValue / inputValue; break;
        default: return;
      }
      
      if (typeof result === 'string' && result.startsWith('Error')) {
        setDisplayValue(result);
        setPrevValue(null); // Error state, reset prevValue
      } else {
        const roundedResult = parseFloat(result.toPrecision(12)); 
        setDisplayValue(String(roundedResult).slice(0,16));
        setPrevValue(roundedResult);
      }
    }
    
    setWaitingForOperand(true);
    setOperator(nextOperator === "=" ? null : nextOperator);
    if (nextOperator === "=") {
        if(displayValue !== "Error: Div by 0") setPrevValue(null); 
        setWaitingForOperand(false);
    }
  };

  const toggleSign = () => {
    if(displayValue === "0" || displayValue === "Error: Div by 0") return;
    setDisplayValue(displayValue.charAt(0) === '-' ? displayValue.substr(1) : '-' + displayValue);
  };

  const inputPercent = () => {
    if(displayValue === "Error: Div by 0") return;
    const currentValue = parseFloat(displayValue);
    setDisplayValue(String(currentValue / 100).slice(0,16));
    setWaitingForOperand(true); // So next number input starts fresh
  }

  const buttonBaseClass = "font-medium py-3 rounded-lg text-xl transition-all duration-100 focus:outline-none focus:ring-2 focus:ring-opacity-75 active:transform active:scale-95 shadow-md";
  
  const styles = {
    calcContainer: { backgroundColor: 'var(--secondary-bg)' },
    display: { backgroundColor: 'var(--primary-bg)', color: 'var(--text-primary)', ringColor: 'var(--focus-ring)' },
    numButton: { backgroundColor: 'var(--titlebar-bg)', color: 'var(--text-primary)', ringColor: 'var(--focus-ring)' },
    opButton: { backgroundColor: 'var(--primary-accent)', color: 'var(--primary-bg)', ringColor: 'var(--focus-ring)' }, 
    specialButton: { backgroundColor: 'var(--secondary-accent)', color: 'var(--primary-bg)', ringColor: 'var(--focus-ring)' },
    
    numButtonHover: { filter: 'brightness(1.25)' },
    opButtonHover: { filter: 'brightness(1.1)'},
    specialButtonHover: { filter: 'brightness(1.1)' },
  };

  const buttons = [
    { label: "AC", style: styles.specialButton, action: clearAll, hoverStyle: styles.specialButtonHover, className: "col-span-1" }, // AC specific
    { label: "+/-", style: styles.specialButton, action: toggleSign, hoverStyle: styles.specialButtonHover },
    { label: "%", style: styles.specialButton, action: inputPercent, hoverStyle: styles.specialButtonHover },
    { label: "/", style: styles.opButton, action: () => performOperation("/"), hoverStyle: styles.opButtonHover },
    
    { label: "7", style: styles.numButton, action: () => inputDigit(7), hoverStyle: styles.numButtonHover },
    { label: "8", style: styles.numButton, action: () => inputDigit(8), hoverStyle: styles.numButtonHover },
    { label: "9", style: styles.numButton, action: () => inputDigit(9), hoverStyle: styles.numButtonHover },
    { label: "*", style: styles.opButton, action: () => performOperation("*"), hoverStyle: styles.opButtonHover },

    { label: "4", style: styles.numButton, action: () => inputDigit(4), hoverStyle: styles.numButtonHover },
    { label: "5", style: styles.numButton, action: () => inputDigit(5), hoverStyle: styles.numButtonHover },
    { label: "6", style: styles.numButton, action: () => inputDigit(6), hoverStyle: styles.numButtonHover },
    { label: "-", style: styles.opButton, action: () => performOperation("-"), hoverStyle: styles.opButtonHover },

    { label: "1", style: styles.numButton, action: () => inputDigit(1), hoverStyle: styles.numButtonHover },
    { label: "2", style: styles.numButton, action: () => inputDigit(2), hoverStyle: styles.numButtonHover },
    { label: "3", style: styles.numButton, action: () => inputDigit(3), hoverStyle: styles.numButtonHover },
    { label: "+", style: styles.opButton, action: () => performOperation("+"), hoverStyle: styles.opButtonHover },

    { label: "0", style: styles.numButton, className: `col-span-2`, action: () => inputDigit(0), hoverStyle: styles.numButtonHover },
    { label: ".", style: styles.numButton, action: inputDecimal, hoverStyle: styles.numButtonHover },
    { label: "=", style: styles.opButton, action: () => performOperation("="), hoverStyle: styles.opButtonHover },
  ];
  
  const applyHoverStyles = (e, hoverStyle) => { if (hoverStyle) Object.keys(hoverStyle).forEach(key => e.currentTarget.style[key] = hoverStyle[key]); };
  const resetStyles = (e, originalStyle) => { if (originalStyle) Object.keys(originalStyle).forEach(key => e.currentTarget.style[key] = originalStyle[key]);};

  return React.createElement('div', { className: "p-3 h-full flex flex-col font-mono select-none", style: styles.calcContainer },
    React.createElement('div', { 
      id: "calc-display", 
      className: "text-right text-5xl p-4 rounded-lg mb-3 overflow-x-auto h-24 flex items-center justify-end shadow-inner break-all",
      style: styles.display,
      "aria-live": "polite"
    } as any, displayValue),
    React.createElement('div', { className: "grid grid-cols-4 gap-2 flex-grow" },
      ...buttons.map(btn => React.createElement('button', { 
        key: btn.label, 
        onClick: btn.label === "AC" ? clearAll : btn.action, // Ensure AC calls clearAll directly
        className: `${buttonBaseClass} ${btn.className || ''}`, 
        style: { ...btn.style },
        onMouseEnter: (e) => applyHoverStyles(e, btn.hoverStyle),
        onMouseLeave: (e) => resetStyles(e, btn.style),
        onTouchStart: (e) => applyHoverStyles(e, btn.hoverStyle),
        onTouchEnd: (e) => resetStyles(e, btn.style),
        "aria-label": btn.label
      } as any, btn.label))
    )
  );
};

const FileExplorerApp = () => {
  const [currentPath, setCurrentPath] = React.useState(["Home", "BubbleUser"]);

  const sidebarItems = [
    { name: "Home", icon: "https://api.iconify.design/fluent/home-24-filled.svg?color=64FFDA", path: ["Home", "BubbleUser"] },
    { name: "Documents", icon: "https://api.iconify.design/fluent/document-multiple-24-filled.svg?color=64FFDA", path: ["Home", "BubbleUser", "Documents"] },
    { name: "Downloads", icon: "https://api.iconify.design/fluent/arrow-download-24-filled.svg?color=64FFDA", path: ["Home", "BubbleUser", "Downloads"] },
    { name: "Pictures", icon: "https://api.iconify.design/fluent/image-multiple-24-filled.svg?color=64FFDA", path: ["Home", "BubbleUser", "Pictures"] },
    { name: "BubbleOS Drive", icon: "https://api.iconify.design/fluent/cloud-24-filled.svg?color=64FFDA", path: ["BubbleOS Drive"] },
  ];

  // Sample files based on current path (conceptual)
  const getFilesForPath = (pathArray) => {
    const pathStr = pathArray.join('/');
    if (pathStr === "Home/BubbleUser/Documents") {
      return [
        { name: "Project Alpha", type: "folder", icon: "https://api.iconify.design/fluent/folder-24-filled.svg?color=00A9E0" },
        { name: "My Novel Draft.docx", type: "file", icon: "https://api.iconify.design/vscode-icons/file-type-word.svg" },
        { name: "Meeting Notes.txt", type: "file", icon: "https://api.iconify.design/vscode-icons/file-type-text.svg" },
      ];
    }
     if (pathStr === "Home/BubbleUser/Downloads") {
      return [
        { name: "installer_package.zip", type: "file", icon: "https://api.iconify.design/vscode-icons/file-type-zip.svg" },
        { name: "latest_report.pdf", type: "file", icon: "https://api.iconify.design/vscode-icons/file-type-pdf2.svg" },
      ];
    }
    // Default for Home/BubbleUser
    return [
      { name: "Documents", type: "folder", icon: "https://api.iconify.design/fluent/folder-24-filled.svg?color=00A9E0" },
      { name: "Pictures", type: "folder", icon: "https://api.iconify.design/fluent/folder-image-24-filled.svg?color=00A9E0" },
      { name: "Music", type: "folder", icon: "https://api.iconify.design/fluent/folder-music-24-filled.svg?color=00A9E0" },
      { name: "Downloads", type: "folder", icon: "https://api.iconify.design/fluent/folder-arrow-down-24-filled.svg?color=00A9E0" },
      { name: "README.md", type: "file", icon: "https://api.iconify.design/vscode-icons/file-type-markdown.svg" },
      { name: "script.js", type: "file", icon: "https://api.iconify.design/vscode-icons/file-type-js.svg" },
    ];
  };
  
  const files = getFilesForPath(currentPath);

  const navigateToPath = (pathArray) => {
    setCurrentPath(pathArray);
  };
  
  const openItem = (item) => {
    if (item.type === 'folder') {
      // Find the full path for this folder if it's a relative name
      const newPath = [...currentPath, item.name];
      // A more robust system would check if item.name is a full path or relative
      // For now, assume item.name is a subfolder
      setCurrentPath(newPath);
    } else {
      alert(`Opening file: ${item.name} (not implemented)`);
    }
  };

  const breadcrumbClick = (index) => {
    setCurrentPath(currentPath.slice(0, index + 1));
  };

  const toolbarButtonBase = "p-2 rounded-md hover:bg-var-highlight-bg transition-colors duration-150 flex items-center space-x-1.5 text-xs";
  const iconOnlyButtonBase = "p-1.5 rounded-md hover:bg-var-highlight-bg transition-colors duration-150";
  
  return React.createElement('div', { className: "h-full flex overflow-hidden", style: { backgroundColor: 'var(--content-bg)', color: 'var(--text-content)' } },
    // Sidebar
    React.createElement('div', {
      className: "w-56 flex-shrink-0 p-3 space-y-3 border-r overflow-y-auto",
      style: { backgroundColor: 'var(--secondary-bg)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }
    } as any,
      React.createElement('h3', { className: "px-2 py-1 text-sm font-semibold", style: { color: 'var(--primary-accent)' } }, "Favorites"),
      sidebarItems.filter(item => ["Home", "Documents", "Downloads", "Pictures"].includes(item.name)).map(item =>
        React.createElement('button', {
          key: item.name,
          onClick: () => navigateToPath(item.path),
          className: `w-full flex items-center space-x-2.5 p-2 rounded-md text-xs font-medium transition-colors duration-150 ${currentPath.join('/') === item.path.join('/') ? 'bg-var-primary-accent text-var-primary-bg' : 'hover:bg-var-highlight-bg'}`,
          style: currentPath.join('/') === item.path.join('/') ? {backgroundColor: 'var(--primary-accent)', color: 'var(--primary-bg)'} : {color: 'var(--text-primary)', '--hover-bg-var-highlight-bg': 'var(--highlight-bg)'}
        } as any,
          React.createElement('img', { src: item.icon, alt: "", className: "w-4 h-4 flex-shrink-0" }),
          React.createElement('span', null, item.name)
        )
      ),
      React.createElement('h3', { className: "px-2 py-1 text-sm font-semibold mt-4", style: { color: 'var(--primary-accent)' } }, "Locations"),
       sidebarItems.filter(item => ["BubbleOS Drive"].includes(item.name)).map(item =>
        React.createElement('button', {
          key: item.name,
          onClick: () => navigateToPath(item.path),
          className: `w-full flex items-center space-x-2.5 p-2 rounded-md text-xs font-medium transition-colors duration-150 ${currentPath.join('/') === item.path.join('/') ? 'bg-var-primary-accent text-var-primary-bg' : 'hover:bg-var-highlight-bg'}`,
           style: currentPath.join('/') === item.path.join('/') ? {backgroundColor: 'var(--primary-accent)', color: 'var(--primary-bg)'} : {color: 'var(--text-primary)', '--hover-bg-var-highlight-bg': 'var(--highlight-bg)'}
        } as any,
          React.createElement('img', { src: item.icon, alt: "", className: "w-4 h-4 flex-shrink-0" }),
          React.createElement('span', null, item.name)
        )
      )
    ), // End of Sidebar div
    // Main Content Area
    React.createElement('div', { className: "flex-grow flex flex-col overflow-hidden" },
      // Toolbar
      React.createElement('div', {
        className: "p-2.5 border-b flex items-center justify-between select-none",
        style: { borderColor: 'rgba(0,0,0,0.08)', backgroundColor: 'var(--content-bg)', color: 'var(--text-content)' }
      } as any, // Removed comma here
        React.createElement('div', {className: "flex items-center space-x-1.5"},
            React.createElement('button', { className: toolbarButtonBase, style: {color: 'var(--text-content)'}, title:"New Folder" } as any, 
                React.createElement('img', {src: "https://api.iconify.design/fluent/folder-add-20-regular.svg?color=0A192F", alt:"", className:"w-4 h-4"}), 
                "New Folder"
            ),
            React.createElement('button', { className: toolbarButtonBase, style: {color: 'var(--text-content)'}, title:"Upload File" } as any, 
                React.createElement('img', {src: "https://api.iconify.design/fluent/document-add-20-regular.svg?color=0A192F", alt:"", className:"w-4 h-4"}), 
                "Upload"
            )
        ), // End of the first child div (button group 1)
        React.createElement('div', {className: "flex items-center space-x-1"},
            React.createElement('button', { className: iconOnlyButtonBase, title: "Grid View" } as any, React.createElement('img', {src: "https://api.iconify.design/fluent/grid-dots-20-filled.svg?color=00A9E0", alt:"", className:"w-4 h-4"})),
            React.createElement('button', { className: iconOnlyButtonBase, title: "List View" } as any, React.createElement('img', {src: "https://api.iconify.design/fluent/text-bullet-list-ltr-20-regular.svg?color=0A192F", alt:"", className:"w-4 h-4"}))
        ) // End of the second child div (button group 2)
      ), // End of Toolbar div
      // Breadcrumbs
      React.createElement('div', { className: "p-2.5 border-b text-xs select-none", style: { borderColor: 'rgba(0,0,0,0.05)', backgroundColor: 'var(--content-bg)', color: 'var(--text-placeholder)' } } as any,
        currentPath.map((segment, index) => 
          React.createElement('span', { key: index },
            index > 0 && React.createElement('span', { className: "mx-1" }, ">"),
            React.createElement('button', { 
              onClick: () => breadcrumbClick(index),
              className: `hover:text-var-primary-accent ${index === currentPath.length - 1 ? 'font-medium text-var-text-content' : ''}`,
              style: index === currentPath.length -1 ? {color: 'var(--text-content)'} : {color: 'var(--text-placeholder)', '--hover-text-var-primary-accent': 'var(--primary-accent)'} // for JIT
            } as any, segment)
          )
        )
      ),
      // File Grid
      React.createElement('div', { className: "flex-grow overflow-y-auto p-4" },
        React.createElement('div', { className: "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-4" } as any,
          files.map(item => 
            React.createElement('button', {
              key: item.name,
              onClick: () => openItem(item),
              className: "p-3 rounded-lg flex flex-col items-center text-center cursor-pointer transition-all duration-150 hover:bg-var-highlight-bg hover:shadow-md focus:outline-none focus:ring-2 focus:ring-var-primary-accent",
              style: {backgroundColor: 'transparent', '--hover-bg-var-highlight-bg': 'var(--highlight-bg)', '--focus-ring-var-primary-accent': 'var(--primary-accent)'} // for JIT
            } as any,
              React.createElement('img', { src: item.icon, alt: item.type, className: "w-12 h-12 mb-2 object-contain" }),
              React.createElement('span', { className: "text-xs font-medium truncate w-full", style: { color: 'var(--text-content)' } }, item.name)
            )
          )
        )
      )
    )
  );
};


export const DEFAULT_APPS = [
  { id: 'browser', name: 'Web Browser', icon: 'https://api.iconify.design/fluent/globe-desktop-24-filled.svg?color=00A9E0', component: WebBrowser, defaultWidth: 800, defaultHeight: 600 },
  { id: 'notepad', name: 'Notepad', icon: 'https://api.iconify.design/fluent/notepad-edit-24-filled.svg?color=00A9E0', component: NotepadApp, defaultWidth: 700, defaultHeight: 500 }, // Increased default size
  { id: 'calculator', name: 'Calculator', icon: 'https://api.iconify.design/fluent/calculator-24-filled.svg?color=00A9E0', component: CalculatorApp, defaultWidth: 320, defaultHeight: 480 },
  { id: 'explorer', name: 'File Explorer', icon: 'https://api.iconify.design/fluent/folder-open-vertical-24-filled.svg?color=00A9E0', component: FileExplorerApp, defaultWidth: 850, defaultHeight: 600 }, // Increased default size for new layout
  { id: 'settings', name: 'Settings', icon: 'https://api.iconify.design/fluent/settings-cog-multiple-24-filled.svg?color=00A9E0', component: SettingsApp, defaultWidth: 600, defaultHeight: 450 },
  { id: 'appstore', name: 'App Store', icon: 'https://api.iconify.design/fluent/app-folder-24-filled.svg?color=00A9E0', component: AppStore, defaultWidth: 750, defaultHeight: 550 },
];

export const WALLPAPER_URL = 'https://images.unsplash.com/photo-1617503752587-97d2103a96ea?auto=format&fit=crop&w=1920&q=80'; // New colorful, sharp wallpaper
export const DEFAULT_WINDOW_WIDTH = 640; // Default, but individual apps can override
export const DEFAULT_WINDOW_HEIGHT = 480;
export const TASKBAR_HEIGHT = 48; // in pixels
