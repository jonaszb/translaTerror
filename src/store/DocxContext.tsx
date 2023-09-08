import React, { PropsWithChildren, useState, useCallback } from 'react';
import { DocxData } from '../../types';
import { ipcRenderer } from 'electron';
import { useSingleFileContext } from './SingleFileContext';

export type DocxContextProps = {
    isProcessing: boolean;
    setIsProcessing: React.Dispatch<React.SetStateAction<boolean>>;
    downloadLink: string | null;
    setDownloadLink: React.Dispatch<React.SetStateAction<string | null>>;
    fromLang: string;
    setFromLang: React.Dispatch<React.SetStateAction<string>>;
    toLang: string;
    setToLang: React.Dispatch<React.SetStateAction<string>>;
    shouldTranslate: boolean;
    setShouldTranslate: React.Dispatch<React.SetStateAction<boolean>>;
    docxData: DocxData | null;
    setDocxData: React.Dispatch<React.SetStateAction<DocxData | null>>;
    matchingMxliff: string | null;
    setMatchingMxliff: React.Dispatch<React.SetStateAction<string | null>>;
    fragData: FragData | null;
    setFragData: React.Dispatch<React.SetStateAction<FragData | null>>;
    isEvaluatingConditions: boolean;
    setIsEvaluatingConditions: React.Dispatch<React.SetStateAction<boolean>>;
    evaluateConditions: () => Promise<void>;
};

export const DocxContext = React.createContext<DocxContextProps>({
    isProcessing: false,
    setIsProcessing: () => null,
    downloadLink: null,
    setDownloadLink: () => null,
    fromLang: 'auto',
    setFromLang: () => null,
    toLang: 'pl',
    setToLang: () => null,
    shouldTranslate: false,
    setShouldTranslate: () => null,
    docxData: null,
    setDocxData: () => null,
    matchingMxliff: null,
    setMatchingMxliff: () => null,
    fragData: null,
    setFragData: () => null,
    isEvaluatingConditions: false,
    setIsEvaluatingConditions: () => null,
    evaluateConditions: async () => void 0,
});

const DocxContextProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const { file } = useSingleFileContext();
    const [isProcessing, setIsProcessing] = useState(false);
    const [downloadLink, setDownloadLink] = useState<string | null>(null);
    const [fromLang, setFromLang] = useState('auto');
    const [toLang, setToLang] = useState('pl');
    const [shouldTranslate, setShouldTranslate] = useState(false);
    const [docxData, setDocxData] = useState<DocxData | null>(null);
    const [matchingMxliff, setMatchingMxliff] = useState<string | null>(null);
    const [fragData, setFragData] = useState<FragData | null>(null);
    const [isEvaluatingConditions, setIsEvaluatingConditions] = useState(false);

    const evaluateConditions = useCallback(async () => {
        if (isProcessing || !ipcRenderer) return;
        setIsEvaluatingConditions(true);
        const jobData = {
            path: file?.path,
            eventId: file?.path,
        };
        ipcRenderer.send('checkDocxData', jobData);
    }, []);

    const contextValue = {
        isProcessing,
        setIsProcessing,
        downloadLink,
        setDownloadLink,
        fromLang,
        setFromLang,
        toLang,
        setToLang,
        shouldTranslate,
        setShouldTranslate,
        docxData,
        setDocxData,
        matchingMxliff,
        setMatchingMxliff,
        fragData,
        setFragData,
        isEvaluatingConditions,
        setIsEvaluatingConditions,
        evaluateConditions,
    };

    React.useEffect(() => {
        if (toLang) {
            setIsProcessing(false);
            setDownloadLink(null);
        }
    }, [toLang]);

    return <DocxContext.Provider value={{ ...contextValue }}>{children}</DocxContext.Provider>;
};

export function useDocxContext() {
    const context = React.useContext(DocxContext);

    if (!context) {
        throw new Error('You need to wrap Provider.');
    }

    return context;
}

export default DocxContextProvider;

type FragData = Record<'redundancy' | 'redundancyRatio' | 'totalLength', number>;
