import { dialog } from 'electron';
import fs from 'fs';
import decompress from 'decompress';

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

export const decompressDocx = async (path) => {
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
