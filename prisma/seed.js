const bcrypt = require("bcryptjs");
const { PrismaClient, UserRole } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const plans = [
    {
      slug: "vanilla-start",
      name: "Vanilla Start",
      ramMb: 2048,
      cpuPercent: 100,
      diskMb: 10240,
      databasesLimit: 1,
      backupsLimit: 1,
      allocationsLimit: 1,
      priceMonthlyCents: 599,
      features: [
        "Instant server deployment",
        "Vanilla Minecraft",
        "NVMe SSD storage",
        "DDoS protection",
        "Databases: 1",
        "Backups: 1",
      ],
      active: true,
    },
    {
      slug: "vanilla-plus",
      name: "Vanilla Plus",
      ramMb: 4096,
      cpuPercent: 200,
      diskMb: 20480,
      databasesLimit: 2,
      backupsLimit: 2,
      allocationsLimit: 1,
      priceMonthlyCents: 999,
      features: [
        "Instant server deployment",
        "Vanilla Minecraft",
        "NVMe SSD storage",
        "DDoS protection",
        "Databases: 2",
        "Backups: 2",
      ],
      active: true,
    },
    {
      slug: "vanilla-pro",
      name: "Vanilla Pro",
      ramMb: 8192,
      cpuPercent: 300,
      diskMb: 30720,
      databasesLimit: 3,
      backupsLimit: 3,
      allocationsLimit: 1,
      priceMonthlyCents: 1499,
      features: [
        "Instant server deployment",
        "Vanilla Minecraft",
        "NVMe SSD storage",
        "DDoS protection",
        "Databases: 3",
        "Backups: 3",
      ],
      active: true,
    },
  ];

  // Deactivate any plans not in our desired list.
  await prisma.plan.updateMany({
    where: { slug: { notIn: plans.map((p) => p.slug) } },
    data: { active: false },
  });

  for (const p of plans) {
    await prisma.plan.upsert({
      where: { slug: p.slug },
      update: p,
      create: p,
    });
  }

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (adminEmail && adminPassword) {
    const passwordHash = await bcrypt.hash(adminPassword, 12);
    await prisma.user.upsert({
      where: { email: adminEmail.toLowerCase() },
      update: { role: UserRole.ADMIN, passwordHash },
      create: { email: adminEmail.toLowerCase(), role: UserRole.ADMIN, passwordHash },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  });
