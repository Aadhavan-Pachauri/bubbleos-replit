import React, { useCallback, useRef, useEffect, useState } from "react";
import { WindowManagerActionType } from "../../types";
import { useWindowManager } from "../../contexts/WindowManagerContext";

const WindowControls = (
  {
    windowId,
    isMaximized,
    onClose,
    onMinimize,
    onMaximize,
  } /*: WindowControlsProps*/,
) => {
  const controlButtonBase =
    "w-3.5 h-3.5 md:w-4 md:h-4 rounded-full focus:outline-none flex items-center justify-center text-black/70 font-bold text-[9px] md:text-[10px] shadow-sm transition-all duration-150";
  const iconSizeStyle = { width: "50%", height: "50%" }; // Adjusted for smaller buttons

  // Using more vibrant, OS-like control button colors directly
  const minimizeColor = "#FAC536"; // Amber/Yellow
  const maximizeColor = "#34C759"; // Green
  const closeColor = "#FF605C"; // Red

  const hoverBrightness = "brightness(0.85)";
  const activeBrightness = "brightness(0.7)";

  const minimizeIcon = React.createElement("img", {
    src: "https://api.iconify.design/ph/minus-bold.svg?color=374151",
    alt: "minimize",
    style: iconSizeStyle,
  });
  const maximizeIcon = React.createElement("img", {
    src: "https://api.iconify.design/ph/square-bold.svg?color=374151",
    alt: "maximize",
    style: iconSizeStyle,
  });
  const restoreIcon = React.createElement("img", {
    src: "https://api.iconify.design/ph/corners-out-bold.svg?color=374151",
    alt: "restore",
    style: iconSizeStyle,
  });
  const closeIcon = React.createElement("img", {
    src: "https://api.iconify.design/ph/x-bold.svg?color=374151",
    alt: "close",
    style: iconSizeStyle,
  });

  const minimizeButton = React.createElement(
    "button",
    {
      onClick: onMinimize,
      className: controlButtonBase,
      style: { backgroundColor: minimizeColor, ringColor: "var(--focus-ring)" },
      onMouseEnter: (e) => (e.currentTarget.style.filter = hoverBrightness),
      onMouseLeave: (e) => (e.currentTarget.style.filter = "none"),
      onMouseDown: (e) => (e.currentTarget.style.filter = activeBrightness),
      onMouseUp: (e) => (e.currentTarget.style.filter = hoverBrightness),
      title: "Minimize",
      "aria-label": "Minimize Window",
    },
    minimizeIcon,
  );

  const maximizeButton = React.createElement(
    "button",
    {
      onClick: onMaximize,
      className: controlButtonBase,
      style: { backgroundColor: maximizeColor, ringColor: "var(--focus-ring)" },
      onMouseEnter: (e) => (e.currentTarget.style.filter = hoverBrightness),
      onMouseLeave: (e) => (e.currentTarget.style.filter = "none"),
      onMouseDown: (e) => (e.currentTarget.style.filter = activeBrightness),
      onMouseUp: (e) => (e.currentTarget.style.filter = hoverBrightness),
      title: isMaximized ? "Restore" : "Maximize",
      "aria-label": isMaximized ? "Restore Window" : "Maximize Window",
    },
    isMaximized ? restoreIcon : maximizeIcon,
  );

  const closeButton = React.createElement(
    "button",
    {
      onClick: onClose,
      className: controlButtonBase,
      style: { backgroundColor: closeColor, ringColor: "var(--focus-ring)" },
      onMouseEnter: (e) => (e.currentTarget.style.filter = hoverBrightness),
      onMouseLeave: (e) => (e.currentTarget.style.filter = "none"),
      onMouseDown: (e) => (e.currentTarget.style.filter = activeBrightness),
      onMouseUp: (e) => (e.currentTarget.style.filter = hoverBrightness),
      title: "Close",
      "aria-label": "Close Window",
    },
    closeIcon,
  );

  return React.createElement(
    "div",
    { className: "flex space-x-1.5 items-center" }, // Reduced space
    closeButton, // Common OS order: Close, Minimize, Maximize
    minimizeButton,
    maximizeButton,
  );
};

