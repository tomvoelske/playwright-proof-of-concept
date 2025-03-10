import { type Locator, type Page } from '@playwright/test';
import { FilterTablesPage } from './filterTables.page';

exports.AssetsPage = class AssetsPage {

    readonly page: Page;
    readonly pageId: string;
    readonly filterTablesPage: FilterTablesPage;
    readonly assetsTableViewButton: Locator;
    readonly assetsTableContainerButton: Locator;
    readonly tableClassName: string;
    readonly defaultFilters: string[];

    /**
     * Constructs an instance of the AssetsPage.
     * 
     * @param {Page} page - The Playwright page object.
     */
    constructor(page: Page) {
        this.page = page;
        this.pageId = "assets";
        this.filterTablesPage = new FilterTablesPage(page);
        this.assetsTableViewButton = page.locator('id=table-switch');
        this.assetsTableContainerButton = page.getByTestId('CONTAINER').getByRole("checkbox");
        this.tableClassName = "MuiTableBody-root";
        this.defaultFilters = ["Logged"];
    }

    /**
     * Navigates to the Assets page.
     * 
     * @returns {Promise<void>} - A promise that resolves when the navigation is complete.
     */
    async goto(): Promise<void> {
        await this.page.goto('https://test.site/assets');
    }

    /**
     * Navigates to the default table view of the Assets page.
     * 
     * @returns {Promise<void>} - A promise that resolves when the navigation is complete.
     */
    async gotoDefaultTableView(): Promise<void> {
        await Promise.all([
            this.page.goto('https://test.site/assets?view=table'),
            this.page.waitForSelector(`.${this.tableClassName}`), // Wait for the table to load, which indicates successful transition to page
            this.page.waitForLoadState("domcontentloaded")
        ]);
    }

    /**
     * Changes the filter on the Assets page.
     * 
     * @param {string[]} optionsToEnable - The filter options to enable.
     * @param {boolean} negateExistingFilter - Whether to negate the existing filter.
     * @returns {Promise<void>} - A promise that resolves when the filter is changed.
     */
    async changeFilter(optionsToEnable: string[], negateExistingFilter: boolean): Promise<void> {
        if (negateExistingFilter) {
            await this.filterTablesPage.deselectAllFilterOptionsUI(this.page);
        }
        await this.filterTablesPage.enableFilterOptions(this.page, optionsToEnable);
    }

    /**
     * Validates the table data on the Assets page.
     * 
     * @param {string} header - The header of the table column to validate.
     * @param {string} value - The value to validate in the table column.
     * @returns {Promise<void>} - A promise that resolves when the table data is validated.
     */
    async validateTable(header: string, value: string): Promise<void> {
        await this.filterTablesPage.validateTableData(this.page, header, value);
    }

}