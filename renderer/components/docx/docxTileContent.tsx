import { ActionButton } from '../Buttons';
import { RightArrowIcon } from '../icons';
import { LanguageSelect } from '../LanguageSelect';
import { ipcRenderer } from 'electron';
import { useSingleFileContext } from '../../store/SingleFileContext';
import { useEffect, useState } from 'react';
import ActionTabs from '../ActionTabs';

const actionTabs = ['Translate', 'To mxliff'];

const DocxTileContent = () => {
    const {
        file,
        isProcessing,
        downloadLink,
        fromLang,
        toLang,
        setFromLang,
        setToLang,
        setIsProcessing,
        setDownloadLink,
    } = useSingleFileContext();
    const [selectedTab, setSelectedTab] = useState(0);

    const initiateTranslation = () => {
        if (isProcessing || !ipcRenderer) return;
        if (downloadLink) {
            ipcRenderer.send('openDownloadLink', { downloadLink, file });
        } else {
            const jobData = {
                fromLang,
                toLang,
                path: file.path,
                name: file.name,
                extension: file.extension,
            };
            setIsProcessing(true);
            ipcRenderer.send('translateSingleDoc', jobData);
        }
    };

    useEffect(() => {
        ipcRenderer.on('translateSingleDoc', (event, data) => {
            if (!data.path || data.path !== file.path) return;
            setIsProcessing(false);
            try {
                new URL(data.downloadLink);
                setDownloadLink(data.downloadLink);
            } catch (e) {
                console.log('Received invalid URL from main process: ' + data);
                console.error(e);
            }
        });
    });

    return (
        <>
            <ActionTabs tabs={actionTabs} selectedIndex={selectedTab} changeHandler={setSelectedTab} />
            {actionTabs[selectedTab] === 'Translate' && (
                <div className="flex h-full w-full flex-col items-center">
                    <div className="mt-10 flex w-full items-center justify-between">
                        <LanguageSelect
                            label="Source"
                            value={fromLang}
                            options={['auto', 'no', 'da', 'sv', 'pl', 'en']}
                            onChange={(value) => setFromLang(value)}
                        />
                        <RightArrowIcon className="opacity-75" />
                        <LanguageSelect
                            label="Target"
                            value={toLang}
                            options={['no', 'da', 'sv', 'pl', 'en']}
                            onChange={(value) => setToLang(value)}
                        />
                    </div>
                    <ActionButton
                        className="my-5"
                        onClick={initiateTranslation}
                        isProcessing={isProcessing}
                        downloadLink={downloadLink}
                        btnText="Translate"
                    />
                </div>
            )}
            {actionTabs[selectedTab] === 'To mxliff' && (
                <div className="pointer-events-none flex h-full items-center text-3xl font-bold tracking-wide text-amber-200 opacity-50">
                    <span>COMING SOON</span>
                </div>
            )}
        </>
    );
};

export default DocxTileContent;
