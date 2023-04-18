import { FC } from 'react';
import SingleFileContextProvider from '../store/SingleFileContext';
import { FileItem } from '../types';
import FileTile from './FileTile';
import { MsWordIcon } from './icons';
import PhraseIcon from '../public/images/Phrase.png';
import Image from 'next/image';
import { useMenuContext } from '../store/MenuContext';

const SelectionButton: FC<React.ComponentProps<'button'>> = (props) => {
    const { className, ...restProps } = props;
    return (
        <button className={`uppercase transition-all hover:text-zinc-400 ${className ?? ''}`} {...restProps}>
            {props.children}
        </button>
    );
};

const FileGroup: FC<{ extension: 'docx' | 'mxliff'; files: FileItem[] }> = ({ extension, files }) => {
    const ctx = useMenuContext();
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

    const areFilesSelected = files.some((file) => file.extension === extension && file.selected);

    return (
        <section className="mb-8">
            <div className="mb-6 flex items-center">
                <div className="h-px w-8 shrink-0 bg-zinc-700" />
                {extension === 'docx' && <MsWordIcon className={extensionIconStyle} />}
                {extension === 'mxliff' && <Image src={PhraseIcon} alt="Phrase icon" className={extensionIconStyle} />}
                <div className="relative h-px w-full bg-zinc-700">
                    <div className="absolute top-1 left-1 flex gap-4 text-xs font-bold text-zinc-700">
                        <SelectionButton onClick={handleSelectAll}>Select all</SelectionButton>
                        {areFilesSelected && (
                            <SelectionButton onClick={handleDeselectAll}>Clear selection</SelectionButton>
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
