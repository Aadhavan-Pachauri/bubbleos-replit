import React, { useEffect, useCallback, useState } from "react";
import Taskbar from "./Taskbar";
import WindowManager from "../WindowManager/WindowManager";
import AppIcon from "../Applications/AppIcon";
import {
  WALLPAPER_URL,
  TASKBAR_HEIGHT,
  DEFAULT_APPS,
} from "../../constants.tsx";
import { useWindowManager } from "../../contexts/WindowManagerContext";
import {
  WindowManagerActionType,
  AppDefinition,
  WindowInstance,
} from "../../types";
import Window from "../WindowManager/Window";

interface DragState {
  isDragging?: boolean;
  isResizing?: boolean;
  windowId?: string;
  offsetX?: number;
  offsetY?: number;
  originalX?: number;
  originalY?: number;
  originalWidth?: number;
  originalHeight?: number;
}

interface WindowManagerState {
  windows: WindowInstance[];
  activeWindowId: string | null;
  nextZIndex: number;
  dragState: DragState;
  maximizedStateStore: Record<
    string,
    { x: number; y: number; width: number; height: number }
  >;
}

interface ContextMenuProps {
  x: number;
  y: number;
  app: AppDefinition | null;
  onClose: () => void;
  onOpen: (app: AppDefinition) => void;
}

const ContextMenu = ({ x, y, onClose, onOpen, app }: ContextMenuProps) => {
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => onClose();
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  // Prevent menu from going off-screen
  const menuWidth = 180;
  const menuHeight = app ? 90 : 50;
  const left = Math.min(x, window.innerWidth - menuWidth - 8);
  const top = Math.min(y, window.innerHeight - menuHeight - 8);

  const menuStyle = {
    position: "fixed" as const,
    left,
    top,
    background: "#fff",
    border: "1px solid #e0e0e0",
    borderRadius: "8px",
    padding: "0.5rem 0",
    minWidth: menuWidth,
    boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
    zIndex: 1000,
    fontSize: "1rem",
    userSelect: "none" as const,
    color: "#222",
  };

  const menuItemStyle = {
    padding: "0.5rem 1.25rem",
    cursor: "pointer",
    color: "#222",
    border: "none",
    background: "none",
    width: "100%",
    textAlign: "left" as const,
    outline: "none",
    fontSize: "1rem",
    transition: "background 0.15s",
  };

  const [hovered, setHovered] = React.useState<string | null>(null);

  const handleClick = (action: () => void) => {
    action();
    onClose();
  };

  return (
    <div
      style={menuStyle}
      onContextMenu={(e) => e.preventDefault()}
      className="contextmenu-animate-in"
    >
      {app && (
        <button
          style={{
            ...menuItemStyle,
            background: hovered === "open" ? "#f0f4f8" : "none",
          }}
          onMouseEnter={() => setHovered("open")}
          onMouseLeave={() => setHovered(null)}
          onClick={() => handleClick(() => onOpen(app))}
        >
          Open
        </button>
      )}
      {app && (
        <div
          style={{ height: 1, background: "#e0e0e0", margin: "0.25rem 0" }}
        />
      )}
      <button
        style={{
          ...menuItemStyle,
          background: hovered === "refresh" ? "#f0f4f8" : "none",
        }}
        onMouseEnter={() => setHovered("refresh")}
        onMouseLeave={() => setHovered(null)}
        onClick={() => handleClick(() => {})}
      >
        Refresh
      </button>
    </div>
  );
};

const Wallpaper = () => {
  return React.createElement("div", {
    className:
      "absolute inset-0 bg-cover bg-center -z-10 transition-all duration-1000 ease-in-out",
    style: { backgroundImage: `url(${WALLPAPER_URL})` },
  });
};

const ASPECT_RATIO = 16 / 9;

const getDesktopBox = () => {
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;
  let width = windowWidth;
  let height = width / ASPECT_RATIO;
  if (height > windowHeight) {
    height = windowHeight;
    width = height * ASPECT_RATIO;
  }
  return { width, height };
};

