import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import { Selectable } from './Selectable';

const props = {
    id: 'Selectable',
    checked: false,
    onChange: () => null,
};

describe('Selectable', () => {
    test('Is rendered', async () => {
        const result = render(<Selectable {...props} />);
        const elem = await result.findByRole('Selectable');
        expect(elem).toBeInTheDocument();
    });

    test('Is not checked by default', async () => {
        const result = render(<Selectable {...props} />);
        const elem = await result.findByRole('Selectable');
        expect(elem).not.toBeChecked();
    });

    test('Is checked when prop is set', async () => {
        const result = render(<Selectable {...props} checked={true} />);
        const elem = await result.findByRole('Selectable');
        expect(elem).toBeChecked();
    });

    test('onChange is called when clicked (not checked)', async () => {
        const onChange = jest.fn();
        const result = render(<Selectable {...props} onChange={onChange} />);
        const elem = await result.findByRole('Selectable');
        elem.click();
        expect(onChange).toHaveBeenCalled();
    });

    test('onChange is called when clicked (checked)', async () => {
        const onChange = jest.fn();
        const result = render(<Selectable {...props} onChange={onChange} checked={true} />);
        const elem = await result.findByRole('Selectable');
        elem.click();
        expect(onChange).toHaveBeenCalled();
    });
});
