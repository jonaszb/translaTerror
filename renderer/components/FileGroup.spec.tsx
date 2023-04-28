import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import { FC } from 'react';
import { FileItem } from '../types';
import FileGroup from './FileGroup';
import FilesContextProvider, { FilesContextProps } from '../store/FilesContext';
import { act } from 'react-dom/test-utils';

const docxFile = { path: '/somedir/file.docx', name: 'file', extension: 'docx', selected: false };
const mxliffFile = { path: '/somedir/phrase.mxliff', name: 'phrase', extension: 'mxliff', selected: false };

const ctxProps = {
    files: [docxFile, mxliffFile],
    setFiles: () => null,
    filesByExtension: {},
};

const elemProps: ElemProps = {
    extension: 'docx',
    files: [docxFile],
};

const GroupWithCtx: FC<{ ctxProps: FilesContextProps; elemProps: ElemProps }> = ({ ctxProps, elemProps }) => {
    return (
        <FilesContextProvider value={ctxProps}>
            <FileGroup {...elemProps} />
        </FilesContextProvider>
    );
};

jest.mock(
    'electron',
    () => {
        const mElectron = { ipcRenderer: { on: jest.fn(), send: jest.fn() } };
        return mElectron;
    },
    { virtual: true }
);

describe('FileGroup', () => {
    test('Lists files by extension specified by the prop', async () => {
        const result = render(<GroupWithCtx ctxProps={ctxProps} elemProps={elemProps} />);
        const files = await result.findAllByTestId('file-tile');
        expect(files.length).toBe(1);
    });

    test('Can render a list of docx files', async () => {
        const result = render(<GroupWithCtx ctxProps={ctxProps} elemProps={elemProps} />);
        const groups = await result.findAllByTestId('file-group');
        expect(groups.length).toBe(1);
        const fileHeader = await result.findByRole('heading');
        expect(fileHeader).toHaveTextContent(docxFile.name);
    });

    test('Can render a list of mxliff files', async () => {
        const result = render(
            <GroupWithCtx ctxProps={ctxProps} elemProps={{ extension: 'mxliff', files: [mxliffFile] }} />
        );
        const groups = await result.findAllByTestId('file-group');
        expect(groups.length).toBe(1);
        const fileHeader = await result.findByRole('heading');
        expect(fileHeader).toHaveTextContent(mxliffFile.name);
    });

    test('Matchin icon is displayed for the file extension (docx)', async () => {
        const result = render(<GroupWithCtx ctxProps={ctxProps} elemProps={elemProps} />);
        const icon = await result.findByTestId('msword-icon');
        expect(icon).toBeInTheDocument();
    });

    test('Matchin icon is displayed for the file extension (mxliff)', async () => {
        const result = render(
            <GroupWithCtx ctxProps={ctxProps} elemProps={{ extension: 'mxliff', files: [mxliffFile] }} />
        );
        const icon = await result.findByTestId('phrase-icon');
        expect(icon).toBeInTheDocument();
    });

    test('Contains the "select all" button', async () => {
        const result = render(<GroupWithCtx ctxProps={ctxProps} elemProps={elemProps} />);
        const btn = await result.findByTestId('select-all');
        expect(btn).toBeInTheDocument();
    });

    test('"Deselect all" button is not visible if no files are selected', async () => {
        const result = render(<GroupWithCtx ctxProps={ctxProps} elemProps={elemProps} />);
        const btn = result.queryByTestId('deselect-all');
        expect(btn).not.toBeInTheDocument();
    });

    test('"Remove" button is not visible if no files are selected', async () => {
        const result = render(<GroupWithCtx ctxProps={ctxProps} elemProps={elemProps} />);
        const btn = result.queryByTestId('remove-selected');
        expect(btn).not.toBeInTheDocument();
    });

    test.skip('"Select all" button selects all files', async () => {
        const result = render(<GroupWithCtx ctxProps={ctxProps} elemProps={elemProps} />);
        const btn = await result.findByTestId('select-all');
        act(() => btn.click());

        const checkbox = await result.findByRole('checkbox');
        expect(checkbox).toBeChecked();
    });
});

type ElemProps = {
    extension: 'docx' | 'mxliff';
    files: FileItem[];
};
