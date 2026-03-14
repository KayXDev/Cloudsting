import { prisma } from "@/server/db";
import { env } from "@/server/env";
import { PterodactylClient } from "@/server/pterodactyl/client";
import { sendEmail } from "@/server/email/smtp";
import { renderPanelAccessEmail } from "@/server/email/templates";
import crypto from "crypto";

function dockerImageForVanillaVersion(opts: {
  vanillaVersion?: string;
  defaultDockerImage: string;
}) {
  const raw = (opts.vanillaVersion ?? "").trim();
  if (!raw) return opts.defaultDockerImage;
  if (raw === "latest" || raw === "snapshot") return opts.defaultDockerImage;

  const match = raw.match(/^(\d+)\.(\d+)(?:\.(\d+))?$/);
  if (!match) return opts.defaultDockerImage;

  const major = Number(match[1]);
  const minor = Number(match[2]);
  const patch = match[3] != null ? Number(match[3]) : 0;
  if (!Number.isFinite(major) || !Number.isFinite(minor) || !Number.isFinite(patch)) {
    return opts.defaultDockerImage;
  }

  // Only handle modern scheme. Fall back for anything unexpected.
  if (major !== 1) return opts.defaultDockerImage;

  // Vanilla MC Java compatibility (practical defaults for hosting):
  // - 1.8.x–1.12.x  => Java 8
  // - 1.13–1.16.5   => Java 11
  // - 1.17.x        => Java 16
  // - 1.18–1.20.4   => Java 17
  // - 1.20.5+ / 1.21+ => Java 21
  if (minor <= 12) return "ghcr.io/pterodactyl/yolks:java_8";
  if (minor <= 16) return "ghcr.io/pterodactyl/yolks:java_11";
  if (minor === 17) return "ghcr.io/pterodactyl/yolks:java_16";
  if (minor <= 19) return "ghcr.io/pterodactyl/yolks:java_17";
  if (minor === 20) return patch <= 4 ? "ghcr.io/pterodactyl/yolks:java_17" : "ghcr.io/pterodactyl/yolks:java_21";
  return "ghcr.io/pterodactyl/yolks:java_21";
}

