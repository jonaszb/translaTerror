import { FC } from 'react';
import { useSingleFileContext } from '../store/SingleFileContext';
import { Checkbox } from './Checkbox';
import { ClearIcon } from './icons';
import { useMenuContext } from '../store/MenuContext';
import { Tooltip } from 'react-tooltip';
import DocxTileContent from './docx/docxTileContent';
import MxliffTileContent from './mxliff/mxliffTileContent';

const FileTile: FC = () => {
    const { setFiles } = useMenuContext();
    const { file } = useSingleFileContext();
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
        <li
            className={`group flex h-92 w-72 flex-col items-center rounded-lg border bg-zinc-800  p-4 shadow-md transition-all ${
                file.selected ? ' border-amber-200 border-opacity-50' : 'border-transparent'
            }`}
        >
            <div className="flex w-full justify-between">
                <Checkbox id={file.path} checked={file.selected} onChange={handleSelectToggle} />
                <ClearIcon
                    onClick={handleDelete}
                    className="h-6 w-6 cursor-pointer stroke-zinc-900 opacity-0 transition-all hover:stroke-red-600 group-hover:opacity-100"
                />
            </div>
            <div className="my-6 flex h-14 max-h-[3.5rem] min-h-[3.5rem] items-center">
                <span
                    data-tooltip-id={file.name}
                    data-tooltip-content={file.name}
                    data-tooltip-delay-show={1000}
                    className="block max-h-[3.5rem] w-full overflow-hidden break-all text-center text-lg font-bold text-amber-50"
                >
                    {file.name}
                </span>
                <Tooltip id={file.name} place="top" />
            </div>
            {file.extension === 'docx' && <DocxTileContent />}
            {file.extension === 'mxliff' && <MxliffTileContent />}
        </li>
    );
};

export default FileTile;
