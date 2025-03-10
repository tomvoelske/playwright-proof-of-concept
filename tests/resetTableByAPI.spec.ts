import { test, expect, type Page } from '@playwright/test';
const { LoginPage } = require('../pages/login.page.ts');
const { AssetsPage } = require('../pages/assets.page.ts');
const { LoggersPage } = require('../pages/loggers.page.ts');
const { ShipmentsPage } = require('../pages/shipments.page.ts');
import { checkArrayEquality } from '../utils/checkArrayEquality';

/**
 * Before each test, navigate to the login page and authenticate the user.
 * 
 * @param {Object} param - The test context object.
 * @param {Page} param.page - The Playwright page object.
 */
test.beforeEach(async ({ page }: { page: Page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.authenticate();
});

/**
 * Test to reset the table by API call for the Assets page.
 * 
 * @param {Object} param - The test context object.
 * @param {Page} param.page - The Playwright page object.
 */
test('Reset Table By API call - Assets', async ({ page }: { page: Page }) => {
    const assetsPage = new AssetsPage(page);
    await handleTests(assetsPage, ["Container"]);
});

/**
 * Test to reset the table by API call for the Loggers page.
 * 
 * @param {Object} param - The test context object.
 * @param {Page} param.page - The Playwright page object.
 */
test('Reset Table By API call - Loggers', async ({ page }: { page: Page }) => {
    const loggersPage = new LoggersPage(page);
    await handleTests(loggersPage, ["Not paired"]);
});

/**
 * Test to reset the table by API call for the Shipments page.
 * 
 * @param {Object} param - The test context object.
 * @param {Page} param.page - The Playwright page object.
 */
test('Reset Table By API call - Shipments', async ({ page }: { page: Page }) => {
    const shipmentsPage = new ShipmentsPage(page);
    await handleTests(shipmentsPage, ["Closed"]);
});

/**
 * Handles the test logic for resetting the table by API call.
 * 
 * @param {Object} testPageClass - The page class for the test.
 * @param {Function} testPageClass.gotoDefaultTableView - Function to navigate to the default table view.
 * @param {Page} testPageClass.page - The Playwright page object.
 * @param {Function} testPageClass.changeFilter - Function to change the filter on the page.
 * @param {Array<string>} testPageClass.defaultFilters - The default filters for the page.
 * @param {Array<string>} filtersToEnable - The filter options to enable.
 */
async function handleTests(testPageClass: { gotoDefaultTableView: () => Promise<void>, page: Page, changeFilter: (optionsToEnable: string[], negateExistingFilter: boolean) => Promise<void>, defaultFilters: string[], filterTablesPage: any }, filtersToEnable: string[]): Promise<void> {
    await testPageClass.gotoDefaultTableView();

    let authorization: string = "";

    testPageClass.page.on('request', async function (request) {
        if (request.url().includes("filter")) {
            let filterHeaders = await request.allHeaders();
            authorization = filterHeaders['authorization'];
        }
    });

    let timeTaken: number = 0;
    let timeout: number = 40;  // this is in multiples of 250ms, so 40 = 10 seconds

    while (authorization === "") {

        // remains in this loop while waiting for the authorization bearer to be acquired

        if (timeTaken > timeout) {
            break;
        }
        await testPageClass.page.waitForTimeout(250);
        timeTaken++;
        
    }

    expect(authorization, "Authorization bearer acquired from filter request header").not.toEqual("");

    await testPageClass.changeFilter(filtersToEnable, true);
    await testPageClass.filterTablesPage.resetFilterAPI(authorization, testPageClass.page);

    let fullFilters = await testPageClass.filterTablesPage.getListOfActiveFilters(testPageClass.page);
    let activeFilters = fullFilters['active'];
    let expectedFilters = testPageClass.defaultFilters;

    expect(await checkArrayEquality(activeFilters, expectedFilters), "Filters should be returned to their original state").toBeTruthy();
}