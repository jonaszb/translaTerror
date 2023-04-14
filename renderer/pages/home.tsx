import React, { FC, PropsWithChildren, SVGProps } from 'react';
import Head from 'next/head';
import { ClearIcon, DocumentIcon, DocumentsIcon, Logo, PlusIcon } from '../components/icons';
import { Tooltip } from 'react-tooltip';
import Select from 'react-select';
import electron from 'electron';

const ipcRenderer = electron.ipcRenderer || false;

const RoundButton: FC<
    PropsWithChildren<
        React.ComponentProps<'button'> & {
            tooltipId?: string;
            tooltip?: string;
            Icon: (props: SVGProps<SVGSVGElement>) => JSX.Element;
        }
    >
> = (props) => {
    const { Icon, tooltip, tooltipId, ...btnProps } = props;
    return (
        <li>
            <button
                {...btnProps}
                data-tooltip-id={tooltipId}
                data-tooltip-content={tooltip}
                data-tooltip-delay-show={1000}
                className="group flex aspect-square h-16 w-16 items-center justify-center rounded-full border-2 border-amber-200 transition-all hover:bg-amber-200 disabled:pointer-events-none disabled:border-zinc-400"
            >
                <Icon className="fill-amber-200 stroke-amber-200 group-hover:scale-125 group-hover:fill-slate-600 group-hover:stroke-slate-600 group-disabled:fill-zinc-400 group-disabled:stroke-zinc-400" />
            </button>
            {tooltip && <Tooltip id={tooltipId} place="right" />}
        </li>
    );
};

const ActionButton: FC<React.ComponentProps<'button'> & { isProcessing: boolean; downloadLink?: string }> = (props) => {
    const { children, className, isProcessing, downloadLink, ...btnProps } = props;
    return (
        <button
            className={`w-full rounded-full border border-amber-200 py-4 text-2xl font-semibold uppercase tracking-widest  transition-all ${
                className ?? ''
            } ${
                isProcessing
                    ? 'pointer-events-none bg-amber-200 text-zinc-800'
                    : 'text-amber-200 hover:bg-amber-200 hover:text-zinc-800 '
            }}`}
            {...btnProps}
        >
            {props.children}
        </button>
    );
};

const LanguageSelect: FC<{ value: string; onChange: (value: string) => void; options: string[]; label: string }> = (
    props
) => {
    const options = props.options.map((option) => {
        return { value: option, label: option.toUpperCase() };
    });
    return (
        <div className="flex w-max flex-col gap-1">
            <label htmlFor={`lang-${props.label}}`} className="text-center font-thin text-amber-50">
                {props.label}
            </label>
            <Select
                id={`lang-${props.label}}`}
                options={options}
                value={options.find((option) => option.value === props.value)}
                onChange={(option) => props.onChange(option.value)}
                classNames={{
                    container: () => 'w-20 h-10 !outline-0',
                    control: () =>
                        '!bg-transparent !cursor-pointer !rounded-full !border-amber-50 hover:!border-amber-200 !border-2',
                    singleValue: () => '!text-amber-50 !text-center !font-bold !text-lg !tracking-wider',
                    indicatorsContainer: () => '!hidden',
                    valueContainer: () => 'text-amber-50 bg-transparent',
                }}
            />
        </div>
    );
};

const Checkbox: FC<{ id: string; checked?: boolean }> = (props) => {
    return (
        <>
            <input id={props.id} type="checkbox" className="peer hidden" checked={props.checked} onChange={() => {}} />
            <label
                htmlFor={props.id}
                className={`pointer-events-none flex h-6 w-6 items-center justify-center rounded-full border-amber-200 bg-zinc-800 peer-checked:border`}
            >
                {props.checked && <div className="h-3.5 w-3.5 rounded-full bg-amber-200" />}
            </label>
        </>
    );
};

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

const pathToFileItem = (path: string): FileItem => {
    const [name, extension] = path
        .split(/[\\\/]/)
        .pop()
        .split('.');
    return {
        path,
        name,
        extension,
    };
};

