import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

async function pteroRequest(path) {
  const baseUrl = requireEnv("PTERO_URL").replace(/\/$/, "");
  const apiKey = requireEnv("PTERO_APPLICATION_API_KEY");

  const res = await fetch(`${baseUrl}${path}`, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: "Application/vnd.pterodactyl.v1+json",
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Pterodactyl API error ${res.status}: ${text}`);
  }

  return text ? JSON.parse(text) : {};
}

async function findPterodactylUserByEmail(email) {
  const normalizedEmail = email.trim().toLowerCase();

  try {
    const filtered = await pteroRequest(`/api/application/users?filter[email]=${encodeURIComponent(normalizedEmail)}`);
    const exact = (filtered.data ?? [])
      .map((entry) => entry.attributes)
      .find((user) => user.email.trim().toLowerCase() === normalizedEmail);

    if (exact) return exact;
  } catch {
    // Fall back to broader listing below if filtering is unavailable.
  }

  let page = 1;
  while (true) {
    const response = await pteroRequest(`/api/application/users?page=${page}&per_page=100`);
    const users = (response.data ?? []).map((entry) => entry.attributes);
    const exact = users.find((user) => user.email.trim().toLowerCase() === normalizedEmail);
    if (exact) return exact;

    const pagination = response.meta?.pagination;
    if (!pagination || page >= pagination.total_pages) break;
    page += 1;
  }

  return null;
}

async function main() {
  requireEnv("DATABASE_URL");
  requireEnv("PTERO_URL");
  requireEnv("PTERO_APPLICATION_API_KEY");

  const users = await prisma.user.findMany({
    where: { pterodactylUserId: null },
    select: { id: true, email: true },
    orderBy: { createdAt: "asc" },
  });

  console.log(`Found ${users.length} local users without linked Pterodactyl accounts.`);

  let linked = 0;
  let missing = 0;

  for (const user of users) {
    const panelUser = await findPterodactylUserByEmail(user.email);

    if (!panelUser) {
      missing += 1;
      console.log(`No panel account found for ${user.email}`);
      continue;
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { pterodactylUserId: panelUser.id },
    });

    linked += 1;
    console.log(`Linked ${user.email} -> Pterodactyl user ${panelUser.id}`);
  }

  console.log(`Done. Linked: ${linked}. Not found: ${missing}.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });