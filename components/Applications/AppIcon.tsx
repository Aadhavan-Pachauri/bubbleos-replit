
import React from 'react';

const AppIcon = ({ app, onClick, isActive = false, isMinimized = false, showTitle = true, className = "", desktopClassName = "" }/*: AppIconProps*/) => {
  const baseClasses = "flex items-center rounded-md cursor-pointer transition-all duration-150 ease-in-out focus:outline-none focus:ring-1";
  
  let effectiveClassName = `${baseClasses} ${className}`;
  const isDesktopIcon = !!desktopClassName;

  const iconIsUrl = typeof app.icon === 'string' && (app.icon.startsWith('http') || app.icon.startsWith('data:image'));
  
  const iconElement = iconIsUrl ? 
    React.createElement('img', { 
      src: app.icon, 
      alt: app.name, 
      className: `flex-shrink-0 object-contain ${isDesktopIcon ? 'w-10 h-10' : (showTitle ? 'w-5 h-5 mr-2' : 'w-6 h-6')}` // Adjusted mr for StartMenu
    }) :
    React.createElement('span', { 
      className: `flex-shrink-0 ${isDesktopIcon ? 'text-3xl' : (showTitle ? 'mr-2 text-lg' : 'text-xl')}` // Adjusted mr
    }, app.icon);

  if (isDesktopIcon) {
    // Desktop Icon Specific Styling
    effectiveClassName = `${baseClasses} ${desktopClassName} flex-col justify-center items-center w-24 h-24 p-2 text-center hover:opacity-80`;
     return React.createElement('button', {
      onClick: onClick,
      className: effectiveClassName,
      title: app.name,
      "aria-label": app.name,
      style: { ringColor: 'var(--focus-ring)', backgroundColor: 'rgba(255,255,255,0.05)', '--hover-bg-opacity': '0.1' }, // Subtle bg for desktop icons
      onMouseEnter: e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.15)',
      onMouseLeave: e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'
    },
      iconElement,
      React.createElement('span', { 
        className: "text-xs truncate w-full mt-1.5 font-medium", 
        style: { color: 'var(--text-primary)', textShadow: '0 1px 3px rgba(0,0,0,0.6)' } 
      }, app.name)
    );
  }

  // Styles for Start Menu and Taskbar
  let dynamicStyle = {
    ringColor: 'var(--focus-ring)',
    color: 'var(--text-primary)', // Default text color for StartMenu items
    backgroundColor: 'transparent'
  };

  if (showTitle) { 
    // For Start Menu
    effectiveClassName += ` p-2 hover:opacity-90`; // Use opacity for hover for now
     dynamicStyle.backgroundColor = 'transparent'; // Handled by inline hover
     // Inline hover for Start Menu items
  } else { 
    // For Taskbar
    effectiveClassName += ` justify-center items-center w-14 h-full relative`; // No explicit hover:opacity-80 here, handled by active/inactive
    
    if (isActive) { 
      dynamicStyle.backgroundColor = 'var(--secondary-accent)'; 
      effectiveClassName += ` after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-4/5 after:h-[3px] after:rounded-t-sm`;
      dynamicStyle['--after-bg-color'] = 'var(--primary-accent)'; // Used for the ::after pseudo-element's background
      // For ::after styling: use inline style for custom prop, or use Tailwind's after:bg-[var(--after-bg-color)] if JIT supports it
      // For now, it's a placeholder if not using direct CSS.
      // A simple border bottom could also work: dynamicStyle.borderBottom = `3px solid var(--primary-accent)`
      // Instead of ::after, let's use a div for indicator:
    } else if (isMinimized) {
      effectiveClassName += ` opacity-60 hover:opacity-90`;
    } else {
       effectiveClassName += ` opacity-80 hover:opacity-90`;
    }
  }
  
  const childrenElements = [iconElement];
  if (showTitle) {
    childrenElements.push(React.createElement('span', { className: "text-sm truncate" }, app.name));
  }
  
  // Taskbar active indicator div
  if (!showTitle && isActive) {
      childrenElements.push(
          React.createElement('div', {
              className: 'absolute bottom-0 left-1/2 -translate-x-1/2 w-4/5 h-[3px] rounded-t-sm',
              style: { backgroundColor: 'var(--primary-accent)'}
          })
      );
  }


  return (
    React.createElement('button', {
      onClick: onClick,
      className: effectiveClassName,
      title: app.name,
      "aria-label": app.name,
      style: dynamicStyle,
      onMouseEnter: (e) => { if (showTitle || (!isActive && !isMinimized)) e.currentTarget.style.backgroundColor = 'var(--secondary-bg)'; }, // Hover for StartMenu & inactive Taskbar
      onMouseLeave: (e) => { if (showTitle || (!isActive && !isMinimized)) e.currentTarget.style.backgroundColor = 'transparent'; } // Reset for StartMenu & inactive Taskbar
    },
      ...childrenElements
    )
  );
};

export default AppIcon;