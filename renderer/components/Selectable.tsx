import { Transition } from '@headlessui/react';
import { FC } from 'react';

export const Selectable: FC<{
    id: string;
    checked: boolean;
    onChange: () => void;
    small?: boolean;
    labelText?: string;
    className?: string;
}> = (props) => {
    return (
        <div className={props.className}>
            <input
                id={props.id}
                type="checkbox"
                className="peer hidden"
                checked={!!props.checked}
                onChange={props.onChange}
            />
            <label htmlFor={props.id} className="flex cursor-pointer items-center">
                <div
                    className={`flex aspect-square  items-center justify-center rounded-full border border-zinc-600 bg-zinc-900 hover:border-amber-200 peer-checked:border-amber-200 ${
                        props.small ? 'h-4 w-4' : 'h-6 w-6'
                    }`}
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
                        <div
                            className={`!z-0  rounded-full bg-amber-200 ${props.small ? 'h-2.5 w-2.5' : 'h-3.5 w-3.5'}`}
                        />
                    </Transition>
                </div>
                {props.labelText && <span className={`ml-2 text-sm font-normal text-zinc-500`}>{props.labelText}</span>}
            </label>
        </div>
    );
};
