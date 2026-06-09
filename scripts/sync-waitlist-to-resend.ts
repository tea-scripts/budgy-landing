/**
 * One-time (idempotent) sync of the Postgres `waitlist_signups` table into a
 * Resend Audience as Contacts, so the "Finby is live" broadcast can be sent to
 * the whole list from the Resend dashboard.
 *
 * Run with:   pnpm sync:waitlist            (creates missing contacts)
 *             pnpm sync:waitlist --dry-run  (reports only, writes nothing)
 *
 * Audience resolution:
 *   - If RESEND_AUDIENCE_ID is set in the env, that audience is used.
 *   - Otherwise an audience named "Finby Waitlist" is found or created, and its
 *     id is printed so you can save it to .env for next time.
 *
 * Safe to re-run: existing contacts (matched by email) are skipped.
 */
import { Resend } from "resend";

// --- env -------------------------------------------------------------------
// Node 22 built-in loader — no dotenv dependency. .env.local overrides .env,
// matching Next.js precedence. Missing files are ignored.
for (const file of [".env", ".env.local"]) {
  try {
    process.loadEnvFile(file);
  } catch {
    // file absent — fine.
  }
}

const AUDIENCE_NAME = "Finby Waitlist";
const RATE_LIMIT_DELAY_MS = 600; // Resend default ~2 req/s; stay comfortably under.
const DRY_RUN = process.argv.includes("--dry-run");

function requireEnv(name: string): string {
  const v = process.env[name]?.trim();
  if (!v) {
    console.error(`✗ ${name} is not set. Add it to .env and re-run.`);
    process.exit(1);
  }
  return v;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Find the "Finby Waitlist" audience by name, or create it. Returns its id. */
async function resolveAudienceId(resend: Resend): Promise<string> {
  const fromEnv = process.env.RESEND_AUDIENCE_ID?.trim();
  if (fromEnv) {
    console.log(`• Using RESEND_AUDIENCE_ID from env: ${fromEnv}`);
    return fromEnv;
  }

  const { data: list, error: listErr } = await resend.audiences.list();
  if (listErr) throw new Error(`audiences.list: ${listErr.message}`);

  const existing = list?.data.find((a) => a.name === AUDIENCE_NAME);
  if (existing) {
    console.log(`• Found audience "${AUDIENCE_NAME}": ${existing.id}`);
    console.log(`  (tip: add RESEND_AUDIENCE_ID=${existing.id} to .env)`);
    return existing.id;
  }

  if (DRY_RUN) {
    console.log(`• [dry-run] would create audience "${AUDIENCE_NAME}"`);
    return "<dry-run-audience>";
  }

  const { data: created, error: createErr } = await resend.audiences.create({
    name: AUDIENCE_NAME,
  });
  if (createErr || !created) {
    throw new Error(`audiences.create: ${createErr?.message ?? "no data"}`);
  }
  console.log(`• Created audience "${AUDIENCE_NAME}": ${created.id}`);
  console.log(`  (tip: add RESEND_AUDIENCE_ID=${created.id} to .env)`);
  return created.id;
}

/** Lowercased set of emails already present as contacts in the audience. */
async function existingContactEmails(
  resend: Resend,
  audienceId: string,
): Promise<Set<string>> {
  if (audienceId === "<dry-run-audience>") return new Set();
  const { data, error } = await resend.contacts.list({ audienceId });
  if (error) throw new Error(`contacts.list: ${error.message}`);
  return new Set((data?.data ?? []).map((c) => c.email.toLowerCase()));
}

async function main(): Promise<void> {
  requireEnv("DATABASE_URL");
  // Contact/Audience management needs a FULL ACCESS key — the app's
  // RESEND_API_KEY is (correctly) send-only. Use a dedicated admin key if
  // provided, so the production sending key is never widened.
  const apiKey =
    process.env.RESEND_ADMIN_API_KEY?.trim() ||
    process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    console.error(
      "✗ Set RESEND_ADMIN_API_KEY (a Full Access key) in .env and re-run.",
    );
    process.exit(1);
  }

  if (DRY_RUN) console.log("=== DRY RUN — no contacts will be created ===\n");

  const resend = new Resend(apiKey);
  const audienceId = await resolveAudienceId(resend);

  // Import the Prisma singleton only after env is loaded — it reads
  // DATABASE_URL at module-eval time.
  const { prisma } = await import("../src/lib/prisma");

  try {
    const signups = await prisma.waitlistSignup.findMany({
      select: { email: true },
      orderBy: { createdAt: "asc" },
    });
    console.log(`• ${signups.length} waitlist signups in Postgres`);

    const already = await existingContactEmails(resend, audienceId);
    console.log(`• ${already.size} already in the audience\n`);

    let created = 0;
    let skipped = 0;
    let failed = 0;

    for (const { email } of signups) {
      if (already.has(email.toLowerCase())) {
        skipped++;
        continue;
      }

      if (DRY_RUN) {
        console.log(`  [dry-run] would add ${email}`);
        created++;
        continue;
      }

      const { error } = await resend.contacts.create({
        audienceId,
        email,
        unsubscribed: false,
      });
      if (error) {
        failed++;
        console.error(`  ✗ ${email}: ${error.message}`);
      } else {
        created++;
        console.log(`  ✓ ${email}`);
      }
      await sleep(RATE_LIMIT_DELAY_MS);
    }

    console.log(
      `\n=== Done: ${created} ${DRY_RUN ? "would be added" : "added"}, ` +
        `${skipped} skipped (already present), ${failed} failed ===`,
    );
    if (failed > 0) process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error("\n✗ Sync failed:", err instanceof Error ? err.message : err);
  process.exit(1);
});