export async function provisionMinecraftServer(opts: {
  userId: string;
  planSlug: string;
  serverName: string;
  vanillaVersion?: string;
  orderId: string;
}) {
  const plan = await prisma.plan.findUnique({ where: { slug: opts.planSlug } });
  if (!plan || !plan.active) {
    throw Object.assign(new Error("Plan not available"), { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: opts.userId } });
  if (!user) throw Object.assign(new Error("User not found"), { status: 404 });

  const server = await prisma.server.create({
    data: {
      userId: user.id,
      planId: plan.id,
      orderId: opts.orderId,
      name: opts.serverName,
      status: "PROVISIONING",
      memoryMb: plan.ramMb,
      cpuPercent: plan.cpuPercent,
      diskMb: plan.diskMb,
    },
  });

  // Provision with Pterodactyl if configured.
  if (env.PTERO_URL && env.PTERO_APPLICATION_API_KEY && env.PTERO_DEFAULT_EGG_ID) {
    const ptero = new PterodactylClient();

    // Ensure the customer has a matching Pterodactyl panel user (server owner).
    if (!user.pterodactylUserId) {
      if (!env.PTERO_AUTO_CREATE_USER) {
        throw new Error(
          "User has no linked Pterodactyl user. Set user.pterodactylUserId (or set PTERO_AUTO_CREATE_USER=true)."
        );
      }

      const tempPassword = crypto.randomBytes(18).toString("base64url");
      const email = user.email;
      const usernameBase = email.split("@")[0]?.replace(/[^a-zA-Z0-9]/g, "").slice(0, 16) || "cloud";
      const username = `${usernameBase}${crypto.randomBytes(2).toString("hex")}`.slice(0, 20);

      const firstName = user.name?.split(" ")[0] ?? "Cloudsting";
      const lastName = user.name?.split(" ").slice(1).join(" ") || "User";

      const created = await ptero.createUser({
        email,
        username,
        firstName,
        lastName,
        password: tempPassword,
      });

      await prisma.user.update({
        where: { id: user.id },
        data: { pterodactylUserId: created.id },
      });

      user.pterodactylUserId = created.id;

      // Best-effort: email panel login details so the customer can sign in when they click "Console".
      try {
        const panel = process.env.NEXT_PUBLIC_PTERO_PANEL_URL ?? env.PTERO_URL ?? "";
        const mail = renderPanelAccessEmail({
          brandName: "Cloudsting",
          panelUrl: panel,
          email,
          temporaryPassword: tempPassword,
        });
        await sendEmail({ to: email, subject: mail.subject, text: mail.text, html: mail.html });
      } catch {
        // ignore email failures
      }
    }

    // Pick a node + allocation automatically.
    const nodesRes = await ptero.listNodes();
    const eligibleNodes = nodesRes.data
      .map((d) => d.attributes)
      .filter((n: any) => !n.maintenance_mode)
      .filter((n: any) => (Number(n.memory) || 0) - (Number(n.allocated_resources?.memory) || 0) >= plan.ramMb);

    let chosenAllocationId: number | null = null;
    let chosenAllocationPort: number | null = null;
    let chosenNodeId: number | null = null;

    for (const n of eligibleNodes) {
      const allocations = await ptero.listNodeAllocations(n.id);
      const free = allocations.find((a) => !a.assigned);
      if (free) {
        chosenAllocationId = free.id;
        chosenAllocationPort = free.port;
        chosenNodeId = n.id;
        break;
      }
    }

    if (!chosenAllocationId) {
      throw Object.assign(new Error("Out of Stock"), { status: 409 });
    }

    const defaultEnv = env.PTERO_DEFAULT_ENV ? JSON.parse(env.PTERO_DEFAULT_ENV) : {};
    const mergedEnv: Record<string, string> = {
      ...defaultEnv,
    };

    if (typeof opts.vanillaVersion === "string") {
      const v = opts.vanillaVersion.trim();
      // Matches egg input rules: required|string between 3..15
      if (/^(latest|snapshot|\d+\.\d+(?:\.\d+)?)$/.test(v) && v.length >= 3 && v.length <= 15) {
        mergedEnv.VANILLA_VERSION = v;
      }
    }

    if (mergedEnv.SERVER_PORT == null && chosenAllocationPort != null) {
      mergedEnv.SERVER_PORT = String(chosenAllocationPort);
    }

    const created = await ptero.createServer({
      name: opts.serverName,
      userId: user.pterodactylUserId,
      eggId: env.PTERO_DEFAULT_EGG_ID,
      dockerImage: dockerImageForVanillaVersion({
        vanillaVersion: mergedEnv.VANILLA_VERSION ?? opts.vanillaVersion,
        defaultDockerImage: env.PTERO_DEFAULT_DOCKER_IMAGE ?? "ghcr.io/pterodactyl/yolks:java_17",
      }),
      startup:
        env.PTERO_DEFAULT_STARTUP ??
        "java -Xms128M -Xmx{{SERVER_MEMORY}}M -jar server.jar",
      environment: {
        ...mergedEnv,
      },
      limits: {
        memory: plan.ramMb,
        cpu: plan.cpuPercent,
        disk: plan.diskMb,
      },
      featureLimits: {
        databases: plan.databasesLimit ?? 0,
        backups: plan.backupsLimit ?? 0,
        allocations: plan.allocationsLimit ?? 1,
      },
      allocation: { default: chosenAllocationId },
    });

    await prisma.server.update({
      where: { id: server.id },
      data: {
        status: "ACTIVE",
        pterodactylServerId: created.id,
        pterodactylIdentifier: created.identifier,
        nodeId: created.node ?? chosenNodeId,
        allocationId: created.allocation,
      },
    });
  }

  return server;
}
