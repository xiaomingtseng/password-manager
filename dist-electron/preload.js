"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("electronAPI", {
  onUpdateCounter: (callback) => electron.ipcRenderer.on("update-counter", (_event, value) => callback(value)),
  // Password management
  getPasswords: () => electron.ipcRenderer.invoke("get-passwords"),
  addPassword: (passwordData) => electron.ipcRenderer.invoke("add-password", passwordData),
  updatePassword: (id, passwordData) => electron.ipcRenderer.invoke("update-password", id, passwordData),
  deletePassword: (id) => electron.ipcRenderer.invoke("delete-password", id),
  // Master password
  checkMasterPassword: () => electron.ipcRenderer.invoke("check-master-password"),
  verifyMasterPassword: (password, hash) => electron.ipcRenderer.invoke("verify-master-password", password, hash),
  setMasterPassword: (passwordHash, salt) => electron.ipcRenderer.invoke("set-master-password", passwordHash, salt)
});
if (process.contextIsolated) {
  try {
    electron.contextBridge.exposeInMainWorld("electron", {
      ipcRenderer: {
        on(...args) {
          const [channel, listener] = args;
          return electron.ipcRenderer.on(channel, (event, ...args2) => listener(event, ...args2));
        },
        off(...args) {
          const [channel, ...omit] = args;
          return electron.ipcRenderer.off(channel, ...omit);
        },
        send(...args) {
          const [channel, ...omit] = args;
          return electron.ipcRenderer.send(channel, ...omit);
        },
        invoke(...args) {
          const [channel, ...omit] = args;
          return electron.ipcRenderer.invoke(channel, ...omit);
        }
      }
    });
  } catch (error) {
    console.error(error);
  }
} else {
  window.electron = {
    ipcRenderer: {
      on: electron.ipcRenderer.on,
      off: electron.ipcRenderer.off,
      send: electron.ipcRenderer.send,
      invoke: electron.ipcRenderer.invoke
    }
  };
}
