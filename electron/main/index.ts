import { app, BrowserWindow, shell, ipcMain } from 'electron';
import { release } from 'node:os';
import { join } from 'node:path';
import { update } from './update';
import { bookmarkAndFragmentDocx, checkDocxData, handleFileOpen, pathToFileItem } from './helpers';

// The built directory structure
//
// ├─┬ dist-electron
// │ ├─┬ main
// │ │ └── index.js    > Electron-Main
// │ └─┬ preload
// │   └── index.js    > Preload-Scripts
// ├─┬ dist
// │ └── index.html    > Electron-Renderer
//
process.env.DIST_ELECTRON = join(__dirname, '../');
process.env.DIST = join(process.env.DIST_ELECTRON, '../dist');
process.env.VITE_PUBLIC = process.env.VITE_DEV_SERVER_URL
    ? join(process.env.DIST_ELECTRON, '../public')
    : process.env.DIST;

let accKeyWindow: BrowserWindow | null = null;

const openAccKeyWindow = async () => {
    if (accKeyWindow) {
        try {
            accKeyWindow.focus();
            return;
        } catch {
            accKeyWindow = null;
        }
    }
    accKeyWindow = new BrowserWindow({
        title: 'Enter Account Key',
        backgroundColor: '#000',
        icon: join(process.env.VITE_PUBLIC, 'favicon.ico'),
        webPreferences: {
            preload,
            // Warning: Enable nodeIntegration and disable contextIsolation is not secure in production
            // Consider using contextBridge.exposeInMainWorld
            // Read more on https://www.electronjs.org/docs/latest/tutorial/context-isolation
            nodeIntegration: true,
            contextIsolation: false,
        },
    });

    if (url) {
        console.log('url', url);
        // electron-vite-vue#298
        accKeyWindow.loadURL(url);
        // Open devTool if the app is not packaged
        accKeyWindow.webContents.openDevTools();
    } else {
        console.log('indexHtml', indexHtml);
        accKeyWindow.loadFile(indexHtml);
    }
};

// Disable GPU Acceleration for Windows 7
if (release().startsWith('6.1')) app.disableHardwareAcceleration();

// Set application name for Windows 10+ notifications
if (process.platform === 'win32') app.setAppUserModelId(app.getName());

if (!app.requestSingleInstanceLock()) {
    app.quit();
    process.exit(0);
}

// Remove electron security warnings
// This warning only shows in development mode
// Read more on https://www.electronjs.org/docs/latest/tutorial/security
// process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'

let win: BrowserWindow | null = null;
// Here, you can also use other preload
const preload = join(__dirname, '../preload/index.js');
const url = process.env.VITE_DEV_SERVER_URL;
const indexHtml = join(process.env.DIST, 'index.html');

async function createWindow() {
    win = new BrowserWindow({
        title: 'Main window',
        backgroundColor: '#000',
        icon: join(process.env.VITE_PUBLIC, 'favicon.ico'),
        webPreferences: {
            preload,
            // Warning: Enable nodeIntegration and disable contextIsolation is not secure in production
            // Consider using contextBridge.exposeInMainWorld
            // Read more on https://www.electronjs.org/docs/latest/tutorial/context-isolation
            nodeIntegration: true,
            contextIsolation: false,
        },
    });

    if (url) {
        console.log('url', url);
        // electron-vite-vue#298
        win.loadURL(url);
        // Open devTool if the app is not packaged
        win.webContents.openDevTools();
    } else {
        console.log('indexHtml', indexHtml);
        win.loadFile(indexHtml);
    }

    // Test actively push message to the Electron-Renderer
    win.webContents.on('did-finish-load', () => {
        win?.webContents.send('main-process-message', new Date().toLocaleString());
    });

    // Make all links open with the browser, not with the application
    win.webContents.setWindowOpenHandler(({ url }) => {
        if (url.startsWith('https:')) shell.openExternal(url);
        return { action: 'deny' };
    });

    // Apply electron-updater
    update(win);
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    win = null;
    if (process.platform !== 'darwin') app.quit();
});

app.on('second-instance', () => {
    if (win) {
        // Focus on the main window if the user tried to open another
        if (win.isMinimized()) win.restore();
        win.focus();
    }
});

app.on('activate', () => {
    const allWindows = BrowserWindow.getAllWindows();
    if (allWindows.length) {
        allWindows[0].focus();
    } else {
        createWindow();
    }
});

// New window example arg: new windows url
ipcMain.handle('open-win', (_, arg) => {
    const childWindow = new BrowserWindow({
        webPreferences: {
            preload,
            nodeIntegration: true,
            contextIsolation: false,
        },
    });

    if (process.env.VITE_DEV_SERVER_URL) {
        childWindow.loadURL(`${url}#${arg}`);
    } else {
        childWindow.loadFile(indexHtml, { hash: arg });
    }
});

ipcMain.on('addFiles', (event, arg) => {
    handleFileOpen(win!, { multiselect: true, extensions: ['docx', 'mxliff'] }).then((filePaths) => {
        event.sender.send('addFiles', filePaths);
    });
});

ipcMain.on('checkDocxData', async (event, arg) => {
    const { path, eventId } = arg;
    const data = await checkDocxData(path);
    event.sender.send('checkDocxData', { data, eventId });
});

ipcMain.on('bookmarkAndFragmentDocx', async (event, arg) => {
    const { path, eventId } = arg;
    try {
        const { files, fragData } = await bookmarkAndFragmentDocx(path);
        if (!fragData) throw new Error('No fragData');
        event.sender.send('bookmarkAndFragmentDocx', {
            files: [pathToFileItem(files.bookmarkTable), pathToFileItem(files.fragmentTable)],
            eventId,
            status: 200,
            fragData: {
                redundancy: fragData.redundancy,
                redundancyRatio: fragData.redundancyRatio,
                totalLength: fragData.totalLength,
            },
        });
    } catch (e: any) {
        event.sender.send('bookmarkAndFragmentDocx', {
            files: [],
            message: e.message,
            eventId,
            status: 500,
        });
    }
});

ipcMain.on('closeAccKeyWindow', async (event, arg) => {
    if (accKeyWindow) {
        try {
            accKeyWindow.close();
        } finally {
            accKeyWindow = null;
        }
        win && win.focus();
    }
});

ipcMain.on('openAccKeyWindow', async (event, arg) => {
    openAccKeyWindow();
});
