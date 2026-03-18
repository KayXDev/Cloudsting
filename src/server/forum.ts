import { prisma } from "@/server/db";

const DEFAULT_FORUM_CATEGORIES = [
  {
    slug: "announcements",
    name: "Announcements",
    description: "Product updates, launches, maintenance notes, and official Cloudsting news.",
    sortOrder: 1,
  },
  {
    slug: "setup-help",
    name: "Setup Help",
    description: "Questions about server setup, performance, plugins, modpacks, and practical hosting decisions.",
    sortOrder: 2,
  },
  {
    slug: "showcase",
    name: "Showcase",
    description: "Share your server, plugin stack, community ideas, and what you are building.",
    sortOrder: 3,
  },
];

export async function ensureForumSeeded() {
  const count = await prisma.forumCategory.count();
  if (count === 0) {
    for (const category of DEFAULT_FORUM_CATEGORIES) {
      try {
        await prisma.forumCategory.create({ data: category });
      } catch {
        // Ignore races across concurrent requests during the first bootstrap.
      }
    }
  }
}

export function forumThreadIsLocked(status: "OPEN" | "LOCKED") {
  return status === "LOCKED";
}

export function formatForumAuthorName(input: { name: string | null; email: string }) {
  const name = input.name?.trim();
  return name && name.length > 0 ? name : input.email.split("@")[0];
}