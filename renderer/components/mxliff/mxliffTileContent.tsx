import { useEffect, useState } from 'react';
import { useSingleFileContext } from '../../store/SingleFileContext';
import ActionTabs from '../ActionTabs';
import { ActionButton } from '../Buttons';
import { ipcRenderer } from 'electron';
import { useMxliffContext } from '../../store/MxliffContext';
import SectionLabel from '../typography/SectionLabel';

const actionTabs = ['To docx'];
const MxliffTileContent = () => {
    const { file } = useSingleFileContext();
    const { isProcessing, downloadLink, setIsProcessing, setDownloadLink } = useMxliffContext();
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
                    <SectionLabel>Output file</SectionLabel>
                    <span className="pointer-events-none mb-4 box-content w-fit max-w-[274px] overflow-hidden text-ellipsis whitespace-nowrap rounded border border-opacity-30 bg-zinc-700 bg-opacity-50 px-4 py-1.5 text-zinc-400 shadow">
                        {file.name}_TAB.docx
                    </span>
                    <div className="flex justify-end">
                        <ActionButton onClick={convertToDocx} isProcessing={isProcessing} downloadLink={downloadLink} />
                    </div>
                </div>
            )}
        </>
    );
};

export default MxliffTileContent;
