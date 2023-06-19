import { FC, SVGProps } from 'react';
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

const BaseActionButton: FC<React.ComponentProps<'button'> & { isProcessing: boolean }> = (props) => {
    const { children, className, isProcessing, onClick, ...btnProps } = props;
    return (
        <button
            className={`relative h-16 w-16 overflow-hidden rounded-full border border-amber-200 py-4 text-2xl font-semibold uppercase tracking-widest transition-all ${
                className ?? ''
            } ${
                isProcessing
                    ? 'pointer-events-none bg-amber-200 text-zinc-800'
                    : 'text-amber-200 hover:bg-amber-200 hover:text-zinc-800 '
            }`}
            onClick={isProcessing ? undefined : onClick}
            {...btnProps}
        >
            {children}
        </button>
    );
};

const BtnCheckIcon = (props: SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} fill="none" {...props}>
        <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={3}
            d="m4.5 12.75 6 6 9-13.5"
        />
    </svg>
);

export const ActionButton: FC<React.ComponentProps<'button'> & { isProcessing: boolean; downloadLink?: string }> = (
    props
) => {
    const { children, className, isProcessing, downloadLink, onClick, ...btnProps } = props;
    return (
        <BaseActionButton onClick={isProcessing ? undefined : onClick} isProcessing={isProcessing} {...btnProps}>
            <Transition show={!isProcessing && !downloadLink} {...transitionProperties}>
                <PlayIcon className="h-10 w-10 translate-x-[2px]" />
            </Transition>
            <Transition show={isProcessing} {...transitionProperties}>
                <Spinner />
            </Transition>
            <Transition show={!!downloadLink && !isProcessing} {...transitionProperties}>
                <DownloadIcon className={!isProcessing && !!downloadLink && 'svg-animate'} />
            </Transition>
        </BaseActionButton>
    );
};

export const ActionButtonLocal: FC<React.ComponentProps<'button'> & { isProcessing: boolean; finished: boolean }> = (
    props
) => {
    const { children, className, isProcessing, finished, onClick, ...btnProps } = props;
    return (
        <BaseActionButton onClick={isProcessing ? undefined : onClick} isProcessing={isProcessing} {...btnProps}>
            <Transition show={!isProcessing && !finished} {...transitionProperties}>
                <PlayIcon className="h-10 w-10 translate-x-[2px]" />
            </Transition>
            <Transition show={isProcessing} {...transitionProperties}>
                <Spinner />
            </Transition>
            <Transition show={!!finished && !isProcessing} {...transitionProperties}>
                <BtnCheckIcon className={'svg-animate scale-125'} />
            </Transition>
        </BaseActionButton>
    );
};
