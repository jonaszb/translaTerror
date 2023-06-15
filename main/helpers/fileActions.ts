import { dialog } from 'electron';
import fs from 'fs';
import decompress from 'decompress';
import xpath from 'xpath';
import { DOMParser } from '@xmldom/xmldom';
import { download } from 'electron-dl';
import { FileItem } from '../../types';

export const findMatchingMxliff = async (path: string, name: string) => {
    const dir = path.replace(`${name}.docx`, '');
    const files = fs.readdirSync(dir);
    const mxliffFiles = files.filter((file) => file.endsWith('.mxliff')).map((file) => file.replace('.mxliff', ''));
    let matchingMxliff = null;
    if (mxliffFiles.length === 0) return null;
    if (name.endsWith('_TAB')) {
        matchingMxliff = mxliffFiles.find((file) => file === name.replace('_TAB', ''));
        if (!matchingMxliff) matchingMxliff = mxliffFiles.find((file) => file === name);
    } else {
        matchingMxliff = mxliffFiles.find((file) => file === name);
    }
    return matchingMxliff ? `${dir}${matchingMxliff}.mxliff` : null;
};

export const decompressDocx = async (path: string) => {
    const randomId = Math.random().toString(36).substring(7);
    const fileName = path.split(/[\\\/]/).pop();
    const dir = path.replace(fileName, `.temp_${randomId}`);
    await decompress(path, dir);
    return { dir, folderName: `.temp_${randomId}` };
};

export async function handleFileOpen(
    browserWindow: Electron.BrowserWindow,
    options?: { multiselect?: boolean; name?: string; extensions?: string[] }
) {
    const { canceled, filePaths } = await dialog.showOpenDialog(browserWindow, {
        properties: options.multiselect ? ['multiSelections', 'openFile'] : ['openFile'],
        filters: [{ name: options.name ?? 'All compatible files', extensions: options.extensions ?? ['*'] }],
    });
    if (canceled) {
        return;
    } else {
        return filePaths;
    }
}

export async function getXmlFromDocx(path: string) {
    const tempDir = await decompressDocx(path);
    const doc = new DOMParser().parseFromString(fs.readFileSync(`${tempDir.dir}/word/document.xml`, 'utf-8'));
    try {
        fs.rmSync(tempDir.dir, { recursive: true, force: true });
    } finally {
        return doc;
    }
}

export async function checkDocxData(path: string) {
    const doc = await getXmlFromDocx(path);
    const select = xpath.useNamespaces({ w: 'http://schemas.openxmlformats.org/wordprocessingml/2006/main' });
    const tables = select('//w:tbl', doc);
    const columns = select('//w:tblGrid/w:gridCol', doc);
    const firstColCells = select('//w:tr/w:tc[1]//text()', doc);
    const totalLength = select('//text()', doc).reduce((acc: number, cur) => acc + cur.toString().length, 0) as number;
    const sourceLength = firstColCells.reduce((acc: number, cur) => acc + cur.toString().length, 0) as number;
    const data = { columns: columns.length, tables: tables.length, sourceLength, totalLength };
    return data;
}

export async function downloadFileFromLink(
    window: Electron.BrowserWindow,
    url: string,
    options: { directory: string; filename: string }
) {
    const dlResult = { url, downloaded: false, directory: options.directory, fileName: options.filename };
    if (!url) return { ...dlResult, directory: null, fileName: null };
    try {
        const file = await download(window, url, {
            directory: options.directory,
            filename: options.filename,
        });
        if (file.getSavePath()) {
            return { ...dlResult, downloaded: true };
        } else {
            return { ...dlResult, directory: null, fileName: null };
        }
    } catch {
        return { ...dlResult, directory: null, fileName: null };
    }
}

export const pathToFileItem = (path: string): FileItem => {
    const nameWithExtension = path.split(/[\\\/]/).pop();
    const lastDot = nameWithExtension.lastIndexOf('.');
    const name = nameWithExtension.slice(0, lastDot);
    const extension = nameWithExtension.slice(lastDot + 1);
    return {
        path,
        name,
        extension,
    };
};
