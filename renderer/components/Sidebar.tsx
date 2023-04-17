import { RoundButton } from './Buttons';
import { ClearIcon, Logo, PlusIcon } from '../components/icons';
import { useMenuContext } from '../store/MenuContext';
import electron from 'electron';

const ipcRenderer = electron.ipcRenderer || false;

export const Sidebar = () => {
    const { files, setFiles } = useMenuContext();
    const clearFiles = () => {
        setFiles([]);
    };

    return (
        <section
            className={`w-20 bg-gradient-to-b from-zinc-700 to-zinc-800 transition-all ease-out ${
                files.length > 0 ? 'translate-x-0 border-r-2 border-amber-200' : ' -translate-x-20'
            }`}
        >
            {files && (
                <>
                    <div className="relative mb-5 flex h-20 w-full border-r-2 border-amber-200 bg-amber-200 p-4">
                        <Logo className="absolute bottom-0 left-2 h-16 w-16 stroke-zinc-800" />
                    </div>
                    <ul className="flex flex-col items-center gap-4">
                        <RoundButton
                            Icon={ClearIcon}
                            onClick={clearFiles}
                            tooltipId="clear-files"
                            tooltip="Deselect all files"
                            danger={true}
                        />
                        <RoundButton
                            Icon={PlusIcon}
                            tooltipId="add-files"
                            tooltip="Add more files"
                            onClick={async () => {
                                if (ipcRenderer) {
                                    ipcRenderer.send('addFiles');
                                }
                            }}
                        />
                    </ul>
                </>
            )}
        </section>
    );
};
