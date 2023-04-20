import { ActionButton } from '../Buttons';
import { RightArrowIcon } from '../icons';
import { LanguageSelect } from '../LanguageSelect';
import { ipcRenderer } from 'electron';
import { useSingleFileContext } from '../../store/SingleFileContext';
import { useEffect, useState } from 'react';
import ActionTabs from '../ActionTabs';
import type { FileItem } from '../../types';

const actionTabs = ['Translate', 'To mxliff'];

const pathToFileItem = (path: string): FileItem => {
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

const DocxTileContent = () => {
    const {
        file,
        isProcessing,
        downloadLink,
        fromLang,
        toLang,
        setFromLang,
        setToLang,
        setIsProcessing,
        setDownloadLink,
    } = useSingleFileContext();
    const [selectedTab, setSelectedTab] = useState(0);
    const [matchingMxliff, setMatchingMxliff] = useState<string | null>(null);

    const initiateTranslation = () => {
        if (isProcessing || !ipcRenderer) return;
        if (downloadLink) {
            ipcRenderer.send('openDownloadLink', { downloadLink, file, suffix: '_TAB' });
        } else {
            const jobData = {
                fromLang,
                toLang,
                path: file.path,
                name: file.name,
                extension: file.extension,
            };
            setIsProcessing(true);
            ipcRenderer.send('translateSingleDoc', jobData);
        }
    };

    const sendMxliffSelectRequest = () => {
        ipcRenderer.send('selectFile', { extensions: ['mxliff'], path: file.path });
    };

    const findMatchingMxliff = () => {
        ipcRenderer.send('findMatchingMxliff', { path: file.path, name: file.name, extension: file.extension });
    };

    const toMxliff = () => {
        if (isProcessing || !ipcRenderer) return;
        if (downloadLink) {
            ipcRenderer.send('openDownloadLink', { downloadLink, file: pathToFileItem(matchingMxliff) });
        } else {
            const jobData = {
                path: file.path,
                name: file.name,
                extension: file.extension,
                mxliffData: pathToFileItem(matchingMxliff),
            };
            setIsProcessing(true);
            ipcRenderer.send('convertDocxToMxliff', jobData);
        }
    };

    useEffect(() => {
        ipcRenderer.on('translateSingleDoc', (event, data) => {
            if (!data.path || data.path !== file.path) return;
            setIsProcessing(false);
            try {
                new URL(data.downloadLink);
                setDownloadLink(data.downloadLink);
            } catch (e) {
                console.log('Received invalid URL from main process: ' + data);
                console.error(e);
            }
        });
        ipcRenderer.on('docxToMxliff', (event, data) => {
            if (!data.path || data.path !== file.path) return;
            setIsProcessing(false);
            try {
                new URL(data.downloadLink);
                setDownloadLink(data.downloadLink);
            } catch (e) {
                console.log('Received invalid URL from main process: ' + data);
                console.error(e);
            }
        });
        ipcRenderer.on('selectFile', (event, data) => {
            console.log(data);
            if (!data.path || data.path !== file.path) return;
            data.filePaths && data.filePaths.length > 0 && setMatchingMxliff(data.filePaths[0]);
        });
        ipcRenderer.on('matchingMxliffFound', (event, data) => {
            if (!data.path || data.path !== file.path) return;
            if (!matchingMxliff && data.mxliffPath) setMatchingMxliff(data.mxliffPath);
        });
    }, []);

    useEffect(() => {
        setDownloadLink(null);
        if (actionTabs[selectedTab] === 'To mxliff') {
            findMatchingMxliff();
        }
    }, [actionTabs[selectedTab]]);

    return (
        <>
            <ActionTabs tabs={actionTabs} selectedIndex={selectedTab} changeHandler={setSelectedTab} />
            {actionTabs[selectedTab] === 'Translate' && (
                <div className="flex h-full w-full flex-col justify-end">
                    <div className="mt-10 flex w-full items-center justify-between">
                        <LanguageSelect
                            label="Source"
                            value={fromLang}
                            options={['auto', 'no', 'da', 'sv', 'pl', 'en']}
                            onChange={(value) => setFromLang(value)}
                        />
                        <RightArrowIcon className="text-zinc-600" />
                        <LanguageSelect
                            label="Target"
                            value={toLang}
                            options={['no', 'da', 'sv', 'pl', 'en']}
                            onChange={(value) => setToLang(value)}
                        />
                    </div>
                    <ActionButton
                        className="my-4"
                        onClick={initiateTranslation}
                        isProcessing={isProcessing}
                        downloadLink={downloadLink}
                    />
                </div>
            )}
            {actionTabs[selectedTab] === 'To mxliff' && (
                <div className="flex h-full w-full flex-col justify-end">
                    {matchingMxliff ? (
                        <span className="text-amber-50">Match: {matchingMxliff}</span>
                    ) : (
                        <button onClick={sendMxliffSelectRequest}>Select mxliff</button>
                    )}
                    <ActionButton
                        className="my-4"
                        onClick={toMxliff}
                        isProcessing={isProcessing}
                        downloadLink={downloadLink}
                        disabled={!matchingMxliff}
                    />
                </div>
            )}
        </>
    );
};

export default DocxTileContent;
