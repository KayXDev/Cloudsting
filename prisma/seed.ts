import bcrypt from "bcryptjs";
import { PrismaClient, UserRole } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.plan.upsert({
    where: { slug: "starter" },
    update: {
      name: "Starter",
      ramMb: 2048,
      cpuPercent: 150,
      diskMb: 10240,
      priceMonthlyCents: 799,
      features: [
        "Instant server deployment",
        "NVMe SSD storage",
        "DDoS protection",
        "Plugin installer",
        "Console access",
        "Automatic backups",
        "99.9% uptime",
      ],
      active: true,
    },
    create: {
      slug: "starter",
      name: "Starter",
      ramMb: 2048,
      cpuPercent: 150,
      diskMb: 10240,
      priceMonthlyCents: 799,
      features: [
        "Instant server deployment",
        "NVMe SSD storage",
        "DDoS protection",
        "Plugin installer",
        "Console access",
        "Automatic backups",
        "99.9% uptime",
      ],
    },
  });

  await prisma.plan.upsert({
    where: { slug: "pro" },
    update: {
      name: "Pro",
      ramMb: 3072,
      cpuPercent: 200,
      diskMb: 20480,
      priceMonthlyCents: 1299,
      features: [
        "Instant server deployment",
        "NVMe SSD storage",
        "DDoS protection",
        "Plugin installer",
        "Console access",
        "Automatic backups",
        "99.9% uptime",
      ],
      active: true,
    },
    create: {
      slug: "pro",
      name: "Pro",
      ramMb: 3072,
      cpuPercent: 200,
      diskMb: 20480,
      priceMonthlyCents: 1299,
      features: [
        "Instant server deployment",
        "NVMe SSD storage",
        "DDoS protection",
        "Plugin installer",
        "Console access",
        "Automatic backups",
        "99.9% uptime",
      ],
    },
  });

  await prisma.plan.upsert({
    where: { slug: "extreme" },
    update: {
      name: "Extreme",
      ramMb: 4096,
      cpuPercent: 250,
      diskMb: 30720,
      priceMonthlyCents: 1999,
      features: [
        "Instant server deployment",
        "NVMe SSD storage",
        "DDoS protection",
        "Plugin installer",
        "Console access",
        "Automatic backups",
        "99.9% uptime",
      ],
      active: true,
    },
    create: {
      slug: "extreme",
      name: "Extreme",
      ramMb: 4096,
      cpuPercent: 250,
      diskMb: 30720,
      priceMonthlyCents: 1999,
      features: [
        "Instant server deployment",
        "NVMe SSD storage",
        "DDoS protection",
        "Plugin installer",
        "Console access",
        "Automatic backups",
        "99.9% uptime",
      ],
    },
  });

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
