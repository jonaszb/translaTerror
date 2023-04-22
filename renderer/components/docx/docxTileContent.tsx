import { ActionButton } from '../Buttons';
import { RightArrowIcon } from '../icons';
import { LanguageSelect } from '../LanguageSelect';
import { ipcRenderer } from 'electron';
import { useSingleFileContext } from '../../store/SingleFileContext';
import { useEffect, useMemo, useState } from 'react';
import ActionTabs from '../ActionTabs';
import type { FileItem } from '../../types';
import { pathToFileItem } from '../../utils/utils';

const actionTabs = ['Translate', 'To mxliff'];

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
    const mxliffData = useMemo(() => {
        if (!matchingMxliff) return null;
        return pathToFileItem(matchingMxliff);
    }, [matchingMxliff]);

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
                eventId: file.path,
            };
            setIsProcessing(true);
            ipcRenderer.send('translateSingleDoc', jobData);
        }
    };

    const sendMxliffSelectRequest = () => {
        ipcRenderer.send('selectFile', { extensions: ['mxliff'], path: file.path, eventId: file.path });
    };

    const findMatchingMxliff = () => {
        ipcRenderer.send('findMatchingMxliff', {
            path: file.path,
            name: file.name,
            extension: file.extension,
            eventId: file.path,
        });
    };

    const toMxliff = () => {
        if (isProcessing || !ipcRenderer) return;
        if (downloadLink) {
            ipcRenderer.send('openDownloadLink', { downloadLink, file: mxliffData });
        } else {
            const jobData = {
                path: file.path,
                name: file.name,
                extension: file.extension,
                mxliffData,
                eventId: file.path,
            };
            setIsProcessing(true);
            ipcRenderer.send('convertDocxToMxliff', jobData);
        }
    };

    useEffect(() => {
        findMatchingMxliff();
        ipcRenderer.on('translateSingleDoc', (event, data) => {
            if (!data.eventId || data.eventId !== file.path) return;
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
            if (!data.eventId || data.eventId !== file.path) return;
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
            if (!data.eventId || data.eventId !== file.path) return;
            data.filePaths && data.filePaths.length > 0 && setMatchingMxliff(data.filePaths[0]);
        });
        ipcRenderer.on('matchingMxliffFound', (event, data) => {
            if (!data.eventId || data.eventId !== file.path) return;
            if (!matchingMxliff && data.mxliffPath) {
                setMatchingMxliff(data.mxliffPath);
            }
        });
    }, []);

    useEffect(() => {
        setDownloadLink(null);
        if (actionTabs[selectedTab] === 'To mxliff' && !matchingMxliff) {
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
                    <span className="font-regular block text-sm text-zinc-600">
                        <b className="mr-2 text-zinc-500">Target file</b>will be overwritten
                    </span>
                    <button
                        onClick={sendMxliffSelectRequest}
                        className={`mt-2 w-fit max-w-[254px] overflow-hidden text-ellipsis whitespace-nowrap rounded border border-opacity-20 bg-opacity-20 py-1 px-4 text-amber-50 shadow ${
                            matchingMxliff
                                ? 'border-green-300 bg-green-500 text-green-300'
                                : 'border-red-300 bg-red-500 text-red-300'
                        }`}
                    >
                        {matchingMxliff ? `${mxliffData.name}.${mxliffData.extension}` : 'Click to select'}
                    </button>

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