const SNAP_THRESHOLD = 32;
const SNAP_LAYOUTS = [
  { key: "left", x: 0, y: 0, w: 0.5, h: 1 },
  { key: "right", x: 0.5, y: 0, w: 0.5, h: 1 },
  { key: "top", x: 0, y: 0, w: 1, h: 1 },
  { key: "topleft", x: 0, y: 0, w: 0.5, h: 0.5 },
  { key: "topright", x: 0.5, y: 0, w: 0.5, h: 0.5 },
  { key: "bottomleft", x: 0, y: 0.5, w: 0.5, h: 0.5 },
  { key: "bottomright", x: 0.5, y: 0.5, w: 0.5, h: 0.5 },
];

const Desktop = () => {
  const { state, dispatch } = useWindowManager();
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    app: AppDefinition | null;
  } | null>(null);
  const [snapTarget, setSnapTarget] = useState<string | null>(null);
  const [snapAssist, setSnapAssist] = useState<{
    layout: string;
    snappedId: string;
  } | null>(null);

  // Get box size using ref
  const boxRef = React.useRef<HTMLDivElement>(null);
  const [boxRect, setBoxRect] = useState({ width: 0, height: 0 });
  useEffect(() => {
    const updateRect = () => {
      if (boxRef.current) {
        const rect = boxRef.current.getBoundingClientRect();
        setBoxRect({ width: rect.width, height: rect.height });
      }
    };
    updateRect();
    window.addEventListener("resize", updateRect);
    return () => window.removeEventListener("resize", updateRect);
  }, []);

  const handleAppIconClick = (app: AppDefinition) => {
    dispatch({ type: WindowManagerActionType.OPEN_WINDOW, payload: { app } });
  };

  const handleContextMenu = (
    e: React.MouseEvent,
    app: AppDefinition | null = null,
  ) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, app });
  };

  const handleContextMenuClose = () => {
    setContextMenu(null);
  };

  const handleMouseDown = (e: React.MouseEvent, windowId: string) => {
    const target = e.target as HTMLElement;
    if (target.classList.contains("window-title-bar")) {
      const window = state.windows.find(
        (w: WindowInstance) => w.id === windowId,
      );
      if (window) {
        console.log("START_DRAG", { windowId, x: window.x, y: window.y });
        dispatch({
          type: WindowManagerActionType.START_DRAG,
          payload: {
            windowId,
            offsetX: e.clientX - window.x,
            offsetY: e.clientY - window.y,
          },
        });
      }
    }
  };

  const dragStateRef = React.useRef(state.dragState);
  useEffect(() => {
    dragStateRef.current = state.dragState;
  }, [state.dragState]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const dragState = dragStateRef.current;
      if (
        dragState.isDragging &&
        dragState.windowId &&
        dragState.offsetX !== undefined &&
        dragState.offsetY !== undefined
      ) {
        const newX = e.clientX - dragState.offsetX;
        const newY = e.clientY - dragState.offsetY;
        console.log("DRAG_WINDOW", {
          id: dragState.windowId,
          x: newX,
          y: newY,
        });
        dispatch({
          type: WindowManagerActionType.DRAG_WINDOW,
          payload: {
            id: dragState.windowId,
            x: newX,
            y: newY,
          },
        });
      }
    };
    const handleMouseUp = () => {
      const dragState = dragStateRef.current;
      if (dragState.isDragging) {
        console.log("END_DRAG", dragState);
        dispatch({
          type: WindowManagerActionType.END_DRAG,
          payload: { desktopBox: boxRect, snapTarget },
        });
        document.body.classList.remove("window-dragging");
      }
    };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dispatch]);

  // Snap Layout overlay logic
  useEffect(() => {
    if (!state.dragState.isDragging || !boxRect.width || !boxRect.height) {
      setSnapTarget(null);
      return;
    }
    const dragState = dragStateRef.current;
    if (!dragState.windowId) return;
    const win = state.windows.find((w) => w.id === dragState.windowId);
    if (!win) return;
    const x = win.x;
    const y = win.y;
    const w = win.width;
    const h = win.height;
    let found = null;
    // Corners
    if (x <= SNAP_THRESHOLD && y <= SNAP_THRESHOLD) found = "topleft";
    else if (x + w >= boxRect.width - SNAP_THRESHOLD && y <= SNAP_THRESHOLD)
      found = "topright";
    else if (x <= SNAP_THRESHOLD && y + h >= boxRect.height - SNAP_THRESHOLD)
      found = "bottomleft";
    else if (
      x + w >= boxRect.width - SNAP_THRESHOLD &&
      y + h >= boxRect.height - SNAP_THRESHOLD
    )
      found = "bottomright";
    // Sides
    else if (x <= SNAP_THRESHOLD) found = "left";
    else if (x + w >= boxRect.width - SNAP_THRESHOLD) found = "right";
    // Top
    else if (y <= SNAP_THRESHOLD) found = "top";
    setSnapTarget(found);
  }, [state.dragState.isDragging, state.windows, boxRect]);

  // Snap Assist logic (show after snap)
  useEffect(() => {
    if (snapAssist) {
      const timer = setTimeout(() => setSnapAssist(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [snapAssist]);

  return (
    <div className="desktop-flex" onContextMenu={(e) => handleContextMenu(e)}>
      <div className="desktop-box" ref={boxRef}>
        {/* Snap Layout Overlay */}
        {snapTarget && (
          <div
            className="snap-target"
            style={{
              left: `${boxRect.width * SNAP_LAYOUTS.find((l) => l.key === snapTarget)!.x}px`,
              top: `${boxRect.height * SNAP_LAYOUTS.find((l) => l.key === snapTarget)!.y}px`,
              width: `${boxRect.width * SNAP_LAYOUTS.find((l) => l.key === snapTarget)!.w}px`,
              height: `${boxRect.height * SNAP_LAYOUTS.find((l) => l.key === snapTarget)!.h}px`,
            }}
          />
        )}
        {/* Snap Assist */}
        {snapAssist && (
          <div
            style={{
              position: "absolute",
              right: 24,
              bottom: 64,
              zIndex: 9999,
              background: "#222",
              color: "#fff",
              borderRadius: 8,
              padding: 12,
              boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: 8 }}>Snap Assist</div>
            <div style={{ display: "flex", gap: 8 }}>
              {state.windows
                .filter((w) => w.id !== snapAssist.snappedId && !w.isMinimized)
                .map((w) => (
                  <div
                    key={w.id}
                    style={{
                      background: "#333",
                      borderRadius: 6,
                      padding: 6,
                      minWidth: 60,
                      textAlign: "center",
                      cursor: "pointer",
                    }}
                    onClick={() =>
                      dispatch({
                        type: WindowManagerActionType.FOCUS_WINDOW,
                        payload: { id: w.id },
                      })
                    }
                  >
                    <div style={{ fontSize: 24 }}>
                      {typeof w.icon === "string" ? (
                        <img
                          src={w.icon}
                          alt={w.title}
                          style={{ width: 24, height: 24 }}
                        />
                      ) : (
                        w.icon
                      )}
                    </div>
                    <div style={{ fontSize: 12, marginTop: 4 }}>{w.title}</div>
                  </div>
                ))}
            </div>
          </div>
        )}
        <div
          className="desktop-icons"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
            padding: "1rem",
            position: "absolute",
            top: 0,
            left: 0,
          }}
        >
          {DEFAULT_APPS.map((app: AppDefinition) => (
            <div
              key={app.id}
              onContextMenu={(e) => handleContextMenu(e, app)}
              style={{ userSelect: "none" }}
            >
              <AppIcon
                app={app}
                onClick={() => handleAppIconClick(app)}
                desktopClassName="desktop-icon"
              />
            </div>
          ))}
        </div>

        {state.windows.map((window: WindowInstance) => (
          <Window
            key={window.id}
            windowInstance={window}
            onMouseDown={(e) => handleMouseDown(e, window.id)}
            onClose={() =>
              dispatch({
                type: WindowManagerActionType.CLOSE_WINDOW,
                payload: { id: window.id },
              })
            }
            onMinimize={() =>
              dispatch({
                type: WindowManagerActionType.MINIMIZE_WINDOW,
                payload: { id: window.id },
              })
            }
            onMaximize={() =>
              dispatch({
                type: WindowManagerActionType.TOGGLE_MAXIMIZE_WINDOW,
                payload: { id: window.id },
              })
            }
            desktopBox={boxRect}
          />
        ))}

        {contextMenu && (
          <ContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            app={contextMenu.app}
            onClose={handleContextMenuClose}
            onOpen={handleAppIconClick}
          />
        )}
        <div className="taskbar-animate-in">
          <Taskbar />
        </div>
      </div>
    </div>
  );
};

export default Desktop;
