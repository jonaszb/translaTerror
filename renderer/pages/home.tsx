import React from 'react';
import Head from 'next/head';
import electron from 'electron';
import { Sidebar } from '../components/Sidebar';
import { FileItem } from '../types';
import { NoFilesScreen } from '../components/NoFilesScreen';
import { useMenuContext } from '../store/MenuContext';
import FileGroup from '../components/FileGroup';

const ipcRenderer = electron.ipcRenderer || false;

const supportedExtensions = ['docx', 'mxliff'];

const pathToFileItem = (path: string): FileItem => {
    const nameWithExtension = path.split(/[\\\/]/).pop();
    const lastDot = nameWithExtension.lastIndexOf('.');
    const name = nameWithExtension.slice(0, lastDot);
    const extension = nameWithExtension.slice(lastDot + 1);
    return {
        path,
        name,
        extension,
    };
};

function Home() {
    const { files, setFiles, filesByExtension } = useMenuContext();

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
    React.useEffect(() => {
        window.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.stopPropagation();
        });

        window.addEventListener('drop', (e) => {
            ipcRenderer && ipcRenderer.send('focusWindow');
            e.preventDefault();
            e.stopPropagation();
            const paths = Array.from(e.dataTransfer.files).map((file) => file.path);
            const validPaths = paths.filter((path) => supportedExtensions.includes(path.split('.').pop()));
            if (validPaths.length > 0) addFiles(validPaths);
        });

        if (ipcRenderer) {
            ipcRenderer.on('addFiles', (event, data: string[]) => {
                addFiles(data);
            });
        }
    }, []);
    return (
        <>
            <Head>
                <title>TranslaTerror</title>
            </Head>
            <main className="col grid h-screen w-screen grid-cols-[min-content_1fr] font-roboto">
                <Sidebar />
                <div className="col-start-2 h-full w-full min-w-[24rem] overflow-scroll py-8 px-10">
                    {files.length > 0 && filesByExtension.docx && (
                        <FileGroup extension="docx" files={filesByExtension.docx} />
                    )}
                    {files.length > 0 && filesByExtension.mxliff && (
                        <FileGroup extension="mxliff" files={filesByExtension.mxliff} />
                    )}

                    {files.length === 0 && <NoFilesScreen />}
                </div>
            </main>
        </>
    );
}

export default Home;
