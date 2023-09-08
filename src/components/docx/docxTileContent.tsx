import { ipcRenderer } from 'electron';
import { useSingleFileContext } from '../../store/SingleFileContext';
import { useEffect, useState, useCallback } from 'react';
import ActionTabs from '../ActionTabs';
import TranslatePanel from './TranslatePanel';
import { useDocxContext } from '../../store/DocxContext';
import ToMxliffPanel from './ToMxliffPanel';
import FragmentPanel from './FragmentPanel';

import { useToastContext } from '../../store/ToastContext';
import { EventDataWithFiles, EventDataWithLink } from '../../../types';
import BookmarkPanel from './BookmarkPanel';

const actionTabs = ['Translate', 'To mxliff', 'Fragment', 'Bookmark'];

const DocxTileContent = () => {
    const { file } = useSingleFileContext();
    const {
        setIsProcessing,
        setDownloadLink,
        setDocxData,
        setFragData,
        setIsEvaluatingConditions,
        evaluateConditions,
    } = useDocxContext();
    const [selectedTab, setSelectedTab] = useState(0);
    const { showToast } = useToastContext();

    const setLinkAndToast = useCallback(
        (data: EventDataWithLink | EventDataWithFiles, actionName: string) => {
            setIsProcessing(false);
            const hasLink = isEventWithLink(data);
            try {
                if (data.status !== 200) throw new Error('Failed to process request');
                if (hasLink) {
                    new URL(data.downloadData.url);
                    setDownloadLink(data.downloadData.url);
                }
                const outputInfo = hasLink
                    ? { directory: data.downloadData.directory, fileName: data.downloadData.fileName }
                    : data.files.map((file) => ({ directory: file.path, fileName: file.name }));
                showToast({
                    title: `${actionName} complete`,
                    message: data.message ?? undefined,
                    outputInfo: outputInfo,
                    type: 'success',
                });
            } catch (e) {
                console.error(e);
                showToast({
                    title: `${actionName} failed`,
                    message:
                        data.message ??
                        `Something went wrong while processing this request.\nStatus code: ${data.status}`,
                    type: 'danger',
                });
            }
        },
        [setIsProcessing, setDownloadLink, showToast]
    );

    useEffect(() => {
        evaluateConditions();
        ipcRenderer.on('checkDocxData', (event, { eventId, data }) => {
            if (!eventId || eventId !== file.path) return;
            setIsEvaluatingConditions(false);
            if (data) {
                setDocxData(data);
                console.log('Received data: ' + JSON.stringify(data));
            }
        });

        ipcRenderer.on('translateSingleDoc', (event, data) => {
            if (!data.eventId || data.eventId !== file.path) return;
            setLinkAndToast(data, 'Translation');
        });

        ipcRenderer.on('docxToMxliff', (event, data) => {
            if (!data.eventId || data.eventId !== file.path) return;
            setLinkAndToast(data, 'Mxliff conversion');
        });

        ipcRenderer.on('fragmentDocx', (event, data) => {
            if (!data.eventId || data.eventId !== file.path) return;
            data.fragData && setFragData(data.fragData);
            setLinkAndToast(data, 'Fragmentation');
        });

        ipcRenderer.on('bookmarkAndFragmentDocx', (event, data) => {
            if (!data.eventId || data.eventId !== file.path) return;
            data.fragData && setFragData(data.fragData);
            setLinkAndToast(data, 'Fragmentation');
        });

        return () => {
            ipcRenderer.removeAllListeners('checkDocxData');
            ipcRenderer.removeAllListeners('translateSingleDoc');
            ipcRenderer.removeAllListeners('docxToMxliff');
            ipcRenderer.removeAllListeners('selectFile');
            ipcRenderer.removeAllListeners('matchingMxliffFound');
            ipcRenderer.removeAllListeners('fragmentDocx');
            ipcRenderer.removeAllListeners('bookmarkAndFragmentDocx');
        };
    }, []);

    useEffect(() => {
        setDownloadLink(null);
        setFragData(null);
    }, [actionTabs[selectedTab]]);

    return (
        <>
            <ActionTabs tabs={actionTabs} selectedIndex={selectedTab} changeHandler={setSelectedTab} />
            {actionTabs[selectedTab] === 'Translate' && (
                <div className="flex h-full w-full flex-col justify-between">
                    <TranslatePanel />
                </div>
            )}
            {actionTabs[selectedTab] === 'To mxliff' && (
                <div className="flex h-full w-full flex-col justify-between">
                    <ToMxliffPanel />
                </div>
            )}
            {actionTabs[selectedTab] === 'Fragment' && (
                <div className="flex h-full w-full flex-col justify-between">
                    {' '}
                    <FragmentPanel />
                </div>
            )}
            {actionTabs[selectedTab] === 'Bookmark' && (
                <div className="flex h-full w-full flex-col justify-between">
                    {' '}
                    <BookmarkPanel />
                </div>
            )}
        </>
    );
};

const isEventWithLink = (data: EventDataWithLink | EventDataWithFiles): data is EventDataWithLink => {
    return data.hasOwnProperty('downloadData');
};

export default DocxTileContent;
