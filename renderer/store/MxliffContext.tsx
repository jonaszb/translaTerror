import React, { PropsWithChildren } from 'react';

export type MxliffContextProps = {
    isProcessing: boolean;
    setIsProcessing: React.Dispatch<React.SetStateAction<boolean>>;
    downloadLink: string | null;
    setDownloadLink: React.Dispatch<React.SetStateAction<string | null>>;
};

export const MxliffContext = React.createContext<MxliffContextProps>({
    isProcessing: false,
    setIsProcessing: () => null,
    downloadLink: null,
    setDownloadLink: () => null,
});

const MxliffContextProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const [isProcessing, setIsProcessing] = React.useState(false);
    const [downloadLink, setDownloadLink] = React.useState<string | null>(null);

    const contextValue = {
        isProcessing,
        setIsProcessing,
        downloadLink,
        setDownloadLink,
    };

    return <MxliffContext.Provider value={{ ...contextValue }}>{children}</MxliffContext.Provider>;
};

export function useMxliffContext() {
    const context = React.useContext(MxliffContext);

    if (!context) {
        throw new Error('You need to wrap Provider.');
    }

    return context;
}

export default MxliffContextProvider;
