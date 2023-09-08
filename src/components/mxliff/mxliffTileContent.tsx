import { useEffect, useState, useCallback } from 'react';
import { useSingleFileContext } from '../../store/SingleFileContext';
import ActionTabs from '../ActionTabs';
import { ActionButton } from '../Buttons';
import { ipcRenderer } from 'electron';
import { useMxliffContext } from '../../store/MxliffContext';
import SectionLabel from '../typography/SectionLabel';
import { EventDataWithLink } from '../../../types';
import { useToastContext } from '../../store/ToastContext';

const actionTabs = ['To docx'];
const MxliffTileContent = () => {
    const { file } = useSingleFileContext();
    const { isProcessing, downloadLink, setIsProcessing, setDownloadLink } = useMxliffContext();
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
            setLinkAndToast(data, 'Docx convertion');
        });
    }, []);

    return (
        <>
            <ActionTabs tabs={actionTabs} selectedIndex={selectedTab} changeHandler={setSelectedTab} />
            {actionTabs[selectedTab] === 'To docx' && (
                <div className="flex h-full w-full flex-col justify-end">
                    <SectionLabel>Output file</SectionLabel>
                    <span className="pointer-events-none mb-4 box-content w-fit max-w-[274px] overflow-hidden text-ellipsis whitespace-nowrap rounded border border-zinc-200 border-opacity-30 bg-zinc-700 bg-opacity-50 px-4 py-1.5 text-zinc-400 shadow">
                        {file.name}_TAB.docx
                    </span>
                    <div className="flex justify-end">
                        <ActionButton
                            onClick={convertToDocx}
                            isProcessing={isProcessing}
                            {...(!!downloadLink && { downloadLink })}
                        />
                    </div>
                </div>
            )}
        </>
    );
};

export default MxliffTileContent;
