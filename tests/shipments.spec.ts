import { test, type Page } from '@playwright/test';
const { LoginPage } = require('../pages/login.page.ts');
const { ShipmentsPage } = require('../pages/shipments.page.ts');

/**
 * Test to verify the table filter functionality on the Shipments page.
 * 
 * @param {Object} param - The test context object.
 * @param {Page} param.page - The Playwright page object.
 */
test('test shipments page table filter @uifilter', async ({ page }: { page: Page }) => {

    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.authenticate();

    const shipmentsPage = new ShipmentsPage(page);
    await shipmentsPage.gotoDefaultTableView();

    await shipmentsPage.changeFilter(["Shipped"], true);

    await shipmentsPage.validateTable("Status", "Shipped");

});