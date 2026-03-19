import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function printSection(title) {
  console.log(`\n=== ${title} ===`);
}

function printRows(rows) {
  if (rows.length === 0) {
    console.log("None found.");
    return;
  }

  console.table(rows);
}

function uniqueIds(values) {
  return Array.from(new Set(values.filter((value) => typeof value === "string" && value.length > 0)));
}

async function loadUsersById(userIds) {
  if (userIds.length === 0) return new Set();

  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true },
  });

  return new Set(users.map((user) => user.id));
}

async function loadPlansById(planIds) {
  if (planIds.length === 0) return new Set();

  const plans = await prisma.plan.findMany({
    where: { id: { in: planIds } },
    select: { id: true },
  });

  return new Set(plans.map((plan) => plan.id));
}

async function loadOrdersById(orderIds) {
  if (orderIds.length === 0) return new Set();

  const orders = await prisma.order.findMany({
    where: { id: { in: orderIds } },
    select: { id: true },
  });

  return new Set(orders.map((order) => order.id));
}

async function findOrphanOrders() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      userId: true,
      planId: true,
      provider: true,
      providerRef: true,
      status: true,
      amountCents: true,
      createdAt: true,
    },
  });

  const existingUserIds = await loadUsersById(uniqueIds(orders.map((order) => order.userId)));
  const existingPlanIds = await loadPlansById(uniqueIds(orders.map((order) => order.planId)));

  return orders
    .map((order) => {
      const missing = [];

      if (!existingUserIds.has(order.userId)) missing.push("user");
      if (!existingPlanIds.has(order.planId)) missing.push("plan");

      if (missing.length === 0) return null;

      return {
        id: order.id,
        missing: missing.join(", "),
        userId: order.userId,
        planId: order.planId,
        provider: order.provider,
        status: order.status,
        amount: (order.amountCents / 100).toFixed(2),
        providerRef: order.providerRef,
        createdAt: order.createdAt.toISOString(),
      };
    })
    .filter(Boolean);
}

async function findOrphanServers() {
  const servers = await prisma.server.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      userId: true,
      planId: true,
      orderId: true,
      name: true,
      status: true,
      pterodactylServerId: true,
      createdAt: true,
    },
  });

  const existingUserIds = await loadUsersById(uniqueIds(servers.map((server) => server.userId)));
  const existingPlanIds = await loadPlansById(uniqueIds(servers.map((server) => server.planId)));
  const existingOrderIds = await loadOrdersById(uniqueIds(servers.map((server) => server.orderId)));

  return servers
    .map((server) => {
      const missing = [];

      if (!existingUserIds.has(server.userId)) missing.push("user");
      if (!existingPlanIds.has(server.planId)) missing.push("plan");
      if (server.orderId && !existingOrderIds.has(server.orderId)) missing.push("order");

      if (missing.length === 0) return null;

      return {
        id: server.id,
        missing: missing.join(", "),
        userId: server.userId,
        planId: server.planId,
        orderId: server.orderId ?? "-",
        name: server.name,
        status: server.status,
        pterodactylServerId: server.pterodactylServerId ?? "-",
        createdAt: server.createdAt.toISOString(),
      };
    })
    .filter(Boolean);
}

async function main() {
  const [orphanOrders, orphanServers] = await Promise.all([
    findOrphanOrders(),
    findOrphanServers(),
  ]);

  printSection(`Orphan orders (${orphanOrders.length})`);
  printRows(orphanOrders);

  printSection(`Orphan servers (${orphanServers.length})`);
  printRows(orphanServers);

  const total = orphanOrders.length + orphanServers.length;
  console.log(`\nTotal orphan records: ${total}`);

  if (total > 0) {
    process.exitCode = 1;
  }
}

main()
  .catch((error) => {
    console.error("Failed to scan orphan records.");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });