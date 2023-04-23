import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import { Checkbox } from './Checkbox';

const props = {
    id: 'checkbox',
    checked: false,
    onChange: () => null,
};

describe('Checkbox', () => {
    test('Is rendered', async () => {
        const result = render(<Checkbox {...props} />);
        const checkbox = await result.findByRole('checkbox');
        expect(checkbox).toBeInTheDocument();
    });

    test('Is not checked by default', async () => {
        const result = render(<Checkbox {...props} />);
        const checkbox = await result.findByRole('checkbox');
        expect(checkbox).not.toBeChecked();
    });

    test('Is checked when prop is set', async () => {
        const result = render(<Checkbox {...props} checked={true} />);
        const checkbox = await result.findByRole('checkbox');
        expect(checkbox).toBeChecked();
    });

    test('onChange is called when clicked (not checked)', async () => {
        const onChange = jest.fn();
        const result = render(<Checkbox {...props} onChange={onChange} />);
        const checkbox = await result.findByRole('checkbox');
        checkbox.click();
        expect(onChange).toHaveBeenCalled();
    });

    test('onChange is called when clicked (checked)', async () => {
        const onChange = jest.fn();
        const result = render(<Checkbox {...props} onChange={onChange} checked={true} />);
        const checkbox = await result.findByRole('checkbox');
        checkbox.click();
        expect(onChange).toHaveBeenCalled();
    });
});
