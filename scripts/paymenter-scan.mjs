import fs from "fs";

function parseDotenvFile(filePath) {
  const out = {};
  const text = fs.readFileSync(filePath, "utf8");
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();

    // Strip surrounding quotes
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    out[key] = value;
  }
  return out;
}

function normalizeApiBase(paymenterUrl) {
  const trimmed = String(paymenterUrl || "").replace(/\/$/, "");
  if (!trimmed) throw new Error("Missing PAYMENTER_URL");

  // If the user already set a full API base, respect it.
  if (trimmed.endsWith("/api")) return trimmed;
  const versioned = trimmed.match(/^(.*\/api)\/v\d+$/);
  if (versioned) return versioned[1];

  return trimmed;
}

async function paymenterRequest(apiBase, apiKey, path) {
  const url = `${apiBase}${path}`;
  const res = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/vnd.api+json",
      Authorization: `Bearer ${apiKey}`,
    },
    cache: "no-store",
  });

  const text = await res.text();
  let json;
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    json = { raw: text };
  }

  if (!res.ok) {
    const msg = typeof json?.message === "string" ? json.message : text;
    throw new Error(`Paymenter request failed ${res.status}: ${msg}`);
  }
  return json;
}

async function detectWorkingApiBase(apiBaseCandidates, apiKey) {
  let lastErr = null;
  for (const candidate of apiBaseCandidates) {
    try {
      // We know /v1/admin/services exists on most installs; use it to confirm the base.
      await paymenterRequest(candidate, apiKey, `/v1/admin/services?per_page=1`);
      return candidate;
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr ?? new Error("Unable to reach Paymenter API");
}

function collectProductAndPlanIdsFromProductsResponse(productsRes) {
  const out = [];
  const includedIndex = indexIncludedByType(productsRes.included ?? []);
  const products = productsRes.data ?? [];

  for (const p of products) {
    const productId = numericId(p);
    const name = p.attributes?.name ?? "(no name)";
    const slug = p.attributes?.slug ?? null;
    const planRefs = p.relationships?.plans?.data ?? [];
    const plans = planRefs.map((ref) => {
      const plan = includedIndex.get(`${ref.type}:${ref.id}`);
      return {
        planId: numericId(plan ?? ref),
        planName: plan?.attributes?.name ?? null,
        planType: plan?.attributes?.type ?? null,
        billingPeriod: plan?.attributes?.billing_period ?? null,
        billingUnit: plan?.attributes?.billing_unit ?? null,
      };
    });
    out.push({ productId, name, slug, plans });
  }

  return out;
}

function collectProductAndPlanIdsFromCategoriesResponse(categoriesRes) {
  const out = [];
  const included = categoriesRes.included ?? [];
  const products = included.filter((r) => r?.type === "products");
  for (const p of products) {
    const productId = numericId(p);
    const name = p.attributes?.name ?? "(no name)";
    const slug = p.attributes?.slug ?? null;
    const planRefs = p.relationships?.plans?.data ?? [];
    const plans = planRefs.map((ref) => ({ planId: numericId(ref), planName: null }));
    out.push({ productId, name, slug, plans });
  }
  return out;
}

function collectProductAndPlanIdsFromServicesResponse(servicesRes) {
  const out = [];
  const included = servicesRes.included ?? [];
  const includedProducts = included.filter((r) => r?.type === "products");

  // Prefer product resources from `included` (have names + plan relationships).
  for (const p of includedProducts) {
    const productId = numericId(p);
    const name = p.attributes?.name ?? "(no name)";
    const slug = p.attributes?.slug ?? null;
    const planRefs = p.relationships?.plans?.data ?? [];
    const plans = planRefs.map((ref) => ({ planId: numericId(ref), planName: null }));
    out.push({ productId, name, slug, plans });
  }

  // Fallback: derive product IDs from the service relationship even if `included` is missing.
  const seen = new Set(out.map((p) => String(p.productId)));
  const services = servicesRes.data ?? [];
  for (const s of services) {
    const prodRef = s.relationships?.product?.data;
    const productId = numericId(prodRef);
    if (!productId) continue;
    const key = String(productId);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ productId, name: "(from services relationship)", slug: null, plans: [] });
  }

  return out;
}

function indexIncludedByType(included = []) {
  const map = new Map();
  for (const item of included) {
    const key = `${item.type}:${item.id}`;
    map.set(key, item);
  }
  return map;
}

function numericId(resource) {
  if (!resource) return null;
  const attrId = resource.attributes?.id;
  if (typeof attrId === "number") return attrId;
  const n = Number(resource.id);
  return Number.isFinite(n) ? n : null;
}

