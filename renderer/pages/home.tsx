import React from 'react';
import Head from 'next/head';
import electron from 'electron';
import { Sidebar } from '../components/Sidebar';
import { FileItem } from '../types';
import { NoFilesScreen } from '../components/NoFilesScreen';
import { DocxTranslatePanel } from '../components/DocxTranslatePanel';
import { useMenuContext } from '../store/MenuContext';

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
    const { files, selectedFile, setFiles, setIsProcessing, setDownloadLink, downloadLink } = useMenuContext();

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
            ipcRenderer.on('translateSingleDoc', (event, data) => {
                setIsProcessing(false);
                try {
                    new URL(data);
                    setDownloadLink(data);
                } catch (e) {
                    console.log('Received invalid URL from main process: ' + data);
                    console.error(e);
                }
            });
        }
    }, []);

    React.useEffect(() => {
        if (downloadLink && ipcRenderer) {
            ipcRenderer.send('openDownloadLink', { downloadLink, selectedFile });
        }
    }, [downloadLink]);

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
