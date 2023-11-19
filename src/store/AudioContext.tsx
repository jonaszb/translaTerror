import { ipcRenderer } from 'electron';
import React, { PropsWithChildren, useCallback } from 'react';
import { useSingleFileContext } from './SingleFileContext';

export type AudioContextProps = {
    isProcessing: boolean;
    setIsProcessing: React.Dispatch<React.SetStateAction<boolean>>;
    downloadLink: string | null;
    setDownloadLink: React.Dispatch<React.SetStateAction<string | null>>;
    duration: number;
    setDuration: React.Dispatch<React.SetStateAction<number>>;
    isEvaluatingConditions: boolean;
    setIsEvaluatingConditions: React.Dispatch<React.SetStateAction<boolean>>;
    evaluateConditions: () => Promise<void>;
};

export const AudioContext = React.createContext<AudioContextProps>({
    isProcessing: false,
    setIsProcessing: () => null,
    downloadLink: null,
    setDownloadLink: () => null,
    duration: -1,
    setDuration: () => null,
    isEvaluatingConditions: false,
    setIsEvaluatingConditions: () => null,
    evaluateConditions: async () => void 0,
});

const AudioContextProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const { file } = useSingleFileContext();
    const [isProcessing, setIsProcessing] = React.useState(false);
    const [downloadLink, setDownloadLink] = React.useState<string | null>(null);
    const [duration, setDuration] = React.useState<number>(-1);
    const [isEvaluatingConditions, setIsEvaluatingConditions] = React.useState(false);

    const evaluateConditions = useCallback(async () => {
        if (isProcessing || !ipcRenderer) return;
        setIsEvaluatingConditions(true);
        const jobData = {
            path: file?.path,
            eventId: file?.path,
        };
        ipcRenderer.send('checkAudioDuration', jobData);
    }, []);

    const contextValue = {
        isProcessing,
        setIsProcessing,
        downloadLink,
        setDownloadLink,
        duration,
        setDuration,
        isEvaluatingConditions,
        setIsEvaluatingConditions,
        evaluateConditions,
    };

    return <AudioContext.Provider value={{ ...contextValue }}>{children}</AudioContext.Provider>;
};

export function useAudioContext() {
    const context = React.useContext(AudioContext);

    if (!context) {
        throw new Error('You need to wrap Provider.');
    }

    return context;
}

export default AudioContextProvider;
