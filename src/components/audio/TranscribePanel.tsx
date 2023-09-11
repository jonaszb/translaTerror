import { useSingleFileContext } from '../../store/SingleFileContext';
import { ActionButton } from '../Buttons';
import { ipcRenderer } from 'electron';
import { useAudioContext } from '@/store/AudioContext';
import FileInfo from '../FileInfoField';
import { useMemo } from 'react';
import Checklist from '../Checklist';
import { formatTime } from '../../utils/utils';

const TranscribePanel = () => {
    const { file } = useSingleFileContext();
    const { isProcessing, downloadLink, setIsProcessing, duration } = useAudioContext();

    const initiateTranscription = () => {
        if (isProcessing || !ipcRenderer) return;
        if (downloadLink) {
            ipcRenderer.send('openDownloadLink', { downloadLink, file, suffix: '_TR' });
        } else {
            const jobData = {
                path: file.path,
                name: file.name,
                eventId: file.path,
            };
            setIsProcessing(true);
            ipcRenderer.send('transcribe', jobData);
        }
    };

    const estCost = useMemo(() => {
        if (duration === -1) return 'N/A';
        const costPerMinute = 0.006;
        const cost = (duration / 60) * costPerMinute;
        return cost.toFixed(2);
    }, [duration]);

    const durationToDisplay = useMemo(() => formatTime(duration), [duration]);
    const conditions = useMemo(
        () => [{ isMet: !!(duration <= 5400), title: 'under 90 min', mandatory: false }],
        [duration]
    );

    return (
        <>
            <Checklist className="mb-4" conditions={conditions} />
            <div className="flex items-end justify-between">
                <div className="flex gap-8">
                    <FileInfo label="Length" value={durationToDisplay} />
                    <FileInfo label="Estimated cost" value={estCost} currency={'$'} />
                </div>
                <ActionButton
                    onClick={initiateTranscription}
                    isProcessing={isProcessing}
                    {...(!!downloadLink && { downloadLink })}
                />
            </div>
        </>
    );
};

export default TranscribePanel;
