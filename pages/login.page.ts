import { expect, type Locator, type Page } from '@playwright/test';

exports.LoginPage = class LoginPage {

    readonly page: Page;
    readonly userNameInput: Locator;
    readonly passwordInput: Locator;
    readonly submitButton: Locator;
    readonly expectedLoginPageTitle: string = "Sign in";
    loginPageTitle: string;

    constructor(page: Page) {
        this.page = page;
        this.userNameInput = page.locator('input[name="username"]');
        this.passwordInput = page.locator('input[name="password"]');
        this.submitButton = page.locator('button[type="submit"]');
    }

    /**
     * Navigates to the login page.
     */
    async goto(): Promise<void> {
        await this.page.goto('https://test.site/login');
    }

    /**
     * Authenticates the user by filling in the username and password and submitting the form.
     * 
     * @throws {Error} If the TEST_USERNAME or TEST_PASSWORD environment variables are not set.
     */
    async authenticate(): Promise<void> {
        await this.page.waitForLoadState('networkidle');
        this.loginPageTitle = await this.page.title();

        if (this.expectedLoginPageTitle.toLowerCase() !== this.loginPageTitle.toLowerCase()) {
            console.log("Already logged in");
            return;
        }

        let username: string = process.env.TEST_USERNAME || '';
        let password: string = process.env.TEST_PASSWORD || '';

        if (username === '' || password === '') {
            throw new Error('Please provide TEST_USERNAME and TEST_PASSWORD environment variables');
        }

        await this.userNameInput.fill(username);
        await this.passwordInput.fill(password);
        await this.submitButton.click();

        // check for successful login state - many different ways of achieving this, but I will use title in this instance
        await this.page.waitForLoadState('domcontentloaded');
        let newTitle: string = await this.page.title();

        expect(newTitle, "Login should be successful").not.toEqual(this.loginPageTitle);
    }

}