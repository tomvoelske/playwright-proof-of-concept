import { type Locator, type Page } from '@playwright/test';
import { FilterTablesPage } from './filterTables.page';

exports.ShipmentsPage = class ShipmentsPage {

    readonly page: Page;
    readonly pageId: string;
    readonly filterTablesPage: FilterTablesPage;
    readonly shipmentsTableViewButton: Locator;
    readonly tableClassName: string;
    readonly defaultFilters: string[];

    /**
     * Constructs an instance of the ShipmentsPage.
     * 
     * @param {Page} page - The Playwright page object.
     */
    constructor(page: Page) {
        this.page = page;
        this.pageId = "shipments";
        this.filterTablesPage = new FilterTablesPage(page);
        this.shipmentsTableViewButton = page.locator('id=table-switch');
        this.tableClassName = "MuiTableBody-root";
        this.defaultFilters = ["Awaiting Shipment", "Shipping"];
    }

    /**
     * Navigates to the Shipments page.
     * 
     * @returns {Promise<void>} - A promise that resolves when the navigation is complete.
     */
    async goto(): Promise<void> {
        await this.page.goto('https://test.site/shipments');
    }

    /**
     * Navigates to the default table view of the Shipments page.
     * 
     * @returns {Promise<void>} - A promise that resolves when the navigation is complete.
     */
    async gotoDefaultTableView(): Promise<void> {
        await Promise.all([
            this.page.goto('https://test.site/shipments?view=table'),
            this.page.waitForSelector(`.${this.tableClassName}`), // Wait for the table to load, which indicates successful transition to page
            this.page.waitForLoadState("domcontentloaded")
        ]);
    }

    /**
     * Changes the filter on the Shipments page.
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
     * Validates the table data on the Shipments page.
     * 
     * @param {string} header - The header of the table column to validate.
     * @param {string} value - The value to validate in the table column.
     * @returns {Promise<void>} - A promise that resolves when the table data is validated.
     */
    async validateTable(header: string, value: string): Promise<void> {
        await this.filterTablesPage.validateTableData(this.page, header, value);
    }

}