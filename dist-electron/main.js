"use strict";
const electron = require("electron");
const path = require("path");
const fs = require("fs");
process.env.DIST = path.join(__dirname, "../dist");
process.env.VITE_PUBLIC = electron.app.isPackaged ? process.env.DIST : path.join(process.env.DIST, "../public");
let win;
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
let dataPath;
let passwords = [];
let masterPasswordData = null;
function createWindow() {
  win = new electron.BrowserWindow({
    width: 1200,
    height: 800,
    icon: path.join(process.env.VITE_PUBLIC || "", "electron-vite.svg"),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true
    }
  });
  win.webContents.on("did-finish-load", () => {
    win?.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  });
  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(process.env.DIST || "", "index.html"));
  }
}
async function initDatabase() {
  dataPath = electron.app.isPackaged ? path.join(process.resourcesPath, "data") : path.join(__dirname, "../data");
  try {
    await fs.promises.mkdir(dataPath, { recursive: true });
  } catch (error) {
  }
  try {
    const passwordsData = await fs.promises.readFile(path.join(dataPath, "passwords.json"), "utf8");
    passwords = JSON.parse(passwordsData);
  } catch (error) {
    passwords = [];
  }
  try {
    const masterData = await fs.promises.readFile(path.join(dataPath, "master.json"), "utf8");
    masterPasswordData = JSON.parse(masterData);
  } catch (error) {
    masterPasswordData = null;
  }
}
async function savePasswords() {
  await fs.promises.writeFile(path.join(dataPath, "passwords.json"), JSON.stringify(passwords, null, 2));
}
async function saveMasterPassword() {
  await fs.promises.writeFile(path.join(dataPath, "master.json"), JSON.stringify(masterPasswordData, null, 2));
}
electron.ipcMain.handle("get-passwords", () => {
  return passwords;
});
electron.ipcMain.handle("add-password", async (event, passwordData) => {
  const newPassword = {
    id: Date.now(),
    ...passwordData,
    created_at: (/* @__PURE__ */ new Date()).toISOString(),
    updated_at: (/* @__PURE__ */ new Date()).toISOString()
  };
  passwords.push(newPassword);
  await savePasswords();
  return true;
});
electron.ipcMain.handle("update-password", async (event, id, passwordData) => {
  const index = passwords.findIndex((p) => p.id === id);
  if (index !== -1) {
    passwords[index] = {
      ...passwords[index],
      ...passwordData,
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    };
    await savePasswords();
    return true;
  }
  return false;
});
electron.ipcMain.handle("delete-password", async (event, id) => {
  const index = passwords.findIndex((p) => p.id === id);
  if (index !== -1) {
    passwords.splice(index, 1);
    await savePasswords();
    return true;
  }
  return false;
});
electron.ipcMain.handle("check-master-password", () => {
  return masterPasswordData !== null;
});
electron.ipcMain.handle("verify-master-password", (event, password, hash) => {
  return true;
});
electron.ipcMain.handle("set-master-password", async (event, passwordHash, salt) => {
  masterPasswordData = {
    password_hash: passwordHash,
    salt,
    created_at: (/* @__PURE__ */ new Date()).toISOString()
  };
  await saveMasterPassword();
  return true;
});
electron.app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    electron.app.quit();
    win = null;
  }
});
electron.app.on("activate", () => {
  if (electron.BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
electron.app.whenReady().then(async () => {
  await initDatabase();
  createWindow();
});
