import { FC, PropsWithChildren, SVGProps } from 'react';
import { Tooltip } from 'react-tooltip';
import { Transition } from '@headlessui/react';
import { DownloadIcon, PlayIcon, Spinner } from './icons';

export const RoundButton: FC<
    PropsWithChildren<
        React.ComponentProps<'button'> & {
            tooltipId?: string;
            tooltip?: string;
            Icon: (props: SVGProps<SVGSVGElement>) => JSX.Element;
            danger?: boolean;
        }
    >
> = (props) => {
    const { Icon, tooltip, tooltipId, danger, ...btnProps } = props;
    return (
        <li>
            <button
                {...btnProps}
                data-tooltip-id={tooltipId}
                data-tooltip-content={tooltip}
                data-tooltip-delay-show={1000}
                className={`group flex aspect-square h-12 w-12 items-center justify-center rounded-full border-2 border-amber-200 transition-all disabled:pointer-events-none disabled:border-zinc-400 ${
                    danger ? 'hover:border-red-600 hover:bg-red-600' : 'hover:border-amber-200 hover:bg-amber-200'
                }`}
            >
                <Icon
                    className={`fill-amber-200 stroke-amber-200 transition-all group-hover:scale-125 group-disabled:fill-zinc-400 group-disabled:stroke-zinc-400 ${
                        danger
                            ? 'group-hover:fill-amber-50 group-hover:stroke-amber-50'
                            : 'group-hover:fill-zinc-800 group-hover:stroke-zinc-800'
                    }`}
                />
            </button>
            {tooltip && <Tooltip id={tooltipId} place="right" className="!z-20 !opacity-100" />}
        </li>
    );
};

const transitionProperties = {
    enter: 'transition-all ease-in-out duration-1000',
    enterFrom: 'opacity-0 -translate-x-20',
    enterTo: 'opacity-100',
    leave: 'transition-all ease-in duration-500',
    leaveFrom: 'opacity-100',
    leaveTo: 'opacity-0 translate-x-8',
    className: 'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2',
};

export const ActionButton: FC<
    React.ComponentProps<'button'> & { isProcessing: boolean; downloadLink?: string; btnText: string }
> = (props) => {
    const { children, className, isProcessing, downloadLink, onClick, btnText, ...btnProps } = props;
    return (
        <button
            className={`relative h-16 w-full overflow-hidden rounded-full border border-zinc-700 py-4 text-2xl font-semibold uppercase tracking-widest transition-all disabled:pointer-events-none disabled:opacity-50 ${
                className ?? ''
            } ${
                isProcessing
                    ? 'pointer-events-none bg-amber-200 text-zinc-800'
                    : downloadLink
                    ? 'cursor-pointer bg-amber-200 text-zinc-800'
                    : 'text-amber-200 hover:bg-amber-200 hover:text-zinc-800 '
            }}`}
            onClick={isProcessing ? undefined : onClick}
            {...btnProps}
        >
            <Transition show={!isProcessing && !downloadLink} {...transitionProperties}>
                <PlayIcon className="h-12 w-12" />
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
