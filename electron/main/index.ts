import { app, BrowserWindow, shell, ipcMain, Menu } from 'electron';
import { release } from 'node:os';
import { join } from 'node:path';
import { update } from './update';
import {
    bookmarkAndFragmentDocx,
    checkDocxData,
    docxToMxliff,
    downloadFileFromLink,
    findMatchingMxliff,
    handleFileOpen,
    mxliffToDocx,
    pathToFileItem,
    translateTable,
} from './helpers';
import { FileItem } from 'types';
import { fragmentDocx } from './helpers/apiUtils';
import { download } from 'electron-dl';
if (require('electron-squirrel-startup')) app.quit();
import updateApp from 'update-electron-app';
updateApp();
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
    const mainWindow = BrowserWindow.getFocusedWindow();
    if (!mainWindow) return;

    accKeyWindow = new BrowserWindow({
        title: 'Enter Account Key',
        backgroundColor: '#000',
        modal: true,
        parent: mainWindow,
        webPreferences: {
            preload,
            // Warning: Enable nodeIntegration and disable contextIsolation is not secure in production
            // Consider using contextBridge.exposeInMainWorld
            // Read more on https://www.electronjs.org/docs/latest/tutorial/context-isolation
            nodeIntegration: true,
            contextIsolation: false,
        },
        width: 660,
        maxWidth: 660,
        minWidth: 660,
        height: 280,
        minHeight: 280,
        maxHeight: 280,
    });

    if (url) {
        accKeyWindow.loadURL(url + '#account-key');
    } else {
        accKeyWindow.loadFile(indexHtml, { hash: 'account-key' });
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

ipcMain.on('findMatchingMxliff', async (event, arg: { path: string; name: string; eventId: string }) => {
    const { path, name, eventId } = arg;
    const mxliffPath = await findMatchingMxliff(path, name);
    return event.sender.send('matchingMxliffFound', { eventId, mxliffPath });
});

ipcMain.on('convertDocxToMxliff', async (event, arg: { path: string; mxliffData: FileItem; eventId: string }) => {
    const { path, mxliffData, eventId } = arg;
    const win = BrowserWindow.getFocusedWindow();
    if (!win) return event.sender.send('docxToMxliff', { eventId, status: 1 });
    const { data: downloadLink, status } = await docxToMxliff(path, mxliffData.path);
    const downloadData =
        status === 200 && typeof downloadLink === 'string'
            ? await downloadFileFromLink(win, downloadLink, {
                  directory: mxliffData.path.replace(`${mxliffData.name}.${mxliffData.extension}`, ''),
                  filename: `${mxliffData.name}.mxliff`,
              })
            : null;
    event.sender.send('docxToMxliff', { downloadData, eventId, status });
});

ipcMain.on(
    'translateSingleDoc',
    async (
        event,
        arg: { path: string; name: string; eventId: string; extension: string; fromLang: string; toLang: string }
    ) => {
        const { path, name, eventId, extension, fromLang, toLang } = arg;
        const win = BrowserWindow.getFocusedWindow();
        if (!win) return event.sender.send('translateSingleDoc', { eventId, status: 1 });
        const { data: downloadLink, status } = await translateTable({ path, toLang, fromLang });
        const downloadData =
            status === 200 && typeof downloadLink === 'string'
                ? await downloadFileFromLink(win, downloadLink, {
                      directory: path.replace(`${name}.${extension}`, ''),
                      filename: `${name}_TAB.${extension}`,
                  })
                : null;
        event.sender.send('translateSingleDoc', { downloadData, eventId, status });
    }
);

ipcMain.on(
    'fragmentDocx',
    async (event, arg: { path: string; name: string; eventId: string; fromLang?: string; toLang?: string }) => {
        const { path, name, eventId, fromLang, toLang } = arg;
        const win = BrowserWindow.getFocusedWindow();
        if (!win) return event.sender.send('fragmentDocx', { eventId, status: 1 });
        const { data: response, status } = await fragmentDocx(path, fromLang, toLang);
        if (isFragmentationResponse(response)) {
            const { url: downloadLink, ...fragData } = response;
            const downloadData =
                status === 200 && typeof downloadLink === 'string'
                    ? await downloadFileFromLink(win, downloadLink, {
                          directory: path.replace(`${name}.docx`, ''),
                          filename: `${name}_TAB.docx`,
                      })
                    : null;
            event.sender.send('fragmentDocx', {
                downloadData,
                fragData: {
                    redundancy: fragData.redundancy,
                    redundancyRatio: fragData.redundancy_ratio,
                    totalLength: fragData.total_length,
                },
                eventId,
                status,
            });
        } else {
            event.sender.send('fragmentDocx', { downloadData: null, eventId, status });
        }
    }
);

ipcMain.on('convertMxliffToDocx', async (event, arg: { path: string; name: string; eventId: string }) => {
    const { path, name, eventId } = arg;
    const win = BrowserWindow.getFocusedWindow();
    if (!win) return event.sender.send('mxliffToDocx', { eventId, status: 1 });
    const { data: downloadLink, status } = await mxliffToDocx(path);
    const downloadData =
        status === 200 && typeof downloadLink === 'string'
            ? await downloadFileFromLink(win, downloadLink, {
                  directory: path.replace(`${name}.mxliff`, ''),
                  filename: `${name}_TAB.docx`,
              })
            : null;
    event.sender.send('mxliffToDocx', { downloadData, eventId, status });
});

ipcMain.on(
    'openDownloadLink',
    async (event, { downloadLink, file, suffix }: { downloadLink: any; file: FileItem; suffix?: string }) => {
        const win = BrowserWindow.getFocusedWindow();
        if (!win) return console.error('No focused window');
        await download(win, downloadLink, {
            saveAs: true,
            directory: file.path.replace(`${file.name}.${file.extension}`, ''),
            filename: `${file.name}${suffix ?? ''}.${file.extension}`,
        });
    }
);

ipcMain.on('selectFile', async (event, arg) => {
    const { eventId, extensions, multiselect } = arg;
    const win = BrowserWindow.getFocusedWindow();
    if (!win) return event.sender.send('selectFile', { eventId, status: 1 });
    const filePaths = await handleFileOpen(win, { extensions, multiselect });
    event.sender.send('selectFile', { filePaths, eventId });
});
ipcMain.on('addFiles', (event, arg) => {
    if (process.env.TEST_FILE_PATH) {
        event.sender.send('addFiles', [process.env.TEST_FILE_PATH]);
    } else {
        handleFileOpen(win!, { multiselect: true, extensions: ['docx', 'mxliff'] }).then((filePaths) => {
            event.sender.send('addFiles', filePaths);
        });
    }
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

const template: Electron.MenuItemConstructorOptions[] = [
    {
        label: app.name,
        submenu: [
            {
                label: 'Account key',
                click: openAccKeyWindow,
            },
            { type: 'separator' },
            {
                label: 'Quit',
                accelerator: 'Command+Q',
                click: function () {
                    app.quit();
                },
            },
        ],
    },
    {
        label: 'Edit',
        submenu: [
            { label: 'Undo', accelerator: 'CmdOrCtrl+Z', role: 'undo' },
            { label: 'Redo', accelerator: 'Shift+CmdOrCtrl+Z', role: 'redo' },
            { label: 'Cut', accelerator: 'CmdOrCtrl+X', role: 'cut' },
            { label: 'Copy', accelerator: 'CmdOrCtrl+C', role: 'copy' },
            { label: 'Paste', accelerator: 'CmdOrCtrl+V', role: 'paste' },
            { label: 'Select All', accelerator: 'CmdOrCtrl+A', role: 'selectAll' },
        ],
    },
];

const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);

const isFragmentationResponse = (
    arg: any
): arg is { url: string; redundancy: number; redundancy_ratio: number; total_length: number } => {
    return arg && typeof arg === 'object' && 'url' in arg && 'redundancy' in arg && 'redundancy_ratio' in arg;
};
