import React from 'react';
import Head from 'next/head';
import electron from 'electron';
import { Sidebar } from '../components/Sidebar';
import { FileItem } from '../types';
import { NoFilesScreen } from '../components/NoFilesScreen';
import { DocxTranslatePanel } from '../components/DocxTranslatePanel';
import { useMenuContext } from '../store/MenuContext';

const ipcRenderer = electron.ipcRenderer || false;

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
    const { files, selectedFile, setFiles, setIsProcessing, setDownloadLink } = useMenuContext();

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

    return (
        <>
            <Head>
                <title>TranslaTerror</title>
            </Head>
            <main className="col grid h-screen w-screen grid-cols-[min-content_1fr] font-roboto">
                <Sidebar />
                <div className="col-start-2 h-full w-full">
                    {files && selectedFile && <DocxTranslatePanel />}
                    {!files && <NoFilesScreen />}
                </div>
            </main>
        </>
    );
}

export default Home;
