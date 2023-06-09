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
        <div className="mb-4 mt-2 flex w-full justify-center border-y-2 border-zinc-600 py-4">
            <Tab.Group selectedIndex={selectedIndex} onChange={(index) => changeHandler(index)}>
                <Tab.List className="relative flex gap-1 transition-all">
                    {tabs.map((tab) => (
                        <Tab key={`${file.name}-${tab}`} className="relative outline-none">
                            {({ selected }) => (
                                <>
                                    <span
                                        className={`block w-20 text-sm font-medium tracking-wide text-amber-50 transition-all hover:opacity-100 ${
                                            selected ? '!opacity-100' : 'opacity-70'
                                        }`}
                                    >
                                        {tab}
                                    </span>
                                </>
                            )}
                        </Tab>
                    ))}
                    {/* <div
                        className="absolute -top-[18px] left-0 h-[2px] w-20 rounded-full bg-amber-200 transition-all ease-out"
                        style={{
                            transform: `translateX(${selectedIndex * 5.25}rem)`,
                        }}
                    /> */}
                    {tabs.length > 1 && (
                        <div
                            className="absolute -bottom-[18px] left-0 h-[2px] w-20 rounded-full bg-amber-200 transition-all ease-out"
                            style={{
                                transform: `translateX(${selectedIndex * 5.25}rem)`,
                            }}
                        />
                    )}
                </Tab.List>
            </Tab.Group>
        </div>
    );
};

export default ActionTabs;
