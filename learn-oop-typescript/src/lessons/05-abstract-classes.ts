export {};
// =============================================================================
// LESSON 5: Abstract Classes and Polymorphism
// =============================================================================
// WHY THIS MATTERS FOR PLAYWRIGHT:
//   Abstract classes let you define a template that subclasses MUST follow.
//   For Page Objects, an abstract BasePage can require every page to implement
//   `waitForReady()` or `getExpectedURL()` — enforcing consistency.
// =============================================================================

console.log("=== Lesson 5: Abstract Classes and Polymorphism ===\n");

// --- CONCEPT: Abstract class = template with enforced rules ---
// - Cannot be instantiated directly (no `new AbstractClass()`)
// - Can have both implemented methods AND abstract methods
// - Abstract methods MUST be implemented by subclasses

abstract class Shape {
  constructor(public color: string) {}

  // Abstract: every shape MUST implement these
  abstract area(): number;
  abstract perimeter(): number;

  // Concrete: shared by all shapes (already implemented)
  describe(): string {
    return `${this.color} ${this.constructor.name}: area=${this.area().toFixed(2)}, perimeter=${this.perimeter().toFixed(2)}`;
  }
}

class Circle extends Shape {
  constructor(color: string, public radius: number) {
    super(color);
  }

  // MUST implement area() — enforced by the abstract class
  area(): number {
    return Math.PI * this.radius ** 2;
  }

  // MUST implement perimeter()
  perimeter(): number {
    return 2 * Math.PI * this.radius;
  }
}

class Rectangle extends Shape {
  constructor(color: string, public width: number, public height: number) {
    super(color);
  }

  area(): number {
    return this.width * this.height;
  }

  perimeter(): number {
    return 2 * (this.width + this.height);
  }
}

// const s = new Shape("red"); // Error: Cannot create instance of abstract class

console.log("1. Abstract classes:");
const circle = new Circle("red", 5);
const rect = new Rectangle("blue", 4, 6);
console.log(`   ${circle.describe()}`);
console.log(`   ${rect.describe()}`);

// --- CONCEPT: Polymorphism ---
// Different objects respond to the same method call in different ways

function printAllShapes(shapes: Shape[]): void {
  console.log("\n2. Polymorphism — same method, different behavior:");
  for (const shape of shapes) {
    // TypeScript knows these all have area() and describe()
    console.log(`   ${shape.describe()}`);
  }
}

printAllShapes([circle, rect, new Circle("green", 3), new Rectangle("yellow", 10, 2)]);

// --- CONCEPT: Abstract class vs Interface ---
// Abstract class: can have implementation + state + constructor
// Interface: purely a contract, no implementation

// Use abstract class when subclasses share behavior
// Use interface when you just need a shape/contract

abstract class DataStore {
  protected items: string[] = []; // Shared state

  // Shared implementation
  count(): number {
    return this.items.length;
  }

  clear(): void {
    this.items = [];
  }

  // Abstract: each store decides HOW to add/get
  abstract add(item: string): void;
  abstract getAll(): string[];
}

class StackStore extends DataStore {
  add(item: string): void {
    this.items.push(item);
  }

  getAll(): string[] {
    return [...this.items].reverse(); // LIFO order
  }

  pop(): string | undefined {
    return this.items.pop();
  }
}

class UniqueStore extends DataStore {
  add(item: string): void {
    if (!this.items.includes(item)) {
      this.items.push(item);
    }
  }

  getAll(): string[] {
    return [...this.items]; // Insertion order
  }
}

console.log("\n3. Abstract class with shared state:");
const stack = new StackStore();
stack.add("first");
stack.add("second");
stack.add("third");
console.log(`   Stack (LIFO): ${stack.getAll().join(", ")}`);
console.log(`   Count: ${stack.count()}`);

const unique = new UniqueStore();
unique.add("apple");
unique.add("banana");
unique.add("apple"); // duplicate — won't be added
console.log(`   Unique: ${unique.getAll().join(", ")}`);
console.log(`   Count: ${unique.count()}`);

// --- PRACTICAL: Abstract BasePage for Playwright ---

abstract class AbstractBasePage {
  constructor(
    protected pageName: string,
    protected baseURL: string
  ) {}

  // Concrete: all pages share this
  getFullURL(path: string): string {
    return `${this.baseURL}${path}`;
  }

  logAction(action: string): void {
    console.log(`   [${this.pageName}] ${action}`);
  }

  // Abstract: every page MUST implement these
  abstract expectedURL(): string;
  abstract waitForReady(): void;
  abstract getPageTitle(): string;
}

class AbstractLoginPage extends AbstractBasePage {
  constructor(baseURL: string) {
    super("Login", baseURL);
  }

  expectedURL(): string {
    return this.getFullURL("/login");
  }

  waitForReady(): void {
    this.logAction("Waiting for login form to be visible");
  }

  getPageTitle(): string {
    return "Sign In | MyApp";
  }

  login(user: string, pass: string): void {
    this.waitForReady();
    this.logAction(`Entering username: ${user}`);
    this.logAction(`Entering password: ${"*".repeat(pass.length)}`);
    this.logAction("Clicking Sign In button");
  }
}

class AbstractHomePage extends AbstractBasePage {
  constructor(baseURL: string) {
    super("Home", baseURL);
  }

  expectedURL(): string {
    return this.getFullURL("/");
  }

  waitForReady(): void {
    this.logAction("Waiting for hero banner to load");
  }

  getPageTitle(): string {
    return "Welcome | MyApp";
  }
}

console.log("\n4. Abstract BasePage pattern:");
const pages: AbstractBasePage[] = [
  new AbstractLoginPage("https://myapp.com"),
  new AbstractHomePage("https://myapp.com"),
];

for (const page of pages) {
  console.log(`\n   Page: ${page.getPageTitle()}`);
  console.log(`   URL: ${page.expectedURL()}`);
  page.waitForReady();
}

console.log("");
const loginPg = pages[0] as AbstractLoginPage;
loginPg.login("varun", "password123");

// --- PLAYWRIGHT CONNECTION ---
console.log("\n--- Playwright Connection ---");
console.log("Abstract base pages enforce that every page object:");
console.log("  1. Defines its expected URL (for navigation assertions)");
console.log("  2. Implements waitForReady() (for stability)");
console.log("  3. Has a getPageTitle() (for verification)");
console.log("");
console.log("If someone adds a new page and forgets waitForReady(),");
console.log("TypeScript will show a compile error. Bugs caught before runtime.\n");

// --- TRY IT YOURSELF ---
// Exercise: Create an abstract `ApiClient` class with:
//   - abstract get(endpoint: string): Promise-like return
//   - abstract post(endpoint: string, body: object): Promise-like return
//   - concrete method: buildURL(endpoint) that prepends baseURL
//   - Two implementations: RestClient and MockClient
