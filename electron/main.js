const path = require("node:path");
const { app, BrowserWindow } = require("electron");

const createWindow = () => {
  // Create a new window and open it in fullscreen.
  const win = new BrowserWindow({
    width: 1080,
    height: 700,
  });
  win.maximize();
  win.setMenuBarVisibility(false);
  win.setFullScreen(true);

  win.loadFile(path.join(__dirname, "static", "index.html"));
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
