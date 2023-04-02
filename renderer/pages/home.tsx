import React, { FC, PropsWithChildren, SVGProps } from 'react';
import Head from 'next/head';
import { ClearIcon, DocumentIcon, DocumentsIcon, Logo, PlusIcon } from '../components/icons';
import { Tooltip } from 'react-tooltip';

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
                data-tooltip-delay-show={750}
                className="group flex aspect-square h-16 w-16 items-center justify-center rounded-full border-2 border-amber-200 transition-all hover:bg-amber-200"
            >
                <Icon className="fill-amber-200 stroke-amber-200 group-hover:scale-125 group-hover:fill-slate-600 group-hover:stroke-slate-600" />
            </button>
            {tooltip && <Tooltip id={tooltipId} place="right" />}
        </li>
    );
};

function Home() {
    const [files, setFiles] = React.useState<File[] | null>(null);
    const [multiMode, setMultiMode] = React.useState(false);
    const inputRef = React.useRef<HTMLInputElement>(null);
    const addFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = files ? [...files, ...Array.from(e.target.files)] : e.target.files;
            setFiles(Array.from(newFiles));
        }
    };
    const clearFiles = () => {
        setFiles(null);
    };

    const filesByExtension = React.useMemo(() => {
        if (files) {
            const knownPaths = new Set<string>();
            const filesByExtension: Record<string, File[]> = {};
            for (const file of files) {
                const extension = file.name.split('.').pop();
                if (extension) {
                    filesByExtension[extension] = filesByExtension[extension] || [];
                    if (knownPaths.has(file.name)) {
                        continue;
                    }
                    knownPaths.add(file.name);
                    filesByExtension[extension].push(file);
                }
            }
            return filesByExtension;
        }
    }, [files]);

    return (
        <>
            <Head>
                <title>TranslaTerror</title>
            </Head>
            <main className="col grid h-screen w-screen grid-cols-[min-content_1fr] font-roboto">
                <section className={`bg-zinc-600 ${files ? 'w-86 border-r-2 border-amber-200' : 'w-0'}`}>
                    {files && (
                        <>
                            <div className="flex w-full border-r-2 border-amber-200 bg-amber-200 p-4">
                                <Logo className="h-16" />
                            </div>
                            <ul className="my-4 mx-9 flex justify-between">
                                <RoundButton
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
                                    onClick={() => console.log(filesByExtension)}
                                />
                            </ul>
                        </>
                    )}
                </section>
                <div className="col-start-2 h-full w-full">
                    {!files && (
                        <fieldset className="group- group h-full w-full p-9">
                            <label
                                className="relative z-10 block h-full w-full cursor-pointer rounded-lg border-2 border-dashed border-amber-200 text-5xl font-semibold text-amber-50"
                                htmlFor="file-select"
                            >
                                <span className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap font-light">
                                    Select or drop file(s)
                                </span>
                                <Logo className="absolute left-1/2 top-1/2 z-0 h-96 -translate-x-1/2 -translate-y-1/2" />
                                <input
                                    className="absolute z-0 h-full w-full opacity-0"
                                    ref={inputRef}
                                    type="file"
                                    id="file-select"
                                    name="file-select"
                                    multiple
                                    accept=".docx,.mxliff"
                                    onChange={addFiles}
                                />
                            </label>
                        </fieldset>
                    )}
                    {files && <div className="h-full w-full p-9"></div>}
                </div>
            </main>
        </>
    );
}

export default Home;
