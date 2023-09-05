import React, { PropsWithChildren } from 'react';
import { FileItem } from '../../types';

export type FilesContextProps = {
    files: FileItem[] | null;
    setFiles: React.Dispatch<React.SetStateAction<FileItem[]>>;
    filesByExtension: Record<string, FileItem[]> | undefined;
};

export const FilesContext = React.createContext<FilesContextProps>({
    files: null,
    setFiles: () => null,
    filesByExtension: undefined,
});

const FilesContextProvider: React.FC<PropsWithChildren<{ value?: FilesContextProps }>> = (props) => {
    const [files, setFiles] = React.useState<FileItem[]>([]);

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
        filesByExtension,
    };

    return <FilesContext.Provider value={props.value ?? contextValue}>{props.children}</FilesContext.Provider>;
};

export function useFilesContext() {
    const context = React.useContext(FilesContext);

    if (!context) {
        throw new Error('You need to wrap Provider.');
    }

    return context;
}

export default FilesContextProvider;
