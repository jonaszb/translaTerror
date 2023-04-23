import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import { ActionButton } from './Buttons';

const props = {
    isProcessing: false,
    downloadLink: null,
};

describe('ActionButton', () => {
    test('Is rendered', async () => {
        const result = render(<ActionButton {...props} />);
        const btn = await result.findByRole('button');
        expect(btn).toBeInTheDocument();
    });

    test('Contains Play icon in default state', async () => {
        const result = render(<ActionButton {...props} />);
        const icon = await result.findByTestId('play-icon');
        expect(icon).toBeInTheDocument();
    });

    test('Contains Spinner icon in processing state', async () => {
        const result = render(<ActionButton {...props} isProcessing={true} />);
        const icon = await result.findByTestId('spinner');
        expect(icon).toBeInTheDocument();
    });

    test('Contains Download icon in download state', async () => {
        const result = render(<ActionButton {...props} downloadLink={'some-link'} />);
        const icon = await result.findByTestId('dl-icon');
        expect(icon).toBeInTheDocument();
    });

    test('Can be rendered with custom class', async () => {
        const result = render(<ActionButton {...props} className={'custom-class'} />);
        const btn = await result.findByRole('button');
        expect(btn).toHaveClass('custom-class');
    });
});
