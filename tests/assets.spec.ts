import { test, type Page } from '@playwright/test';
const { LoginPage } = require('../pages/login.page.ts');
const { AssetsPage } = require('../pages/assets.page.ts');

/**
 * Test to verify the table filter functionality on the Assets page.
 * 
 * @param {Object} param - The test context object.
 * @param {Page} param.page - The Playwright page object.
 */
test('test assets page table filter @uifilter', async ({ page }: { page: Page }) => {

    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.authenticate();

    const assetsPage = new AssetsPage(page);
    await assetsPage.gotoDefaultTableView();

    await assetsPage.changeFilter(["Box"], false);

    await assetsPage.validateTable("Asset Type", "Box");

});