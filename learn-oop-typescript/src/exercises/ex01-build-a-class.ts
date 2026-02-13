export {};
// =============================================================================
// EXERCISE 1: Build a Class from Scratch
// =============================================================================
// Covers: Lesson 1 (Classes) + Lesson 2 (Access Modifiers)
//
// INSTRUCTIONS:
//   1. Read each TODO
//   2. Write your code where indicated
//   3. Run with: npm run exercise:1
//   4. All console.log assertions should print "PASS"
// =============================================================================

// TODO 1: Create a class called `Playlist` with:
//   - private property: songs (string array, starts empty)
//   - public readonly property: name (string, set via constructor)
//   - public method: addSong(title: string) — adds to the array
//   - public method: removeSong(title: string) — removes from array, returns boolean
//   - public method: getSongs() — returns a copy of the songs array
//   - public getter: length — returns number of songs
//   - public method: shuffle() — returns songs in random order (doesn't modify original)

// 👇 Write your Playlist class here:

// class Playlist {
//
// }

// --- TESTS (uncomment when ready) ---

// const rock = new Playlist("Rock Classics");
// rock.addSong("Bohemian Rhapsody");
// rock.addSong("Stairway to Heaven");
// rock.addSong("Hotel California");
//
// console.log(rock.length === 3 ? "PASS: length is 3" : "FAIL: length should be 3");
// console.log(rock.name === "Rock Classics" ? "PASS: name is correct" : "FAIL: name is wrong");
//
// const removed = rock.removeSong("Stairway to Heaven");
// console.log(removed === true ? "PASS: removeSong returned true" : "FAIL: should return true");
// console.log(rock.length === 2 ? "PASS: length is 2 after remove" : "FAIL: length should be 2");
//
// const notRemoved = rock.removeSong("Nonexistent Song");
// console.log(notRemoved === false ? "PASS: removeSong returned false for missing" : "FAIL: should return false");
//
// const songs = rock.getSongs();
// songs.push("HACK"); // Modifying the returned array
// console.log(rock.length === 2 ? "PASS: original not modified" : "FAIL: getSongs should return a copy");
//
// const shuffled = rock.shuffle();
// console.log(shuffled.length === 2 ? "PASS: shuffle returns all songs" : "FAIL: shuffle length wrong");

// TODO 2: Create a class called `Timer` with:
//   - private property: startTime (number or null)
//   - public method: start() — records Date.now()
//   - public method: stop() — returns elapsed milliseconds
//   - public method: isRunning — getter that returns boolean
//   - Throws an error if stop() is called before start()

// 👇 Write your Timer class here:

// class Timer {
//
// }

// --- TESTS (uncomment when ready) ---

// const timer = new Timer();
// console.log(timer.isRunning === false ? "PASS: timer not running initially" : "FAIL");
// timer.start();
// console.log(timer.isRunning === true ? "PASS: timer is running after start" : "FAIL");
//
// // Small delay to ensure elapsed > 0
// const busyWait = Date.now() + 10;
// while (Date.now() < busyWait) {} // wait ~10ms
//
// const elapsed = timer.stop();
// console.log(elapsed >= 10 ? "PASS: elapsed time measured" : "FAIL: elapsed should be >= 10ms");
// console.log(timer.isRunning === false ? "PASS: timer stopped" : "FAIL");
//
// try {
//   const freshTimer = new Timer();
//   freshTimer.stop();
//   console.log("FAIL: should have thrown an error");
// } catch (e) {
//   console.log("PASS: threw error when stop() called before start()");
// }

console.log("\nExercise 1: Uncomment tests as you implement each class!");
console.log("Run with: npm run exercise:1\n");
