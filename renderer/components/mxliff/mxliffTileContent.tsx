import { useState } from 'react';
import { useSingleFileContext } from '../../store/SingleFileContext';
import ActionTabs from '../ActionTabs';

const actionTabs = ['To docx'];
const MxliffTileContent = () => {
    // const { file } = useSingleFileContext();
    const [selectedTab, setSelectedTab] = useState(0);

    return (
        <>
            <ActionTabs tabs={actionTabs} selectedIndex={selectedTab} changeHandler={setSelectedTab} />
            <div className="pointer-events-none flex h-full items-center text-3xl font-bold tracking-wide text-amber-200 opacity-50">
                <span>COMING SOON</span>
            </div>
        </>
    );
};

export default MxliffTileContent;
