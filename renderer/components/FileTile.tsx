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
            className={`group flex min-h-[20rem] w-72 flex-col items-center rounded-lg border bg-zinc-800  p-4 shadow-md transition-all ${
                file.selected ? ' border-amber-200 border-opacity-50' : 'border-transparent'
            }`}
        >
            <div className="mb-12 flex w-full justify-between">
                <Checkbox id={file.path} checked={file.selected} onChange={handleSelectToggle} />
                <span
                    data-tooltip-id={file.name}
                    data-tooltip-content={file.name}
                    data-tooltip-delay-show={1000}
                    className="text-md block w-full overflow-hidden text-ellipsis whitespace-nowrap px-4 text-center font-bold text-amber-50"
                >
                    {file.name}
                </span>
                <Tooltip id={file.name} place="top" />

                <ClearIcon
                    onClick={handleDelete}
                    className="stroke-zinc-950 h-6 w-6 cursor-pointer opacity-0 transition-all hover:stroke-red-400 group-hover:opacity-100"
                />
            </div>
            {file.extension === 'docx' && <DocxTileContent />}
            {file.extension === 'mxliff' && <MxliffTileContent />}
        </li>
    );
};

export default FileTile;
