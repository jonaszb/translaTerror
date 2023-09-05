import { FC } from 'react';

const FileInfo: FC<{ label: string; value: string; currency?: string; annotation?: string }> = ({
    label,
    value,
    currency,
    annotation,
}) => {
    return (
        <div className="flex w-1/2 flex-col font-source-sans">
            <span className="whitespace-nowrap text-xs text-zinc-300">{label}</span>
            <div className=" flex h-[36px] text-zinc-400">
                {currency && <span className="mr-px mt-[3px]">{currency}</span>}
                <span className="whitespace-nowrap text-3xl font-light">{value}</span>
                {annotation && <span className="ml-1.5 mt-[2px]">{annotation}</span>}
            </div>
        </div>
    );
};

export default FileInfo;
