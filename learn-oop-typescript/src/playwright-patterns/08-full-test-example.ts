export {};
// =============================================================================
// LESSON 8: Full Playwright Test Structure
// =============================================================================
// This shows how a REAL Playwright project is organized using OOP.
// You can't run this without a browser, but it shows the exact patterns
// you'll use in production test suites.
//
// This file is PSEUDOCODE — it demonstrates structure, not runnable tests.
// Look at it as a blueprint for your real Playwright projects.
// =============================================================================

console.log("=== Lesson 8: Full Playwright Test Structure ===\n");
console.log("This lesson shows production-ready Playwright patterns.\n");

// =============================================================================
// FILE: pages/base.page.ts
// =============================================================================
console.log("--- File: pages/base.page.ts ---");
console.log(`
  import { Page, Locator, expect } from '@playwright/test';

  export abstract class BasePage {
    constructor(protected page: Page) {}

    // Every page must declare its path
    abstract readonly path: string;

    // Navigate to this page
    async goto(): Promise<void> {
      await this.page.goto(this.path);
    }

    // Verify we're on the right page
    async verifyURL(): Promise<void> {
      await expect(this.page).toHaveURL(new RegExp(this.path));
    }

    // Common actions available on all pages
    async getTitle(): Promise<string> {
      return await this.page.title();
    }

    // Shared component: header navigation
    get header() {
      return {
        logo: this.page.locator('[data-testid="logo"]'),
        navLinks: this.page.locator('nav a'),
        userMenu: this.page.locator('[data-testid="user-menu"]'),
      };
    }
  }
`);

// =============================================================================
// FILE: pages/login.page.ts
// =============================================================================
console.log("--- File: pages/login.page.ts ---");
console.log(`
  import { Page, Locator } from '@playwright/test';
  import { BasePage } from './base.page';

  export class LoginPage extends BasePage {
    readonly path = '/login';

    // Locators — defined once, used in methods
    private readonly usernameInput: Locator;
    private readonly passwordInput: Locator;
    private readonly submitButton: Locator;
    private readonly errorAlert: Locator;

    constructor(page: Page) {
      super(page);
      // Best practice: use data-testid selectors
      this.usernameInput = page.getByTestId('username-input');
      this.passwordInput = page.getByTestId('password-input');
      this.submitButton = page.getByRole('button', { name: 'Sign In' });
      this.errorAlert = page.getByRole('alert');
    }

    async login(username: string, password: string): Promise<void> {
      await this.usernameInput.fill(username);
      await this.passwordInput.fill(password);
      await this.submitButton.click();
    }

    async getError(): Promise<string> {
      return await this.errorAlert.textContent() ?? '';
    }

    async isErrorVisible(): Promise<boolean> {
      return await this.errorAlert.isVisible();
    }
  }
`);

// =============================================================================
// FILE: pages/dashboard.page.ts
// =============================================================================
console.log("--- File: pages/dashboard.page.ts ---");
console.log(`
  import { Page, Locator } from '@playwright/test';
  import { BasePage } from './base.page';

  export class DashboardPage extends BasePage {
    readonly path = '/dashboard';

    private readonly welcomeText: Locator;
    private readonly bookingCards: Locator;
    private readonly newBookingButton: Locator;

    constructor(page: Page) {
      super(page);
      this.welcomeText = page.getByTestId('welcome-message');
      this.bookingCards = page.getByTestId('booking-card');
      this.newBookingButton = page.getByRole('button', { name: 'New Booking' });
    }

    async getWelcomeMessage(): Promise<string> {
      return await this.welcomeText.textContent() ?? '';
    }

    async getBookingCount(): Promise<number> {
      return await this.bookingCards.count();
    }

    async clickNewBooking(): Promise<void> {
      await this.newBookingButton.click();
    }
  }
`);

// =============================================================================
// FILE: fixtures/test-data.ts
// =============================================================================
console.log("--- File: fixtures/test-data.ts ---");
console.log(`
  export interface TestUser {
    username: string;
    password: string;
    role: 'admin' | 'coach' | 'student';
    expectedWelcome: string;
  }

  export const TEST_USERS: Record<string, TestUser> = {
    admin: {
      username: 'admin@sanches.com',
      password: process.env.ADMIN_PASSWORD ?? 'test-admin-pass',
      role: 'admin',
      expectedWelcome: 'Welcome, Admin',
    },
    coach: {
      username: 'coach@sanches.com',
      password: process.env.COACH_PASSWORD ?? 'test-coach-pass',
      role: 'coach',
      expectedWelcome: 'Welcome, Coach',
    },
    student: {
      username: 'student@sanches.com',
      password: process.env.STUDENT_PASSWORD ?? 'test-student-pass',
      role: 'student',
      expectedWelcome: 'Welcome back',
    },
  };
`);

