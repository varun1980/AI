export {};
// =============================================================================
// LESSON 6: Generics
// =============================================================================
// WHY THIS MATTERS FOR PLAYWRIGHT:
//   Generics let you write reusable, type-safe code. Playwright uses them
//   for things like `page.evaluate<T>()` where T is the return type.
//   You'll use generics in test helpers, data factories, and API utilities.
// =============================================================================

console.log("=== Lesson 6: Generics ===\n");

// --- CONCEPT: The problem generics solve ---

// Without generics, you'd have to write separate functions for each type:
function getFirstNumber(arr: number[]): number | undefined {
  return arr[0];
}

function getFirstString(arr: string[]): string | undefined {
  return arr[0];
}

// Or use `any` which throws away type safety:
function getFirstAny(arr: any[]): any {
  return arr[0]; // We lose all type information
}

// --- CONCEPT: Generic function ---
// <T> is a type parameter — a placeholder for whatever type the caller uses

function getFirst<T>(arr: T[]): T | undefined {
  return arr[0];
}

console.log("1. Generic functions:");
const firstNum = getFirst([10, 20, 30]);       // TypeScript infers T = number
const firstStr = getFirst(["a", "b", "c"]);    // TypeScript infers T = string
console.log(`   First number: ${firstNum}`);     // type is number | undefined
console.log(`   First string: ${firstStr}`);     // type is string | undefined

// You can also be explicit:
const explicit = getFirst<boolean>([true, false, true]);
console.log(`   First boolean (explicit): ${explicit}`);

// --- CONCEPT: Generic class ---

class TypedList<T> {
  private items: T[] = [];

  add(item: T): void {
    this.items.push(item);
  }

  get(index: number): T | undefined {
    return this.items[index];
  }

  getAll(): T[] {
    return [...this.items];
  }

  find(predicate: (item: T) => boolean): T | undefined {
    return this.items.find(predicate);
  }

  map<U>(transform: (item: T) => U): TypedList<U> {
    const result = new TypedList<U>();
    for (const item of this.items) {
      result.add(transform(item));
    }
    return result;
  }
}

console.log("\n2. Generic class:");
const numbers = new TypedList<number>();
numbers.add(1);
numbers.add(2);
numbers.add(3);
console.log(`   Numbers: ${numbers.getAll()}`);

interface TestCase {
  name: string;
  priority: "high" | "medium" | "low";
}

const tests = new TypedList<TestCase>();
tests.add({ name: "Login works", priority: "high" });
tests.add({ name: "Profile pic uploads", priority: "low" });
tests.add({ name: "Checkout flow", priority: "high" });

const highPriority = tests.find((t) => t.priority === "high");
console.log(`   First high-priority test: ${highPriority?.name}`);

// Map from TestCase to string
const testNames = tests.map((t) => `[${t.priority}] ${t.name}`);
console.log(`   Formatted: ${testNames.getAll().join(", ")}`);

// --- CONCEPT: Generic constraints ---
// Use `extends` to limit what types T can be

interface HasId {
  id: number | string;
}

function findById<T extends HasId>(items: T[], id: number | string): T | undefined {
  return items.find((item) => item.id === id);
}

console.log("\n3. Generic constraints:");

interface Product extends HasId {
  id: number;
  name: string;
  price: number;
}

const products: Product[] = [
  { id: 1, name: "Football", price: 29.99 },
  { id: 2, name: "Jersey", price: 79.99 },
  { id: 3, name: "Cleats", price: 119.99 },
];

const found = findById(products, 2);
console.log(`   Found product: ${found?.name} - $${found?.price}`);

// findById([1, 2, 3], 1); // Error: number doesn't have 'id' property

// --- CONCEPT: Multiple type parameters ---

class KeyValueStore<K, V> {
  private store = new Map<K, V>();

  set(key: K, value: V): void {
    this.store.set(key, value);
  }

  get(key: K): V | undefined {
    return this.store.get(key);
  }