const Window = ({ windowInstance } /*: WindowProps*/) => {
  const { state, dispatch } = useWindowManager();
  const {
    id,
    title,
    icon,
    x,
    y,
    width,
    height,
    zIndex,
    content,
    isMaximized,
    isFocused,
  } = windowInstance;
  const windowRef = useRef(null);
  const [isOpening, setIsOpening] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsOpening(false), 50);
    return () => clearTimeout(timer);
  }, []);

  const handleMouseDownHeader = useCallback(
    (event /*: React.MouseEvent<HTMLDivElement>*/) => {
      if (isMaximized || event.button !== 0) return;
      event.preventDefault();
      document.body.classList.add("window-dragging");
      dispatch({ type: WindowManagerActionType.FOCUS_WINDOW, payload: { id } });
      state.dragState = {
        isDragging: true,
        windowId: id,
        offsetX: event.clientX - x,
        offsetY: event.clientY - y,
      };
    },
    [dispatch, id, x, y, isMaximized, state],
  );

  const handleMouseDownResize = useCallback(
    (event /*: React.MouseEvent<HTMLDivElement>*/) => {
      if (isMaximized || event.button !== 0) return;
      event.preventDefault();
      event.stopPropagation();
      document.body.classList.add("window-dragging");
      dispatch({ type: WindowManagerActionType.FOCUS_WINDOW, payload: { id } });
      state.dragState = {
        isResizing: true,
        windowId: id,
        originalX: x,
        originalY: y,
        originalWidth: width,
        originalHeight: height,
      };
    },
    [dispatch, id, x, y, width, height, isMaximized, state],
  );

  const handleWindowClick = useCallback(() => {
    if (!isFocused) {
      dispatch({ type: WindowManagerActionType.FOCUS_WINDOW, payload: { id } });
    }
  }, [isFocused, dispatch, id]);

  const handleClose = useCallback(
    () =>
      dispatch({ type: WindowManagerActionType.CLOSE_WINDOW, payload: { id } }),
    [dispatch, id],
  );
  const handleMinimize = useCallback(
    () =>
      dispatch({
        type: WindowManagerActionType.MINIMIZE_WINDOW,
        payload: { id },
      }),
    [dispatch, id],
  );
  const handleMaximize = useCallback(
    () =>
      dispatch({
        type: WindowManagerActionType.TOGGLE_MAXIMIZE_WINDOW,
        payload: { id },
      }),
    [dispatch, id],
  );
  const handleDoubleClickHeader = useCallback(() => {
    dispatch({
      type: WindowManagerActionType.TOGGLE_MAXIMIZE_WINDOW,
      payload: { id },
    });
  }, [dispatch, id]);

  const windowClasses = `
    absolute flex flex-col 
    backdrop-blur-xl 
    rounded-lg 
    shadow-2xl 
    overflow-hidden 
    border 
    transition-all duration-200 ease-out /* Changed to ease-out */
    ${isOpening ? "opacity-0 scale-90 transform" : "opacity-100 scale-100 transform"}
  `;

  const iconIsUrl =
    typeof icon === "string" &&
    (icon.startsWith("http") || icon.startsWith("data:image"));
  const titleBarIconElement = iconIsUrl
    ? React.createElement("img", {
        src: icon,
        alt: title,
        className: "w-4 h-4 flex-shrink-0 object-contain",
      })
    : React.createElement("span", { className: "text-xs" }, icon);

  return React.createElement(
    "div",
    {
      ref: windowRef,
      className: windowClasses,
      style: {
        left: x,
        top: y,
        width: width,
        height: height,
        zIndex: zIndex,
        minWidth: "300px",
        minHeight: "200px",
        willChange: "transform, width, height, opacity",
        backgroundColor: "rgba(0,0,0,0.1)", // Subtle dark tint for overall window before content specific bg
        borderColor: isFocused ? "var(--focus-ring)" : "var(--border-color)",
        boxShadow: isFocused
          ? `0 0 0 1.5px var(--focus-ring), 0 12px 30px -8px rgba(0,0,0,0.4), 0 8px 15px -8px rgba(0,0,0,0.4)`
          : "0 10px 25px -5px rgba(0,0,0,0.25), 0 8px 10px -6px rgba(0,0,0,0.25)",
        "--tw-backdrop-blur": "blur(var(--glass-blur))",
      },
      onMouseDown: handleWindowClick,
    },
    React.createElement(
      "div",
      {
        className: `flex items-center justify-between px-2.5 h-8 ${isMaximized ? "" : "cursor-grab"} select-none border-b`, // Reduced height and padding
        style: {
          backgroundColor: "var(--titlebar-bg)",
          borderColor: "var(--border-color)",
          color: "var(--text-primary)",
        },
        onMouseDown: !isMaximized ? handleMouseDownHeader : undefined,
        onDoubleClick: handleDoubleClickHeader,
      },
      React.createElement(
        "div",
        { className: "flex items-center space-x-1.5 overflow-hidden" }, // Reduced space
        titleBarIconElement,
        React.createElement(
          "span",
          { className: "text-xs font-medium truncate pr-2" },
          title,
        ),
      ),
      React.createElement(WindowControls, {
        windowId: id,
        isMaximized: isMaximized,
        onClose: handleClose,
        onMinimize: handleMinimize,
        onMaximize: handleMaximize,
      }),
    ),
    React.createElement(
      "div",
      {
        className: "flex-grow overflow-auto relative",
        style: { backgroundColor: "var(--content-bg)" }, // Apps will define their specific content BG, this is fallback
      },
      content,
    ),
    !isMaximized &&
      React.createElement("div", {
        className: "resize-handle",
        onMouseDown: handleMouseDownResize,
        title: "Resize window",
      }),
  );
};

export default Window;
