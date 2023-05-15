import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import { FileItem } from '../../types';
import { ipcRenderer } from 'electron';
import NoFilesScreen from './NoFilesScreen';

jest.mock(
    'electron',
    () => {
        const mElectron = { ipcRenderer: { on: jest.fn(), send: jest.fn() } };
        return mElectron;
    },
    { virtual: true }
);

describe('Checkbox', () => {
    test('Contains the logo', async () => {
        const result = render(<NoFilesScreen />);
        const logo = await result.findByTestId('logo');
        expect(logo).toBeInTheDocument();
    });

    test('Button triggers the ipcRenderer.send function', async () => {
        const result = render(<NoFilesScreen />);
        const btn = await result.findByRole('button');
        btn.click();
        expect(ipcRenderer.send).toHaveBeenCalled();
        expect(ipcRenderer.send).toHaveBeenCalledWith('addFiles');
    });
});

type CtxProps = {
    files: FileItem[];
    setFiles: (files: FileItem[]) => void;
    filesByExtension: Record<string, FileItem[]>;
};
