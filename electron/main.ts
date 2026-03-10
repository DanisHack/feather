import { app, BrowserWindow, shell, Menu, ipcMain } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { buildMenu } from './menu';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let mainWindow: BrowserWindow | null = null;

const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL;
const DIST = path.join(__dirname, '../dist');

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1100,
    minHeight: 700,
    titleBarStyle: 'hiddenInset',
    vibrancy: 'under-window',
    backgroundColor: '#0B0B0F',
    trafficLightPosition: { x: 16, y: 16 },
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  // Show window when ready to avoid visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  // Open external links in browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  if (VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(DIST, 'index.html'));
  }

  // ⌘K and ⌘F are handled via keydown in the renderer.
  // Using webContents keyboard events instead of globalShortcut
  // to avoid intercepting the key before the renderer sees it.
  mainWindow.webContents.on('before-input-event', (_event, input) => {
    if (input.meta && input.key === 'k' && input.type === 'keyDown') {
      mainWindow?.webContents.send('toggle-command-bar');
    }
  });
}

// ─── Plaid Link IPC ────────────────────────────────────────
ipcMain.on('open-plaid-link', (_event, linkToken: string) => {
  if (!mainWindow) return;

  const plaidWindow = new BrowserWindow({
    width: 480,
    height: 640,
    parent: mainWindow,
    modal: true,
    show: false,
    backgroundColor: '#0B0B0F',
    titleBarStyle: 'hiddenInset',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  const plaidHtml = path.join(__dirname, '../src/plaid-link.html');
  plaidWindow.loadFile(plaidHtml, { hash: linkToken });

  plaidWindow.once('ready-to-show', () => {
    plaidWindow.show();
  });

  // Listen for postMessage from the Plaid Link page
  plaidWindow.webContents.on('did-navigate', () => {
    plaidWindow.webContents.executeJavaScript(`
      window.addEventListener('message', (event) => {
        require('electron').ipcRenderer.send('plaid-message', event.data);
      });
    `).catch(() => {});
  });

  plaidWindow.on('closed', () => {
    mainWindow?.webContents.send('plaid-result', { type: 'plaid-exit' });
  });
});

// Build Mac app menu
app.whenReady().then(() => {
  const menu = buildMenu();
  Menu.setApplicationMenu(menu);
  createWindow();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('will-quit', () => {
  // No global shortcuts to clean up
});
