export type CartItem = {
  id: string;
  planSlug: string;
  planName: string;
  ramMb: number;
  cpuPercent: number;
  diskMb: number;
  priceMonthlyCents: number;
  interval: "week" | "month" | "quarter" | "year";
  serverName: string;
  vanillaVersion: string;
  addedAt: string;
};

const CART_KEY = "cloudsting-cart";

function safeParse(value: string | null): CartItem[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function readCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  return safeParse(window.localStorage.getItem(CART_KEY));
}

function writeCart(items: CartItem[]) {
  window.localStorage.setItem(CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("cloudsting-cart-change"));
}

export function addCartItem(item: Omit<CartItem, "id" | "addedAt" | "serverName" | "vanillaVersion"> & Partial<Pick<CartItem, "serverName" | "vanillaVersion">>) {
  if (typeof window === "undefined") return;
  const items = readCart();
  items.push({
    ...item,
    id: crypto.randomUUID(),
    serverName: item.serverName ?? item.planName,
    vanillaVersion: item.vanillaVersion ?? "latest",
    addedAt: new Date().toISOString(),
  });
  writeCart(items);
}

export function updateCartItem(id: string, patch: Partial<CartItem>) {
  if (typeof window === "undefined") return;
  const items = readCart().map((item) => (item.id === id ? { ...item, ...patch } : item));
  writeCart(items);
}

export function removeCartItem(id: string) {
  if (typeof window === "undefined") return;
  writeCart(readCart().filter((item) => item.id !== id));
}

export function clearCart() {
  if (typeof window === "undefined") return;
  writeCart([]);
}

export function findCartItem(id: string) {
  return readCart().find((item) => item.id === id) ?? null;
}