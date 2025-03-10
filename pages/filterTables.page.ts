import { type Page, expect } from '@playwright/test';

type FilterStatus = {
    active: string[];
    inactive: string[];
    [key: string]: string[] | boolean;
};

export class FilterTablesPage {

    // class to handle all filter table-related functionality

    readonly page: Page;

    /**
     * Constructs an instance of the FilterTables Page.
     * 
     * @param {Page} page - The Playwright page object.
     */
    constructor(page: Page) {
        this.page = page;
    }

    /**
     * Negates all active filters on the page.
     * 
     * @param {Page} page - The Playwright page object.
     * @returns {Promise<void>} - A promise that resolves when all active filters are negated.
     */
    async deselectAllFilterOptionsUI(page: Page): Promise<void> {
    
        // wait for filter to appear
        await this.waitForFiltersToPopulate(page);
    
        // Get all checkbox elements
        const checkboxes = page.locator('input[type="checkbox"]');
    
        // the pageSummary variable here will capture the penultimate page summary so that we can measure to see whether it changes in the end
        let oldPageSummaryText: string = "";
    
        for (let i = 0; i < await checkboxes.count(); i++) {
            let checkbox = checkboxes.nth(i);
            let checked = await checkbox.isChecked();
    
            if (checked) {
                oldPageSummaryText = await this.getTableSummaryText(page);
                await checkbox.click();
            }
        }
    
        await this.waitForTableSummaryTextChange(page, oldPageSummaryText);
    }

    /**
     * Enables filter options on the page.
     * 
     * @param {Page} page - The Playwright page object.
     * @param {string[]} options - The filter options to enable.
     * @returns {Promise<void>} - A promise that resolves when the filter options are enabled.
     */
    async enableFilterOptions(page: Page, options: string[]): Promise<void> {
    
        if (options.length === 0) {
            return;
        }
    
        // makes it case-insensitive
        options = options.map(e => e.toLowerCase());
    
        // wait for filter to appear
        await this.waitForFiltersToPopulate(page);
    
        // Get all checkbox elements
        const checkboxes = page.locator('input[type="checkbox"]');
        let checkboxText: string;
    
        // the pageSummary variable here will capture the penultimate page summary so that we can measure to see whether it changes in the end
        let oldPageSummaryText: string = "";
    
        for (let i = 0; i < await checkboxes.count(); i++) {
            let checkbox = checkboxes.nth(i);
            // trying to get text of the line from either most recent parent or the one above that
            checkboxText = await checkbox.evaluate(node => node.parentElement?.innerText || '');
            if (checkboxText === '') {
                checkboxText = await checkbox.evaluate(node => node.parentElement?.parentElement?.innerText || '');
            }
            checkboxText = checkboxText.toLowerCase();  // to match the case-insensitivity of the options provided
    
            let checked = await checkbox.isChecked();
    
            if (options.includes(checkboxText) && !checked) {
                oldPageSummaryText = await this.getTableSummaryText(page);
                await checkbox.click();
            }
    
        }
    
        await this.waitForTableSummaryTextChange(page, oldPageSummaryText);
    
    }

    /**
     * Retrieves the list of active and inactive filters on the page.
     * 
     * @param {Page} page - The Playwright page object.
     * @returns {Promise<FilterStatus>} - A promise that resolves to an object containing the active and inactive filters.
     */
    async getListOfActiveFilters(page: Page): Promise<FilterStatus> {
    
        let filterStatus: FilterStatus = {
            'active': [],
            'inactive': []
        }
    
        // Get all checkbox elements
        const checkboxes = page.locator('input[type="checkbox"]');
        let checkboxText: string;
    
        for (let i = 0; i < await checkboxes.count(); i++) {
    
            let checkbox = checkboxes.nth(i);
            // trying to get text of the line from either most recent parent or the one above that
            checkboxText = await checkbox.evaluate(node => node.parentElement?.innerText || '');
            if (checkboxText === '') {
                checkboxText = await checkbox.evaluate(node => node.parentElement?.parentElement?.innerText || '');
            }
            checkboxText = checkboxText.toLowerCase();  // to match the case-insensitivity of the options provided
    
            let checked = await checkbox.isChecked();
    
            if (checked) {
                filterStatus['active'].push(checkboxText);
            } else {
                filterStatus['inactive'].push(checkboxText);
            }
    
            filterStatus[checkboxText] = checked;
    
        }
    
        return filterStatus;
    
    }

    /**
     * Resets the filter via an API call.
     * 
     * @param {string} authorization - The authorization token.
     * @param {Page} page - The Playwright page object.
     * @returns {Promise<void>} - A promise that resolves when the filter is reset.
     */
    async resetFilterAPI(authorization: string, page: Page): Promise<void> {
    
        const resetFilterURL: string = "https://test.site/filter";
    
        const headersObject = {
            'Authorization': `${authorization}`,
            'content-type': 'application/json'
        }
    
        const payload = {
            "value": ""
        }
    
        let response = await page.request.post(resetFilterURL, {
            headers: headersObject,
            data: payload
        });
    
        await expect(response, "Reset filter via API call should be responsive").toBeOK();
        
    }

    /**
     * Waits for the filter options to populate on the page.
     * 
     * @param {Page} page - The Playwright page object.
     * @returns {Promise<void>} - A promise that resolves when the filter options are populated.
     */
    async waitForFiltersToPopulate(page: Page): Promise<void> {
    
        let numberOfCheckboxes: number = 0;
    
        let timeTaken = 0;
        let timeout = 8;  // this is in multiples of 250ms, so 8 = 2 seconds
    
        while (numberOfCheckboxes === 0) {
    
            if (timeTaken > timeout) {
                break;
            }
    
            const checkboxes = page.locator('input[type="checkbox"]');
            numberOfCheckboxes = await checkboxes.count();
    
            if (numberOfCheckboxes === 0) {
    
                await page.waitForTimeout(250);
                timeTaken++;
    
            }
    
        }
    
        expect(numberOfCheckboxes, "Filter options should load").toBeGreaterThan(0);
    
    }

