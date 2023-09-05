import { test, expect, _electron as electron } from '@playwright/test';

test('App has correct title', async () => {
    const app = await electron.launch({ args: ['.', '--no-sandbox'] });
    const page = await app.firstWindow();
    expect(await page.title()).toBe('TranslaTerror');
});
