import { ActionButton } from '../Buttons';
import { RightArrowIcon } from '../icons';
import { LanguageSelect } from '../LanguageSelect';
import { ipcRenderer } from 'electron';
import { useSingleFileContext } from '../../store/SingleFileContext';
import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import ActionTabs from '../ActionTabs';
import { pathToFileItem } from '../../utils/utils';
import { Selectable } from '../Selectable';

const actionTabs = ['Translate', 'To mxliff', 'Fragment'];

const DocxTileContent = () => {
    const {
        file,
        isProcessing,
        downloadLink,
        fromLang,
        toLang,
        shouldTranslate,
        setShouldTranslate,
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

    const fragmentDocx = () => {
        if (isProcessing || !ipcRenderer) return;
        if (downloadLink) {
            ipcRenderer.send('openDownloadLink', { downloadLink, file, suffix: '_TAB' });
        } else {
            const jobData = {
                path: file.path,
                name: file.name,
                eventId: file.path,
                fromLang: shouldTranslate ? fromLang : null,
                toLang: shouldTranslate ? toLang : null,
            };
            setIsProcessing(true);
            ipcRenderer.send('fragmentDocx', jobData);
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

        ipcRenderer.on('fragmentDocx', (event, data) => {
            if (!data.eventId || data.eventId !== file.path) return;
            setIsProcessing(false);
            try {
                console.log('Received download link: ' + data.downloadLink);
                console.log('Frag data: ' + JSON.stringify(data.fragData));
                new URL(data.downloadLink);
                setDownloadLink(data.downloadLink);
            } catch (e) {
                console.log('Received invalid URL from main process: ' + JSON.stringify(data));
                console.error(e);
            }
        });
    }, []);

    const LangSelect: FC<{ disabled?: boolean }> = useCallback(
        ({ disabled }) => {
            return (
                <div
                    className={`flex w-full items-center justify-between ${
                        disabled ? 'pointer-events-none opacity-30' : ''
                    }`}
                >
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
            );
        },
        [fromLang, toLang]
    );

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
                    <LangSelect />
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
                        className={`mt-2 w-fit max-w-[254px] overflow-hidden text-ellipsis whitespace-nowrap rounded border border-opacity-20 bg-opacity-20 px-4 py-1 text-amber-50 shadow ${
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
            {actionTabs[selectedTab] === 'Fragment' && (
                <div className="flex h-full w-full flex-col justify-end">
                    <Selectable
                        id={`${file.name}.translate`}
                        onChange={() => setShouldTranslate(!shouldTranslate)}
                        checked={shouldTranslate}
                        small={true}
                        labelText="Include translation"
                        className="mb-2"
                    />
                    <LangSelect disabled={!shouldTranslate} />
                    <ActionButton
                        className="my-4"
                        onClick={fragmentDocx}
                        isProcessing={isProcessing}
                        downloadLink={downloadLink}
                    />
                </div>
            )}
        </>
    );
};

export default DocxTileContent;
