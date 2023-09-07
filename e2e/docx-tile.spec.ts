import { test, expect, _electron as electron, Page, Locator, ElectronApplication } from '@playwright/test';

test.describe.serial('Docx tile', () => {
    let app: ElectronApplication;
    let page: Page;
    let tile: Locator;
    test.beforeAll(async () => {
        const testFilePath = `${__dirname}/test-data/macbeth.docx`;
        app = await electron.launch({
            args: ['.', '--no-sandbox'],
            env: { ...process.env, TEST_FILE_PATH: testFilePath },
        });
        page = await app.firstWindow();
        await page.locator('body').click(); // Triggers file selection
        tile = page.getByTestId('file-tile');
    });
    test.afterAll(async () => {
        await app.close();
    });

    test('Docx file name is displayed', async () => {
        await expect(tile.getByRole('heading')).toHaveText('macbeth');
    });

    test('Available actions are displayed as tabs', async () => {
        const expectedTabs = ['Translate', 'To mxliff', 'Fragment', 'Bookmark'];
        await expect(tile.getByRole('tab')).toHaveText(expectedTabs);
    });

    test('First tab is selected by default', async () => {
        await expect(tile.getByRole('tab').first()).toHaveAttribute('aria-selected', 'true');
    });

    test.describe('Translate tab', () => {
        test('Contains "Requirements" section and refresh button', async () => {
            await expect(tile.getByRole('button', { name: 'Check conditions' })).toBeVisible();
            await expect(tile.getByText('Requirements')).toBeVisible();
        });

        test('Contains expected requirements', async () => {
            const expectedRequirements = ['Single table', '4 columns', '< 500 000 chars'];
            const reqList = tile.getByTestId('requirement-list');
            await expect(reqList.locator('li')).toHaveText(expectedRequirements);
        });

        test('Contains language dropdowns', async () => {
            const languages = ['NO', 'DA', 'SV', 'PL', 'EN'];
            const source = tile.getByLabel('Source').first();
            const target = tile.getByLabel('Target').first();
            await expect(source).toBeVisible();
            await expect(target).toBeVisible();
            await source.click();
            const sourceListItems = tile.getByRole('listbox', { name: 'Source' }).locator('li');
            await expect.soft(sourceListItems).toHaveText(['AUTO', ...languages]);
            await target.click();
            const targetListItems = tile.getByRole('listbox', { name: 'Target' }).locator('li');
            await expect.soft(targetListItems).toHaveText(languages);
            await target.click();
        });

        test('Contains document stats', async () => {
            // Stats should be N/A, becasue the file does not follow the 4 column format
            const charCount = tile.getByTestId('character-count');
            const estCost = tile.getByTestId('estimated-cost');
            await expect(charCount).toContainText('Character count');
            await expect(charCount).toContainText('N/A');
            await expect(estCost).toContainText('Estimated cost');
            await expect(estCost).toContainText('N/A');
        });
    });

    test.describe('To mxliff tab', () => {
        test('Can select "To mxliff" tab', async () => {
            const mxliffTab = tile.getByRole('tab', { name: 'To mxliff' });
            await mxliffTab.click();
            await expect(mxliffTab).toHaveAttribute('aria-selected', 'true');
        });

        test('Contains "Requirements" section and refresh button', async () => {
            await expect(tile.getByRole('button', { name: 'Check conditions' })).toBeVisible();
            await expect(tile.getByText('Requirements')).toBeVisible();
        });

        test('Contains expected requirements', async () => {
            const expectedRequirements = ['Single table', '5 columns', '< 500 000 chars'];
            const reqList = tile.getByTestId('requirement-list');
            await expect(reqList.locator('li')).toHaveText(expectedRequirements);
        });

        test('Contains "Target file" button', async () => {
            await expect(tile.getByText('Target file')).toBeVisible();
            // No file selected by default
            await expect(tile.getByRole('button', { name: 'Click to select' })).toBeVisible();
        });

        test('Contains document character count', async () => {
            // Count should be N/A, becasue the file does not follow the 5 column format
            const charCount = tile.getByTestId('character-count');
            await expect(charCount).toContainText('Character count');
            await expect(charCount).toContainText('N/A');
        });
    });

    test.describe('Fragment tab', () => {
        test('Can select "Fragment" tab', async () => {
            const mxliffTab = tile.getByRole('tab', { name: 'Fragment' });
            await mxliffTab.click();
            await expect(mxliffTab).toHaveAttribute('aria-selected', 'true');
        });

        test('Contains "Requirements" section and refresh button', async () => {
            await expect(tile.getByRole('button', { name: 'Check conditions' })).toBeVisible();
            await expect(tile.getByText('Requirements')).toBeVisible();
        });

        test('Contains expected requirements', async () => {
            const expectedRequirements = ['> 500 chars', '< 500 000 chars'];
            const reqList = tile.getByTestId('requirement-list');
            await expect(reqList.locator('li')).toHaveText(expectedRequirements);
        });

        test('Contains "Translate" button (deselected by default)', async () => {
            const translateInput = tile.getByLabel('Translate');
            await expect(translateInput).not.toBeChecked();
        });

        test('Contains document character count', async () => {
            // Count should be N/A, becasue the file does not follow the 5 column format
            const charCount = tile.getByTestId('character-count');
            await expect(charCount).toContainText('Character count');
            await expect(charCount).toContainText('96 796');
        });

        test('Estimated cost should not be displayed if not translating', async () => {
            const estCost = tile.getByTestId('estimated-cost');
            await expect(estCost).not.toBeVisible();
        });

        test('Language select fields are disabled', async () => {
            const source = tile.getByLabel('Source').first();
            const target = tile.getByLabel('Target').first();
            await expect(source).toBeDisabled();
            await expect(target).toBeDisabled();
        });

        test('Translation can be enabled', async () => {
            const translateInput = tile.locator('label', { hasText: 'Translate' });
            await translateInput.click();
            const source = tile.getByLabel('Source').first();
            const target = tile.getByLabel('Target').first();
            await expect(source).toBeEnabled();
            await expect(target).toBeEnabled();
        });

        test('Estimated cost should be displayed if translating', async () => {
            const estCost = tile.getByTestId('estimated-cost');
            await expect(estCost).toBeVisible();
            await expect(estCost).toContainText('$1.94');
        });
    });
});
