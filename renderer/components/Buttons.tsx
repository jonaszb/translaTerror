import { FC } from 'react';
import { Transition } from '@headlessui/react';
import { DownloadIcon, PlayIcon, Spinner } from './icons';

const transitionProperties = {
    enter: 'transition-all ease-in-out duration-1000',
    enterFrom: 'opacity-0 -translate-y-20',
    enterTo: 'opacity-100',
    leave: 'transition-all ease-in duration-500',
    leaveFrom: 'opacity-100',
    leaveTo: 'opacity-0 translate-y-8',
    className: 'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2',
};

export const ActionButton: FC<React.ComponentProps<'button'> & { isProcessing: boolean; downloadLink?: string }> = (
    props
) => {
    const { children, className, isProcessing, downloadLink, onClick, ...btnProps } = props;
    return (
        <button
            className={`relative h-16 w-16 overflow-hidden rounded-full border border-amber-200 py-4 text-2xl font-semibold uppercase tracking-widest transition-all disabled:pointer-events-none disabled:opacity-50 ${
                className ?? ''
            } ${
                isProcessing
                    ? 'pointer-events-none bg-amber-200 text-zinc-800'
                    : 'text-amber-200 hover:bg-amber-200 hover:text-zinc-800 '
            }}`}
            onClick={isProcessing ? undefined : onClick}
            {...btnProps}
        >
            <Transition show={!isProcessing && !downloadLink} {...transitionProperties}>
                <PlayIcon className="h-10 w-10 translate-x-[2px]" />
            </Transition>
            <Transition show={isProcessing} {...transitionProperties}>
                <Spinner />
            </Transition>
            <Transition show={!!downloadLink && !isProcessing} {...transitionProperties}>
                <DownloadIcon className="svg-animate" />
            </Transition>
        </button>
    );
};
