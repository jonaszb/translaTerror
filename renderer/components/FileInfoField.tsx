import { FC } from 'react';

const FileInfo: FC<{ label: string; value: string; currency?: string }> = ({ label, value, currency }) => {
    return (
        <div className="flex flex-col font-source-sans">
            <span className="text-xs text-zinc-300">{label}</span>
            <div className=" flex h-[36px] text-zinc-400">
                {currency && <span className="mr-px mt-[3px]">{currency}</span>}
                <span className="text-3xl font-light ">{value}</span>
            </div>
        </div>
    );
};

export default FileInfo;
