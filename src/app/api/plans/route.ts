import { prisma } from "@/server/db";
import { jsonOk } from "@/server/http";

export const dynamic = "force-dynamic";

const FALLBACK_PLANS = [
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
  },
] as const;

export async function GET() {
  if (!process.env.DATABASE_URL) {
    return jsonOk(FALLBACK_PLANS);
  }

  const plans = await prisma.plan.findMany({
    where: { active: true },
    orderBy: { priceMonthlyCents: "asc" },
    select: {
      slug: true,
      name: true,
      ramMb: true,
      cpuPercent: true,
      diskMb: true,
      databasesLimit: true,
      backupsLimit: true,
      allocationsLimit: true,
      priceMonthlyCents: true,
      features: true,
    },
  });

  return jsonOk(plans);
}
