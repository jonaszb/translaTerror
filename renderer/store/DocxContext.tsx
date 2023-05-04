import React, { PropsWithChildren, useState } from 'react';
import { DocxData } from '../types';

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
    docxData: DocxData;
    setDocxData: React.Dispatch<React.SetStateAction<DocxData>>;
    matchingMxliff: string | null;
    setMatchingMxliff: React.Dispatch<React.SetStateAction<string | null>>;
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
});

const DocxContextProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [downloadLink, setDownloadLink] = useState<string | null>(null);
    const [fromLang, setFromLang] = useState('auto');
    const [toLang, setToLang] = useState('pl');
    const [shouldTranslate, setShouldTranslate] = useState(false);
    const [docxData, setDocxData] = useState<DocxData>(null);
    const [matchingMxliff, setMatchingMxliff] = useState<string | null>(null);

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
