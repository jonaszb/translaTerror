import { FC, SVGProps } from 'react';
import { Transition } from '@headlessui/react';
import { DownloadIcon, PlayIcon, Spinner } from '../icons/icons';
import { useAccKeyContext } from '../store/AccKeyContext';

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

const PadlockIcon = (props: SVGProps<SVGSVGElement>) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path
            d="M16.5 10.5V6.75C16.5 4.26472 14.4853 2.25 12 2.25C9.51472 2.25 7.5 4.26472 7.5 6.75V10.5M6.75 21.75H17.25C18.4926 21.75 19.5 20.7426 19.5 19.5V12.75C19.5 11.5074 18.4926 10.5 17.25 10.5H6.75C5.50736 10.5 4.5 11.5074 4.5 12.75V19.5C4.5 20.7426 5.50736 21.75 6.75 21.75Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

export const ActionButton: FC<React.ComponentProps<'button'> & { isProcessing: boolean; downloadLink?: string }> = (
    props
) => {
    const { children, className, isProcessing, downloadLink, onClick, ...btnProps } = props;
    const { hasValidKey } = useAccKeyContext();
    return hasValidKey ? (
        <BaseActionButton onClick={isProcessing ? undefined : onClick} isProcessing={isProcessing} {...btnProps}>
            <Transition show={!isProcessing && !downloadLink} {...transitionProperties}>
                <PlayIcon className="h-10 w-10 translate-x-[2px]" />
            </Transition>
            <Transition show={isProcessing} {...transitionProperties}>
                <Spinner />
            </Transition>
            <Transition show={!!downloadLink && !isProcessing} {...transitionProperties}>
                <DownloadIcon className={!isProcessing && !!downloadLink ? 'svg-animate' : undefined} />
            </Transition>
        </BaseActionButton>
    ) : (
        <BaseActionButton isProcessing={false} disabled className="pointer-events-none opacity-60">
            <PadlockIcon className="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2" />
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
