import fs from 'fs';
import FormData from 'form-data';
import { GoogleAuth } from 'google-auth-library';
import Store from 'electron-store';
import { BrowserWindow, ipcMain, safeStorage } from 'electron';
import DocxFile from '../models/DocxFile';

const keyStore = new Store({ name: 'service-key' });
let key: any;
let auth: GoogleAuth;

const keyCheckUrl = 'https://europe-central2-translaterror.cloudfunctions.net/check';
const translafeFnUrl = 'https://europe-central2-translaterror.cloudfunctions.net/docx-translate';
const mxliffConvertUrl = 'https://europe-central2-translaterror.cloudfunctions.net/docx-mxliff-single';
const fragmentDocxUrl = 'https://europe-central2-translaterror.cloudfunctions.net/docx-fragment';

const initialize = () => {
    console.log('Initializing key');
    const keyAsStored = keyStore.get('key');
    try {
        if (keyAsStored) {
            key = safeStorage.isEncryptionAvailable()
                ? safeStorage.decryptString(Buffer.from(keyAsStored as Buffer))
                : keyAsStored;
        }
        const decodedKey = Buffer.from(key, 'base64').toString('ascii');
        auth = new GoogleAuth({ credentials: JSON.parse(decodedKey) as any });
    } catch {
        console.error('Invalid key');
    }
};

ipcMain.on('setServiceKey', async (event, key) => {
    const mainWindow = BrowserWindow.fromId(1);
    try {
        const decodedKey = Buffer.from(key, 'base64').toString('ascii');
        const newAuth = new GoogleAuth({ credentials: JSON.parse(decodedKey) as any });
        const client = await newAuth.getIdTokenClient(keyCheckUrl);
        const res = await client.request({ url: keyCheckUrl, method: 'GET' });
        if (res.status === 200) {
            console.log('Setting new key');
            const newKey = safeStorage.isEncryptionAvailable() ? safeStorage.encryptString(key) : key;
            keyStore.set('key', newKey);
            auth = newAuth;
            mainWindow && mainWindow.webContents.send('serviceKeySet', true);
            event.sender.send('serviceKeySet', true);
        } else {
            console.error('The key failed validation');
            event.sender.send('serviceKeySet', false);
        }
    } catch {
        console.error('Invalid key');
        event.sender.send('serviceKeySet', false);
    }
});

ipcMain.on('checkAccKey', async (event) => {
    if (!key) initialize();
    try {
        const client = await auth.getIdTokenClient(keyCheckUrl);
        const res = await client.request({ url: keyCheckUrl, method: 'GET' });
        if (res.status === 200) {
            event.sender.send('serviceKeySet', true);
        } else {
            console.error('The key failed validation');
            event.sender.send('serviceKeySet', false);
        }
    } catch {
        console.error('Invalid key');
        event.sender.send('serviceKeySet', false);
    }
});

const sendAuthRequest = async (data: { url: string; method: Method; headers?: FormData.Headers; data: any }) => {
    try {
        const client = await auth.getIdTokenClient(data.url);
        const res = await client.request(data);
        return res;
    } catch (error) {
        console.error(error);
        return null;
    }
};

export async function requestForm(options: { formData: FormData; url: string; method?: Method }) {
    const requestData = {
        url: options.url,
        method: options.method ?? 'POST',
        headers: options.formData.getHeaders(),
        data: options.formData.getBuffer(),
    };
    const res = await sendAuthRequest(requestData);
    if (isResponseWithData(res)) {
        return { data: res.data, status: res.status };
    } else {
        return { data: null, status: 1 };
    }
}

export const translateTable = async (jobData: { path: string; toLang: string; fromLang: string }) => {
    const { path, toLang, fromLang } = jobData;
    const formData = new FormData();
    const fileData = fs.readFileSync(path);
    const fileName = path.split(/[\\\/]/).pop();
    formData.append('file', fileData, fileName);
    formData.append('target_language', toLang);
    fromLang === 'auto' || formData.append('source_language', fromLang);
    return await requestForm({ formData, url: translafeFnUrl });
};

export const mxliffToDocx = async (path: string) => {
    const formData = new FormData();
    const fileData = fs.readFileSync(path);
    const fileName = path.split(/[\\\/]/).pop();
    formData.append('file', fileData, fileName);
    return await requestForm({ formData, url: mxliffConvertUrl });
};

export const docxToMxliff = async (path: string, mxliffPath: string) => {
    const formData = new FormData();
    const docxData = fs.readFileSync(path);
    const mxliffData = fs.readFileSync(mxliffPath);
    const docxName = path.split(/[\\\/]/).pop();
    const mxliffName = mxliffPath.split(/[\\\/]/).pop();
    formData.append('file', docxData, docxName);
    formData.append('target_file', mxliffData, mxliffName);
    return await requestForm({ formData, url: mxliffConvertUrl });
};

export const fragmentDocx = async (path: string, fromLang?: string, toLang?: string) => {
    const formData = new FormData();
    const docx = new DocxFile(path);
    let response: { data: unknown; status: number };
    try {
        await docx.read();
        const xmlData = docx.getDocumentXml();
        const fileName = path.split(/[\\\/]/).pop();
        formData.append('file', xmlData, fileName!.replace('.docx', '.xml'));
        toLang && formData.append('target_language', toLang);
        fromLang && fromLang !== 'auto' && formData.append('source_language', fromLang);
        response = await requestForm({ formData, url: fragmentDocxUrl });
    } catch {
        response = { data: null, status: 1 };
    }
    return response;
};

type Method = 'POST' | 'GET' | 'HEAD' | 'DELETE' | 'PUT' | 'CONNECT' | 'OPTIONS' | 'TRACE' | 'PATCH';

const isResponseWithData = (response: unknown): response is { data: any; status: number } => {
    return (
        typeof response === 'object' &&
        response !== null &&
        'data' in response &&
        'status' in response &&
        typeof response.status === 'number'
    );
};
