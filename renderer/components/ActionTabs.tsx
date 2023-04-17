import { Tab, Transition } from '@headlessui/react';
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
            <Tab.List className="flex gap-1 transition-all">
                {tabs.map((tab) => (
                    <Tab key={`${file.name}-${tab}`} className="relative pb-1 outline-none">
                        {({ selected }) => (
                            <>
                                <span
                                    className={`block w-20 text-sm font-bold tracking-wider text-amber-50 transition-all hover:opacity-100 ${
                                        selected ? '!opacity-100' : 'opacity-50'
                                    }`}
                                >
                                    {tab}
                                </span>
                                <Transition
                                    show={selected}
                                    enter="transition-all ease-in-out absolute"
                                    enterFrom="scale-x-0"
                                    enterTo="scale-x-100"
                                    leave="transition-all ease-in-out absolute"
                                    leaveFrom="scale-x-100"
                                    leaveTo="scale-x-0"
                                >
                                    <div className="absolute -bottom-1 left-0 h-[2px] w-20 scale-x-100 rounded bg-amber-200"></div>
                                </Transition>
                            </>
                        )}
                    </Tab>
                ))}
            </Tab.List>
        </Tab.Group>
    );
};

export default ActionTabs;
