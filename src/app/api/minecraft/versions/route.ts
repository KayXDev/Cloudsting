import { jsonError, jsonOk } from "@/server/http";

const MANIFEST_URLS = [
  "https://launchermeta.mojang.com/mc/game/version_manifest_v2.json",
  "https://piston-meta.mojang.com/mc/game/version_manifest_v2.json",
] as const;

type CacheValue = {
  fetchedAt: number;
  releases: string[];
  snapshots: string[];
  oldBetas: string[];
  oldAlphas: string[];
};

function getCache(): CacheValue | null {
  const g = globalThis as any;
  return (g.__kx_mc_versions_cache as CacheValue | undefined) ?? null;
}

function setCache(value: CacheValue) {
  const g = globalThis as any;
  g.__kx_mc_versions_cache = value;
}

async function fetchManifest(): Promise<any> {
  let lastErr: any = null;
  for (const url of MANIFEST_URLS) {
    try {
      const res = await fetch(url, {
        // Let Next cache be controlled by our in-memory cache.
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`Manifest fetch failed: ${res.status}`);
      return await res.json();
    } catch (err) {
      lastErr = err;
    }
  }
  throw lastErr ?? new Error("Unable to fetch manifest");
}

export async function GET() {
  try {
    const cached = getCache();
    const oneHour = 60 * 60 * 1000;
    if (cached && Date.now() - cached.fetchedAt < oneHour) {
      return jsonOk({ releases: cached.releases, snapshots: cached.snapshots, cachedAt: cached.fetchedAt });
    }

    const manifest = await fetchManifest();
    const versions: Array<{ id: string; type: string; releaseTime?: string }> = Array.isArray(manifest?.versions)
      ? manifest.versions
      : [];

    // Keep all known releases/snapshots; order newest first.
    const sorted = versions
      .filter((v) => typeof v?.id === "string" && typeof v?.type === "string")
      .sort((a, b) => {
        const at = a.releaseTime ? Date.parse(a.releaseTime) : 0;
        const bt = b.releaseTime ? Date.parse(b.releaseTime) : 0;
        return bt - at;
      });

    const releases = sorted.filter((v) => v.type === "release").map((v) => v.id);
    const snapshots = sorted.filter((v) => v.type === "snapshot").map((v) => v.id);
    const oldBetas = sorted.filter((v) => v.type === "old_beta").map((v) => v.id);
    const oldAlphas = sorted.filter((v) => v.type === "old_alpha").map((v) => v.id);

    const value: CacheValue = { fetchedAt: Date.now(), releases, snapshots, oldBetas, oldAlphas };
    setCache(value);

    return jsonOk({ releases, snapshots, oldBetas, oldAlphas, cachedAt: value.fetchedAt });
  } catch (err: any) {
    return jsonError(err?.message ?? "Failed to load Minecraft versions", 500);
  }
}
