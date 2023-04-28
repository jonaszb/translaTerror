import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import { FC } from 'react';
import FilesContextProvider from '../store/FilesContext';
import { FileItem } from '../types';
import Sidebar from './Sidebar';
import { ipcRenderer } from 'electron';

const ctxProps = {
    files: [],
    setFiles: () => null,
    filesByExtension: {},
};

const SidebarWithCtx: FC<{ ctxProps: CtxProps }> = ({ ctxProps }) => {
    return (
        <FilesContextProvider value={ctxProps}>
            <Sidebar />
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

describe('Sidebar', () => {
    test('Contains the logo', async () => {
        const result = render(<SidebarWithCtx ctxProps={ctxProps} />);
        const logo = await result.findByTestId('logo-round');
        expect(logo).toBeInTheDocument();
    });

    test('Contains the "remove" button', async () => {
        const result = render(<SidebarWithCtx ctxProps={ctxProps} />);
        const btns = await result.findAllByRole('button');
        expect(btns[0]).toBeInTheDocument();
        expect(btns[0]).toHaveProperty('name', 'Remove all');
    });

    test('"remove" button contains the bin icon', async () => {
        const result = render(<SidebarWithCtx ctxProps={ctxProps} />);
        const icon = await result.findByTestId('bin-icon');
        expect(icon).toBeInTheDocument();
    });

    test('Contains the "add" button', async () => {
        const result = render(<SidebarWithCtx ctxProps={ctxProps} />);
        const btns = await result.findAllByRole('button');
        expect(btns[1]).toBeInTheDocument();
        expect(btns[1]).toHaveProperty('name', 'Add files');
    });

    test('"add" button contains the plus icon', async () => {
        const result = render(<SidebarWithCtx ctxProps={ctxProps} />);
        const icon = await result.findByTestId('plus-icon');
        expect(icon).toBeInTheDocument();
    });

    test('"Remove" button triggers the setFiles function', async () => {
        const setFiles = jest.fn();
        const result = render(<SidebarWithCtx ctxProps={{ ...ctxProps, setFiles }} />);
        const btn = await result.findAllByRole('button');
        btn[0].click();
        expect(setFiles).toHaveBeenCalled();
        expect(setFiles).toHaveBeenCalledWith([]);
    });

    test('"Add" button triggers the ipcRenderer.send function', async () => {
        const result = render(<SidebarWithCtx ctxProps={ctxProps} />);
        const btn = await result.findAllByRole('button');
        btn[1].click();
        expect(ipcRenderer.send).toHaveBeenCalled();
        expect(ipcRenderer.send).toHaveBeenCalledWith('addFiles');
    });

    test('Sidebar is hidden if no files are found', async () => {
        const result = render(<SidebarWithCtx ctxProps={ctxProps} />);
        const sidebar = await result.findByTestId('sidebar');
        expect(sidebar).toHaveClass('-translate-x-20');
    });

    test('Sidebar is visible if files are found', async () => {
        const result = render(
            <SidebarWithCtx
                ctxProps={{ ...ctxProps, files: [{ path: 'some/path.docx', name: 'path', extension: 'docx' }] }}
            />
        );
        const sidebar = await result.findByTestId('sidebar');
        expect(sidebar).not.toHaveClass('-translate-x-20');
    });
});

type CtxProps = {
    files: FileItem[];
    setFiles: (files: FileItem[]) => void;
    filesByExtension: Record<string, FileItem[]>;
};
