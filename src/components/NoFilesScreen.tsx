import { FC } from 'react';
import { Logo } from '../icons/icons';
import { ipcRenderer } from 'electron';

const NoFilesScreen: FC = () => {
    return (
        <button
            className="group absolute top-0 left-0 h-screen w-screen p-9"
            onClick={() => ipcRenderer && ipcRenderer.send('addFiles')}
        >
            <div className="relative z-10 block h-full w-full cursor-pointer rounded-lg border-2 border-dashed border-amber-200 text-3xl font-semibold text-amber-50 sm:text-5xl">
                <span className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap font-light">
                    Select or drop file(s)
                </span>
                <Logo className="absolute left-1/2 top-1/2 z-0 h-80 -translate-x-1/2 -translate-y-1/2 stroke-amber-200 opacity-10" />
            </div>
        </button>
    );
};

export default NoFilesScreen;
