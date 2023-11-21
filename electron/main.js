const path = require("node:path");
const { app, BrowserWindow } = require("electron");

const createWindow = () => {
  // Create a new window and load the html file right away.
  const win = new BrowserWindow({
    width: 1080,
    height: 700,
    backgroundColor: "#12091B",
    webPreferences: {
      autoplayPolicy: "no-user-gesture-required",
    },
    show: false, // will be shown when ready
  });
  win.loadFile(path.join(__dirname, "static", "index.html"));

  // Set window to fullscreen.
  win.maximize();
  win.setMenuBarVisibility(false);
  win.setFullScreen(true);

  // Set zoom level based on screen width.
  // TODO(albrow): Remove this if we improve responsiveness on larger screens.
  // See: https://github.com/albrow/elara/issues/75
  const { width } = win.getBounds();
  if (width >= 1976) {
    win.webContents.setZoomFactor(1.5);
  } else if (width >= 1551) {
    win.webContents.setZoomFactor(1.2);
  }

  // Show window when ready.
  win.once("ready-to-show", () => {
    win.show();
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
