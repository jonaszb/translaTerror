import React, { PropsWithChildren } from 'react';
import { FileItem } from '../types';

export type SingleFileContextProps = {
    isProcessing: boolean;
    setIsProcessing: React.Dispatch<React.SetStateAction<boolean>>;
    downloadLink: string | null;
    setDownloadLink: React.Dispatch<React.SetStateAction<string | null>>;
    fromLang: string;
    setFromLang: React.Dispatch<React.SetStateAction<string>>;
    toLang: string;
    setToLang: React.Dispatch<React.SetStateAction<string>>;
    file: FileItem;
};

export const SingleFileContext = React.createContext<SingleFileContextProps>({
    isProcessing: false,
    setIsProcessing: () => null,
    downloadLink: null,
    setDownloadLink: () => null,
    fromLang: 'auto',
    setFromLang: () => null,
    toLang: 'pl',
    setToLang: () => null,
    file: null,
});

const SingleFileContextProvider: React.FC<PropsWithChildren<{ file: FileItem }>> = (props) => {
    const [isProcessing, setIsProcessing] = React.useState(false);
    const [downloadLink, setDownloadLink] = React.useState<string | null>(null);
    const [fromLang, setFromLang] = React.useState('auto');
    const [toLang, setToLang] = React.useState('pl');

    const contextValue = {
        isProcessing,
        setIsProcessing,
        downloadLink,
        setDownloadLink,
        fromLang,
        setFromLang,
        toLang,
        setToLang,
    };

    React.useEffect(() => {
        if (toLang) {
            setIsProcessing(false);
            setDownloadLink(null);
        }
    }, [toLang]);

    return (
        <SingleFileContext.Provider value={{ ...contextValue, file: props.file }}>
            {props.children}
        </SingleFileContext.Provider>
    );
};

export function useSingleFileContext() {
    const context = React.useContext(SingleFileContext);

    if (!context) {
        throw new Error('You need to wrap Provider.');
    }

    return context;
}

export default SingleFileContextProvider;
