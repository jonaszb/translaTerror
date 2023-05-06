import { app, ipcMain, BrowserWindow } from 'electron';
import serve from 'electron-serve';
import {
    createWindow,
    docxToMxliff,
    findMatchingMxliff,
    mxliffToDocx,
    translateTable,
    handleFileOpen,
    checkDocxData,
} from './helpers';
import { download } from 'electron-dl';
import type { FileItem } from '../renderer/types';
import { fragmentDocx } from './helpers/apiUtils';

const isProd: boolean = process.env.NODE_ENV === 'production';

if (isProd) {
    serve({ directory: 'app' });
} else {
    app.setPath('userData', `${app.getPath('userData')} (development)`);
}

(async () => {
    await app.whenReady();
    const mainWindow = createWindow('main', {
        width: 1000,
        height: 600,
        minHeight: 540,
        minWidth: 460,
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
            const downloadLink = await translateTable({ path, toLang, fromLang });
            if (typeof downloadLink === 'string') {
                await download(win, downloadLink, {
                    directory: path.replace(`${name}.${extension}`, ''),
                    filename: `${name}_TAB.${extension}`,
                });
            }
            event.sender.send('translateSingleDoc', { downloadLink, eventId });
        }
    );

    ipcMain.on(
        'fragmentDocx',
        async (event, arg: { path: string; name: string; eventId: string; fromLang?: string; toLang?: string }) => {
            const { path, name, eventId, fromLang, toLang } = arg;
            const win = BrowserWindow.getFocusedWindow();
            const response = await fragmentDocx(path, fromLang, toLang);
            if (isFragmentationResponse(response)) {
                const { url: downloadLink, ...fragData } = response;
                console.log('fragData', JSON.stringify(fragData));
                console.log('downloadLink', downloadLink);
                await download(win, downloadLink, {
                    directory: path.replace(`${name}.docx`, ''),
                    filename: `${name}_TAB.docx`,
                });
                event.sender.send('fragmentDocx', {
                    downloadLink,
                    fragData: {
                        redundancy: fragData.redundancy,
                        redundancyRatio: fragData.redundancy_ratio,
                        totalLength: fragData.total_length,
                    },
                    eventId,
                });
            } else {
                event.sender.send('fragmentDocx', { downloadLink: null, eventId });
            }
        }
    );

    ipcMain.on('convertMxliffToDocx', async (event, arg: { path: string; name: string; eventId: string }) => {
        const { path, name, eventId } = arg;
        const win = BrowserWindow.getFocusedWindow();
        const downloadLink = await mxliffToDocx(path);
        if (typeof downloadLink === 'string') {
            const directory = path.replace(`${name}.mxliff`, '');
            const filename = `${name}_TAB.docx`;
            await download(win, downloadLink, { directory, filename });
        }
        event.sender.send('mxliffToDocx', { downloadLink, eventId });
    });

    ipcMain.on('findMatchingMxliff', async (event, arg: { path: string; name: string; eventId: string }) => {
        const { path, name, eventId } = arg;
        const mxliffPath = await findMatchingMxliff(path, name);
        return event.sender.send('matchingMxliffFound', { eventId, mxliffPath });
    });

    ipcMain.on('convertDocxToMxliff', async (event, arg: { path: string; mxliffData: FileItem; eventId: string }) => {
        const { path, mxliffData, eventId } = arg;
        const win = BrowserWindow.getFocusedWindow();
        const downloadLink = await docxToMxliff(path, mxliffData.path);
        if (typeof downloadLink === 'string') {
            const directory = mxliffData.path.replace(`${mxliffData.name}.${mxliffData.extension}`, '');
            const filename = `${mxliffData.name}.mxliff`;

            await download(win, downloadLink, { directory, filename });
        }
        event.sender.send('docxToMxliff', { downloadLink, eventId });
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

    mainWindow.setBackgroundColor('#18181b');
    if (isProd) {
        await mainWindow.loadURL('app://./home.html');
    } else {
        const port = process.argv[2];
        await mainWindow.loadURL(`http://localhost:${port}/home`);
        mainWindow.webContents.openDevTools();
    }
})();

app.on('window-all-closed', () => {
    app.quit();
});

const isFragmentationResponse = (
    arg: any
): arg is { url: string; redundancy: number; redundancy_ratio: number; total_length: number } => {
    return arg && typeof arg === 'object' && 'url' in arg && 'redundancy' in arg && 'redundancy_ratio' in arg;
};
