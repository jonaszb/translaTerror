import { dialog } from 'electron';
import fs from 'fs';
import { download } from 'electron-dl';
import { FileItem } from '../../../types';
import DocxFile from '../models/DocxFile';
import { parseBuffer } from 'music-metadata';

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

export async function handleFileOpen(
    browserWindow: Electron.BrowserWindow,
    options?: { multiselect?: boolean; name?: string; extensions?: string[] }
) {
    const { canceled, filePaths } = await dialog.showOpenDialog(browserWindow, {
        properties: options?.multiselect ? ['multiSelections', 'openFile'] : ['openFile'],
        filters: [{ name: options?.name ?? 'All compatible files', extensions: options?.extensions ?? ['*'] }],
    });
    if (canceled) {
        return;
    } else {
        return filePaths;
    }
}

export async function bookmarkAndFragmentDocx(path: string) {
    const docx = new DocxFile(path);
    let progress = '';
    try {
        const bookmarkTableFilePath = docx.getPathWithSuffix('_TT');
        const fragmentTableFilePath = docx.getPathWithSuffix('_TT_TAB');
        progress = 'creating backup';
        docx.createBackup();
        progress = 'reading docx';
        await docx.read();
        progress = 'adding bookmarks';
        await docx.addBookmarks();
        progress = 'creating tables';
        const bookmarkTable = await docx.createBookmarkTable();
        const fragmentTable = await docx.createFragmentTable();
        progress = 'saving documents';
        await docx.saveChanges();
        bookmarkTable &&
            fs.writeFile(bookmarkTableFilePath, bookmarkTable, (err) => {
                if (err) throw err;
                console.log('Bookmark table saved');
            });
        fragmentTable &&
            fs.writeFile(fragmentTableFilePath, fragmentTable, (err) => {
                if (err) throw err;
                console.log('Fragment table saved');
            });
        return {
            files: {
                bookmarkTable: bookmarkTableFilePath,
                fragmentTable: fragmentTableFilePath,
            },
            fragData: docx.getFragData(),
        };
    } catch (e) {
        docx.restoreBackup();
        docx.deleteBackup();
        throw new Error(`Error while ${progress}`);
    }
}

export async function checkDocxData(path: string) {
    const docx = new DocxFile(path);
    await docx.read();
    return await docx.getDocumentInfo();
}

export async function checkAudioDuration(path: string) {
    try {
        const buffer = fs.readFileSync(path);
        const metadata = await parseBuffer(buffer);
        return metadata.format.duration ? Math.floor(metadata.format.duration) : -1;
    } catch (error) {
        console.error('Error reading file:', error);
        return -1;
    }
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
    if (!nameWithExtension) return { path, name: '', extension: '' };
    const lastDot = nameWithExtension.lastIndexOf('.');
    if (lastDot === -1) return { path, name: nameWithExtension, extension: '' };
    const name = nameWithExtension.slice(0, lastDot);
    const extension = nameWithExtension.slice(lastDot + 1);
    return {
        path,
        name,
        extension,
    };
};
