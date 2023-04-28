import { FC } from 'react';
import { useSingleFileContext } from '../store/SingleFileContext';
import { Checkbox } from './Checkbox';
import { useFilesContext } from '../store/FilesContext';
import { Tooltip } from 'react-tooltip';
import DocxTileContent from './docx/docxTileContent';
import MxliffTileContent from './mxliff/mxliffTileContent';

const FileTile: FC = () => {
    const { setFiles } = useFilesContext();
    const { file } = useSingleFileContext();
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
            data-testid="file-tile"
            className={`flex min-h-[20rem] w-72 flex-col items-center rounded-lg border bg-zinc-800  p-4 shadow-inner-white transition-all ${
                file.selected ? ' border-amber-200 border-opacity-50' : 'border-transparent'
            }`}
        >
            <div className="mb-10 flex w-full items-center justify-between border-b-2 border-zinc-700 pb-2">
                <h3
                    data-tooltip-id={file.name}
                    data-tooltip-content={file.name}
                    data-tooltip-delay-show={1000}
                    className="mr-4 block w-full overflow-hidden text-ellipsis whitespace-nowrap text-left font-source-sans text-lg text-amber-50"
                >
                    {file.name}
                </h3>
                <Checkbox id={file.path} checked={file.selected} onChange={handleSelectToggle} />
                <Tooltip id={file.name} place="top" />
            </div>
            {file.extension === 'docx' && <DocxTileContent />}
            {file.extension === 'mxliff' && <MxliffTileContent />}
        </li>
    );
};

export default FileTile;
