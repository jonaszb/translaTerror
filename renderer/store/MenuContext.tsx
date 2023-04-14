import React, { PropsWithChildren } from 'react';
import { FileItem } from '../types';

export type MenuContextProps = {
    files: FileItem[] | null;
    setFiles: React.Dispatch<React.SetStateAction<FileItem[] | null>>;
    multiMode: boolean;
    setMultiMode: React.Dispatch<React.SetStateAction<boolean>>;
    selectedFile: FileItem | null;
    setSelectedFile: React.Dispatch<React.SetStateAction<FileItem | null>>;
    isProcessing: boolean;
    setIsProcessing: React.Dispatch<React.SetStateAction<boolean>>;
    downloadLink: string | null;
    setDownloadLink: React.Dispatch<React.SetStateAction<string | null>>;
    filesByExtension?: Record<string, FileItem[]>;
    fromLang: string;
    setFromLang: React.Dispatch<React.SetStateAction<string>>;
    toLang: string;
    setToLang: React.Dispatch<React.SetStateAction<string>>;
};

export const MenuContext = React.createContext<MenuContextProps>({
    files: null,
    setFiles: () => null,
    multiMode: false,
    setMultiMode: () => null,
    selectedFile: null,
    setSelectedFile: () => null,
    isProcessing: false,
    setIsProcessing: () => null,
    downloadLink: null,
    setDownloadLink: () => null,
    fromLang: 'auto',
    setFromLang: () => null,
    toLang: 'pl',
    setToLang: () => null,
});

const MenuContextProvider: React.FC<PropsWithChildren<{ value?: MenuContextProps }>> = (props) => {
    const [files, setFiles] = React.useState<FileItem[] | null>(null);
    const [multiMode, setMultiMode] = React.useState(false);
    const [selectedFile, setSelectedFile] = React.useState<FileItem | null>(null);
    const [isProcessing, setIsProcessing] = React.useState(false);
    const [downloadLink, setDownloadLink] = React.useState<string | null>(null);
    const [fromLang, setFromLang] = React.useState('auto');
    const [toLang, setToLang] = React.useState('pl');

    const filesByExtension = React.useMemo(() => {
        if (files) {
            const filesByExtension: Record<string, FileItem[]> = {};
            for (const file of files) {
                const extension = file.extension;
                if (extension) {
                    filesByExtension[extension] = filesByExtension[extension] || [];
                    filesByExtension[extension].push(file);
                }
            }
            return filesByExtension;
        }
    }, [files]);

    React.useEffect(() => {
        if (files && !selectedFile) {
            setSelectedFile(files[0]);
        }
    }, [files]);

    React.useEffect(() => {
        setDownloadLink(null);
    }, [selectedFile]);

    const contextValue = {
        files,
        setFiles,
        multiMode,
        setMultiMode,
        selectedFile,
        setSelectedFile,
        isProcessing,
        setIsProcessing,
        downloadLink,
        setDownloadLink,
        filesByExtension,
        fromLang,
        setFromLang,
        toLang,
        setToLang,
    };

    return <MenuContext.Provider value={props.value ?? contextValue}>{props.children}</MenuContext.Provider>;
};

export function useMenuContext() {
    const context = React.useContext(MenuContext);

    if (!context) {
        throw new Error('You need to wrap Provider.');
    }

    return context;
}

export default MenuContextProvider;
