export {};
// =============================================================================
// LESSON 4: Interfaces and Contracts
// =============================================================================
// WHY THIS MATTERS FOR PLAYWRIGHT:
//   Interfaces define the SHAPE of objects. Playwright's API is built on them.
//   When you define test data, page actions, or API responses — interfaces
//   give you type safety and autocomplete.
// =============================================================================

console.log("=== Lesson 4: Interfaces and Contracts ===\n");

// --- CONCEPT: An interface defines what an object must look like ---

interface User {
  id: number;
  name: string;
  email: string;
  isActive: boolean;
}

// The object MUST have all the properties with the correct types
const user1: User = {
  id: 1,
  name: "Varun",
  email: "varun@example.com",
  isActive: true,
};

// This would fail:
// const badUser: User = { id: 1, name: "Test" }; // Error: missing email, isActive

console.log("1. Basic Interface:");
console.log(`   User: ${user1.name} (${user1.email})`);

// --- CONCEPT: Optional and readonly properties ---

interface TestConfig {
  readonly baseURL: string;       // can't be changed after creation
  browser: string;
  headless: boolean;
  timeout?: number;               // optional — may or may not be present
  retries?: number;               // optional
}

const config: TestConfig = {
  baseURL: "https://example.com",
  browser: "chromium",
  headless: true,
  // timeout and retries are optional, so we can skip them
};

console.log("\n2. Optional and Readonly:");
console.log(`   Config: ${config.browser}, headless=${config.headless}`);
console.log(`   Timeout: ${config.timeout ?? "not set (using default)"}`);
// config.baseURL = "other"; // Error: cannot assign to readonly

// --- CONCEPT: Interface for methods (function signatures) ---

interface Searchable {
  search(query: string): string[];
  resultCount(): number;
}

class ProductCatalog implements Searchable {
  private products = ["Football", "Jersey", "Cleats", "Shin Guards", "Gloves"];
  private lastResults: string[] = [];

  search(query: string): string[] {
    this.lastResults = this.products.filter((p) =>
      p.toLowerCase().includes(query.toLowerCase())
    );
    return this.lastResults;
  }

  resultCount(): number {
    return this.lastResults.length;
  }
}

class UserDirectory implements Searchable {
  private users = ["Varun", "Sanches", "Alex", "Maria", "Viktor"];
  private lastResults: string[] = [];

  search(query: string): string[] {
    this.lastResults = this.users.filter((u) =>
      u.toLowerCase().includes(query.toLowerCase())
    );
    return this.lastResults;
  }

  resultCount(): number {
    return this.lastResults.length;
  }
}

console.log("\n3. Classes implementing interfaces:");
const catalog = new ProductCatalog();
const directory = new UserDirectory();

console.log(`   Products matching "l": ${catalog.search("l")}`);
console.log(`   Count: ${catalog.resultCount()}`);
console.log(`   Users matching "a": ${directory.search("a")}`);
console.log(`   Count: ${directory.resultCount()}`);

// Both can be used wherever Searchable is expected:
function displayResults(searchable: Searchable, query: string): void {
  const results = searchable.search(query);
  console.log(`   Found ${searchable.resultCount()} results for "${query}": ${results.join(", ")}`);
}

console.log("\n4. Polymorphism through interfaces:");
displayResults(catalog, "g");
displayResults(directory, "v");

// --- CONCEPT: Extending interfaces ---

interface HasTimestamps {
  createdAt: Date;
  updatedAt: Date;
}

interface BlogPost extends HasTimestamps {
  title: string;
  content: string;
  author: string;
  tags: string[];
}

const post: BlogPost = {
  title: "Learning OOP",
  content: "Interfaces are contracts...",
  author: "Varun",
  tags: ["typescript", "oop"],
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-15"),
};

console.log("\n5. Extending interfaces:");
console.log(`   Post: "${post.title}" by ${post.author}`);
console.log(`   Tags: ${post.tags.join(", ")}`);
console.log(`   Created: ${post.createdAt.toISOString().split("T")[0]}`);

// --- CONCEPT: Interface vs Type alias ---
// Both can describe object shapes. Key differences:

// Interface — can be extended, merged, and implemented by classes
interface Point2D {
  x: number;
  y: number;
}

interface Point3D extends Point2D {
  z: number;
}

// Type — more flexible, can be unions, intersections, primitives
type Coordinate = [number, number];
type Result = "pass" | "fail" | "skip";
type ResponseData = User | { error: string };

console.log("\n6. Interface vs Type:");
const p: Point3D = { x: 1, y: 2, z: 3 };
console.log(`   Point3D: (${p.x}, ${p.y}, ${p.z})`);
const coord: Coordinate = [10, 20];
console.log(`   Coordinate tuple: [${coord}]`);
const result: Result = "pass";
console.log(`   Result union type: ${result}`);

// --- PRACTICAL: Typing API response data ---

interface ApiResponse<T> {
  status: number;
  data: T;
  message: string;
}

interface BookingSlot {
  id: string;
  date: string;
  time: string;
  coach: string;
  available: boolean;
}

// Simulating what you'd get from an API call
const apiResponse: ApiResponse<BookingSlot[]> = {
  status: 200,
  message: "Success",
  data: [
    { id: "1", date: "2024-01-20", time: "10:00", coach: "Sanches", available: true },
    { id: "2", date: "2024-01-20", time: "14:00", coach: "Sanches", available: false },
  ],
};

console.log("\n7. Typed API responses:");
console.log(`   Status: ${apiResponse.status}`);
apiResponse.data.forEach((slot) => {
  console.log(`   ${slot.date} ${slot.time} - ${slot.coach}: ${slot.available ? "open" : "booked"}`);
});

// --- PLAYWRIGHT CONNECTION ---
console.log("\n--- Playwright Connection ---");
console.log("Interfaces are everywhere in Playwright testing:");
console.log("");
console.log("  // Type your test data");
console.log("  interface LoginCredentials { username: string; password: string; }");
console.log("");
console.log("  // Type API response expectations");
console.log("  interface UserResponse { id: number; name: string; role: string; }");
console.log("");
console.log("  // Define page action contracts");
console.log("  interface PageActions {");
console.log("    navigate(): Promise<void>;");
console.log("    isLoaded(): Promise<boolean>;");
console.log("  }");
console.log("");
console.log("You get autocomplete, catch typos at compile time, and");
console.log("make your tests self-documenting.\n");

// --- TRY IT YOURSELF ---
// Exercise: Define interfaces for a Playwright test scenario:
//   - TestUser: { username, password, role: 'admin' | 'user' }
//   - Expected page state after login: { title, welcomeMessage, navItems: string[] }
//   - Write a function that takes TestUser and returns expected state
