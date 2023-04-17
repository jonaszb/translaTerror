import { FC } from 'react';
import SingleFileContextProvider from '../store/SingleFileContext';
import { FileItem } from '../types';
import FileTile from './FileTile';
import { MsWordIcon } from './icons';
import PhraseIcon from '../public/images/Phrase.png';
import Image from 'next/image';

const FileGroup: FC<{ extension: 'docx' | 'mxliff'; files: FileItem[] }> = ({ extension, files }) => {
    const extensionIconStyle = 'mx-3 h-12 w-12 shrink-0 translate-y-1';
    return (
        <section className="mb-8">
            <div className="mb-4 flex items-center">
                <div className="h-px w-8 shrink-0 bg-zinc-700" />
                {extension === 'docx' && <MsWordIcon className={extensionIconStyle} />}
                {extension === 'mxliff' && <Image src={PhraseIcon} alt="Phrase icon" className={extensionIconStyle} />}
                <div className="h-px w-full bg-zinc-700" />
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
