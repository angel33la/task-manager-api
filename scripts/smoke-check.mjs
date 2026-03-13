const baseUrl = process.env.SMOKE_BASE_URL || "http://localhost:4000";

async function assertJson200(pathname) {
  const res = await fetch(`${baseUrl}${pathname}`);
  if (!res.ok) {
    throw new Error(`${pathname} returned ${res.status}`);
  }
  await res.json();
}

async function main() {
  await assertJson200("/api");
  await assertJson200("/api/tasks");
  console.log(`Smoke checks passed against ${baseUrl}`);
}

main().catch((err) => {
  console.error("Smoke checks failed:", err.message);
  process.exit(1);
});
