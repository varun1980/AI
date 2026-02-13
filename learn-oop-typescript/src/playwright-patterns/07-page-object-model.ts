export {};
// =============================================================================
// LESSON 7: The Page Object Model — OOP Applied to Playwright
// =============================================================================
// This is where everything comes together. The Page Object Model (POM)
// is the #1 pattern in Playwright test automation. It uses EVERY OOP concept
// you've learned: classes, encapsulation, inheritance, interfaces, generics.
// =============================================================================

console.log("=== Lesson 7: Page Object Model for Playwright ===\n");

// We'll simulate Playwright's Page type for this lesson
// (In real code, you'd import { Page } from '@playwright/test')

interface MockLocator {
  fill(value: string): Promise<void>;
  click(): Promise<void>;
  textContent(): Promise<string>;
  isVisible(): Promise<boolean>;
}

interface MockPage {
  goto(url: string): Promise<void>;
  title(): Promise<string>;
  locator(selector: string): MockLocator;
  url(): string;
  waitForLoadState(): Promise<void>;
}

// --- Simulated Page for running examples without a browser ---
function createMockPage(): MockPage {
  let currentURL = "";
  let currentTitle = "Mock Page";
  const filledValues: Record<string, string> = {};

  return {
    async goto(url: string) {
      currentURL = url;
      currentTitle = url.includes("login") ? "Login" : url.includes("dashboard") ? "Dashboard" : "Page";
      console.log(`      [browser] Navigated to ${url}`);
    },
    async title() {
      return currentTitle;
    },
    url() {
      return currentURL;
    },
    async waitForLoadState() {
      console.log(`      [browser] Page loaded`);
    },
    locator(selector: string): MockLocator {
      return {
        async fill(value: string) {
          filledValues[selector] = value;
          console.log(`      [browser] Filled "${selector}" with "${value}"`);
        },
        async click() {
          console.log(`      [browser] Clicked "${selector}"`);
        },
        async textContent() {
          return filledValues[selector] || `Content of ${selector}`;
        },
        async isVisible() {
          return true;
        },
      };
    },
  };
}

// =============================================================================
// PATTERN 1: Basic Page Object
// =============================================================================

console.log("--- Pattern 1: Basic Page Object ---\n");

class LoginPage {
  // PRIVATE: selectors are hidden implementation details
  private readonly usernameInput = "#username";
  private readonly passwordInput = "#password";
  private readonly submitButton = 'button[type="submit"]';
  private readonly errorMessage = ".error-message";

  // Constructor receives the Playwright Page instance
  constructor(private page: MockPage) {}

  // PUBLIC: clean actions that tests call
  async navigate(): Promise<void> {
    await this.page.goto("https://myapp.com/login");
    await this.page.waitForLoadState();
  }

  async login(username: string, password: string): Promise<void> {
    await this.page.locator(this.usernameInput).fill(username);
    await this.page.locator(this.passwordInput).fill(password);
    await this.page.locator(this.submitButton).click();
  }

  async getErrorMessage(): Promise<string> {
    return await this.page.locator(this.errorMessage).textContent();
  }

  async isErrorVisible(): Promise<boolean> {
    return await this.page.locator(this.errorMessage).isVisible();
  }
}

// Using it (simulates a test)
async function basicExample() {
  const page = createMockPage();
  const loginPage = new LoginPage(page);

  await loginPage.navigate();
  await loginPage.login("varun", "mypassword");
  console.log("");
}

// =============================================================================
// PATTERN 2: BasePage with Inheritance
// =============================================================================

console.log("--- Pattern 2: BasePage with Inheritance ---\n");

abstract class BasePage {
  constructor(
    protected page: MockPage,
    protected baseURL: string = "https://myapp.com"
  ) {}

  // Shared: every page can do these
  async navigateTo(path: string): Promise<void> {
    await this.page.goto(`${this.baseURL}${path}`);
    await this.page.waitForLoadState();
    await this.waitForReady();
  }

  async getTitle(): Promise<string> {
    return await this.page.title();
  }

  getCurrentURL(): string {
    return this.page.url();
  }

  // Abstract: every page MUST implement
  abstract waitForReady(): Promise<void>;
  abstract expectedPath(): string;
}

class LoginPageV2 extends BasePage {
  private selectors = {
    username: "#username",
    password: "#password",
    submit: 'button[type="submit"]',
    error: ".error-message",
    forgotPassword: 'a[href="/forgot-password"]',
  };

  expectedPath(): string {
    return "/login";
  }

  async waitForReady(): Promise<void> {
    const visible = await this.page.locator(this.selectors.submit).isVisible();
    console.log(`      [page] Login form ready: ${visible}`);
  }

  async login(username: string, password: string): Promise<void> {
    await this.page.locator(this.selectors.username).fill(username);
    await this.page.locator(this.selectors.password).fill(password);
    await this.page.locator(this.selectors.submit).click();
  }

