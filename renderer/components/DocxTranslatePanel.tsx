import { ipcRenderer } from 'electron';
import { useMenuContext } from '../store/MenuContext';
import { ActionButton } from './Buttons';
import { LanguageSelect } from './LanguageSelect';

export const DocxTranslatePanel = () => {
    const { selectedFile, isProcessing, downloadLink, fromLang, toLang, setFromLang, setToLang, setIsProcessing } =
        useMenuContext();

    const initiateTranslation = () => {
        if (isProcessing) return;
        if (!ipcRenderer || !selectedFile || selectedFile.extension !== 'docx') return;
        if (downloadLink) {
            ipcRenderer.send('openDownloadLink', { downloadLink, selectedFile });
        } else {
            const jobData = {
                fromLang,
                toLang,
                path: selectedFile.path,
            };
            setIsProcessing(true);
            ipcRenderer.send('translateSingleDoc', jobData);
        }
    };

    return (
        <section className="flex h-full w-full flex-col items-center pt-24">
            <h1 className="mb-14 block text-center text-3xl font-bold tracking-wide text-amber-50">
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
                    btnText="Translate"
                />
            </div>
        </section>
    );
};
