export {};
// =============================================================================
// LESSON 3: Inheritance (extends and super)
// =============================================================================
// WHY THIS MATTERS FOR PLAYWRIGHT:
//   You'll create a BasePage class with shared navigation, header, footer logic.
//   Then each page (LoginPage, DashboardPage) extends BasePage to inherit that
//   shared behavior while adding page-specific methods.
// =============================================================================

console.log("=== Lesson 3: Inheritance ===\n");

// --- CONCEPT: A child class inherits from a parent class ---

class Animal {
  constructor(public name: string, public sound: string) {}

  speak(): string {
    return `${this.name} says ${this.sound}`;
  }

  move(): string {
    return `${this.name} is moving`;
  }
}

// `extends` means Dog gets ALL of Animal's properties and methods
class Dog extends Animal {
  constructor(name: string) {
    // `super()` calls the parent's constructor — REQUIRED
    super(name, "Woof");
  }

  // New method specific to Dog
  fetch(item: string): string {
    return `${this.name} fetches the ${item}!`;
  }
}

class Cat extends Animal {
  constructor(name: string) {
    super(name, "Meow");
  }

  purr(): string {
    return `${this.name} purrs contentedly`;
  }
}

console.log("1. Basic Inheritance:");
const dog = new Dog("Rex");
const cat = new Cat("Whiskers");
console.log(`   ${dog.speak()}`);       // Inherited from Animal
console.log(`   ${dog.fetch("ball")}`);  // Dog-specific
console.log(`   ${cat.speak()}`);       // Inherited from Animal
console.log(`   ${cat.purr()}`);         // Cat-specific

// --- CONCEPT: Method Overriding ---
// A child can replace a parent's method with its own version

class Vehicle {
  constructor(public make: string, public model: string) {}

  describe(): string {
    return `${this.make} ${this.model}`;
  }

  fuelType(): string {
    return "gasoline";
  }
}

class ElectricCar extends Vehicle {
  constructor(make: string, model: string, public range: number) {
    super(make, model);
  }

  // Override: replaces parent's fuelType()
  fuelType(): string {
    return "electric";
  }

  // Override: extends parent's describe()
  describe(): string {
    // `super.describe()` calls the PARENT's version
    return `${super.describe()} (EV, ${this.range}mi range)`;
  }
}

console.log("\n2. Method Overriding:");
const tesla = new ElectricCar("Tesla", "Model 3", 358);
const civic = new Vehicle("Honda", "Civic");
console.log(`   ${civic.describe()} — fuel: ${civic.fuelType()}`);
console.log(`   ${tesla.describe()} — fuel: ${tesla.fuelType()}`);

// --- CONCEPT: The `protected` modifier ---
// `protected` members are accessible in the class AND its children

class BaseComponent {
  protected tag: string;

  constructor(tag: string) {
    this.tag = tag;
  }

  protected renderOpen(): string {
    return `<${this.tag}>`;
  }

  protected renderClose(): string {
    return `</${this.tag}>`;
  }

  render(content: string): string {
    return `${this.renderOpen()}${content}${this.renderClose()}`;
  }
}

class LinkComponent extends BaseComponent {
  constructor(private href: string) {
    super("a");
  }

  // Can access `this.tag` and `renderOpen()` because they're `protected`
  render(text: string): string {
    return `<${this.tag} href="${this.href}">${text}</${this.tag}>`;
  }
}

console.log("\n3. Protected members:");
const link = new LinkComponent("https://playwright.dev");
console.log(`   ${link.render("Playwright Docs")}`);
// link.tag;          // Error: 'tag' is protected
// link.renderOpen(); // Error: 'renderOpen' is protected

// --- CONCEPT: instanceof check ---
// You can check what class an object belongs to

console.log("\n4. instanceof checks:");
console.log(`   dog instanceof Dog: ${dog instanceof Dog}`);         // true
console.log(`   dog instanceof Animal: ${dog instanceof Animal}`);   // true (Dog extends Animal)
console.log(`   cat instanceof Dog: ${cat instanceof Dog}`);         // false

// --- PRACTICAL EXAMPLE: Building toward Page Objects ---

class BasePage {
  protected currentURL: string;

  constructor(public pageName: string, protected baseURL: string) {
    this.currentURL = baseURL;
  }

  navigate(path: string): void {
    this.currentURL = `${this.baseURL}${path}`;
    console.log(`   Navigating to ${this.currentURL}`);
  }

  getTitle(): string {
    return `${this.pageName} | My App`;
  }

  protected waitForLoad(): void {
    console.log(`   Waiting for ${this.pageName} to load...`);
  }
}

class LoginPage extends BasePage {
  constructor(baseURL: string) {
    super("Login", baseURL);
  }

  login(username: string, password: string): void {
    this.navigate("/login");
    this.waitForLoad(); // Can call because it's protected
    console.log(`   Filling username: ${username}`);
    console.log(`   Filling password: ${"*".repeat(password.length)}`);
    console.log(`   Clicking submit`);
  }
}

class DashboardPage extends BasePage {
  constructor(baseURL: string) {
    super("Dashboard", baseURL);
  }

  getStats(): void {
    this.navigate("/dashboard");
    this.waitForLoad();
    console.log(`   Loading dashboard statistics...`);
  }
}

console.log("\n5. Page Object inheritance pattern:");
const loginPage = new LoginPage("https://app.example.com");
loginPage.login("varun", "secretpass");

console.log("");
const dashboard = new DashboardPage("https://app.example.com");
dashboard.getStats();

console.log(`\n   Login title: ${loginPage.getTitle()}`);
console.log(`   Dashboard title: ${dashboard.getTitle()}`);

// --- PLAYWRIGHT CONNECTION ---
console.log("\n--- Playwright Connection ---");
console.log("This is exactly the Page Object Model pattern:");
console.log("  1. BasePage has shared logic: navigation, waiting, header checks");
console.log("  2. LoginPage extends BasePage, adds login-specific methods");
console.log("  3. DashboardPage extends BasePage, adds dashboard methods");
console.log("  4. Tests use page objects, never touching selectors directly\n");

// --- TRY IT YOURSELF ---
// Exercise: Create a `ProductPage` class that extends `BasePage` with:
//   - addToCart(productId: string)
//   - getPrice(productId: string): string
//   - navigate to "/products"
