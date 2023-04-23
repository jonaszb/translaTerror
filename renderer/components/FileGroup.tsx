import { FC } from 'react';
import SingleFileContextProvider from '../store/SingleFileContext';
import { FileItem } from '../types';
import FileTile from './FileTile';
import { MsWordIcon } from './icons';
import PhraseIcon from '../public/images/Phrase.png';
import Image from 'next/image';
import { useFilesContext } from '../store/FilesContext';

const GroupActionButton: FC<React.ComponentProps<'button'> & { border?: boolean }> = (props) => {
    const { className, border, ...restProps } = props;
    return (
        <button
            className={`uppercase tracking-wide text-zinc-600 transition-all hover:text-zinc-400 ${className ?? ''} ${
                border ? 'rounded-full border border-zinc-600 py-0.5 px-2 hover:border-zinc-400' : ''
            }`}
            {...restProps}
        >
            {props.children}
        </button>
    );
};

const FileGroup: FC<{ extension: 'docx' | 'mxliff'; files: FileItem[] }> = ({ extension, files }) => {
    const ctx = useFilesContext();
    const extensionIconStyle = 'mx-3 h-12 w-12 shrink-0 translate-y-1';

    const setSelection = (selected: boolean) => {
        ctx.setFiles((files) => {
            return files.map((file) => {
                if (file.extension !== extension) return file;
                return { ...file, selected };
            });
        });
    };

    const handleSelectAll = () => {
        setSelection(true);
    };

    const handleDeselectAll = () => {
        setSelection(false);
    };

    const handleRemoveSelected = () => {
        ctx.setFiles((files) => {
            return files.filter((file) => !file.selected);
        });
    };

    const areFilesSelected = files.some((file) => file.extension === extension && file.selected);

    return (
        <section className="mb-8">
            <div className="mb-8 flex items-center">
                <div className="h-px w-8 shrink-0 bg-zinc-700" />
                {extension === 'docx' && <MsWordIcon className={extensionIconStyle} />}
                {extension === 'mxliff' && <Image src={PhraseIcon} alt="Phrase icon" className={extensionIconStyle} />}
                <div className="relative h-px w-full bg-zinc-700">
                    <div className="absolute bottom-1 left-0 flex gap-4 text-xs font-bold text-zinc-700">
                        <GroupActionButton onClick={handleSelectAll}>Select all</GroupActionButton>
                        {areFilesSelected && (
                            <GroupActionButton onClick={handleDeselectAll}>Clear selection</GroupActionButton>
                        )}
                    </div>
                    <div className="absolute top-2 left-0 flex gap-4 text-xs font-bold text-zinc-700">
                        {areFilesSelected && (
                            <>
                                <GroupActionButton border={true} onClick={handleRemoveSelected}>
                                    Remove
                                </GroupActionButton>
                                {/* <GroupActionButton border={true} onClick={() => {}}>
                                    Bulk operation
                                </GroupActionButton> */}
                            </>
                        )}
                    </div>
                </div>
            </div>
            <ul className="flex flex-wrap gap-4">
                {files.map((file) => (
                    <SingleFileContextProvider file={file} key={file.path}>
                        <FileTile />
                    </SingleFileContextProvider>
                ))}
            </ul>
        </section>
    );
};

export default FileGroup;
