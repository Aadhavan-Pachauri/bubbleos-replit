import React, { useState } from "react";

const WebBrowser = () => {
  const [url, setUrl] = useState(
    /*<string>*/ "https://www.google.com/webhp?igu=1&hl=en",
  );
  const [iframeSrc, setIframeSrc] = useState(
    /*<string>*/ "https://www.google.com/webhp?igu=1&hl=en",
  );
  const [isLoading, setIsLoading] = useState(/*<boolean>*/ false);
  const [error, setError] = useState(/*<string | null>*/ null);
  const [currentTitle, setCurrentTitle] = useState("New Tab");

  const handleSubmit = (e /*: React.FormEvent<HTMLFormElement>*/) => {
    e.preventDefault();
    navigateToUrl(url);
  };

  const navigateToUrl = (targetUrl /*: string*/) => {
    let finalUrl = targetUrl.trim();
    if (!finalUrl) {
      setError("URL cannot be empty. Please enter a valid web address.");
      setIframeSrc("about:blank");
      setCurrentTitle("Error");
      return;
    }
    if (!finalUrl.startsWith("http://") && !finalUrl.startsWith("https://")) {
      finalUrl = "https://" + finalUrl;
    }

    setIsLoading(true);
    setError(null);
    setUrl(finalUrl);
    setIframeSrc(finalUrl);
    setCurrentTitle("Loading...");
  };

  const handleIframeLoad = (event) => {
    setIsLoading(false);
    setError(null);
    try {
      // This will likely fail for cross-origin iframes, which is expected.
      const iframeDocument = event.target.contentWindow?.document;
      if (iframeDocument && iframeDocument.title) {
        setCurrentTitle(iframeDocument.title);
      } else {
        setCurrentTitle(
          iframeSrc.replace(/^https?:\/\/(www\.)?/, "").split("/")[0],
        ); // Fallback to domain
      }
    } catch (e) {
      // Fallback if title access is blocked
      setCurrentTitle(
        iframeSrc.replace(/^https?:\/\/(www\.)?/, "").split("/")[0],
      );
    }
  };

  const handleIframeError = (event) => {
    setIsLoading(false);
    setError(
      `Failed to load: ${iframeSrc}. This content cannot be displayed. Common reasons include X-Frame-Options or CSP headers preventing framing, or the URL is incorrect/unavailable.`,
    );
    setCurrentTitle("Page Load Error");
  };

  const toolbarButtonClass =
    "p-1.5 rounded-md transition-colors duration-150 focus:outline-none focus:ring-1 flex items-center justify-center";
  const iconBaseStyle = "w-5 h-5"; // Increased size slightly

  // Update window title via prop if available (conceptual)
  // if (windowId && typeof window.updateWindowTitle === 'function') {
  //    window.updateWindowTitle(windowId, `Browser - ${currentTitle}`);
  // }

  return React.createElement(
    "div",
    {
      className: "flex flex-col h-full",
      style: {
        backgroundColor: "var(--content-bg)",
        color: "var(--text-content)",
      },
    },
    React.createElement(
      "form",
      {
        onSubmit: handleSubmit,
        className: "p-2 flex items-center space-x-2 border-b shadow-sm",
        style: {
          borderColor: "var(--border-color)",
          backgroundColor: "var(--secondary-bg)",
        },
      },
      React.createElement(
        "button",
        {
          type: "button",
          onClick: () => navigateToUrl(iframeSrc),
          className: `${toolbarButtonClass} hover:bg-var-highlight-bg`,
          style: {
            color: "var(--text-primary)",
            // ringColor: 'var(--focus-ring)', // Already handled by focus:ring-1 in toolbarButtonClass
            "--hover-bg-var-highlight-bg": "var(--highlight-bg)", // For JIT
          },
          onMouseEnter: (e) =>
            (e.currentTarget.style.backgroundColor = "var(--highlight-bg)"),
          onMouseLeave: (e) =>
            (e.currentTarget.style.backgroundColor = "transparent"),
          title: "Reload current page",
          "aria-label": "Reload page",
        } as any,
        React.createElement("img", {
          src: "https://api.iconify.design/fluent/arrow-clockwise-20-regular.svg?color=CCD6F6",
          alt: "Reload",
          className: iconBaseStyle,
        }),
      ), // CCD6F6 is --text-primary
      React.createElement("input", {
        type: "text",
        value: url,
        onChange: (e /*: React.ChangeEvent<HTMLInputElement>*/) =>
          setUrl((e.target as HTMLInputElement).value),
        placeholder: "Enter URL and press Enter",
        className:
          "flex-grow p-1.5 border rounded-md focus:outline-none focus:ring-2 text-sm shadow-inner",
        style: {
          backgroundColor: "var(--primary-bg)",
          color: "var(--text-primary)",
          borderColor: "var(--border-color)",
          // ringColor: 'var(--focus-ring)', // Removed, focus:ring-2 class handles this
          "--placeholder-color": "var(--text-placeholder)",
        },
        "aria-label": "Address bar",
      } as any),
      React.createElement(
        "button",
        {
          type: "submit",
          className: `${toolbarButtonClass} font-semibold text-sm px-3.5`, // Adjusted padding
          style: {
            backgroundColor: "var(--primary-accent)",
            color:
              "var(--primary-bg)" /* ringColor: 'var(--focus-ring)' // Removed */,
          },
          onMouseEnter: (e) =>
            (e.currentTarget.style.filter = "brightness(1.1)"),
          onMouseLeave: (e) => (e.currentTarget.style.filter = "none"),
          title: "Go to entered URL",
          "aria-label": "Go",
        } as any,
        "Go",
      ),
    ),
    React.createElement(
      "div",
      {
        className: "flex-grow relative",
        style: { backgroundColor: "#FFFFFF" },
      },
      isLoading &&
        React.createElement(
          "div",
          {
            className:
              "absolute inset-0 flex flex-col items-center justify-center z-10 p-4 text-center",
            style: { backgroundColor: "rgba(255,255,255,0.9)" },
          }, // Added p-4 and text-center
          React.createElement(
            "svg",
            {
              className: "animate-spin h-8 w-8 mb-3",
              style: { color: "var(--primary-accent)" },
              xmlns: "http://www.w3.org/2000/svg",
              fill: "none",
              viewBox: "0 0 24 24",
            },
            React.createElement("circle", {
              className: "opacity-25",
              cx: "12",
              cy: "12",
              r: "10",
              stroke: "currentColor",
              strokeWidth: "4",
            }),
            React.createElement("path", {
              className: "opacity-75",
              fill: "currentColor",
              d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z",
            }),
          ),
          React.createElement(
            "p",
            {
              className: "text-md font-medium",
              style: { color: "var(--text-content)" },
            },
            "Loading page...",
          ),
        ),

      error &&
        React.createElement(
          "div",
          {
            className:
              "absolute inset-0 flex flex-col items-center justify-center p-6 z-10 text-center",
            style: { backgroundColor: "var(--content-bg)" },
          },
          React.createElement("img", {
            src: "https://api.iconify.design/fluent/error-circle-24-filled.svg?color=FF6B6B",
            alt: "Error",
            className: "w-12 h-12 mb-3",
          }), // Using --danger-accent color
          React.createElement(
            "h3",
            {
              className: "text-lg font-semibold mb-1",
              style: { color: "var(--danger-accent)" },
            },
            "Page Load Error",
          ),
          React.createElement(
            "p",
            {
              className: "text-sm max-w-md opacity-90",
              style: { color: "var(--text-content)" },
            },
            error,
          ),
          React.createElement(
            "button",
            {
              onClick: () => {
                setError(null);
                setUrl("https://www.google.com/webhp?igu=1&hl=en");
                setIframeSrc("https://www.google.com/webhp?igu=1&hl=en");
                setIsLoading(false);
                setCurrentTitle("New Tab");
              },
              className:
                "mt-4 px-4 py-1.5 text-white rounded-md hover:opacity-90 text-sm transition-opacity font-semibold",
              style: {
                backgroundColor: "var(--primary-accent)",
                color: "var(--primary-bg)",
              },
            } as any,
            "Try Google",
          ),
        ),

      React.createElement("iframe", {
        src: iframeSrc,
        // title: currentTitle, // Title attribute on iframe is for accessibility, not display
        className: `w-full h-full border-none transition-opacity duration-300 ${isLoading || error ? "opacity-0 pointer-events-none" : "opacity-100"}`,
        onLoad: handleIframeLoad,
        onError: handleIframeError,
        sandbox:
          "allow-forms allow-modals allow-pointer-lock allow-popups allow-popups-to-escape-sandbox allow-presentation allow-same-origin allow-scripts",
        referrerPolicy: "strict-origin-when-cross-origin",
        "aria-label": `Web content for ${currentTitle}`,
      }),
    ),
  );
};

export default WebBrowser;
