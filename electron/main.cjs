const { app, BrowserWindow, ipcMain, Notification, Tray, Menu, globalShortcut, nativeImage } = require('electron');
const path = require('path');

let mainWindow = null;
let tray = null;
let isAlwaysOnTop = false;

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
const PORT = process.env.PORT || 5173;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1360,
    height: 860,
    minWidth: 1024,
    minHeight: 700,
    frame: false, // Frameless for Enterprise Custom Titlebar
    titleBarStyle: 'hidden',
    backgroundColor: '#0f172a',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
    },
    icon: path.join(__dirname, '../public/favicon.ico'),
    show: false,
  });

  const devUrl = `http://localhost:${PORT}`;
  const prodUrl = `file://${path.join(__dirname, '../dist/index.html')}`;

  if (isDev) {
    mainWindow.loadURL(devUrl);
  } else {
    mainWindow.loadURL(prodUrl);
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.focus();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function createTray() {
  const icon = nativeImage.createEmpty();
  tray = new Tray(icon);
  
  const contextMenu = Menu.buildFromTemplate([
    { label: '🍔 Foody Enterprise Desktop', enabled: false },
    { type: 'separator' },
    { label: 'Show Application', click: () => { if (mainWindow) mainWindow.show(); } },
    { label: 'Hide to Tray', click: () => { if (mainWindow) mainWindow.hide(); } },
    { type: 'separator' },
    { 
      label: 'Toggle Always-On-Top', 
      type: 'checkbox', 
      checked: isAlwaysOnTop, 
      click: () => toggleAlwaysOnTop() 
    },
    { type: 'separator' },
    { label: 'Quit Enterprise Suite', click: () => app.quit() }
  ]);

  tray.setToolTip('Foody Enterprise Delivery Management System');
  tray.setContextMenu(contextMenu);
  tray.on('double-click', () => {
    if (mainWindow) mainWindow.show();
  });
}

function registerGlobalShortcuts() {
  globalShortcut.register('CommandOrControl+Shift+O', () => {
    if (mainWindow) {
      mainWindow.show();
      mainWindow.webContents.send('hotkey:triggered', 'OPEN_ORDERS');
    }
  });

  globalShortcut.register('CommandOrControl+Shift+P', () => {
    if (mainWindow) {
      mainWindow.webContents.send('hotkey:triggered', 'PRINT_RECEIPT');
    }
  });

  globalShortcut.register('CommandOrControl+Shift+M', () => {
    if (mainWindow) {
      mainWindow.webContents.send('hotkey:triggered', 'MUTE_AUDIO');
    }
  });
}

function toggleAlwaysOnTop() {
  if (!mainWindow) return false;
  isAlwaysOnTop = !isAlwaysOnTop;
  mainWindow.setAlwaysOnTop(isAlwaysOnTop);
  return isAlwaysOnTop;
}

// App Life Cycle
app.whenReady().then(() => {
  createWindow();
  createTray();
  registerGlobalShortcuts();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// IPC Communication Handlers
ipcMain.on('window:minimize', () => {
  if (mainWindow) mainWindow.minimize();
});

ipcMain.on('window:maximize', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
});

ipcMain.on('window:close', () => {
  if (mainWindow) mainWindow.close();
});

ipcMain.handle('window:toggle-always-on-top', () => {
  return toggleAlwaysOnTop();
});

ipcMain.on('notification:send', (event, { title, body }) => {
  if (Notification.isSupported()) {
    new Notification({ title: title || 'Foody Enterprise', body: body || 'New System Alert' }).show();
  }
});

ipcMain.on('tray:badge', (event, count) => {
  if (tray) {
    tray.setToolTip(`Foody Enterprise (${count} Active Orders)`);
  }
});

ipcMain.handle('printer:get-list', async () => {
  if (!mainWindow) return [];
  return await mainWindow.webContents.getPrintersAsync();
});

ipcMain.handle('printer:print-receipt', async (event, htmlContent) => {
  if (!mainWindow) return { success: false, error: 'No active window' };

  let printWin = new BrowserWindow({
    show: false,
    webPreferences: { nodeIntegration: false }
  });

  await printWin.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`);

  return new Promise((resolve) => {
    printWin.webContents.print({ silent: true, printBackground: true }, (success, errorType) => {
      printWin.close();
      if (!success) resolve({ success: false, error: errorType });
      else resolve({ success: true });
    });
  });
});
