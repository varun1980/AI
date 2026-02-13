export {};
// =============================================================================
// EXERCISE 3: Interface Design — Build a Mini Page Object Framework
// =============================================================================
// Covers: Lesson 4 (Interfaces) + Lesson 6 (Generics) + Lesson 7 (POM)
//
// SCENARIO: Design the type system for a Playwright Page Object framework.
// This is the closest exercise to what you'll do in real Playwright projects.
//
// INSTRUCTIONS:
//   1. Define the interfaces
//   2. Implement the classes
//   3. Uncomment tests
//   4. Run with: npm run exercise:3
// =============================================================================

// TODO 1: Define an interface `PageContract` with:
//   - readonly path: string
//   - goto(): Promise<void>
//   - isLoaded(): Promise<boolean>
//   - getTitle(): Promise<string>

// 👇 Write the interface here:

// interface PageContract {
//
// }

// TODO 2: Define an interface `HasSearch` with:
//   - search(query: string): Promise<void>
//   - getResults(): Promise<string[]>
//   - getResultCount(): Promise<number>

// 👇 Write the interface here:

// interface HasSearch {
//
// }

// TODO 3: Define a generic interface `ApiResponse<T>` with:
//   - status: number
//   - data: T
//   - error?: string
//   - timestamp: Date

// 👇 Write the interface here:

// interface ApiResponse<T> {
//
// }

// TODO 4: Define an interface `TestFixture<TPage>` with:
//   - page: TPage
//   - setup(): Promise<void>
//   - teardown(): Promise<void>

// 👇 Write the interface here:

// interface TestFixture<TPage> {
//
// }

// TODO 5: Implement a class `MockSearchPage` that implements BOTH
//         `PageContract` AND `HasSearch`
//   - Store an internal array of items for search results
//   - Constructor takes: path (string), items (string[])
//   - search() filters items by query (case-insensitive includes)
//   - getResults() returns the filtered results
//   - getResultCount() returns count of results

// 👇 Write the class here:

// class MockSearchPage implements PageContract, HasSearch {
//
// }

// TODO 6: Implement a generic class `ApiClient<T>` with:
//   - constructor takes: baseURL (string)
//   - async method: get(endpoint: string): Promise<ApiResponse<T>>
//     Returns a mock response with status 200 and empty data
//   - async method: post(endpoint: string, body: Partial<T>): Promise<ApiResponse<T>>
//     Returns a mock response with the body merged as data

// 👇 Write the class here:

// class ApiClient<T extends object> {
//
// }

// --- TESTS (uncomment when ready) ---

// async function runTests() {
//   // Test MockSearchPage
//   const searchPage = new MockSearchPage("/products", [
//     "Football", "Basketball", "Tennis Ball", "Golf Club", "Football Jersey"
//   ]);
//
//   await searchPage.goto();
//   console.log(searchPage.isLoaded() ? "PASS: page loaded" : "FAIL");
//
//   await searchPage.search("football");
//   const results = await searchPage.getResults();
//   console.log(results.length === 2 ? "PASS: found 2 football items" : `FAIL: found ${results.length}`);
//
//   const count = await searchPage.getResultCount();
//   console.log(count === 2 ? "PASS: count matches" : "FAIL");
//
//   await searchPage.search("ball");
//   const ballResults = await searchPage.getResults();
//   console.log(ballResults.length === 3 ? "PASS: found 3 ball items" : `FAIL: found ${ballResults.length}`);
//
//   // Test that it satisfies PageContract
//   const title = await searchPage.getTitle();
//   console.log(typeof title === "string" ? "PASS: title is string" : "FAIL");
//
//   // Test ApiClient with a User type
//   interface User {
//     id: number;
//     name: string;
//     email: string;
//   }
//
//   const userApi = new ApiClient<User>("https://api.example.com");
//   const getResponse = await userApi.get("/users/1");
//   console.log(getResponse.status === 200 ? "PASS: GET status 200" : "FAIL");
//   console.log(getResponse.timestamp instanceof Date ? "PASS: has timestamp" : "FAIL");
//
//   const postResponse = await userApi.post("/users", { name: "Varun", email: "v@test.com" });
//   console.log(postResponse.status === 200 ? "PASS: POST status 200" : "FAIL");
//   console.log(postResponse.data.name === "Varun" ? "PASS: data contains posted name" : "FAIL");
//
//   console.log("\nAll tests complete!");
// }
//
// runTests().catch(console.error);

console.log("\nExercise 3: This is the capstone — bring it all together!");
console.log("Define interfaces, implement classes, then uncomment the tests.");
console.log("Run with: npm run exercise:3\n");
