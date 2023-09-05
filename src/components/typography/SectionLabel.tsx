import { FC, PropsWithChildren } from 'react';

const SectionLabel: FC<PropsWithChildren> = ({ children }) => {
    return <span className="mb-1 block font-source-sans text-sm text-zinc-400">{children}</span>;
};

export default SectionLabel;