// =============================================================================
// FILE: tests/login.spec.ts — THE ACTUAL TEST FILE
// =============================================================================
console.log("--- File: tests/login.spec.ts ---");
console.log(`
  import { test, expect } from '@playwright/test';
  import { LoginPage } from '../pages/login.page';
  import { DashboardPage } from '../pages/dashboard.page';
  import { TEST_USERS } from '../fixtures/test-data';

  test.describe('Login Feature', () => {

    test('successful login redirects to dashboard', async ({ page }) => {
      // Arrange: set up page objects
      const loginPage = new LoginPage(page);
      const dashboardPage = new DashboardPage(page);
      const user = TEST_USERS.student;

      // Act: perform login
      await loginPage.goto();
      await loginPage.login(user.username, user.password);

      // Assert: verify we landed on dashboard
      await dashboardPage.verifyURL();
      const welcome = await dashboardPage.getWelcomeMessage();
      expect(welcome).toContain(user.expectedWelcome);
    });

    test('invalid credentials shows error', async ({ page }) => {
      const loginPage = new LoginPage(page);

      await loginPage.goto();
      await loginPage.login('wrong@user.com', 'badpassword');

      expect(await loginPage.isErrorVisible()).toBe(true);
      expect(await loginPage.getError()).toContain('Invalid credentials');
    });

    // Data-driven test: test login for each role
    for (const [role, user] of Object.entries(TEST_USERS)) {
      test(\`\${role} user can log in\`, async ({ page }) => {
        const loginPage = new LoginPage(page);
        const dashboardPage = new DashboardPage(page);

        await loginPage.goto();
        await loginPage.login(user.username, user.password);
        await dashboardPage.verifyURL();

        const welcome = await dashboardPage.getWelcomeMessage();
        expect(welcome).toContain(user.expectedWelcome);
      });
    }
  });
`);

// =============================================================================
// FILE: playwright.config.ts
// =============================================================================
console.log("--- File: playwright.config.ts ---");
console.log(`
  import { defineConfig, devices } from '@playwright/test';

  export default defineConfig({
    testDir: './tests',
    timeout: 30000,
    retries: 2,
    use: {
      baseURL: 'https://staging.sanches-coaching.com',
      screenshot: 'only-on-failure',
      trace: 'retain-on-failure',
    },
    projects: [
      { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
      { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
      { name: 'mobile', use: { ...devices['iPhone 14'] } },
    ],
  });
`);

// =============================================================================
// PROJECT STRUCTURE SUMMARY
// =============================================================================
console.log("=== Recommended Project Structure ===\n");
console.log("  tests/");
console.log("  ├── pages/                    # Page Objects (OOP classes)");
console.log("  │   ├── base.page.ts          # Abstract base (Lesson 5)");
console.log("  │   ├── login.page.ts         # Extends BasePage (Lesson 3)");
console.log("  │   ├── dashboard.page.ts     # Extends BasePage");
console.log("  │   └── components/           # Reusable UI components");
console.log("  │       ├── navbar.component.ts");
console.log("  │       └── modal.component.ts");
console.log("  ├── fixtures/                 # Test data and helpers");
console.log("  │   ├── test-data.ts          # Typed data (Lesson 4)");
console.log("  │   └── factories.ts          # Data factories (Lesson 6)");
console.log("  ├── tests/                    # Actual test specs");
console.log("  │   ├── login.spec.ts");
console.log("  │   ├── dashboard.spec.ts");
console.log("  │   └── booking.spec.ts");
console.log("  └── playwright.config.ts");

console.log("\n=== OOP Concept Map ===\n");
console.log("  Lesson 1 (Classes)        → Page objects are classes");
console.log("  Lesson 2 (Encapsulation)  → Private selectors, public actions");
console.log("  Lesson 3 (Inheritance)    → BasePage → LoginPage, DashboardPage");
console.log("  Lesson 4 (Interfaces)     → TestUser, Credentials, ApiResponse");
console.log("  Lesson 5 (Abstract)       → BasePage forces waitForReady()");
console.log("  Lesson 6 (Generics)       → Factory<T>, ApiResponse<T>");
console.log("  Lesson 7 (POM)            → All concepts in one pattern");
console.log("  Lesson 8 (This file)      → Production project structure\n");
