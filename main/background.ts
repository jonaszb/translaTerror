import { app, dialog, ipcMain, BrowserWindow } from 'electron';
import serve from 'electron-serve';
import { createWindow } from './helpers';
import { GoogleAuth } from 'google-auth-library';
import fs from 'fs';
import FormData from 'form-data';
import serviceKey from './key.json';
import { download } from 'electron-dl';
import type { FileItem } from '../renderer/types';

const translafeFnUrl = 'https://europe-central2-translaterror.cloudfunctions.net/docx-translate';
const mxliffConvertUrl = 'https://europe-central2-translaterror.cloudfunctions.net/docx-mxliff-single';
const auth = new GoogleAuth({ credentials: serviceKey });
const debug = process.env.DEBUG === 'true';

const isProd: boolean = process.env.NODE_ENV === 'production';

if (isProd) {
    serve({ directory: 'app' });
} else {
    app.setPath('userData', `${app.getPath('userData')} (development)`);
}

async function requestForm(options: { formData: FormData; url: string; method?: Method }) {
    const client = await auth.getIdTokenClient(options.url);
    const res = await client.request({
        url: options.url,
        method: options.method ?? 'POST',
        headers: options.formData.getHeaders(),
        data: options.formData.getBuffer(),
    });
    return res.data;
}

async function handleFileOpen(browserWindow: Electron.BrowserWindow) {
    const { canceled, filePaths } = await dialog.showOpenDialog(browserWindow, {
        properties: ['multiSelections', 'openFile'],
        filters: [{ name: 'All compatible files', extensions: ['docx', 'mxliff'] }],
    });
    if (canceled) {
        return;
    } else {
        return filePaths;
    }
}

const translateTable = async (jobData) => {
    const { path, toLang, fromLang } = jobData;
    const formData = new FormData();
    const fileData = fs.readFileSync(path);
    const fileName = path.split(/[\\\/]/).pop();
    formData.append('file', fileData, fileName);
    formData.append('target_language', toLang);
    fromLang === 'auto' || formData.append('source_language', fromLang);
    return await requestForm({ formData, url: translafeFnUrl });
};

const mxliffToDocx = async (path: string) => {
    const formData = new FormData();
    const fileData = fs.readFileSync(path);
    const fileName = path.split(/[\\\/]/).pop();
    console.log('fileName', fileName);
    console.log('fileData', fileData);
    formData.append('file', fileData, fileName);
    return await requestForm({ formData, url: mxliffConvertUrl });
};

const docxToMxliff = async (path: string, mxliffPath: string) => {
    debug && console.log('docxToMxliff ', path, mxliffPath);
    const formData = new FormData();
    const docxData = fs.readFileSync(path);
    const mxliffData = fs.readFileSync(mxliffPath);
    const docxName = path.split(/[\\\/]/).pop();
    const mxliffName = mxliffPath.split(/[\\\/]/).pop();
    formData.append('file', docxData, docxName);
    formData.append('target_file', mxliffData, mxliffName);
    return await requestForm({ formData, url: mxliffConvertUrl });
};

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
        handleFileOpen(mainWindow).then((filePaths) => {
            event.sender.send('addFiles', filePaths);
        });
    });

    ipcMain.on('translateSingleDoc', async (event, arg) => {
        const win = BrowserWindow.getFocusedWindow();
        const downloadLink = await translateTable(arg);
        if (typeof downloadLink === 'string') {
            await download(win, downloadLink, {
                directory: arg.path.replace(`${arg.name}.${arg.extension}`, ''),
                filename: `${arg.name}_TAB.${arg.extension}`,
            });
        }
        event.sender.send('translateSingleDoc', { downloadLink, path: arg.path });
    });

    ipcMain.on('convertMxliffToDocx', async (event, arg) => {
        const win = BrowserWindow.getFocusedWindow();
        const downloadLink = await mxliffToDocx(arg.path);
        debug && console.log('Finished mxliff -> docx conversion');
        debug && console.log('downloadLink: ', downloadLink);
        if (typeof downloadLink === 'string') {
            const directory = arg.path.replace(`${arg.name}.${arg.extension}`, '');
            const filename = `${arg.name}_TAB.docx`;
            debug && console.log('downloading to: ', directory + filename);
            await download(win, downloadLink, { directory, filename });
        }
        event.sender.send('mxliffToDocx', { downloadLink, path: arg.path });
    });

    ipcMain.on('findMatchingMxliff', async (event, arg) => {
        const { path, name, extension } = arg;
        const dir = path.replace(`${name}.${extension}`, '');
        const files = fs.readdirSync(dir);
        const mxliffFiles = files.filter((file) => file.endsWith('.mxliff')).map((file) => file.replace('.mxliff', ''));
        let matchingMxliff = null;
        if (mxliffFiles.length === 0) return event.sender.send('matchingMxliffFound', { path, mxliffPath: null });
        if (name.endsWith('_TAB')) {
            matchingMxliff = mxliffFiles.find((file) => file === name.replace('_TAB', ''));
            if (!matchingMxliff) matchingMxliff = mxliffFiles.find((file) => file === name);
        } else {
            matchingMxliff = mxliffFiles.find((file) => file === name);
        }
        const mxliffPath = matchingMxliff ? `${dir}${matchingMxliff}.mxliff` : null;
        return event.sender.send('matchingMxliffFound', { path, mxliffPath });
    });

    ipcMain.on('convertDocxToMxliff', async (event, arg) => {
        const win = BrowserWindow.getFocusedWindow();
        debug && console.log('Starting docx -> mxliff conversion');
        const downloadLink = await docxToMxliff(arg.path, arg.mxliffData.path);
        debug && console.log('Finished docx -> mxliff conversion');
        debug && console.log('downloadLink: ', downloadLink);
        if (typeof downloadLink === 'string') {
            const directory: string = arg.mxliffData.path.replace(
                `${arg.mxliffData.name}.${arg.mxliffData.extension}`,
                ''
            );
            const filename: string = `${arg.mxliffData.name}.mxliff`;
            debug && console.log('downloading to: ', directory + filename);

            await download(win, downloadLink, { directory, filename });
        }
        event.sender.send('docxToMxliff', { downloadLink, path: arg.path });
    });

    ipcMain.on(
        'openDownloadLink',
        async (event, { downloadLink, file, suffix }: { downloadLink: any; file: FileItem; suffix?: string }) => {
            const win = BrowserWindow.getFocusedWindow();
            console.log(
                await download(win, downloadLink, {
                    saveAs: true,
                    directory: file.path.replace(`${file.name}.${file.extension}`, ''),
                    filename: `${file.name}${suffix ?? ''}.${file.extension}`,
                })
            );
        }
    );

    ipcMain.on('selectFile', async (event, arg) => {
        const win = BrowserWindow.getFocusedWindow();
        const { filePaths } = await dialog.showOpenDialog(win, {
            properties: arg.properties ?? ['openFile'],
            filters: [{ name: arg.name ?? 'All Files', extensions: arg.extensions ?? ['*'] }],
        });
        event.sender.send('selectFile', { filePaths, path: arg.path });
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

type Method = 'POST' | 'GET' | 'HEAD' | 'DELETE' | 'PUT' | 'CONNECT' | 'OPTIONS' | 'TRACE' | 'PATCH';
