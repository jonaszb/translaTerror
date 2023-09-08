import { RightArrowIcon } from '../../icons/icons';
import { useDocxContext } from '../../store/DocxContext';

import { FC, Fragment } from 'react';
import { Listbox } from '@headlessui/react';
import { Tooltip } from 'react-tooltip';
import { useSingleFileContext } from '../../store/SingleFileContext';
import SectionLabel from '../typography/SectionLabel';

const LanguageSelect: FC<{
    value: string;
    onChange: (value: string) => void;
    options: string[];
    label: string;
    disabled?: boolean;
}> = (props) => {
    const options = props.options.map((option, i) => {
        return { id: i, value: option, label: option.toUpperCase() };
    });
    const selectedOption = options.find((option) => option.value === props.value);
    const { file } = useSingleFileContext();
    return (
        <div className="relative flex flex-col transition-all">
            <Listbox value={selectedOption?.value} onChange={(option) => props.onChange(option)}>
                <Listbox.Label className="hidden text-center font-thin text-amber-50">{props.label}</Listbox.Label>
                <Listbox.Button
                    data-tooltip-id={`${file.name}-${props.label}`}
                    data-tooltip-content={`${props.label} language`}
                    data-tooltip-delay-show={1000}
                    aria-disabled={props.disabled}
                    className="h-10 w-20 cursor-pointer rounded-full bg-transparent bg-zinc-700 text-sm font-bold tracking-widest text-amber-50 outline-0 hover:brightness-110"
                >
                    {selectedOption?.label}
                </Listbox.Button>
                <Tooltip id={`${file.name}-${props.label}`} place="top" />
                <Listbox.Options className="absolute top-full z-10 w-full overflow-hidden rounded bg-amber-50">
                    {options.map((option) => (
                        <Listbox.Option key={option.id} value={option.value} as={Fragment}>
                            {({ active }) => (
                                <li
                                    className={`cursor-pointer p-2 font-bold tracking-wide text-zinc-800 ${
                                        active ? 'bg-amber-200' : ''
                                    }`}
                                >
                                    {option.label}
                                </li>
                            )}
                        </Listbox.Option>
                    ))}
                </Listbox.Options>
            </Listbox>
        </div>
    );
};

const LangSelect: FC<React.ComponentProps<'div'> & { disabled?: boolean; noLabel?: boolean }> = ({
    disabled,
    noLabel,
    className,
    ...props
}) => {
    const { fromLang, setFromLang, toLang, setToLang } = useDocxContext();
    return (
        <div {...props}>
            {noLabel || <SectionLabel>Language</SectionLabel>}
            <div
                className={`flex items-center gap-2 ${disabled ? 'pointer-events-none opacity-30' : ''} ${
                    className ?? ''
                }`}
            >
                <LanguageSelect
                    label="Source"
                    value={fromLang}
                    options={['auto', 'no', 'da', 'sv', 'pl', 'en']}
                    onChange={(value) => setFromLang(value)}
                    disabled={disabled}
                />
                <RightArrowIcon className="text-zinc-600" />
                <LanguageSelect
                    label="Target"
                    value={toLang}
                    options={['no', 'da', 'sv', 'pl', 'en']}
                    onChange={(value) => setToLang(value)}
                    disabled={disabled}
                />
            </div>
        </div>
    );
};

export default LangSelect;
