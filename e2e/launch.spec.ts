import { test, expect, _electron as electron, Page, ElectronApplication } from '@playwright/test';

test.describe.serial('App launch', () => {
    let app: ElectronApplication;
    let page: Page;
    test.beforeAll(async () => {
        const testFilePath = `${__dirname}/test-data/frag.docx`;
        app = await electron.launch({ args: ['.', '--no-sandbox'], env: { TEST_FILE_PATH: testFilePath } });
        page = await app.firstWindow();
    });
    test.afterAll(async () => {
        await app.close();
    });

    test('App has correct title', async () => {
        expect(await page.title()).toBe('TranslaTerror');
    });

    test('Initial layout contains no sidebar or files', async () => {
        await expect(page.getByRole('button', { name: 'Remove all' })).not.toBeVisible();
        await expect(page.getByRole('button', { name: 'Add files' })).not.toBeVisible();
        await expect(page.getByTestId('file-tile')).not.toBeVisible();
    });

    test('File can be selected', async () => {
        await page.locator('body').click(); // Triggers file selection
        await expect(page.getByTestId('file-tile')).toBeVisible();
    });

    test('Sidebar is visible', async () => {
        await expect(page.getByRole('button', { name: 'Remove all' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Add files' })).toBeVisible();
    });
});
