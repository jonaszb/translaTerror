import { RoundButton } from './Buttons';
import { ClearIcon, DocumentIcon, DocumentsIcon, Logo, PlusIcon } from '../components/icons';
import { useMenuContext } from '../store/MenuContext';
import { FC } from 'react';
import { FileItem } from '../types';
import { Tooltip } from 'react-tooltip';
import electron from 'electron';
import { Checkbox } from './Checkbox';

const ipcRenderer = electron.ipcRenderer || false;

const FileListItem: FC<{ file: FileItem; selected?: boolean; clickHandler: (file: FileItem) => void }> = (props) => {
    const { file } = props;
    return (
        <li
            key={file.name}
            onClick={() => props.clickHandler(file)}
            className="group flex cursor-pointer items-center gap-2 py-4"
        >
            <Checkbox id={file.name} checked={props.selected} />
            <span
                data-tooltip-id={`${file.name}-tooltip`}
                data-tooltip-content={file.name}
                data-tooltip-delay-show={1000}
                className="max-w-[14rem] cursor-pointer overflow-hidden text-ellipsis whitespace-nowrap text-lg font-bold text-amber-50"
            >
                {file.name.split('.')[0]}
            </span>
            <Tooltip id={`${file.name}-tooltip`} place="right" />
        </li>
    );
};

export const Sidebar = () => {
    const {
        files,
        multiMode,
        setMultiMode,
        setFiles,
        selectedFile,
        setSelectedFile,
        setIsProcessing,
        setDownloadLink,
        filesByExtension,
    } = useMenuContext();
    const clearFiles = () => {
        setFiles(null);
        setSelectedFile(null);
        setIsProcessing(false);
        setDownloadLink(null);
    };

    const handleFileClick = (file: FileItem) => {
        if (multiMode) {
            console.log('placeholder');
        } else {
            setSelectedFile(file);
        }
    };

    return (
        <section
            className={`bg-gradient-to-b from-zinc-600 to-zinc-700 ${
                files ? 'w-86 border-r-2 border-amber-200' : 'w-0'
            }`}
        >
            {files && (
                <>
                    <div className="flex w-full border-r-2 border-amber-200 bg-amber-200 p-4">
                        <Logo className="h-16" />
                    </div>
                    <ul className="my-4 mx-9 flex justify-between">
                        <RoundButton
                            disabled
                            Icon={multiMode ? DocumentsIcon : DocumentIcon}
                            tooltipId="multi-select"
                            tooltip={multiMode ? 'Switch to single file mode' : 'Switch to multi-file mode'}
                            onClick={() => setMultiMode(!multiMode)}
                        />
                        <RoundButton
                            Icon={ClearIcon}
                            onClick={clearFiles}
                            tooltipId="clear-files"
                            tooltip="Deselect all files"
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
                    <div className="max-h-[calc(100vh-12.5rem)] overflow-y-scroll px-9">
                        {filesByExtension['docx'] && (
                            <>
                                <h2 className="font-bold tracking-wider text-zinc-400">docx</h2>
                                <ul className="flex flex-col">
                                    {filesByExtension['docx'].map((file) => (
                                        <FileListItem
                                            key={file.name}
                                            file={file}
                                            selected={file.name === selectedFile?.name}
                                            clickHandler={handleFileClick}
                                        />
                                    ))}
                                </ul>
                            </>
                        )}
                        {filesByExtension['mxliff'] && (
                            <>
                                <h2 className="font-bold tracking-wider text-zinc-400">mxliff</h2>
                                <ul className="flex flex-col gap-2">
                                    {filesByExtension['mxliff'].map((file) => (
                                        <FileListItem
                                            key={file.name}
                                            file={file}
                                            selected={file.name === selectedFile?.name}
                                            clickHandler={handleFileClick}
                                        />
                                    ))}
                                </ul>
                            </>
                        )}
                    </div>
                </>
            )}
        </section>
    );
};
