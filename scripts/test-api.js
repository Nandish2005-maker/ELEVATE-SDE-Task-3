// Quick end-to-end check of the API. Start the server first (npm run dev), then run:  npm run test:api
const BASE = process.env.API_URL || "http://localhost:5000";

let passed = 0;
let failed = 0;
let adminToken = "";

async function call(method, path, { body, token } = {}) {
  const res = await fetch(BASE + path, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return { status: res.status, data: await res.json() };
}

function check(name, condition, extra = "") {
  if (condition) {
    passed++;
    console.log(`  PASS  ${name}`);
  } else {
    failed++;
    console.log(`  FAIL  ${name} ${extra}`);
  }
}

const validBody = { name: "Test User", phone: "9000000001", gender: "Male", city: "Pune", state: "Maharashtra" };

async function run() {
  console.log(`Testing ${BASE}\n`);

  console.log("Health");
  let r = await call("GET", "/api/health");
  check("GET /api/health returns 200", r.status === 200);

  console.log("\nRequest certificate (POST /api/applications)");
  r = await call("POST", "/api/applications", { body: validBody });
  check("valid request returns 201", r.status === 201, JSON.stringify(r.data));
  check("response has applicationId and status Pending", /^APP-\d{4}$/.test(r.data.applicationId) && r.data.status === "Pending");
  const newId = r.data.applicationId;

  r = await call("POST", "/api/applications", { body: {} });
  check("empty body returns 400 with errors for every field", r.status === 400 && Object.keys(r.data.errors || {}).length === 5);
  r = await call("POST", "/api/applications", { body: { ...validBody, phone: "12345" } });
  check("bad phone returns 400", r.status === 400 && !!r.data.errors?.phone);
  r = await call("POST", "/api/applications", { body: { ...validBody, gender: "Robot" } });
  check("bad gender returns 400", r.status === 400 && !!r.data.errors?.gender);
  r = await call("POST", "/api/applications", { body: { ...validBody, state: "Narnia" } });
  check("bad state returns 400", r.status === 400 && !!r.data.errors?.state);

  console.log("\nTrack application (GET /api/applications/track/:id)");
  r = await call("GET", `/api/applications/track/${newId}`);
  check("new application can be tracked, status Pending", r.status === 200 && r.data.status === "Pending" && r.data.name === "Test User");
  r = await call("GET", "/api/applications/track/app-0001");
  check("lowercase ID works (APP-0001 is Approved)", r.status === 200 && r.data.status === "Approved");
  r = await call("GET", "/api/applications/track/%23APP-0002");
  check("ID with # works (APP-0002 is Pending)", r.status === 200 && r.data.status === "Pending");
  r = await call("GET", "/api/applications/track/APP-9999");
  check("unknown ID returns 404", r.status === 404 && r.data.success === false);

  console.log("\nVerify certificate (GET /api/certificates/verify/:id)");
  r = await call("GET", "/api/certificates/verify/CERT-0001");
  check("CERT-0001 is Valid with name and phone", r.status === 200 && r.data.status === "Valid" && !!r.data.name && !!r.data.phone);
  r = await call("GET", "/api/certificates/verify/cert-0002");
  check("CERT-0002 is Revoked", r.status === 200 && r.data.status === "Revoked");
  r = await call("GET", "/api/certificates/verify/CERT-9999");
  check("unknown certificate returns 404", r.status === 404);

  console.log("\nAdmin login (POST /api/admin/login)");
  r = await call("POST", "/api/admin/login", { body: {} });
  check("missing fields returns 400", r.status === 400);
  r = await call("POST", "/api/admin/login", { body: { username: "admin", password: "wrong" } });
  check("wrong password returns 401", r.status === 401 && !r.data.token);
  r = await call("POST", "/api/admin/login", { body: { username: "nobody", password: "admin" } });
  check("unknown user returns 401", r.status === 401);
  r = await call("POST", "/api/admin/login", { body: { username: "admin", password: "admin" } });
  check("correct login returns 200 and a token", r.status === 200 && !!r.data.token);
  adminToken = r.data.token;

  console.log("\nProtected admin routes");
  r = await call("GET", "/api/admin/applications");
  check("applications without token returns 401", r.status === 401);
  r = await call("GET", "/api/admin/certificates", { token: "not-a-real-token" });
  check("certificates with a fake token returns 401", r.status === 401);
  r = await call("GET", "/api/admin/applications", { token: adminToken });
  check("applications with token returns 200 and a list", r.status === 200 && r.data.count >= 6 && Array.isArray(r.data.applications));
  r = await call("GET", "/api/admin/certificates", { token: adminToken });
  check("certificates with token returns 200 and a list", r.status === 200 && r.data.count >= 2 && !!r.data.certificates[0].name);

  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
}

run().catch((err) => {
  console.error("\nCould not reach the API. Is the server running? (npm run dev)\n", err.message);
  process.exit(1);
});
