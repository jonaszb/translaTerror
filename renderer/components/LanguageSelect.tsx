import { FC, Fragment } from 'react';
import { Listbox } from '@headlessui/react';

export const LanguageSelect: FC<{
    value: string;
    onChange: (value: string) => void;
    options: string[];
    label: string;
}> = (props) => {
    const options = props.options.map((option, i) => {
        return { id: i, value: option, label: option.toUpperCase() };
    });
    const selectedOption = options.find((option) => option.value === props.value);
    return (
        <div className="flex w-max flex-col gap-1">
            <div className="relative flex flex-col">
                <Listbox value={selectedOption.value} onChange={(option) => props.onChange(option)}>
                    <Listbox.Label className="text-center font-thin text-amber-50">{props.label}</Listbox.Label>
                    <Listbox.Button className="h-10 w-20 cursor-pointer rounded-full border-2 border-amber-50 bg-transparent text-lg font-bold tracking-wider text-amber-50 outline-0 hover:border-amber-200">
                        {selectedOption.label}
                    </Listbox.Button>
                    <Listbox.Options className="absolute top-full z-10 w-full rounded bg-amber-50">
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
        </div>
    );
};
