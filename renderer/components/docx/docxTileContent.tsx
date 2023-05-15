import { ipcRenderer } from 'electron';
import { useSingleFileContext } from '../../store/SingleFileContext';
import { useEffect, useState, useCallback } from 'react';
import ActionTabs from '../ActionTabs';
import TranslatePanel from './TranslatePanel';
import { useDocxContext } from '../../store/DocxContext';
import ToMxliffPanel from './ToMxliffPanel';
import FragmentPanel from './FragmentPanel';
import { useToastContext } from '../../store/ToastContext';
import { EventDataWithLink } from '../../../types';

const actionTabs = ['Translate', 'To mxliff', 'Fragment'];

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
        (data: EventDataWithLink, actionName: string) => {
            setIsProcessing(false);
            try {
                new URL(data.downloadData.url);
                setDownloadLink(data.downloadData.url);
                showToast({
                    title: `${actionName} complete`,
                    outputInfo: { directory: data.downloadData.directory, fileName: data.downloadData.fileName },
                    type: 'success',
                });
            } catch (e) {
                console.error(e);
                showToast({
                    title: `${actionName} failed`,
                    message: `Something went wrong while processing this request.\nStatus code: ${data.status}`,
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

        return () => {
            ipcRenderer.removeAllListeners('checkDocxData');
            ipcRenderer.removeAllListeners('translateSingleDoc');
            ipcRenderer.removeAllListeners('docxToMxliff');
            ipcRenderer.removeAllListeners('selectFile');
            ipcRenderer.removeAllListeners('matchingMxliffFound');
            ipcRenderer.removeAllListeners('fragmentDocx');
        };
    }, []);

    useEffect(() => {
        setDownloadLink(null);
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
        </>
    );
};

export default DocxTileContent;
