import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import ActionTabs from './ActionTabs';
import SingleFileContextProvider from '../store/SingleFileContext';

const props = {
    tabs: ['Translate', 'To mxliff'],
    selectedIndex: 0,
    changeHandler: () => null,
};

const file = {
    path: 'some/path/file.docx',
    name: 'file',
    extension: 'docx',
};

describe('ActionTabs', () => {
    test('Renders tabs based on props (single tab)', async () => {
        const result = render(
            <SingleFileContextProvider file={file}>
                <ActionTabs {...props} tabs={['Translate']} />
            </SingleFileContextProvider>
        );
        const tab = await result.findByRole('tab');
        expect(tab).toBeInTheDocument();
        expect(tab).toHaveTextContent('Translate');
    });

    test('Renders tabs based on props (multiple tabs)', async () => {
        const result = render(
            <SingleFileContextProvider file={file}>
                <ActionTabs {...props} />
            </SingleFileContextProvider>
        );
        const tabs = await result.findAllByRole('tab');
        expect(tabs.length).toEqual(2);
        expect(tabs[0]).toHaveTextContent('Translate');
        expect(tabs[1]).toHaveTextContent('To mxliff');
    });

    test('Tab is selected based on prop (first)', async () => {
        const result = render(
            <SingleFileContextProvider file={file}>
                <ActionTabs {...props} />
            </SingleFileContextProvider>
        );
        const tab = await result.findByRole('tab', { selected: true });
        expect(tab).toHaveTextContent('Translate');
    });

    test('Tab is selected based on prop (second)', async () => {
        const result = render(
            <SingleFileContextProvider file={file}>
                <ActionTabs {...props} selectedIndex={1} />
            </SingleFileContextProvider>
        );
        const tab = await result.findByRole('tab', { selected: true });
        expect(tab).toHaveTextContent('To mxliff');
    });

    test('changeHandler is called when tab is clicked', async () => {
        const changeHandler = jest.fn();
        const result = render(
            <SingleFileContextProvider file={file}>
                <ActionTabs {...props} selectedIndex={1} changeHandler={changeHandler} />
            </SingleFileContextProvider>
        );
        const tab = await result.findAllByRole('tab');
        tab[0].click();
        expect(changeHandler).toHaveBeenCalledTimes(1);
        expect(changeHandler).toHaveBeenCalledWith(0);
    });
});
