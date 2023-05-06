import { ipcRenderer } from 'electron';
import { useSingleFileContext } from '../../store/SingleFileContext';
import { useEffect, useState } from 'react';
import ActionTabs from '../ActionTabs';
import TranslatePanel from './TranslatePanel';
import { useDocxContext } from '../../store/DocxContext';
import ToMxliffPanel from './ToMxliffPanel';
import FragmentPanel from './FragmentPanel';

const actionTabs = ['Translate', 'To mxliff', 'Fragment'];

const DocxTileContent = () => {
    const { file } = useSingleFileContext();
    const { isProcessing, setIsProcessing, setDownloadLink, setDocxData, setFragData } = useDocxContext();
    const [selectedTab, setSelectedTab] = useState(0);

    const checkData = () => {
        if (isProcessing || !ipcRenderer) return;
        const jobData = {
            path: file.path,
            eventId: file.path,
        };
        ipcRenderer.send('checkDocxData', jobData);
    };

    useEffect(() => {
        checkData();
        ipcRenderer.on('checkDocxData', (event, { eventId, data }) => {
            if (!eventId || eventId !== file.path) return;
            if (data) {
                setDocxData(data);
                console.log('Received data: ' + JSON.stringify(data));
            }
        });

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

        ipcRenderer.on('fragmentDocx', (event, data) => {
            if (!data.eventId || data.eventId !== file.path) return;
            setIsProcessing(false);
            try {
                new URL(data.downloadLink);
                setDownloadLink(data.downloadLink);
                setFragData(data.fragData);
            } catch (e) {
                console.log('Received invalid URL from main process: ' + JSON.stringify(data));
                console.error(e);
            }
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
