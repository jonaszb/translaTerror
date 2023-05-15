import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import { FC } from 'react';
import { FileItem } from '../../types';
import SingleFileContextProvider from '../store/SingleFileContext';
import { LanguageSelect } from './LanguageSelect';
import { act } from 'react-dom/test-utils';

const file = { path: '/somedir/file.docx', name: 'file', extension: 'docx' };
const elemProps = { value: 'en', onChange: () => null, options: ['en', 'dk'], label: 'Language' };

const SelectWithCtx: FC<{ file: FileItem; elemProps: SelectProps }> = ({ file, elemProps }) => {
    return (
        <SingleFileContextProvider file={file}>
            <LanguageSelect {...elemProps} />
        </SingleFileContextProvider>
    );
};

describe('Language select', () => {
    test('Contains the label', async () => {
        const result = render(<SelectWithCtx file={file} elemProps={elemProps} />);
        const label = await result.findByText('Language');
        expect(label).toBeInTheDocument();
    });

    test('Contains the button element', async () => {
        const result = render(<SelectWithCtx file={file} elemProps={elemProps} />);
        const select = await result.findByRole('button');
        expect(select).toBeInTheDocument();
    });

    test('No options are rendered when the dropdown is closed', async () => {
        const result = render(<SelectWithCtx file={file} elemProps={elemProps} />);
        const options = result.queryAllByRole('option');
        expect(options).toHaveLength(0);
    });

    test('Listbox is rendered when the dropdown is opened', async () => {
        const result = render(<SelectWithCtx file={file} elemProps={elemProps} />);
        const select = await result.findByRole('button');
        act(() => select.click());
        const listbox = await result.findByRole('listbox');
        expect(listbox).toBeInTheDocument();
    });

    test('Options are rendered when the dropdown is opened', async () => {
        const result = render(<SelectWithCtx file={file} elemProps={elemProps} />);
        const select = await result.findByRole('button');
        act(() => select.click());
        const options = await result.findAllByRole('option');
        expect(options).toHaveLength(2);
    });

    test('Options are rendered with the correct text', async () => {
        const result = render(<SelectWithCtx file={file} elemProps={elemProps} />);
        const select = await result.findByRole('button');
        act(() => select.click());
        const options = await result.findAllByRole('option');
        expect(options[0]).toHaveTextContent('EN');
        expect(options[1]).toHaveTextContent('DK');
    });

    test('The button contains the selected option', async () => {
        const result = render(<SelectWithCtx file={file} elemProps={elemProps} />);
        const select = await result.findByRole('button');
        expect(select).toHaveTextContent('EN');
    });

    test('Selecting a language calls the onChange function', async () => {
        const onChange = jest.fn();
        const result = render(<SelectWithCtx file={file} elemProps={{ ...elemProps, onChange }} />);
        const select = await result.findByRole('button');
        act(() => select.click());
        const options = await result.findAllByRole('option');
        act(() => options[1].click());
        expect(onChange).toHaveBeenCalledWith('dk');
    });
});

type SelectProps = {
    value: string;
    onChange: (value: string) => void;
    options: string[];
    label: string;
};
