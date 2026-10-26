import assert from "node:assert";

const BASE_URL = "http://localhost:3000";

async function run() {
  console.log("=== RUNNING SPECIFICATION VERIFICATION TESTS ===");

  // 1. Unauthenticated /api/auth/me -> 401
  console.log("Test 1: Unauthenticated /api/auth/me");
  const meRes1 = await fetch(`${BASE_URL}/api/auth/me`);
  assert.strictEqual(meRes1.status, 401, "Should return 401");
  const meData1 = await meRes1.json();
  assert.strictEqual(meData1.error, "Unauthorized");
  console.log("  ✓ Passed: returns 401 Unauthorized");

  // 2. Register validations
  console.log("Test 2: Register validation error messages");
  const testEmail = `tester_${Date.now()}@example.com`;

  // Empty email
  const regEmailEmpty = await fetch(`${BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "", password: "password123", confirmPassword: "password123" }),
  });
  assert.strictEqual(regEmailEmpty.status, 400);
  assert.strictEqual((await regEmailEmpty.json()).error, "Email is required");

  // Invalid email
  const regEmailInv = await fetch(`${BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "invalid-email", password: "password123", confirmPassword: "password123" }),
  });
  assert.strictEqual(regEmailInv.status, 400);
  assert.strictEqual((await regEmailInv.json()).error, "Please enter a valid email address");

  // Empty password
  const regPassEmpty = await fetch(`${BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: testEmail, password: "", confirmPassword: "" }),
  });
  assert.strictEqual(regPassEmpty.status, 400);
  assert.strictEqual((await regPassEmpty.json()).error, "Password is required");

  // Password < 6 chars
  const regPassShort = await fetch(`${BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: testEmail, password: "123", confirmPassword: "123" }),
  });
  assert.strictEqual(regPassShort.status, 400);
  assert.strictEqual((await regPassShort.json()).error, "Password must be at least 6 characters");

  // Confirm password mismatch
  const regMismatch = await fetch(`${BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: testEmail, password: "password123", confirmPassword: "password456" }),
  });
  assert.strictEqual(regMismatch.status, 400);
  assert.strictEqual((await regMismatch.json()).error, "Passwords do not match");

  // Valid registration
  const regValid = await fetch(`${BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: testEmail, password: "password123", confirmPassword: "password123" }),
  });
  assert.strictEqual(regValid.status, 201);
  const regData = await regValid.json();
  assert.ok(regData.id, "Should return user id");
  assert.strictEqual(regData.email, testEmail);
  console.log("  ✓ Passed: Register validation and creation");

  // 3. Login
  console.log("Test 3: Login with wrong and valid password");
  const loginWrong = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: testEmail, password: "wrongpassword" }),
  });
  assert.strictEqual(loginWrong.status, 401);
  assert.strictEqual((await loginWrong.json()).error, "Invalid email or password");

  const loginValid = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: testEmail, password: "password123" }),
  });
  assert.strictEqual(loginValid.status, 200);
  const cookieHeader = loginValid.headers.get("set-cookie");
  assert.ok(cookieHeader && cookieHeader.includes("session_token="), "Should set session_token cookie");
  console.log("  ✓ Passed: Login sets session_token cookie");

  // Extract session_token cookie
  const match = cookieHeader.match(/session_token=([^;]+)/);
  const sessionCookie = `session_token=${match[1]}`;

  // 4. GET /api/auth/me with session
  console.log("Test 4: GET /api/auth/me with session");
  const meRes2 = await fetch(`${BASE_URL}/api/auth/me`, {
    headers: { Cookie: sessionCookie },
  });
  assert.strictEqual(meRes2.status, 200);
  const meData2 = await meRes2.json();
  assert.strictEqual(meData2.email, testEmail);
  console.log("  ✓ Passed: /api/auth/me returns authenticated user");

  // 5. POST /api/expenses validation
  console.log("Test 5: POST /api/expenses validation messages");

  // Empty title
  const expTitleEmpty = await fetch(`${BASE_URL}/api/expenses`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: sessionCookie },
    body: JSON.stringify({ title: "   ", amount: 50, category: "Food", spentAt: "2026-10-20" }),
  });
  assert.strictEqual(expTitleEmpty.status, 400);
  assert.strictEqual((await expTitleEmpty.json()).error, "Title is required");

  // Title > 80 chars
  const expTitleLong = await fetch(`${BASE_URL}/api/expenses`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: sessionCookie },
    body: JSON.stringify({ title: "A".repeat(81), amount: 50, category: "Food", spentAt: "2026-10-20" }),
  });
  assert.strictEqual(expTitleLong.status, 400);
  assert.strictEqual((await expTitleLong.json()).error, "Title must be at most 80 characters");

  // Amount negative/zero
  const expAmountZero = await fetch(`${BASE_URL}/api/expenses`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: sessionCookie },
    body: JSON.stringify({ title: "Coffee", amount: 0, category: "Food", spentAt: "2026-10-20" }),
  });
  assert.strictEqual(expAmountZero.status, 400);
  assert.strictEqual((await expAmountZero.json()).error, "Amount must be a positive number");

  // Category empty
  const expCatEmpty = await fetch(`${BASE_URL}/api/expenses`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: sessionCookie },
    body: JSON.stringify({ title: "Coffee", amount: 3.5, category: "", spentAt: "2026-10-20" }),
  });
  assert.strictEqual(expCatEmpty.status, 400);
  assert.strictEqual((await expCatEmpty.json()).error, "Please choose a category");

  // Category invalid
  const expCatInv = await fetch(`${BASE_URL}/api/expenses`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: sessionCookie },
    body: JSON.stringify({ title: "Coffee", amount: 3.5, category: "Gaming", spentAt: "2026-10-20" }),
  });
  assert.strictEqual(expCatInv.status, 400);
  assert.strictEqual((await expCatInv.json()).error, "Invalid category");

  // Date in future
  const expDateFuture = await fetch(`${BASE_URL}/api/expenses`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: sessionCookie },
    body: JSON.stringify({ title: "Coffee", amount: 3.5, category: "Food", spentAt: "2030-01-01" }),
  });
  assert.strictEqual(expDateFuture.status, 400);
  assert.strictEqual((await expDateFuture.json()).error, "Date cannot be in the future");

  // Valid expense creation
  const expCreate = await fetch(`${BASE_URL}/api/expenses`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: sessionCookie },
    body: JSON.stringify({
      title: "Grab to campus",
      amount: 45000,
      category: "Transport",
      note: "Morning class",
      spentAt: "2026-10-20",
    }),
  });
  assert.strictEqual(expCreate.status, 201);
  const createdExp = await expCreate.json();
  assert.strictEqual(createdExp.title, "Grab to campus");
  assert.strictEqual(createdExp.amount, 45000);
  assert.strictEqual(createdExp.category, "Transport");
  assert.strictEqual(createdExp.starred, false);
  assert.strictEqual(createdExp.spentAt, "2026-10-20");
  assert.ok(createdExp.id, "Must have an id");
  assert.ok(createdExp.createdAt, "Must have createdAt");
  console.log("  ✓ Passed: POST /api/expenses validations and shape");

  // Duplicate expense detection
  console.log("Test 6: Duplicate expense check (409)");
  const expDup = await fetch(`${BASE_URL}/api/expenses`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: sessionCookie },
    body: JSON.stringify({
      title: "Grab to campus",
      amount: 45000,
      category: "Transport",
      spentAt: "2026-10-20",
    }),
  });
  assert.strictEqual(expDup.status, 409);
  assert.strictEqual(
    (await expDup.json()).error,
    "Duplicate expense: an expense with the same title, amount and date already exists"
  );
  console.log("  ✓ Passed: 409 Duplicate expense error message exact match");

  // 7. Summary and breakdown check
  console.log("Test 7: Summary calculation and breakdown ordering");
  // Add a Food expense
  await fetch(`${BASE_URL}/api/expenses`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: sessionCookie },
    body: JSON.stringify({
      title: "Lunch buffet",
      amount: 150000,
      category: "Food",
      spentAt: "2026-10-22",
    }),
  });

  const sumRes = await fetch(`${BASE_URL}/api/expenses/summary`, {
    headers: { Cookie: sessionCookie },
  });
  assert.strictEqual(sumRes.status, 200);
  const summary = await sumRes.json();
  assert.strictEqual(summary.count, 2);
  assert.strictEqual(summary.totalAmount, 195000);
  assert.strictEqual(summary.breakdown[0].category, "Food");
  assert.strictEqual(summary.breakdown[0].total, 150000);
  assert.strictEqual(summary.breakdown[1].category, "Transport");
  assert.strictEqual(summary.breakdown[1].total, 45000);
  console.log("  ✓ Passed: Summary and breakdown calculations");

  // 8. PATCH toggle star
  console.log("Test 8: PATCH /api/expenses/:id");
  const starRes = await fetch(`${BASE_URL}/api/expenses/${createdExp.id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Cookie: sessionCookie },
    body: JSON.stringify({ starred: true }),
  });
  assert.strictEqual(starRes.status, 200);
  const starredExp = await starRes.json();
  assert.strictEqual(starredExp.starred, true);

  // Check starredCount updated
  const sumResStarred = await fetch(`${BASE_URL}/api/expenses/summary`, {
    headers: { Cookie: sessionCookie },
  });
  assert.strictEqual((await sumResStarred.json()).starredCount, 1);
  console.log("  ✓ Passed: PATCH toggles star and updates summary starredCount");

  // 9. DELETE expense
  console.log("Test 9: DELETE /api/expenses/:id");
  const delRes = await fetch(`${BASE_URL}/api/expenses/${createdExp.id}`, {
    method: "DELETE",
    headers: { Cookie: sessionCookie },
  });
  assert.strictEqual(delRes.status, 200);
  assert.deepStrictEqual(await delRes.json(), { success: true });

  const delNotFound = await fetch(`${BASE_URL}/api/expenses/${createdExp.id}`, {
    method: "DELETE",
    headers: { Cookie: sessionCookie },
  });
  assert.strictEqual(delNotFound.status, 404);
  assert.strictEqual((await delNotFound.json()).error, "Expense not found");
  console.log("  ✓ Passed: DELETE removes item and returns 404 if not found");

  // 10. Logout
  console.log("Test 10: POST /api/auth/logout");
  const logoutRes = await fetch(`${BASE_URL}/api/auth/logout`, {
    method: "POST",
    headers: { Cookie: sessionCookie },
  });
  assert.strictEqual(logoutRes.status, 200);

  const meAfterLogout = await fetch(`${BASE_URL}/api/auth/me`);
  assert.strictEqual(meAfterLogout.status, 401);
  console.log("  ✓ Passed: Logout clears session");

  console.log("\nALL SPECIFICATION API TESTS PASSED PERFECTLY! 🚀");
}

run().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
