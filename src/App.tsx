import React from 'react';
import electron from 'electron';
import Sidebar from './components/Sidebar';
import NoFilesScreen from './components/NoFilesScreen';
import { useFilesContext } from './store/FilesContext';
import FileGroup from './components/FileGroup';
import { pathToFileItem } from './utils/utils';
import ToastContainer from './components/toast/ToastContainer';
import { AccKeyProvider } from './store/AccKeyContext';

const ipcRenderer = electron.ipcRenderer || false;

const supportedExtensions = ['docx', 'mxliff', 'mp3'];

function Home() {
    const { files, setFiles, filesByExtension } = useFilesContext();

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
            const paths = Array.from(e.dataTransfer!.files).map((file) => file.path);
            const validPaths = paths.filter((path) => supportedExtensions.includes(path.split('.').pop() as string));
            if (validPaths.length > 0) addFiles(validPaths);
        });

        if (ipcRenderer) {
            ipcRenderer.on('addFiles', (event, data: string[]) => {
                console.log('adding files: ' + JSON.stringify(data));
                addFiles(data);
            });
        }
    }, []);
    return (
        <>
            <AccKeyProvider>
                <main className="col relative grid h-screen w-screen grid-cols-[min-content_1fr] font-roboto">
                    <Sidebar />
                    <div className="col-start-2 h-full w-full min-w-[24rem] overflow-scroll overflow-y-auto overflow-x-hidden px-10 py-6">
                        {files && files.length > 0 && filesByExtension!.docx && (
                            <FileGroup extension="docx" files={filesByExtension!.docx} />
                        )}
                        {files && files.length > 0 && filesByExtension!.mxliff && (
                            <FileGroup extension="mxliff" files={filesByExtension!.mxliff} />
                        )}
                        {files && files.length > 0 && filesByExtension!.mp3 && (
                            <FileGroup extension="mp3" files={filesByExtension!.mp3} />
                        )}

                        {(!files || files.length === 0) && <NoFilesScreen />}
                    </div>
                    <ToastContainer />
                </main>
            </AccKeyProvider>
        </>
    );
}

export default Home;
