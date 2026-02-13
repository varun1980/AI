export {};
// =============================================================================
// LESSON 2: Access Modifiers and Encapsulation
// =============================================================================
// WHY THIS MATTERS FOR PLAYWRIGHT:
//   When building Page Objects for your tests, you'll use `private` to hide
//   locators/selectors and `public` to expose clean actions like `login()`.
//   This keeps your tests readable and your locators maintainable.
// =============================================================================

console.log("=== Lesson 2: Access Modifiers and Encapsulation ===\n");

// --- CONCEPT: Three access modifiers ---
// public    — accessible from anywhere (default)
// private   — accessible only inside the class
// protected — accessible inside the class AND subclasses (Lesson 3)

class BankAccount {
  public ownerName: string;       // anyone can read/write
  private balance: number;         // only this class can access
  private transactionLog: string[];

  constructor(owner: string, initialDeposit: number) {
    this.ownerName = owner;
    this.balance = initialDeposit;
    this.transactionLog = [`Initial deposit: $${initialDeposit}`];
  }

  // Public methods: the "API" of your class
  deposit(amount: number): void {
    if (amount <= 0) {
      console.log("   Deposit amount must be positive");
      return;
    }
    this.balance += amount;
    this.logTransaction(`Deposit: $${amount}`);
    console.log(`   Deposited $${amount}. New balance: $${this.balance}`);
  }

  withdraw(amount: number): boolean {
    if (amount > this.balance) {
      console.log(`   Insufficient funds. Balance: $${this.balance}`);
      return false;
    }
    this.balance -= amount;
    this.logTransaction(`Withdrawal: $${amount}`);
    console.log(`   Withdrew $${amount}. New balance: $${this.balance}`);
    return true;
  }

  getBalance(): number {
    return this.balance;
  }

  printStatement(): void {
    console.log(`   --- Statement for ${this.ownerName} ---`);
    this.transactionLog.forEach((entry) => console.log(`   ${entry}`));
    console.log(`   Current balance: $${this.balance}`);
  }

  // Private method: internal helper, not part of the public API
  private logTransaction(entry: string): void {
    this.transactionLog.push(`${new Date().toISOString().split("T")[0]}: ${entry}`);
  }
}

console.log("1. Public vs Private:");
const account = new BankAccount("Varun", 1000);
account.deposit(500);
account.withdraw(200);

// These would cause TypeScript compile errors (try uncommenting):
// account.balance = 999999;        // Error: 'balance' is private
// account.logTransaction("hack");  // Error: 'logTransaction' is private

console.log(`\n   Owner (public): ${account.ownerName}`);
console.log(`   Balance (via getter): $${account.getBalance()}`);
account.printStatement();

// --- CONCEPT: Getters and Setters ---
// TypeScript supports `get` and `set` keywords for computed/validated properties

class Temperature {
  private _celsius: number;

  constructor(celsius: number) {
    this._celsius = celsius;
  }

  // Getter: access like a property, not a method
  get fahrenheit(): number {
    return this._celsius * 9 / 5 + 32;
  }

  // Setter: assign like a property, but with validation
  set celsius(value: number) {
    if (value < -273.15) {
      throw new Error("Temperature below absolute zero is not possible");
    }
    this._celsius = value;
  }

  get celsius(): number {
    return this._celsius;
  }
}

console.log("\n2. Getters and Setters:");
const temp = new Temperature(100);
console.log(`   ${temp.celsius}°C = ${temp.fahrenheit}°F`); // used like properties!
temp.celsius = 0;
console.log(`   ${temp.celsius}°C = ${temp.fahrenheit}°F`);

// --- CONCEPT: readonly modifier ---
// `readonly` properties can only be set in the constructor

class Config {
  constructor(
    public readonly baseURL: string,
    public readonly timeout: number,
    public readonly retries: number
  ) {}
}

console.log("\n3. Readonly properties:");
const config = new Config("https://example.com", 30000, 3);
console.log(`   baseURL: ${config.baseURL}`);
console.log(`   timeout: ${config.timeout}`);
// config.baseURL = "something";  // Error: Cannot assign to 'baseURL' because it is read-only

// --- PLAYWRIGHT CONNECTION: Why encapsulation matters ---
console.log("\n--- Playwright Connection ---");
console.log("In a Playwright Page Object, you encapsulate selectors:");
console.log("");
console.log("  class LoginPage {");
console.log("    private usernameInput = '#username';  // hidden selector");
console.log("    private passwordInput = '#password';  // hidden selector");
console.log("    private submitButton  = '#login-btn'; // hidden selector");
console.log("");
console.log("    async login(user: string, pass: string) {  // public API");
console.log("      await this.page.fill(this.usernameInput, user);");
console.log("      await this.page.fill(this.passwordInput, pass);");
console.log("      await this.page.click(this.submitButton);");
console.log("    }");
console.log("  }");
console.log("");
console.log("If a selector changes, you fix ONE place — not every test file.\n");

// --- TRY IT YOURSELF ---
// Exercise: Create a class `UserProfile` with:
//   - private email (with getter/setter that validates @ symbol)
//   - readonly id (set once in constructor)
//   - public displayName
//   - a method `toJSON()` that returns a plain object