  entries(): Array<[K, V]> {
    return [...this.store.entries()];
  }
}

console.log("\n4. Multiple type parameters:");
const testData = new KeyValueStore<string, number>();
testData.set("loginTests", 5);
testData.set("checkoutTests", 3);
testData.set("profileTests", 8);

console.log(`   Login tests: ${testData.get("loginTests")}`);
console.log(`   All entries:`);
testData.entries().forEach(([k, v]) => console.log(`     ${k}: ${v}`));

// --- PRACTICAL: Test data factory ---

interface TestDataFactory<T> {
  create(overrides?: Partial<T>): T;
  createMany(count: number, overrides?: Partial<T>): T[];
}

interface UserData {
  username: string;
  email: string;
  role: "admin" | "user";
}

class UserFactory implements TestDataFactory<UserData> {
  private counter = 0;

  create(overrides?: Partial<UserData>): UserData {
    this.counter++;
    return {
      username: `testuser${this.counter}`,
      email: `user${this.counter}@test.com`,
      role: "user",
      ...overrides, // Override any defaults
    };
  }

  createMany(count: number, overrides?: Partial<UserData>): UserData[] {
    return Array.from({ length: count }, () => this.create(overrides));
  }
}

console.log("\n5. Test data factory (practical pattern):");
const userFactory = new UserFactory();

const regularUser = userFactory.create();
const adminUser = userFactory.create({ role: "admin", username: "superadmin" });
const bulkUsers = userFactory.createMany(3);

console.log(`   Regular: ${regularUser.username} (${regularUser.role})`);
console.log(`   Admin: ${adminUser.username} (${adminUser.role})`);
console.log(`   Bulk users: ${bulkUsers.map((u) => u.username).join(", ")}`);

// --- CONCEPT: Generic utility types (built-in to TypeScript) ---

interface FullConfig {
  baseURL: string;
  timeout: number;
  retries: number;
  headless: boolean;
  browser: string;
}

// Partial<T> — all properties become optional
type OptionalConfig = Partial<FullConfig>;

// Pick<T, K> — select only certain properties
type BrowserConfig = Pick<FullConfig, "browser" | "headless">;

// Omit<T, K> — remove certain properties
type ConfigWithoutBrowser = Omit<FullConfig, "browser">;

// Record<K, V> — object with known keys and value type
type TestResults = Record<string, "pass" | "fail" | "skip">;

console.log("\n6. Built-in utility types:");
const partial: OptionalConfig = { baseURL: "https://test.com" };
const browserConf: BrowserConfig = { browser: "chromium", headless: true };
const results: TestResults = { login: "pass", checkout: "fail", profile: "skip" };
console.log(`   Partial config: ${JSON.stringify(partial)}`);
console.log(`   Browser config: ${JSON.stringify(browserConf)}`);
console.log(`   Test results: ${JSON.stringify(results)}`);

// --- PLAYWRIGHT CONNECTION ---
console.log("\n--- Playwright Connection ---");
console.log("Generics you'll use with Playwright:");
console.log("");
console.log("  // Typed page.evaluate — T is the return type");
console.log("  const count = await page.evaluate<number>(() => {");
console.log("    return document.querySelectorAll('.item').length;");
console.log("  });");
console.log("");
console.log("  // Test data factories with generics");
console.log("  const user = userFactory.create({ role: 'admin' });");
console.log("");
console.log("  // API response typing");
console.log("  const resp = await request.get<ApiResponse<User[]>>('/api/users');");
console.log("");
console.log("  // Partial for test config overrides");
console.log("  function runTest(config: Partial<TestConfig>) { ... }\n");

// --- TRY IT YOURSELF ---
// Exercise: Create a generic `ApiResponseHandler<T>` class that:
//   - Stores a response of type T
//   - Has methods: getData(): T, isSuccess(): boolean
//   - Has a static method `fromJSON<T>(json: string): ApiResponseHandler<T>`
