import { useSingleFileContext } from '../../store/SingleFileContext';
import { ActionButton } from '../Buttons';
import { ipcRenderer } from 'electron';
import Checklist from '../Checklist';
import { useMemo } from 'react';
import { useDocxContext } from '../../store/DocxContext';
import FileInfo from '../FileInfoField';
import { Selectable } from '../Selectable';
import LangSelect from './LangSelect';
import { Transition } from '@headlessui/react';

const transitionProperties = {
    enter: 'transition-all ease-in-out duration-1000',
    enterFrom: 'opacity-0',
    enterTo: 'opacity-100',
    leave: 'transition-all ease-in duration-500',
    leaveFrom: 'opacity-100',
    leaveTo: 'opacity-0',
};

const FragmentPanel = () => {
    const { file } = useSingleFileContext();
    const {
        isProcessing,
        downloadLink,
        docxData,
        shouldTranslate,
        setShouldTranslate,
        fromLang,
        toLang,
        setIsProcessing,
        fragData,
    } = useDocxContext();

    const fragmentDocx = () => {
        if (isProcessing || !ipcRenderer) return;
        if (downloadLink) {
            ipcRenderer.send('openDownloadLink', { downloadLink, file, suffix: '_TAB' });
        } else {
            const jobData = {
                path: file.path,
                name: file.name,
                eventId: file.path,
                fromLang: shouldTranslate ? fromLang : null,
                toLang: shouldTranslate ? toLang : null,
            };
            setIsProcessing(true);
            ipcRenderer.send('fragmentDocx', jobData);
        }
    };

    const conditions = useMemo(
        () => [
            { isMet: docxData?.totalLength > 500, title: '> 500 chars', mandatory: false },
            { isMet: docxData?.totalLength < 500_000, title: '< 500 000 chars', mandatory: false },
        ],
        [docxData]
    );

    const allConditionsMet = useMemo(() => conditions.every((c) => c.isMet || !c.mandatory), [conditions]);
    const { estCost, charCount } = useMemo(() => {
        if (!allConditionsMet) return { estCost: 'N/A', charCount: 'N/A' };
        const estCost = String(((docxData.totalLength / 1000000) * 20).toFixed(2)); // 20 USD per 1M chars
        const charCount = docxData.totalLength.toLocaleString().replace(/,/g, ' ');
        return { estCost, charCount };
    }, [allConditionsMet]);

    return (
        <>
            <Checklist className="mb-4" conditions={conditions} />
            <Selectable
                id={`${file.name}.translate`}
                onChange={() => setShouldTranslate(!shouldTranslate)}
                checked={shouldTranslate}
                small={true}
                labelText="Translate"
                className="mb-1"
            />
            <LangSelect disabled={!shouldTranslate} noLabel={true} className="mb-4" />
            <div className="flex items-end justify-between">
                <div>
                    <Transition show={!downloadLink && !isProcessing} {...transitionProperties}>
                        <div className="flex gap-4">
                            <FileInfo label="Character count" value={charCount} />
                            {shouldTranslate && (
                                <FileInfo label="Estimated cost" value={estCost} currency={allConditionsMet && '$'} />
                            )}
                        </div>
                    </Transition>
                    <Transition
                        show={!!downloadLink && !!fragData}
                        {...{
                            ...transitionProperties,
                            leave: 'absolute hidden',
                        }}
                    >
                        <div className="flex gap-4">
                            {fragData && (
                                <>
                                    <FileInfo
                                        label="Character count"
                                        value={fragData.totalLength.toLocaleString().replace(/,/g, ' ')}
                                    />
                                    <FileInfo
                                        label="Redundancy"
                                        value={`${fragData.redundancy.toLocaleString().replace(/,/g, ' ')}`}
                                        annotation={`${fragData.redundancyRatio}%`}
                                    />
                                </>
                            )}
                        </div>
                    </Transition>
                </div>
                <ActionButton
                    onClick={fragmentDocx}
                    isProcessing={isProcessing}
                    downloadLink={downloadLink}
                    disabled={!allConditionsMet}
                />
            </div>
        </>
    );
};

export default FragmentPanel;
