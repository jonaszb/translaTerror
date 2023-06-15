import createWindow from './create-window';
import { docxToMxliff, mxliffToDocx, requestForm, translateTable } from './apiUtils';
import {
    findMatchingMxliff,
    handleFileOpen,
    decompressDocx,
    getXmlFromDocx,
    checkDocxData,
    downloadFileFromLink,
    pathToFileItem,
} from './fileActions';
import { bookmarkAndFragmentDocx } from './fragmentation';

export {
    createWindow,
    docxToMxliff,
    mxliffToDocx,
    requestForm,
    translateTable,
    findMatchingMxliff,
    handleFileOpen,
    decompressDocx,
    getXmlFromDocx,
    checkDocxData,
    downloadFileFromLink,
    bookmarkAndFragmentDocx,
    pathToFileItem,
};