    /**
     * Waits for the table summary text to change.
     * 
     * @param {Page} page - The Playwright page object.
     * @param {string} oldPageSummaryText - The old table summary text.
     * @returns {Promise<void>} - A promise that resolves when the table summary text changes or the timeout is reached.
     */
    async waitForTableSummaryTextChange(page: Page, oldPageSummaryText: string): Promise<void> {

        let newPageSummaryText: string = oldPageSummaryText;  // assigns to the same to begin with, as we want to "release" the function when it changes

        // waits for either the summary text in the bottom right to change, or 2 seconds - whichever is sooner

        let timeTaken: number = 0;
        let timeout: number = 20;  // this is in multiples of 100ms, so 20 = 2 seconds

        while (oldPageSummaryText === newPageSummaryText) {

            if (timeTaken > timeout) {
                break;
            }

            await page.waitForTimeout(100);
            newPageSummaryText = await this.getTableSummaryText(page);

            timeTaken++;

        }

        // note that it is not necessarily the case that this not changing implies an error - it could be that the filter doesn't change the count, or that the count is the same as before
        // thus we have two scenarios: one where the count changes, and the function will quickly release the process, and the other where it doesn't, so it just gets slowed down
        // there may be a better approach based on reading the expected changes on the lines themselves

    }

    /**
     * Retrieves the table summary text from the page.
     * 
     * @param {Page} page - The Playwright page object.
     * @returns {Promise<string>} - A promise that resolves to the table summary text.
     */
    async getTableSummaryText(page: Page): Promise<string> {

        let pageSummary: string = "Not loaded yet";
        let timeTaken: number = 0;
        let timeout: number = 10;  // this is in multiples of 250ms, so 10 = 2.5 seconds

        while (pageSummary === "Not loaded yet") {

            await page.waitForTimeout(250);
            timeTaken++;

            if (timeTaken > timeout) {
                break;
            }

            // the pagination panel on all pages is in this format
            const element = page.locator('text=Showing ');
            if (await element.count() === 0) {
                pageSummary = "Not loaded yet";
                continue;
            }

            const parentElement = element.locator('..'); // Navigate to the parent element to capture the whole text (i.e. - with the count too, as that will be the part that changes as you change the filters)
            pageSummary = await parentElement.evaluate(node => (node as HTMLElement).innerText || 'Not loaded yet');

            if (pageSummary != "Not loaded yet") {
                return pageSummary;
            }

        }

        // can add some failure condition here, only gets here if it never loads - or, if the count doesn't change. Would add extra processing here.

        return pageSummary;

    }

    /**
     * Validates the table data on the page.
     * 
     * @param {Page} page - The Playwright page object.
     * @param {string} header - The header of the table column to validate.
     * @param {string} value - The value to validate in the table column.
     * @returns {Promise<void>} - A promise that resolves when the table data is validated.
     */
    async validateTableData(page: Page, header: string, value: string): Promise<void> {

        let elementsPresent: boolean = false;
        let timeTaken: number = 0;
        let timeout: number = 10;
        let tableValidationResults: { success: number, failure: number, error: string } = { success: 0, failure: 0, error: 'N/A' };

        // sometimes the table can take awhile to refresh, so the reading loops until the timeout is reached - if no table results are found, or no results match the expected value, the table read will be retried

        while (!elementsPresent) {

            if (timeTaken > timeout) {
                break;
            }

            tableValidationResults = await page.evaluate(async ([header, value]) => {

                let results = {
                    'success': 0,
                    'failure': 0,
                    'error': 'N/A'
                }

                if (document.getElementsByTagName("tr").length === 0) {

                    results['error'] = "Table not found";
                    return results;
                    
                }

                // can pull directly by tags below if it's the sole table on the page

                let tableHeaders = document.getElementsByTagName("th");
                let headerIndex = -1;

                for (let i = 0; i < tableHeaders.length; i++) {

                    if (tableHeaders[i].innerText === header) {
                        headerIndex = i;
                        break;
                    }

                }

                if (headerIndex === -1) {
                    results['error'] = "Header not found";
                    return results;
                }

                let tableBody = document.getElementsByTagName("tr");
                for (let i = 1; i < tableBody.length; i++) { // i = 0 is the header row

                    let relevantRowValue = (tableBody[i].children[headerIndex] as HTMLElement).innerText;
                    if (relevantRowValue === value) {
                        results['success'] = results['success'] + 1;
                    } else {
                        results['failure'] = results['failure'] + 1;
                    }

                }

                return results;

            }, [header, value]);

            if (tableValidationResults['success'] === 0 || tableValidationResults['failure'] > 0 || tableValidationResults['error'] !== 'N/A') {

                // try to load again - chance that the page didn't adjust to the new filter yet
                await page.waitForTimeout(1000);
                timeTaken++;

            } else {

                elementsPresent = true;

            }

        }

        expect(tableValidationResults['error'], `Header ${header} should exist`).toBe("N/A");
        expect(tableValidationResults['success'], "Table should not be empty").toBeGreaterThan(0);
        expect(tableValidationResults['failure'], `All table values should match ${value} under heading ${header} - failure amount should be 0`).toEqual(0);

    }

}