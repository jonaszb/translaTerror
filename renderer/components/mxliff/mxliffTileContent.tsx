import { useEffect, useState } from 'react';
import { useSingleFileContext } from '../../store/SingleFileContext';
import ActionTabs from '../ActionTabs';
import { ActionButton } from '../Buttons';
import { ipcRenderer } from 'electron';

const actionTabs = ['To docx'];
const MxliffTileContent = () => {
    const { file, isProcessing, downloadLink, setIsProcessing, setDownloadLink } = useSingleFileContext();
    const [selectedTab, setSelectedTab] = useState(0);

    const convertToDocx = () => {
        if (isProcessing || !ipcRenderer) return;
        if (downloadLink) {
            ipcRenderer.send('openDownloadLink', {
                downloadLink,
                file: { ...file, extension: 'docx' },
                suffix: '_TAB',
            });
        } else {
            const jobData = {
                path: file.path,
                name: file.name,
                eventId: file.path,
            };
            setIsProcessing(true);
            ipcRenderer.send('convertMxliffToDocx', jobData);
        }
    };

    useEffect(() => {
        ipcRenderer.on('mxliffToDocx', (event, data) => {
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
    }, []);

    return (
        <>
            <ActionTabs tabs={actionTabs} selectedIndex={selectedTab} changeHandler={setSelectedTab} />
            {actionTabs[selectedTab] === 'To docx' && (
                <div className="flex h-full w-full flex-col justify-end">
                    <span className="font-regular block text-sm text-zinc-600">
                        <b className="mr-2 text-zinc-500">Output file</b>
                    </span>
                    <span className="pointer-events-none mt-2 w-fit max-w-[254px] overflow-hidden text-ellipsis whitespace-nowrap rounded border border-zinc-400 border-opacity-50 bg-zinc-700 bg-opacity-50 py-1 px-4 text-zinc-400 shadow">
                        {file.name}_TAB.docx
                    </span>
                    <ActionButton
                        className="my-4"
                        onClick={convertToDocx}
                        isProcessing={isProcessing}
                        downloadLink={downloadLink}
                    />
                </div>
            )}
        </>
    );
};

export default MxliffTileContent;
