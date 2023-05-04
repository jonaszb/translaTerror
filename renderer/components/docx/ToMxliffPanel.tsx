import { useSingleFileContext } from '../../store/SingleFileContext';
import { ActionButton } from '../Buttons';
import { ipcRenderer } from 'electron';
import Checklist from '../Checklist';
import { useEffect, useMemo } from 'react';
import { useDocxContext } from '../../store/DocxContext';
import { pathToFileItem } from '../../utils/utils';
import FileInfo from '../FileInfoField';
import SectionLabel from '../typography/SectionLabel';

const ToMxliffPanel = () => {
    const { file } = useSingleFileContext();
    const { isProcessing, downloadLink, setIsProcessing, docxData, matchingMxliff, setMatchingMxliff } =
        useDocxContext();

    const mxliffData = useMemo(() => {
        if (!matchingMxliff) return null;
        return pathToFileItem(matchingMxliff);
    }, [matchingMxliff]);

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

    const sendMxliffSelectRequest = () => {
        ipcRenderer.send('selectFile', { extensions: ['mxliff'], path: file.path, eventId: file.path });
    };

    const conditions = useMemo(
        () => [
            { isMet: docxData?.tables === 1, title: 'Single table', mandatory: true },
            { isMet: docxData?.columns === 5, title: '5 columns', mandatory: true },
            { isMet: docxData?.sourceLength < 500000, title: '< 500 000 chars', mandatory: false },
        ],
        [docxData]
    );

    const allConditionsMet = useMemo(() => conditions.every((c) => c.isMet || !c.mandatory), [conditions]);
    const charCount = useMemo(
        () => (allConditionsMet ? docxData.sourceLength.toLocaleString().replace(/,/g, ' ') : 'N/A'),
        [allConditionsMet]
    );

    useEffect(() => {
        findMatchingMxliff();
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
        return () => {
            ipcRenderer.removeAllListeners('selectFile');
            ipcRenderer.removeAllListeners('matchingMxliffFound');
        };
    }, []);

    return (
        <>
            <Checklist className="mb-4" conditions={conditions} />
            <div className="mb-4">
                <SectionLabel>Target file</SectionLabel>
                <button
                    onClick={sendMxliffSelectRequest}
                    className={`mt-0.5 box-content w-fit max-w-[274px] overflow-hidden text-ellipsis whitespace-nowrap rounded border border-opacity-30 bg-opacity-20 px-4 py-1.5 text-amber-50 shadow ${
                        matchingMxliff
                            ? 'border-green-300 bg-green-500 text-green-300'
                            : 'border-red-300 bg-red-500 text-red-300'
                    }`}
                >
                    {matchingMxliff ? `${mxliffData.name}.${mxliffData.extension}` : 'Click to select'}
                </button>
            </div>
            <div className="flex items-end justify-between">
                <div className="flex gap-4">
                    <FileInfo label="Character count" value={charCount} />
                </div>
                <ActionButton
                    onClick={toMxliff}
                    isProcessing={isProcessing}
                    downloadLink={downloadLink}
                    disabled={!allConditionsMet}
                />
            </div>
        </>
    );
};

export default ToMxliffPanel;
