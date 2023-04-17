import React, { PropsWithChildren } from 'react';
import { FileItem } from '../types';

export type MenuContextProps = {
    files: FileItem[] | null;
    setFiles: React.Dispatch<React.SetStateAction<FileItem[] | null>>;
    multiMode: boolean;
    setMultiMode: React.Dispatch<React.SetStateAction<boolean>>;
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
    fromLang: 'auto',
    setFromLang: () => null,
    toLang: 'pl',
    setToLang: () => null,
});

const MenuContextProvider: React.FC<PropsWithChildren<{ value?: MenuContextProps }>> = (props) => {
    const [files, setFiles] = React.useState<FileItem[]>([]);
    const [multiMode, setMultiMode] = React.useState(false);
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

    const contextValue = {
        files,
        setFiles,
        multiMode,
        setMultiMode,
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
