import { FC } from 'react';
import { ExclamationTriangle, CheckIcon, RedCrossIcon } from './icons';
import SectionLabel from './typography/SectionLabel';

const Condition = ({ isMet, title, mandatory }: { isMet: boolean; title: string; mandatory: boolean }) => {
    const FailureIndicator = mandatory ? RedCrossIcon : ExclamationTriangle;
    return (
        <li className={`flex w-1/2 items-center py-1`}>
            {isMet ? <CheckIcon /> : <FailureIndicator />}
            <span className="ml-1.5 gap-2 font-source-sans text-zinc-400">{title}</span>
        </li>
    );
};

const Checklist: FC<
    React.ComponentProps<'div'> & { conditions: { isMet: boolean; title: string; mandatory: boolean }[] }
> = ({ conditions, ...props }) => {
    return (
        <div {...props}>
            <SectionLabel>Requirements</SectionLabel>
            <ul className="flex max-h-[82px] w-full flex-col flex-wrap rounded border border-zinc-700 px-3 py-2 shadow-inner">
                {conditions.map((condition, i) => (
                    <Condition key={i} {...condition} />
                ))}
            </ul>
        </div>
    );
};

export default Checklist;
