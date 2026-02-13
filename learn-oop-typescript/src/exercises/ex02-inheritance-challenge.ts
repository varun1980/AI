export {};
// =============================================================================
// EXERCISE 2: Inheritance Challenge
// =============================================================================
// Covers: Lesson 3 (Inheritance) + Lesson 5 (Abstract Classes)
//
// SCENARIO: Build a notification system with different notification types.
// Each type formats and delivers messages differently.
//
// INSTRUCTIONS:
//   1. Implement the abstract class and subclasses
//   2. Uncomment tests as you go
//   3. Run with: npm run exercise:2
// =============================================================================

// TODO 1: Create an abstract class `Notification` with:
//   - protected property: recipient (string)
//   - protected property: message (string)
//   - private property: sentAt (Date | null, starts null)
//   - abstract method: format() — returns string (each subclass formats differently)
//   - abstract method: validate() — returns boolean
//   - concrete method: send() — calls validate(), sets sentAt, returns format()
//     If validate() returns false, throw Error("Invalid notification")
//   - concrete getter: isSent — returns boolean (whether sentAt is set)

// 👇 Write your abstract Notification class here:

// abstract class Notification {
//
// }

// TODO 2: Create `EmailNotification` extending Notification with:
//   - private property: subject (string, via constructor)
//   - format() returns: "Email to {recipient}: [{subject}] {message}"
//   - validate() returns: true if recipient contains "@"

// 👇 Write EmailNotification here:

// class EmailNotification extends Notification {
//
// }

// TODO 3: Create `SMSNotification` extending Notification with:
//   - format() returns: "SMS to {recipient}: {message}" (truncated to 160 chars)
//   - validate() returns: true if recipient starts with "+"

// 👇 Write SMSNotification here:

// class SMSNotification extends Notification {
//
// }

// TODO 4: Create `SlackNotification` extending Notification with:
//   - private property: channel (string, via constructor)
//   - format() returns: "Slack #{channel} @{recipient}: {message}"
//   - validate() returns: true if channel starts with "#" or recipient is not empty

// 👇 Write SlackNotification here:

// class SlackNotification extends Notification {
//
// }

// --- TESTS (uncomment when ready) ---

// const email = new EmailNotification("varun@test.com", "Test passed!", "Build Results");
// console.log(email.isSent === false ? "PASS: not sent initially" : "FAIL");
// const emailResult = email.send();
// console.log(emailResult.includes("varun@test.com") ? "PASS: email formatted" : "FAIL");
// console.log(emailResult.includes("[Build Results]") ? "PASS: subject included" : "FAIL");
// console.log(email.isSent === true ? "PASS: marked as sent" : "FAIL");
//
// try {
//   const badEmail = new EmailNotification("not-an-email", "test", "test");
//   badEmail.send();
//   console.log("FAIL: should have thrown for invalid email");
// } catch (e) {
//   console.log("PASS: invalid email throws error");
// }
//
// const sms = new SMSNotification("+1234567890", "Your test suite passed with 42 tests.");
// const smsResult = sms.send();
// console.log(smsResult.includes("+1234567890") ? "PASS: SMS formatted" : "FAIL");
//
// const longMessage = "A".repeat(200);
// const longSMS = new SMSNotification("+1234567890", longMessage);
// const longResult = longSMS.send();
// console.log(longResult.length <= 160 ? "PASS: SMS truncated to 160" : `FAIL: length is ${longResult.length}`);
//
// const slack = new SlackNotification("varun", "Deployment complete!", "#engineering");
// const slackResult = slack.send();
// console.log(slackResult.includes("#engineering") ? "PASS: channel included" : "FAIL");
// console.log(slackResult.includes("@varun") ? "PASS: mention included" : "FAIL");

// BONUS: Polymorphism test
// const notifications: Notification[] = [
//   new EmailNotification("dev@test.com", "Build passed", "CI/CD"),
//   new SMSNotification("+1555000111", "Deploy done"),
//   new SlackNotification("team", "All green!", "#releases"),
// ];
//
// console.log("\nPolymorphism - sending all notifications:");
// for (const notif of notifications) {
//   console.log(`  ${notif.send()}`);
// }

console.log("\nExercise 2: Implement the classes and uncomment tests!");
console.log("Run with: npm run exercise:2\n");
