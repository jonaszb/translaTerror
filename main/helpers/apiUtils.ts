import fs from 'fs';
import FormData from 'form-data';
import serviceKey from '../key.json';
import { GoogleAuth } from 'google-auth-library';
import { decompressDocx } from './fileActions';
const auth = new GoogleAuth({ credentials: serviceKey });

const translafeFnUrl = 'https://europe-central2-translaterror.cloudfunctions.net/docx-translate';
const mxliffConvertUrl = 'https://europe-central2-translaterror.cloudfunctions.net/docx-mxliff-single';
const fragmentDocxUrl = 'https://europe-central2-translaterror.cloudfunctions.net/docx-fragment';

export async function requestForm(options: { formData: FormData; url: string; method?: Method }) {
    const client = await auth.getIdTokenClient(options.url);
    const res = await client.request({
        url: options.url,
        method: options.method ?? 'POST',
        headers: options.formData.getHeaders(),
        data: options.formData.getBuffer(),
    });
    return res.data;
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
    const tempDir = await decompressDocx(path);
    const xmlData = fs.readFileSync(`${tempDir.dir}/word/document.xml`);
    const fileName = path.split(/[\\\/]/).pop();
    formData.append('file', xmlData, fileName.replace('.docx', '.xml'));
    toLang && formData.append('target_language', toLang);
    fromLang && fromLang !== 'auto' && formData.append('source_language', fromLang);
    const response = await requestForm({ formData, url: fragmentDocxUrl });
    console.log(response);
    try {
        fs.rmSync(tempDir.dir, { recursive: true, force: true });
    } finally {
        return response;
    }
};

type Method = 'POST' | 'GET' | 'HEAD' | 'DELETE' | 'PUT' | 'CONNECT' | 'OPTIONS' | 'TRACE' | 'PATCH';