function Home() {
    const [files, setFiles] = React.useState<FileItem[] | null>(null);
    const [multiMode, setMultiMode] = React.useState(false);
    const [selectedFile, setSelectedFile] = React.useState<FileItem | null>(null);
    const [fromLang, setFromLang] = React.useState('auto');
    const [toLang, setToLang] = React.useState('pl');
    const [isProcessing, setIsProcessing] = React.useState(false);
    const [downloadLink, setDownloadLink] = React.useState<string | null>(null);

    const addFiles = (paths?: string[]) => {
        if (!paths) return;
        setFiles((previous) => {
            if (previous) {
                const newPaths = paths.filter((path) => {
                    return !previous.find((file) => file.path === path);
                });
                return [...previous, ...newPaths.map(pathToFileItem)];
            }
            return paths.map(pathToFileItem);
        });
    };
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

    const filesByExtension = React.useMemo(() => {
        if (files) {
            const filesByExtension: Record<string, FileItem[]> = {};
            for (const file of files) {
                const extension = file.extension;
                if (extension) {
                    filesByExtension[extension] = filesByExtension[extension] || [];
                    filesByExtension[extension].push(file);
                }
            }
            return filesByExtension;
        }
    }, [files]);

    const initiateTranslation = () => {
        if (!ipcRenderer || !selectedFile || selectedFile.extension !== 'docx') return;
        const jobData = {
            fromLang,
            toLang,
            path: selectedFile.path,
        };
        setIsProcessing(true);
        ipcRenderer.send('translateSingleDoc', jobData);
    };

    React.useEffect(() => {
        if (ipcRenderer) {
            ipcRenderer.on('addFiles', (event, data: string[]) => {
                addFiles(data);
            });
            ipcRenderer.on('translateSingleDoc', (event, data) => {
                setIsProcessing(false);
                setDownloadLink(data);
                console.log(data);
            });
        }
    }, []);

    React.useEffect(() => {
        if (files && !selectedFile) {
            setSelectedFile(files[0]);
        }
    }, [files]);

    return (
        <>
            <Head>
                <title>TranslaTerror</title>
            </Head>
            <main className="col grid h-screen w-screen grid-cols-[min-content_1fr] font-roboto">
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
                <div className="col-start-2 h-full w-full">
                    {files && selectedFile && (
                        <section className="flex h-full w-full flex-col items-center pt-24">
                            <h1 className="mb-24 block text-center text-3xl font-bold tracking-wide text-amber-50">
                                {selectedFile.name.split('.')[0]}
                            </h1>
                            <div className="w-56">
                                <div className="flex justify-between">
                                    <LanguageSelect
                                        label="Source"
                                        value={fromLang}
                                        options={['auto', 'no', 'dk', 'pl', 'en']}
                                        onChange={(value) => setFromLang(value)}
                                    />
                                    <LanguageSelect
                                        label="Target"
                                        value={toLang}
                                        options={['no', 'dk', 'pl', 'en']}
                                        onChange={(value) => setToLang(value)}
                                    />
                                </div>
                                <ActionButton
                                    className="my-12"
                                    onClick={initiateTranslation}
                                    isProcessing={isProcessing}
                                    downloadLink={downloadLink}
                                >
                                    Translate
                                </ActionButton>
                            </div>
                        </section>
                    )}
                    {!files && (
                        <button
                            className="group- group h-full w-full p-9"
                            onClick={() => ipcRenderer && ipcRenderer.send('addFiles')}
                        >
                            <div className="relative z-10 block h-full w-full cursor-pointer rounded-lg border-2 border-dashed border-amber-200 text-5xl font-semibold text-amber-50">
                                <span className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap font-light">
                                    Select file(s)
                                </span>
                                <Logo className="absolute left-1/2 top-1/2 z-0 h-96 -translate-x-1/2 -translate-y-1/2" />
                            </div>
                        </button>
                    )}
                </div>
            </main>
        </>
    );
}

type FileItem = {
    name: string;
    path: string;
    extension: string;
};

export default Home;
