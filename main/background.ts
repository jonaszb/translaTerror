import { app, dialog, ipcMain, BrowserWindow } from 'electron';
import serve from 'electron-serve';
import { createWindow } from './helpers';
import { GoogleAuth } from 'google-auth-library';
import fs from 'fs';
import FormData from 'form-data';
import serviceKey from './key.json';
import { download } from 'electron-dl';

const translafeFnUrl = 'https://europe-central2-translaterror.cloudfunctions.net/docx-translate';
const translateTargetAudience = translafeFnUrl;
const auth = new GoogleAuth({ credentials: serviceKey });

const isProd: boolean = process.env.NODE_ENV === 'production';

if (isProd) {
    serve({ directory: 'app' });
} else {
    app.setPath('userData', `${app.getPath('userData')} (development)`);
}

async function request(formData: FormData) {
    console.info(`request ${translafeFnUrl} with target audience ${translateTargetAudience}`);
    const client = await auth.getIdTokenClient(translateTargetAudience);
    const res = await client.request({
        url: translafeFnUrl,
        method: 'POST',
        headers: formData.getHeaders(),
        data: formData.getBuffer(),
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
    // console.log('translateTable', path, toLang, fromLang);
    // await new Promise((resolve) => setTimeout(resolve, 5000));
    // return true;
    const formData = new FormData();
    const fileData = fs.readFileSync(path);
    const fileName = path.split(/[\\\/]/).pop();
    formData.append('file', fileData, fileName);
    formData.append('target_language', toLang);
    fromLang === 'auto' || formData.append('source_language', fromLang);
    return await request(formData);
};

(async () => {
    await app.whenReady();
    const mainWindow = createWindow('main', {
        width: 1000,
        height: 600,
        minHeight: 600,
        minWidth: 1000,
    });

    ipcMain.on('addFiles', (event, arg) => {
        handleFileOpen(mainWindow).then((filePaths) => {
            event.sender.send('addFiles', filePaths);
        });
    });

    ipcMain.on('translateSingleDoc', (event, arg) => {
        translateTable(arg).then((result) => {
            event.sender.send('translateSingleDoc', result);
        });
    });

    ipcMain.on('openDownloadLink', async (event, { downloadLink, selectedFile }) => {
        const win = BrowserWindow.getFocusedWindow();
        console.log(
            await download(win, downloadLink, {
                saveAs: true,
                directory: selectedFile.path.replace(selectedFile.name, ''),
                filename: `${selectedFile.name}_TAB.${selectedFile.extension}`,
            })
        );
    });

    mainWindow.setBackgroundColor('#27272A');
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
