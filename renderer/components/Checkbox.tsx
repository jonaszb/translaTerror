import { Transition } from '@headlessui/react';
import { FC } from 'react';

export const Checkbox: FC<{ id: string; checked: boolean; onChange: () => void }> = (props) => {
    return (
        <>
            <input
                id={props.id}
                type="checkbox"
                className="peer hidden"
                checked={!!props.checked}
                onChange={props.onChange}
            />
            <label
                htmlFor={props.id}
                className={`flex aspect-square h-6 w-6 cursor-pointer items-center justify-center rounded-full border border-zinc-600 bg-zinc-900 peer-checked:border-amber-200`}
            >
                <Transition
                    show={!!props.checked}
                    enter="transition-all ease-in-out"
                    enterFrom="scale-0"
                    enterTo="scale-100"
                    leave="transition-all ease-in-out"
                    leaveFrom="scale-100"
                    leaveTo="scale-0"
                >
                    <div className="!z-0 h-3.5 w-3.5 rounded-full bg-amber-200" />
                </Transition>
            </label>
        </>
    );
};
