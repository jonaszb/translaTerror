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
                extension: file.extension,
            };
            setIsProcessing(true);
            ipcRenderer.send('convertMxliffToDocx', jobData);
        }
    };

    useEffect(() => {
        ipcRenderer.on('mxliffToDocx', (event, data) => {
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
    }, []);

    return (
        <>
            <ActionTabs tabs={actionTabs} selectedIndex={selectedTab} changeHandler={setSelectedTab} />
            {actionTabs[selectedTab] === 'To docx' && (
                <div className="flex h-full w-full flex-col justify-end">
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
