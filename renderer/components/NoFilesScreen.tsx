import { FC } from 'react';
import electron from 'electron';
import { Logo } from './icons';

const ipcRenderer = electron.ipcRenderer || false;

export const NoFilesScreen: FC = () => {
    return (
        <button className="group- group h-full w-full p-9" onClick={() => ipcRenderer && ipcRenderer.send('addFiles')}>
            <div className="relative z-10 block h-full w-full cursor-pointer rounded-lg border-2 border-dashed border-amber-200 text-5xl font-semibold text-amber-50">
                <span className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap font-light">
                    Select file(s)
                </span>
                <Logo className="absolute left-1/2 top-1/2 z-0 h-96 -translate-x-1/2 -translate-y-1/2" />
            </div>
        </button>
    );
};
