import { test, expect, _electron as electron, Page, Locator, ElectronApplication } from '@playwright/test';

test.describe.serial('Audio tile', () => {
    let app: ElectronApplication;
    let page: Page;
    let tile: Locator;
    test.beforeAll(async () => {
        const testFilePath = `${__dirname}/test-data/53s.mp3`;
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

    test('mp3 file name is displayed', async () => {
        await expect(tile.getByRole('heading')).toHaveText('53s');
    });

    test('Available actions are displayed as tabs', async () => {
        const expectedTabs = ['Transcribe'];
        await expect(tile.getByRole('tab')).toHaveText(expectedTabs);
    });

    test('First tab is selected by default', async () => {
        await expect(tile.getByRole('tab').first()).toHaveAttribute('aria-selected', 'true');
    });

    test.describe('Transcribe tab', () => {
        test('Contains "Requirements" section and refresh button', async () => {
            await expect(tile.getByRole('button', { name: 'Check conditions' })).toBeVisible();
            await expect(tile.getByText('Requirements')).toBeVisible();
        });

        test('Contains expected requirements', async () => {
            const expectedRequirements = ['under 90 min'];
            const reqList = tile.getByTestId('requirement-list');
            await expect(reqList.locator('li')).toHaveText(expectedRequirements);
        });

        test('Contains document stats', async () => {
            // Stats should be N/A, becasue the file does not follow the 4 column format
            const charCount = tile.getByTestId('length');
            const estCost = tile.getByTestId('estimated-cost');
            await expect(charCount).toContainText('Length');
            await expect(charCount).toContainText('53s');
            await expect(estCost).toContainText('Estimated cost');
            await expect(estCost).toContainText('$0.01');
        });
    });
});
