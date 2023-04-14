import { Transition } from '@headlessui/react';
import { FC } from 'react';

export const Checkbox: FC<{ id: string; checked?: boolean }> = (props) => {
    return (
        <>
            <input id={props.id} type="checkbox" className="peer hidden" checked={props.checked} onChange={() => {}} />
            <label
                htmlFor={props.id}
                className={`pointer-events-none flex h-6 w-6 items-center justify-center rounded-full border-amber-200 bg-zinc-800 peer-checked:border`}
            >
                <Transition
                    show={props.checked}
                    enter="transition-all ease-in-out"
                    enterFrom="scale-0"
                    enterTo="scale-100"
                    leave="transition-all ease-in-out"
                    leaveFrom="scale-100"
                    leaveTo="scale-0"
                >
                    <div className="h-3.5 w-3.5 rounded-full bg-amber-200" />
                </Transition>
            </label>
        </>
    );
};
