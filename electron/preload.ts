import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  onToggleCommandBar: (callback: () => void) => {
    ipcRenderer.on('toggle-command-bar', callback);
    return () => ipcRenderer.removeListener('toggle-command-bar', callback);
  },
  onFocusSearch: (callback: () => void) => {
    ipcRenderer.on('focus-search', callback);
    return () => ipcRenderer.removeListener('focus-search', callback);
  },
  openPlaidLink: (linkToken: string) => {
    ipcRenderer.send('open-plaid-link', linkToken);
  },
  onPlaidResult: (callback: (result: { type: string; publicToken?: string; error?: unknown }) => void) => {
    ipcRenderer.on('plaid-result', (_event, result) => callback(result));
    return () => ipcRenderer.removeListener('plaid-result', () => {});
  },
  platform: process.platform,
});