  async clickForgotPassword(): Promise<void> {
    await this.page.locator(this.selectors.forgotPassword).click();
  }
}

class DashboardPage extends BasePage {
  private selectors = {
    welcomeBanner: ".welcome-banner",
    statsContainer: "#stats",
    logoutButton: "#logout",
  };

  expectedPath(): string {
    return "/dashboard";
  }

  async waitForReady(): Promise<void> {
    const visible = await this.page.locator(this.selectors.statsContainer).isVisible();
    console.log(`      [page] Dashboard ready: ${visible}`);
  }

  async getWelcomeMessage(): Promise<string> {
    return await this.page.locator(this.selectors.welcomeBanner).textContent();
  }

  async logout(): Promise<void> {
    await this.page.locator(this.selectors.logoutButton).click();
  }
}

async function inheritanceExample() {
  const page = createMockPage();

  const loginPage = new LoginPageV2(page);
  await loginPage.navigateTo(loginPage.expectedPath());
  await loginPage.login("varun", "pass123");

  console.log("");

  const dashboard = new DashboardPage(page);
  await dashboard.navigateTo(dashboard.expectedPath());
  const welcome = await dashboard.getWelcomeMessage();
  console.log(`      Welcome: ${welcome}`);
  console.log("");
}

// =============================================================================
// PATTERN 3: Component Objects (Composition)
// =============================================================================

console.log("--- Pattern 3: Component Objects ---\n");

// Not everything is a full page — reusable components get their own classes

class NavigationBar {
  private selectors = {
    homeLink: 'nav a[href="/"]',
    profileLink: 'nav a[href="/profile"]',
    menuToggle: "#menu-toggle",
  };

  constructor(private page: MockPage) {}

  async goHome(): Promise<void> {
    await this.page.locator(this.selectors.homeLink).click();
  }

  async goToProfile(): Promise<void> {
    await this.page.locator(this.selectors.profileLink).click();
  }
}

class SearchBar {
  private readonly input = "#search-input";
  private readonly button = "#search-button";

  constructor(private page: MockPage) {}

  async search(query: string): Promise<void> {
    await this.page.locator(this.input).fill(query);
    await this.page.locator(this.button).click();
  }
}

// Pages COMPOSE components
class HomePage extends BasePage {
  // Composition: HomePage HAS a NavigationBar and SearchBar
  readonly nav: NavigationBar;
  readonly search: SearchBar;

  constructor(page: MockPage) {
    super(page);
    this.nav = new NavigationBar(page);
    this.search = new SearchBar(page);
  }

  expectedPath(): string {
    return "/";
  }

  async waitForReady(): Promise<void> {
    console.log(`      [page] Home page ready`);
  }
}

async function compositionExample() {
  const page = createMockPage();
  const homePage = new HomePage(page);

  await homePage.navigateTo(homePage.expectedPath());
  await homePage.search.search("coaching sessions");
  await homePage.nav.goToProfile();
  console.log("");
}

// =============================================================================
// PATTERN 4: Test Data with Interfaces and Factories
// =============================================================================

console.log("--- Pattern 4: Typed Test Data ---\n");

interface Credentials {
  username: string;
  password: string;
}

interface TestUser extends Credentials {
  role: "admin" | "coach" | "student";
  displayName: string;
}

class TestUsers {
  static readonly admin: TestUser = {
    username: "admin@test.com",
    password: "AdminPass123!",
    role: "admin",
    displayName: "Test Admin",
  };

  static readonly coach: TestUser = {
    username: "coach@test.com",
    password: "CoachPass123!",
    role: "coach",
    displayName: "Test Coach",
  };

  static readonly student: TestUser = {
    username: "student@test.com",
    password: "StudentPass123!",
    role: "student",
    displayName: "Test Student",
  };

  static getByRole(role: TestUser["role"]): TestUser {
    const users: Record<string, TestUser> = {
      admin: this.admin,
      coach: this.coach,
      student: this.student,
    };
    return users[role];
  }
}

console.log("   Test user data:");
console.log(`   Admin: ${TestUsers.admin.username}`);
console.log(`   Coach by role: ${TestUsers.getByRole("coach").displayName}`);

// =============================================================================
// RUN ALL EXAMPLES
// =============================================================================

async function main() {
  await basicExample();
  await inheritanceExample();
  await compositionExample();

  console.log("\n=== Summary: OOP Concepts Used ===");
  console.log("  Classes          → Page objects, component objects");
  console.log("  Encapsulation    → Private selectors, public actions");
  console.log("  Inheritance      → BasePage -> LoginPage, DashboardPage");
  console.log("  Abstract classes → BasePage enforces waitForReady()");
  console.log("  Interfaces       → TestUser, Credentials, PageConfig");
  console.log("  Composition      → HomePage contains NavBar + SearchBar");
  console.log("  Static members   → TestUsers.admin, TestUsers.getByRole()");
  console.log("");
}

main().catch(console.error);
