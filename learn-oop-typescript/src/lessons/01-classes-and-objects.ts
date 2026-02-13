export {};
// =============================================================================
// LESSON 1: Classes, Objects, and Constructors
// =============================================================================
// WHY THIS MATTERS FOR PLAYWRIGHT:
//   Playwright uses classes everywhere. Every Page, Browser, Locator is an object.
//   When you write `page.click()`, you're calling a method on a Page object.
//   Understanding classes is step one.
// =============================================================================

// --- CONCEPT: A class is a blueprint for creating objects ---

class FootballPlayer {
  // Properties: data that belongs to each object
  name: string;
  position: string;
  goals: number;

  // Constructor: runs when you create a new object with `new`
  constructor(name: string, position: string) {
    this.name = name;
    this.position = position;
    this.goals = 0; // default value
  }

  // Methods: functions that belong to the object
  scoreGoal(): void {
    this.goals += 1;
    console.log(`  ⚽ ${this.name} scored! Total goals: ${this.goals}`);
  }

  describe(): string {
    return `${this.name} plays ${this.position} with ${this.goals} goals`;
  }
}

// --- USING THE CLASS ---

console.log("=== Lesson 1: Classes, Objects, and Constructors ===\n");

// Creating objects (instances) from the class
const ronaldo = new FootballPlayer("Ronaldo", "Forward");
const messi = new FootballPlayer("Messi", "Forward");

console.log("1. Created two player objects:");
console.log(`   ronaldo.name = "${ronaldo.name}"`);
console.log(`   messi.name = "${messi.name}"`);

console.log("\n2. Calling methods on objects:");
ronaldo.scoreGoal();
ronaldo.scoreGoal();
messi.scoreGoal();

console.log("\n3. Each object has its own state:");
console.log(`   ${ronaldo.describe()}`);
console.log(`   ${messi.describe()}`);

// --- CONCEPT: Shorthand constructor (TypeScript-specific) ---
// TypeScript lets you declare AND assign properties in the constructor signature

class CoachingSession {
  constructor(
    public coach: string,
    public date: string,
    public durationMinutes: number,
    public topic: string
  ) {}
  // No need for `this.coach = coach` etc. — TypeScript does it automatically!

  summary(): string {
    return `[${this.date}] ${this.coach}: ${this.topic} (${this.durationMinutes} min)`;
  }
}

console.log("\n4. Shorthand constructor (TypeScript feature):");
const session = new CoachingSession("Sanches", "2024-01-15", 60, "Dribbling");
console.log(`   ${session.summary()}`);

// --- CONCEPT: `this` keyword ---
// `this` refers to the current object instance

class Counter {
  count = 0; // Property can be initialized directly

  increment(): Counter {
    this.count++;
    return this; // Returning `this` enables method chaining
  }

  getValue(): number {
    return this.count;
  }
}

console.log("\n5. Method chaining with `this`:");
const counter = new Counter();
counter.increment().increment().increment(); // chain calls!
console.log(`   Counter value after 3 increments: ${counter.getValue()}`);

// --- HOW THIS CONNECTS TO PLAYWRIGHT ---
console.log("\n--- Playwright Connection ---");
console.log("In Playwright, you'll see patterns like:");
console.log('   const browser = await chromium.launch();  // creates Browser object');
console.log('   const page = await browser.newPage();     // creates Page object');
console.log("   await page.goto('https://example.com');   // calls method on Page");
console.log("   await page.click('#button');              // another method call");
console.log("\nEvery one of those is calling a method on a class instance.");
console.log("browser, page, locator — all objects created from classes.\n");

// --- TRY IT YOURSELF ---
// Exercise: Create a class called `TestResult` with:
//   - properties: testName (string), passed (boolean), durationMs (number)
//   - a method `toString()` that returns a formatted string
//   - create 2 instances and print them
