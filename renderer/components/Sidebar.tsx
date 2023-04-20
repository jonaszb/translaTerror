import { BinIcon, LogoRound, PlusIcon } from '../components/icons';
import { useMenuContext } from '../store/MenuContext';
import electron from 'electron';
import { FC } from 'react';

const ipcRenderer = electron.ipcRenderer || false;

const MenuButton: FC<React.ComponentProps<'button'> & { danger?: boolean }> = (props) => {
    const { children, danger, className, ...restProps } = props;
    return (
        <button
            className={`rounded-full bg-zinc-600 p-4 shadow-sm ${
                danger ? 'hover:text-red-400' : 'hover:text-amber-200'
            }`}
            {...restProps}
        >
            {children}
        </button>
    );
};

export const Sidebar = () => {
    const { files, setFiles } = useMenuContext();
    const clearFiles = () => {
        setFiles([]);
    };

    return (
        <section
            className={`flex w-20 flex-col items-center bg-gradient-to-b from-zinc-700 to-zinc-800 transition-all ease-out ${
                files.length > 0 ? 'translate-x-0 border-r-2 border-zinc-600' : ' -translate-x-20'
            }`}
        >
            {files && (
                <>
                    <LogoRound className="my-6 h-14 w-14" />
                    <div className="flex flex-col items-center gap-4 text-amber-50">
                        <MenuButton danger={true} onClick={clearFiles} name="Remove all">
                            <BinIcon />
                        </MenuButton>
                        <MenuButton
                            onClick={() => {
                                if (ipcRenderer) ipcRenderer.send('addFiles');
                            }}
                            name="Add files"
                        >
                            <PlusIcon />
                        </MenuButton>
                    </div>
                </>
            )}
        </section>
    );
};
