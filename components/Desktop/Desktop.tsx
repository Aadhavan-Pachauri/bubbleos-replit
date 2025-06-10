import React, { useEffect, useCallback } from "react";
import Taskbar from "./Taskbar";
import WindowManager from "../WindowManager/WindowManager";
import AppIcon from "../Applications/AppIcon";
import {
  WALLPAPER_URL,
  TASKBAR_HEIGHT,
  DEFAULT_APPS,
} from "../../constants.tsx";
import { useWindowManager } from "../../contexts/WindowManagerContext";
import { WindowManagerActionType } from "../../types";

const Wallpaper = () => {
  return React.createElement("div", {
    className:
      "absolute inset-0 bg-cover bg-center -z-10 transition-all duration-1000 ease-in-out",
    style: { backgroundImage: `url(${WALLPAPER_URL})` },
  });
};

const Desktop = () => {
  const { state, dispatch } = useWindowManager();

  const handleAppIconClick = (app) => {
    dispatch({ type: WindowManagerActionType.OPEN_WINDOW, payload: { app } });
  };

  const handleMouseMove = useCallback(
    (event /*: MouseEvent*/) => {
      const { dragState, windows } = state;

      if (
        dragState.isDragging &&
        dragState.windowId &&
        dragState.offsetX !== undefined &&
        dragState.offsetY !== undefined
      ) {
        const targetWindow = windows.find((w) => w.id === dragState.windowId);
        if (!targetWindow || targetWindow.isMaximized) return;

        let newX = event.clientX - dragState.offsetX;
        let newY = event.clientY - dragState.offsetY;

        const boundedX = Math.max(
          -targetWindow.width + 100,
          Math.min(newX, window.innerWidth - 100),
        );
        const boundedY = Math.max(
          0,
          Math.min(newY, window.innerHeight - TASKBAR_HEIGHT - 30),
        );

        dispatch({
          type: WindowManagerActionType.DRAG_WINDOW,
          payload: { id: dragState.windowId, x: boundedX, y: boundedY },
        });
      } else if (
        dragState.isResizing &&
        dragState.windowId &&
        dragState.originalX !== undefined &&
        dragState.originalY !== undefined &&
        dragState.originalWidth !== undefined &&
        dragState.originalHeight !== undefined
      ) {
        const targetWindow = windows.find((w) => w.id === dragState.windowId);
        if (!targetWindow || targetWindow.isMaximized) return;

        let newWidth =
          dragState.originalWidth +
          (event.clientX - (dragState.originalX + dragState.originalWidth));
        let newHeight =
          dragState.originalHeight +
          (event.clientY - (dragState.originalY + dragState.originalHeight));

        newWidth = Math.max(300, newWidth);
        newHeight = Math.max(200, newHeight);

        if (targetWindow.x + newWidth > window.innerWidth) {
          newWidth = window.innerWidth - targetWindow.x;
        }
        if (targetWindow.y + newHeight > window.innerHeight - TASKBAR_HEIGHT) {
          newHeight = window.innerHeight - TASKBAR_HEIGHT - targetWindow.y;
        }

        dispatch({
          type: WindowManagerActionType.RESIZE_WINDOW,
          payload: {
            id: dragState.windowId,
            width: newWidth,
            height: newHeight,
          },
        });
      }
    },
    [state, dispatch],
  );

  const handleMouseUp = useCallback(() => {
    if (state.dragState.isDragging || state.dragState.isResizing) {
      const updatedWindows = state.windows.map((w) => ({ ...w }));
      dispatch({
        type: WindowManagerActionType.SET_WINDOWS,
        payload: updatedWindows,
      });
      state.dragState.isDragging = false;
      state.dragState.isResizing = false;
      state.dragState.windowId = undefined;
      document.body.classList.remove("window-dragging");
    }
  }, [state, dispatch]);

  useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.classList.remove("window-dragging");
    };
  }, [handleMouseMove, handleMouseUp]);

  return React.createElement(
    "div",
    {
      className: "relative h-screen w-screen overflow-hidden select-none",
      style: { backgroundColor: "var(--primary-bg)" },
    },
    React.createElement(Wallpaper),
    React.createElement(
      "div",
      {
        // Container for desktop icons
        className:
          "absolute top-0 left-0 p-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-10 gap-x-2 gap-y-4", // Responsive grid for icons
      },
      ...DEFAULT_APPS.map((app) =>
        React.createElement(AppIcon, {
          key: `desktop-${app.id}`,
          app: app,
          onClick: () => handleAppIconClick(app),
          showTitle: true,
          desktopClassName: "desktop-icon-style",
        }),
      ),
    ),
    React.createElement(WindowManager),
    React.createElement(Taskbar),
  );
};

export default Desktop;
