const path = require("node:path");
const log = require("electron-log/main");
const { app, BrowserWindow, shell } = require("electron");
const steamworks = require("steamworks.js");

const STEAM_APP_ID = 2657610;

// Initialize logger
log.initialize({ preload: true });

/**
 * Automatically sets browser zoom level based on the width of the window.
 *
 * @param {BrowserWindow} win
 */
function applyAutoZoom(win) {
  // TODO(albrow): Remove this if we improve responsiveness on larger screens.
  // See: https://github.com/albrow/elara/issues/75
  const { width } = win.getBounds();
  if (width >= 1976) {
    win.webContents.setZoomFactor(1.5);
  } else if (width >= 1551) {
    win.webContents.setZoomFactor(1.2);
  }
}

const createWindow = () => {
  // Create a new window and load the html file right away.
  const win = new BrowserWindow({
    width: 1080,
    height: 700,
    backgroundColor: "#12091B",
    webPreferences: {
      autoplayPolicy: "no-user-gesture-required",
      // These two options are needed for Steamworks to behave
      // See: https://liana.one/integrate-electron-steam-api-steamworks
      nodeIntegration: true,
      contextIsolation: false,
    },
    show: false, // will be shown when ready
  });
  win.loadFile(path.join(__dirname, "static", "index.html"));

  // Set window to fullscreen.
  win.maximize();
  win.setMenuBarVisibility(false);
  win.setFullScreen(true);

  // Open links with the default OS browser instead of inside Electron.
  // See: https://stackoverflow.com/questions/32402327/how-can-i-force-external-links-from-browser-window-to-open-in-a-default-browser
  // and https://www.electronjs.org/docs/latest/api/web-contents#contentssetwindowopenhandlerhandler
  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  // Override Shift+Tab to allow opening the Steam overlay.
  win.webContents.on("before-input-event", (event, input) => {
    if (input.shift && input.key === "Tab") {
      console.log("Pressed Shift+Tab");
      event.preventDefault();
    }
  });

  // Show window when ready.
  win.once("ready-to-show", () => {
    // Apply auto zoom and show the window.
    applyAutoZoom(win);
    win.show();

    // Initialize logger
    log.initialize({ preload: true });

    // Steamworks Debugging
    const client = steamworks.init(STEAM_APP_ID);
    log.info(`player name: ${client.localplayer.getName()}`);
  });

  // On re-size, re-apply auto zoom.
  win.on("resize", () => {
    applyAutoZoom(win);
  });
};

app.on("window-all-closed", () => {
  app.quit();
});

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Required to get Steamworks to work with Electron.
steamworks.electronEnableSteamOverlay();
