import { FC } from 'react';
import { Selectable } from './Selectable';
import { useFilesContext } from '../store/FilesContext';
import { Tooltip } from 'react-tooltip';
import DocxTileContent from './docx/DocxTileContent';
import MxliffTileContent from './mxliff/mxliffTileContent';
import { FileItem } from '../types';
import SingleFileContextProvider from '../store/SingleFileContext';
import DocxContextProvider from '../store/DocxContext';
import MxliffContextProvider from '../store/MxliffContext';

const FileTile: FC<{ file: FileItem }> = ({ file }) => {
    const { setFiles } = useFilesContext();
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
            className={` rounded-lg border bg-zinc-800 p-6 shadow-inner-white transition-all ${
                file.selected ? ' border-amber-200 border-opacity-50' : 'border-transparent'
            }`}
        >
            <div className={`flex flex-col items-center ${file.extension === 'mxliff' ? 'w-72' : 'w-80'}`}>
                <div className="flex w-full items-start justify-between">
                    <h3
                        data-tooltip-id={file.name}
                        data-tooltip-content={file.name}
                        data-tooltip-delay-show={1000}
                        className="mr-4 block w-full overflow-hidden text-ellipsis whitespace-nowrap text-left font-source-sans text-xl text-amber-50"
                    >
                        {file.name}
                    </h3>
                    <Selectable id={file.path} checked={file.selected} onChange={handleSelectToggle} />
                    <Tooltip id={file.name} place="top" />
                </div>
                <SingleFileContextProvider file={file}>
                    {file.extension === 'docx' && (
                        <DocxContextProvider>
                            <DocxTileContent />
                        </DocxContextProvider>
                    )}
                    {file.extension === 'mxliff' && (
                        <MxliffContextProvider>
                            <MxliffTileContent />
                        </MxliffContextProvider>
                    )}
                </SingleFileContextProvider>
            </div>
        </li>
    );
};

export default FileTile;
