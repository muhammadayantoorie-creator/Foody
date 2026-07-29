const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Window control IPCs
  minimizeWindow: () => ipcRenderer.send('window:minimize'),
  maximizeWindow: () => ipcRenderer.send('window:maximize'),
  closeWindow: () => ipcRenderer.send('window:close'),
  toggleAlwaysOnTop: () => ipcRenderer.invoke('window:toggle-always-on-top'),

  // Native Notifications & Tray IPCs
  sendNativeNotification: (title, body) => ipcRenderer.send('notification:send', { title, body }),
  updateTrayBadge: (count) => ipcRenderer.send('tray:badge', count),

  // POS Printing IPC
  printReceipt: (htmlContent) => ipcRenderer.invoke('printer:print-receipt', htmlContent),
  getPrinters: () => ipcRenderer.invoke('printer:get-list'),

  // Environment info
  isElectron: true,
  getPlatform: () => process.platform,

  // Event Listeners from Main process
  onHotkeyTriggered: (callback) => {
    ipcRenderer.on('hotkey:triggered', (event, action) => callback(action));
  }
});
