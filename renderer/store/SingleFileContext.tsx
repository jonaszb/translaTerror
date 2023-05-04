import React, { PropsWithChildren } from 'react';
import { FileItem } from '../types';

export type SingleFileContextProps = {
    file: FileItem;
};

export const SingleFileContext = React.createContext<SingleFileContextProps>({
    file: null,
});

const SingleFileContextProvider: React.FC<PropsWithChildren<{ file: FileItem }>> = ({ file, children }) => {
    return <SingleFileContext.Provider value={{ file }}>{children}</SingleFileContext.Provider>;
};

export function useSingleFileContext() {
    const context = React.useContext(SingleFileContext);

    if (!context) {
        throw new Error('You need to wrap Provider.');
    }

    return context;
}

export default SingleFileContextProvider;
