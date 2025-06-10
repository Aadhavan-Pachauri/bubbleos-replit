import React, { forwardRef, useState } from "react";
import { DEFAULT_APPS } from "../../constants.tsx";
import { useWindowManager } from "../../contexts/WindowManagerContext";
import { WindowManagerActionType } from "../../types";
import AppIcon from "../Applications/AppIcon";
import { TASKBAR_HEIGHT } from "../../constants.tsx";

const StartMenu = forwardRef(
  (
    { toggleMenu }: { toggleMenu: () => void },
    ref: React.ForwardedRef<HTMLDivElement>,
  ) => {
    const { dispatch } = useWindowManager();
    const [searchTerm, setSearchTerm] = useState("");

    const handleAppClick = (app) => {
      dispatch({ type: WindowManagerActionType.OPEN_WINDOW, payload: { app } });
      if (toggleMenu) {
        toggleMenu();
      }
    };

    const filteredApps = DEFAULT_APPS.filter((app) =>
      app.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    const appIcons = filteredApps.map((app) => {
      const appIconProps = {
        key: app.id,
        app: app,
        onClick: () => handleAppClick(app),
        showTitle: true,
        className:
          "w-full flex items-center space-x-3 p-2.5 rounded-md cursor-pointer transition-colors duration-150", // Hover style managed by AppIcon or global CSS
      };
      return React.createElement(AppIcon, appIconProps);
    });

    const powerIconUrl =
      "https://api.iconify.design/fluent/power-24-regular.svg?color=F0F4F8"; // --text-primary
    const settingsIconUrl =
      "https://api.iconify.design/fluent/settings-24-regular.svg?color=F0F4F8";

    const powerIcon = React.createElement("img", {
      src: powerIconUrl,
      alt: "Power",
      className: "w-5 h-5",
    });
    const settingsAppIcon = React.createElement("img", {
      src: settingsIconUrl,
      alt: "Settings",
      className: "w-5 h-5",
    });

    const controlButtonBaseStyle =
      "flex items-center p-2.5 rounded-md cursor-pointer transition-colors duration-150 text-sm";

    return React.createElement(
      "div",
      {
        ref: ref,
        className:
          "absolute left-0 backdrop-blur-xl shadow-2xl rounded-tr-xl w-96 max-h-[calc(80vh-48px)] flex flex-col z-50 select-none border",
        style: {
          bottom: `${TASKBAR_HEIGHT}px`,
          backgroundColor: "var(--start-menu-bg)",
          color: "var(--text-primary)",
          borderColor: "var(--border-color)",
          "--tw-backdrop-blur": "blur(var(--glass-blur))",
        },
      },
      React.createElement(
        "div",
        {
          className: "p-4 sticky top-0 z-10 border-b",
          style: {
            backgroundColor: "var(--start-menu-bg)",
            borderColor: "var(--border-color)",
            "--tw-backdrop-blur": "blur(var(--glass-blur))",
          },
        },
        React.createElement("input", {
          type: "search",
          placeholder: "Search applications...",
          value: searchTerm,
          onChange: (e) => setSearchTerm((e.target as HTMLInputElement).value),
          className:
            "w-full p-2.5 rounded-md placeholder-var-text-placeholder text-var-text-primary focus:outline-none focus:ring-2 text-sm",
          style: {
            backgroundColor: "var(--secondary-bg)",
            color: "var(--text-primary)",
          }, // Removed ringColor and placeholderColor
        }),
      ),
      React.createElement(
        "div",
        {
          className: "overflow-y-auto p-4 flex-grow",
        },
        React.createElement(
          "h3",
          {
            className:
              "text-xs font-semibold px-1 py-2 uppercase tracking-wider",
            style: { color: "var(--primary-accent)" },
          },
          "All Applications",
        ),
        React.createElement(
          "div",
          { className: "flex flex-col space-y-1" },
          appIcons.length > 0
            ? appIcons
            : (() => {
                const pProps = {
                  style: { color: "var(--text-secondary)" },
                  className: "text-center py-4 text-sm",
                };
                return React.createElement(
                  "p",
                  pProps,
                  "No applications found.",
                );
              })(),
        ),
      ),
      React.createElement(
        "div",
        {
          className: "border-t mt-auto p-2 flex justify-end space-x-1",
          style: {
            backgroundColor: "var(--start-menu-bg)",
            borderColor: "var(--border-color)",
            "--tw-backdrop-blur": "blur(var(--glass-blur))",
          },
        } as any,
        React.createElement(
          "button",
          {
            className: controlButtonBaseStyle,
            style: { "--hover-bg": "var(--secondary-accent)" } as any,
            title: "Settings",
            onMouseEnter: (e) =>
              (e.currentTarget.style.backgroundColor =
                "var(--secondary-accent)"),
            onMouseLeave: (e) =>
              (e.currentTarget.style.backgroundColor = "transparent"),
            onClick: () => {
              const settingsApp = DEFAULT_APPS.find(
                (app) => app.id === "settings",
              );
              if (settingsApp) handleAppClick(settingsApp);
              if (toggleMenu) toggleMenu();
            },
          } as React.ButtonHTMLAttributes<HTMLButtonElement>,
          settingsAppIcon,
        ),
        React.createElement(
          "button",
          {
            className: controlButtonBaseStyle,
            title: "Power Options (Placeholder)",
            style: { "--hover-bg": "var(--secondary-accent)" } as any,
            onMouseEnter: (e) =>
              (e.currentTarget.style.backgroundColor =
                "var(--secondary-accent)"),
            onMouseLeave: (e) =>
              (e.currentTarget.style.backgroundColor = "transparent"),
            onClick: () => {
              if (toggleMenu) toggleMenu();
            },
          } as React.ButtonHTMLAttributes<HTMLButtonElement>,
          powerIcon,
        ),
      ),
    );
  },
);
StartMenu.displayName = "StartMenu";
export default StartMenu;
