import { FC } from 'react';
import Select from 'react-select';

export const LanguageSelect: FC<{
    value: string;
    onChange: (value: string) => void;
    options: string[];
    label: string;
}> = (props) => {
    const options = props.options.map((option) => {
        return { value: option, label: option.toUpperCase() };
    });
    return (
        <div className="flex w-max flex-col gap-1">
            <label htmlFor={`lang-${props.label}}`} className="text-center font-thin text-amber-50">
                {props.label}
            </label>
            <Select
                id={`lang-${props.label}}`}
                options={options}
                value={options.find((option) => option.value === props.value)}
                onChange={(option) => props.onChange(option.value)}
                classNames={{
                    container: () => 'w-20 h-10 !outline-0',
                    control: () =>
                        '!bg-transparent !cursor-pointer !rounded-full !border-amber-50 hover:!border-amber-200 !border-2',
                    singleValue: () => '!text-amber-50 !text-center !font-bold !text-lg !tracking-wider',
                    indicatorsContainer: () => '!hidden',
                    valueContainer: () => 'text-amber-50 bg-transparent',
                }}
            />
        </div>
    );
};
