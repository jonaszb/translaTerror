import { app, Menu, ipcMain, BrowserWindow } from 'electron';
import serve from 'electron-serve';
import {
    createWindow,
    docxToMxliff,
    findMatchingMxliff,
    mxliffToDocx,
    translateTable,
    handleFileOpen,
    checkDocxData,
    downloadFileFromLink,
    bookmarkAndFragmentDocx,
    pathToFileItem,
} from './helpers';
import { download } from 'electron-dl';
import type { FileItem } from '../types';
import { fragmentDocx } from './helpers/apiUtils';

const isProd: boolean = process.env.NODE_ENV === 'production';

if (isProd) {
    serve({ directory: 'app' });
} else {
    app.setPath('userData', `${app.getPath('userData')} (development)`);
}

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
    accKeyWindow = createWindow('account-key', {
        width: 660,
        maxWidth: 660,
        minWidth: 660,
        height: 280,
        minHeight: 280,
        maxHeight: 280,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
        backgroundColor: '#18181b',
    });
    // Go to account-key page
    if (isProd) {
        await accKeyWindow.loadURL('app://./account-key.html');
    } else {
        const port = process.argv[2];
        await accKeyWindow.loadURL(`http://localhost:${port}/account-key`);
        accKeyWindow.webContents.openDevTools();
    }
};

(async () => {
    await app.whenReady();
    const mainWindow = createWindow('main', {
        width: 1000,
        height: 600,
        minHeight: 580,
        minWidth: 530,
    });

    ipcMain.on('focusWindow', () => {
        mainWindow.setAlwaysOnTop(true);
        mainWindow.show();
        mainWindow.setAlwaysOnTop(false);
        app.focus();
    });

    ipcMain.on('addFiles', (event, arg) => {
        handleFileOpen(mainWindow, { multiselect: true, extensions: ['docx', 'mxliff'] }).then((filePaths) => {
            event.sender.send('addFiles', filePaths);
        });
    });

    ipcMain.on(
        'translateSingleDoc',
        async (
            event,
            arg: { path: string; name: string; eventId: string; extension: string; fromLang: string; toLang: string }
        ) => {
            const { path, name, eventId, extension, fromLang, toLang } = arg;
            const win = BrowserWindow.getFocusedWindow();
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

    ipcMain.on('findMatchingMxliff', async (event, arg: { path: string; name: string; eventId: string }) => {
        const { path, name, eventId } = arg;
        const mxliffPath = await findMatchingMxliff(path, name);
        return event.sender.send('matchingMxliffFound', { eventId, mxliffPath });
    });

    ipcMain.on('convertDocxToMxliff', async (event, arg: { path: string; mxliffData: FileItem; eventId: string }) => {
        const { path, mxliffData, eventId } = arg;
        const win = BrowserWindow.getFocusedWindow();
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
        'openDownloadLink',
        async (event, { downloadLink, file, suffix }: { downloadLink: any; file: FileItem; suffix?: string }) => {
            const win = BrowserWindow.getFocusedWindow();
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
        const filePaths = await handleFileOpen(win, { extensions, multiselect });
        event.sender.send('selectFile', { filePaths, eventId });
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
        } catch (e) {
            console.error(e);
            event.sender.send('bookmarkAndFragmentDocx', {
                files: [],
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
            mainWindow.focus();
        }
    });

    ipcMain.on('openAccKeyWindow', async (event, arg) => {
        openAccKeyWindow();
    });

    mainWindow.setBackgroundColor('#18181b');
    if (isProd) {
        await mainWindow.loadURL('app://./home.html');
    } else {
        const port = process.argv[2];
        await mainWindow.loadURL(`http://localhost:${port}/home`);
        mainWindow.webContents.openDevTools();
    }
})();

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

app.on('window-all-closed', () => {
    app.quit();
});

const isFragmentationResponse = (
    arg: any
): arg is { url: string; redundancy: number; redundancy_ratio: number; total_length: number } => {
    return arg && typeof arg === 'object' && 'url' in arg && 'redundancy' in arg && 'redundancy_ratio' in arg;
};
