import { FC, useEffect } from 'react';
import { useSingleFileContext } from '../store/SingleFileContext';
import { Checkbox } from './Checkbox';
import { ClearIcon, RightArrowIcon } from './icons';
import { useMenuContext } from '../store/MenuContext';
import { LanguageSelect } from './LanguageSelect';
import { Tooltip } from 'react-tooltip';
import { ActionButton } from './Buttons';
import { ipcRenderer } from 'electron';
import DocxTileContent from './docx/docxTileContent';
import MxliffTileContent from './mxliff/mxliffTileContent';

const FileTile: FC = () => {
    const { setFiles } = useMenuContext();
    const {
        file,
        fromLang,
        setFromLang,
        toLang,
        setToLang,
        isProcessing,
        downloadLink,
        setDownloadLink,
        setIsProcessing,
    } = useSingleFileContext();
    const handleDelete = () => {
        setFiles((previous) => {
            if (previous) {
                return previous.filter((f) => f.path !== file.path);
            }
            return [];
        });
    };
    const handleSelectToggle = () => {
        setFiles((previous) => {
            if (previous) {
                return previous.map((f) => {
                    if (f.path === file.path) {
                        return {
                            ...f,
                            selected: !f.selected,
                        };
                    }
                    return f;
                });
            }
            return [];
        });
    };

    return (
        <li className="group flex h-92 w-72 flex-col items-center rounded-lg bg-zinc-800 p-4 shadow-lg">
            <div className="flex w-full justify-between">
                <Checkbox id={file.path} checked={file.selected} onChange={handleSelectToggle} />
                <ClearIcon
                    onClick={handleDelete}
                    className="hidden h-6 w-6 cursor-pointer stroke-zinc-900 transition-all hover:stroke-red-400 group-hover:block"
                />
            </div>
            <div className="my-6 flex h-14 max-h-[3.5rem] min-h-[3.5rem] items-center">
                <span
                    data-tooltip-id={file.name}
                    data-tooltip-content={file.name}
                    data-tooltip-delay-show={1000}
                    className="block max-h-[3.5rem] w-full overflow-hidden break-all text-center text-lg font-bold tracking-wide text-amber-50"
                >
                    {file.name}
                </span>
                <Tooltip id={file.name} place="bottom" />
            </div>
            {file.extension === 'docx' && <DocxTileContent />}
            {file.extension === 'mxliff' && <MxliffTileContent />}
        </li>
    );
};

export default FileTile;
