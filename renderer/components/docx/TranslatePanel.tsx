import { useSingleFileContext } from '../../store/SingleFileContext';
import { ActionButton } from '../Buttons';
import { ipcRenderer } from 'electron';
import LangSelect from './LangSelect';
import Checklist from '../Checklist';
import { useMemo } from 'react';
import { useDocxContext } from '../../store/DocxContext';
import FileInfo from '../FileInfoField';

const TranslatePanel = () => {
    const { file } = useSingleFileContext();
    const { isProcessing, downloadLink, fromLang, toLang, setIsProcessing, docxData } = useDocxContext();

    const initiateTranslation = () => {
        if (isProcessing || !ipcRenderer) return;
        if (downloadLink) {
            ipcRenderer.send('openDownloadLink', { downloadLink, file, suffix: '_TAB' });
        } else {
            const jobData = {
                fromLang,
                toLang,
                path: file.path,
                name: file.name,
                extension: file.extension,
                eventId: file.path,
            };
            setIsProcessing(true);
            ipcRenderer.send('translateSingleDoc', jobData);
        }
    };
    const conditions = useMemo(
        () => [
            { isMet: docxData?.tables === 1, title: 'Single table', mandatory: true },
            { isMet: docxData?.columns === 4, title: '4 columns', mandatory: true },
            { isMet: docxData?.sourceLength < 500000, title: '< 500 000 chars', mandatory: false },
        ],
        [docxData]
    );

    const allConditionsMet = useMemo(() => conditions.every((c) => c.isMet || !c.mandatory), [conditions]);
    const { estCost, charCount } = useMemo(() => {
        if (!allConditionsMet) return { estCost: 'N/A', charCount: 'N/A' };
        const estCost = String(((docxData.sourceLength / 1000000) * 20).toFixed(2)); // 20 USD per 1M chars
        const charCount = docxData.sourceLength.toLocaleString().replace(/,/g, ' ');
        return { estCost, charCount };
    }, [allConditionsMet]);

    return (
        <>
            <Checklist className="mb-4" conditions={conditions} />
            <LangSelect className="mb-4" />
            <div className="flex items-end justify-between">
                <div className="flex gap-8">
                    <FileInfo label="Character count" value={charCount} />
                    <FileInfo label="Estimated cost" value={estCost} currency={allConditionsMet && '$'} />
                </div>
                <ActionButton
                    onClick={initiateTranslation}
                    isProcessing={isProcessing}
                    downloadLink={downloadLink}
                    disabled={!allConditionsMet}
                />
            </div>
        </>
    );
};

export default TranslatePanel;
