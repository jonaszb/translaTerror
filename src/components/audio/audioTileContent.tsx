import { ipcRenderer } from 'electron';
import { useSingleFileContext } from '../../store/SingleFileContext';
import { useEffect, useState, useCallback } from 'react';
import ActionTabs from '../ActionTabs';
import TranscribePanel from './TranscribePanel';
import { useToastContext } from '../../store/ToastContext';
import { EventDataWithFiles, EventDataWithLink } from '../../../types';
import { useAudioContext } from '@/store/AudioContext';

const actionTabs = ['Transcribe'];

const AudioTileContent = () => {
    const { file } = useSingleFileContext();
    const { setIsProcessing, setDownloadLink, setDuration, setIsEvaluatingConditions, evaluateConditions } =
        useAudioContext();
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
        ipcRenderer.on('checkAudioDuration', (event, { eventId, duration }) => {
            console.log(duration);
            if (!eventId || eventId !== file.path) return;
            setIsEvaluatingConditions(false);
            if (duration) {
                setDuration(duration);
                console.log('Received data: ' + JSON.stringify(duration));
            }
        });

        ipcRenderer.on('transcribe', (event, data) => {
            if (!data.eventId || data.eventId !== file.path) return;
            setLinkAndToast(data, 'Transcription');
        });

        return () => {
            ipcRenderer.removeAllListeners('transcribeAudio');
        };
    }, []);

    useEffect(() => {
        setDownloadLink(null);
    }, [actionTabs[selectedTab]]);

    return (
        <>
            <ActionTabs tabs={actionTabs} selectedIndex={selectedTab} changeHandler={setSelectedTab} />
            {actionTabs[selectedTab] === 'Transcribe' && (
                <div className="flex h-full w-full flex-col justify-between">
                    <TranscribePanel />
                </div>
            )}
        </>
    );
};

const isEventWithLink = (data: EventDataWithLink | EventDataWithFiles): data is EventDataWithLink => {
    return data.hasOwnProperty('downloadData');
};

export default AudioTileContent;