async function main() {
  const env = parseDotenvFile(new URL("../.env", import.meta.url));
  const apiKey = env.PAYMENTER_API_KEY;
  const paymenterUrl = env.PAYMENTER_URL;

  if (!apiKey) throw new Error("PAYMENTER_API_KEY is empty in .env");
  const base = normalizeApiBase(paymenterUrl);

  // Auto-detect API prefix: some installs expose /api/v1/*, others /v1/*.
  const apiBaseCandidates = Array.from(
    new Set([base, `${base}/api`].map((b) => String(b).replace(/\/$/, "")))
  );

  const apiBase = await detectWorkingApiBase(apiBaseCandidates, apiKey);
  console.log(`Using API base: ${apiBase}`);

  let products = [];
  try {
    console.log(`Trying: ${apiBase}/v1/admin/products?include=plans.prices ...`);
    const productsRes = await paymenterRequest(
      apiBase,
      apiKey,
      `/v1/admin/products?per_page=100&include=plans.prices`
    );
    products = collectProductAndPlanIdsFromProductsResponse(productsRes);
  } catch (e) {
    console.log(`Products endpoint failed: ${e?.message ?? e}`);
    console.log(`Falling back to categories include...`);

    const includeCandidates = [
      `products,products.plans,products.plans.prices`,
      `products,products.plans`,
      `products`,
    ];

    let categoriesRes = null;
    let lastErr = null;
    for (const inc of includeCandidates) {
      try {
        console.log(`Trying: ${apiBase}/v1/admin/categories?include=${inc} ...`);
        categoriesRes = await paymenterRequest(
          apiBase,
          apiKey,
          `/v1/admin/categories?per_page=100&include=${encodeURIComponent(inc)}`
        );
        break;
      } catch (err) {
        console.log(`  Failed include=${inc}: ${err?.message ?? err}`);
        lastErr = err;
      }
    }

    if (categoriesRes) {
      products = collectProductAndPlanIdsFromCategoriesResponse(categoriesRes);
    } else {
      console.log(`Categories fallback failed: ${lastErr?.message ?? lastErr}`);
      console.log(`Falling back to services include=product...`);

      const serviceIncludeCandidates = [
        `product,product.plans,product.plans.prices,properties`,
        `product,product.plans,properties`,
        `product,properties`,
        `product`,
      ];

      let servicesRes = null;
      let lastServiceErr = null;
      for (const inc of serviceIncludeCandidates) {
        try {
          console.log(`Trying: ${apiBase}/v1/admin/services?include=${inc} ...`);
          servicesRes = await paymenterRequest(
            apiBase,
            apiKey,
            `/v1/admin/services?per_page=100&include=${encodeURIComponent(inc)}`
          );
          break;
        } catch (err) {
          console.log(`  Failed include=${inc}: ${err?.message ?? err}`);
          lastServiceErr = err;
        }
      }

      if (!servicesRes) throw lastServiceErr ?? new Error("Unable to list services for products/plans discovery");
      const serviceCount = Array.isArray(servicesRes.data) ? servicesRes.data.length : 0;
      console.log(`Services returned: ${serviceCount}`);

      // Show property keys/values for quick manual discovery (plan_id might be stored as a property).
      const included = servicesRes.included ?? [];
      const props = included.filter((r) => r?.type === "properties");
      if (props.length) {
        console.log(`Included properties: ${props.length}`);
        const sample = props.slice(0, 25).map((p) => ({
          id: numericId(p),
          key: p.attributes?.key ?? null,
          value: p.attributes?.value ?? null,
          name: p.attributes?.name ?? null,
        }));
        console.log("Property sample:", sample);
      } else {
        console.log("No properties included (or none exist on services).");
      }

      products = collectProductAndPlanIdsFromServicesResponse(servicesRes);
    }
  }

  console.log(`Found ${products.length} product(s) (direct or via fallback).`);

  for (const p of products) {
    console.log("\nPRODUCT", { productId: p.productId, name: p.name, slug: p.slug });
    if (!p.plans?.length) {
      console.log("  (no plans attached)");
      continue;
    }
    for (const plan of p.plans) {
      console.log("  PLAN", plan);
    }
  }

  console.log("\nNow create PAYMENTER_SERVICE_MAPPING using your internal plan slugs as keys:");
  console.log("  vanilla-start, vanilla-plus, vanilla-pro");
  console.log("Example format:");
  console.log('  {"vanilla-start":{"productId":1,"planId":2}}');
}

main().catch((e) => {
  console.error(e?.message ?? e);
  process.exit(1);
});
