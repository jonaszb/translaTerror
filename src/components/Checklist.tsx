import { FC, useMemo } from 'react';
import { ExclamationTriangle, CheckIcon, CrossIcon, SpinnerSmall, RefreshIcon } from '../icons/icons';
import SectionLabel from './typography/SectionLabel';
import { useDocxContext } from '../store/DocxContext';

const Condition = ({
    isMet,
    isEvaluating,
    title,
    mandatory,
}: {
    isMet: boolean;
    isEvaluating: boolean;
    title: string;
    mandatory: boolean;
}) => {
    const FailureIndicator = useMemo(() => {
        if (isEvaluating) return SpinnerSmall;
        return mandatory ? CrossIcon : ExclamationTriangle;
    }, [isEvaluating]);
    return (
        <li className={`flex w-1/2 items-center py-1`}>
            {isMet && !isEvaluating ? (
                <CheckIcon className="w-3.5" />
            ) : (
                <FailureIndicator className="w-3.5 stroke-red-400" />
            )}
            <span className="ml-1.5 gap-2 font-source-sans text-zinc-400">{title}</span>
        </li>
    );
};

const Checklist: FC<
    React.ComponentProps<'div'> & { conditions: { isMet: boolean; title: string; mandatory: boolean }[] }
> = ({ conditions, ...props }) => {
    const { isEvaluatingConditions, evaluateConditions } = useDocxContext();
    return (
        <div {...props}>
            <div className="relative">
                <SectionLabel>Requirements</SectionLabel>
                <ul className="flex max-h-[82px] w-full flex-col flex-wrap rounded border border-zinc-700 px-3 py-2 shadow-inner">
                    {conditions.map((condition, i) => (
                        <Condition key={i} {...condition} isEvaluating={isEvaluatingConditions} />
                    ))}
                </ul>
                <button className="absolute right-1 top-0.5 text-zinc-400" onClick={evaluateConditions}>
                    <RefreshIcon className={`h-4 w-4 ${isEvaluatingConditions ? 'animate-spin' : ''}`} />
                </button>
            </div>
        </div>
    );
};

export default Checklist;
