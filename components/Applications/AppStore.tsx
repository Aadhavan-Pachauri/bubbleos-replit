
import React from 'react';

const AppStore = () => {
  const sectionTitleStyle = "text-lg font-semibold mb-3 mt-5 px-4";
  const textMutedStyle = "text-xs px-4 mb-3 opacity-80"; // Slightly less muted
  const buttonStyle = "px-4 py-2 rounded-md text-sm font-medium transition-colors duration-150 focus:outline-none focus:ring-2";

  const placeholderAppCard = (id, name, category, iconUrl) => {
    return React.createElement('div', {
      key: id,
      className: "p-3 rounded-lg shadow-lg flex flex-col items-center text-center cursor-pointer transition-all duration-150 hover:transform hover:-translate-y-1 hover:shadow-xl",
      style: { backgroundColor: 'var(--secondary-bg)', color: 'var(--text-primary)' },
      tabIndex: 0,
      role: "button",
      "aria-label": `Install ${name}`,
      onClick: () => alert(`Install ${name} (not implemented).`)
    } as any,
      React.createElement('img', { src: iconUrl, alt: "", className: "w-12 h-12 mb-2 object-contain" }), // Alt empty as name is present
      React.createElement('h4', { className: "text-sm font-medium truncate w-full" }, name),
      React.createElement('p', { className: "text-xs opacity-70" }, category)
    );
  };

  return React.createElement('div', {
    className: "h-full flex flex-col overflow-y-auto",
    style: { backgroundColor: 'var(--content-bg)', color: 'var(--text-content)' }
  },
    // Header
    React.createElement('div', {
      className: "p-4 border-b sticky top-0 z-10",
      style: { backgroundColor: 'var(--content-bg)', borderColor: 'rgba(0,0,0,0.1)' }
    } as any,
      React.createElement('h2', { className: "text-xl font-semibold", style: { color: 'var(--primary-accent)' } }, "Bubble App Store")
    ),

    // Main Content
    React.createElement('div', { className: "flex-grow p-3" }, // Slightly less padding for denser content

      // Upload & Convert App Section
      React.createElement('div', { className: "mb-6 p-4 rounded-lg shadow-lg", style: { backgroundColor: 'var(--secondary-bg)', color: 'var(--text-primary)'}} as any,
        React.createElement('h3', { className: "text-lg font-semibold mb-2", style: {color: 'var(--primary-accent)'} }, "Upload & Convert Your Apps"),
        React.createElement('p', { className: "text-sm mb-3 opacity-90" },
          "Transform your existing applications (APK, EXE, DMG, etc.) into BubbleOS compatible web apps. ",
          React.createElement('strong', null, "This feature is a high-priority visual placeholder.")
        ),
        React.createElement('div', {
          className: "border-2 border-dashed rounded-md p-6 text-center mb-3 cursor-pointer transition-colors duration-200 hover:border-var-highlight-accent hover:bg-var-highlight-bg",
          style: { 
            borderColor: 'var(--primary-accent)', 
            color: 'var(--text-placeholder)'
            // Removed non-standard properties:
            // '--hover-border-var-highlight-accent': 'var(--highlight-accent)', 
            // '--hover-bg-var-highlight-bg': 'var(--highlight-bg)'
          },
          title: "Drag and drop app file here (non-functional placeholder)",
          role: "button",
          tabIndex: 0,
          "aria-label": "Drag and drop app file or click to upload",
          onClick: () => document.getElementById('app-upload-button')?.click(), // Trigger button click
          onMouseEnter: (e) => { e.currentTarget.style.borderColor = 'var(--highlight-accent)'; e.currentTarget.style.backgroundColor = 'var(--highlight-bg)';},
          onMouseLeave: (e) => { e.currentTarget.style.borderColor = 'var(--primary-accent)'; e.currentTarget.style.backgroundColor = 'transparent';}
        } as any,
          React.createElement('img', {src: "https://api.iconify.design/fluent/upload-24-filled.svg?color=00A9E0", alt:"Upload Icon", className:"w-10 h-10 mx-auto mb-2 opacity-80"}), // color matches secondary-accent
          React.createElement('p', { className: "text-sm" }, "Drag & drop app file or click button")
        ),
        React.createElement('button', {
          id: "app-upload-button",
          className: `${buttonStyle} w-full sm:w-auto font-semibold`,
          style: { backgroundColor: 'var(--primary-accent)', color: 'var(--primary-bg)' /* ringColor: 'var(--focus-ring)' // Removed */ },
          onClick: () => alert("App upload and conversion functionality is not yet implemented."),
          title: "Select app file (non-functional placeholder)"
        } as any, "Select App File to Convert")
      ),

      // Featured Apps Section
      React.createElement('h3', { className: sectionTitleStyle, style: { color: 'var(--text-content)'} }, "Featured Apps"),
      React.createElement('p', { className: textMutedStyle, style: { color: 'var(--text-placeholder)'} }, "Explore popular applications optimized for BubbleOS."),
      React.createElement('div', { className: "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 px-4 mb-6" } as any, // Reduced gap
        placeholderAppCard("app1", "Productivity Suite", "Office", "https://api.iconify.design/fluent/briefcase-24-filled.svg?color=00A9E0"),
        placeholderAppCard("app2", "Pixel Editor", "Graphics", "https://api.iconify.design/fluent/image-edit-24-filled.svg?color=00A9E0"),
        placeholderAppCard("app3", "Code Studio", "Development", "https://api.iconify.design/fluent/code-24-filled.svg?color=00A9E0"),
        placeholderAppCard("app4", "Music Maker", "Multimedia", "https://api.iconify.design/fluent/music-note-2-24-filled.svg?color=00A9E0"),
        placeholderAppCard("app5", "Social Hub", "Social", "https://api.iconify.design/fluent/people-community-24-filled.svg?color=00A9E0")
      ),
      
      // Browse by Category Section
      React.createElement('h3', { className: sectionTitleStyle, style: { color: 'var(--text-content)'} }, "Browse by Category"),
       React.createElement('p', { className: textMutedStyle, style: { color: 'var(--text-placeholder)'} }, "Find apps based on your interests."),
      React.createElement('div', { className: "flex flex-wrap gap-2 px-4 mb-6" } as any,
        ...['Productivity', 'Games', 'Utilities', 'Education', 'Development', 'Multimedia', 'Finance', 'Creative'].map(category =>
          React.createElement('button', {
            key: category,
            className: `${buttonStyle} transition-all duration-150 hover:transform hover:-translate-y-0.5`,
            style: { backgroundColor: 'var(--secondary-bg)', color: 'var(--text-primary)' /* ringColor: 'var(--focus-ring)' // Removed */},
            onMouseEnter: e => e.currentTarget.style.backgroundColor = 'var(--primary-accent)',
            onMouseLeave: e => e.currentTarget.style.backgroundColor = 'var(--secondary-bg)',
            onClick: () => alert(`Browsing ${category} apps (non-functional).`)
          } as any, category)
        )
      )
    )
  );
};

export default AppStore;
