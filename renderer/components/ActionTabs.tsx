import { Tab } from '@headlessui/react';
import { Dispatch, FC, SetStateAction } from 'react';
import { useSingleFileContext } from '../store/SingleFileContext';

const ActionTabs: FC<{ tabs: string[]; selectedIndex: number; changeHandler: Dispatch<SetStateAction<number>> }> = ({
    tabs,
    selectedIndex,
    changeHandler,
}) => {
    const { file } = useSingleFileContext();
    return (
        <Tab.Group selectedIndex={selectedIndex} onChange={(index) => changeHandler(index)}>
            <Tab.List className="relative flex gap-1 transition-all">
                {tabs.map((tab) => (
                    <Tab key={`${file.name}-${tab}`} className="relative outline-none">
                        {({ selected }) => (
                            <>
                                <span
                                    className={`block w-20 text-sm font-bold tracking-wider text-amber-50 transition-all hover:opacity-100 ${
                                        selected ? '!opacity-100' : 'opacity-50'
                                    }`}
                                >
                                    {tab}
                                </span>
                            </>
                        )}
                    </Tab>
                ))}
                <div
                    className="absolute -bottom-2 left-0 h-[2px] w-20 rounded-full bg-amber-200 transition-all ease-out"
                    style={{
                        transform: `translateX(${selectedIndex * 5.25}rem)`,
                    }}
                />
            </Tab.List>
        </Tab.Group>
    );
};

export default ActionTabs;
