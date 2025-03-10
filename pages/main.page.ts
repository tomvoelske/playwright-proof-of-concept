import { type Page } from '@playwright/test';

exports.MainPage = class MainPage {

    readonly page: Page;

    /**
     * Constructs an instance of the MainPage.
     * 
     * @param {Page} page - The Playwright page object.
     */
    constructor(page: Page) {
        this.page = page;
    }

    /**
     * Navigates to the main page.
     * 
     * @returns {Promise<void>} - A promise that resolves when the navigation is complete.
     */
    async goto(): Promise<void> {
        await this.page.goto('https://test.site');
    }

}