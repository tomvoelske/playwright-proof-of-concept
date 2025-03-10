import { test, type Page } from '@playwright/test';
const { LoginPage } = require('../pages/login.page.ts');
const { LoggersPage } = require('../pages/loggers.page.ts');

/**
 * Test to verify the table filter functionality on the Loggers page.
 * 
 * @param {Object} param - The test context object.
 * @param {Page} param.page - The Playwright page object.
 */
test('test loggers page table filter @uifilter', async ({ page }: { page: Page }) => {

    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.authenticate();

    const loggersPage = new LoggersPage(page);
    await loggersPage.gotoDefaultTableView();

    await loggersPage.changeFilter(["Not Logging"], false);

    await loggersPage.validateTable("Logging Status", "Not Logging");

});