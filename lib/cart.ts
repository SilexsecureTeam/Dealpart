import { customerApi } from "@/lib/customerApiClient";

const CART_EVENT = "cart:updated";

export function emitCartUpdated() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(CART_EVENT));
}

export function onCartUpdated(cb: () => void) {
  if (typeof window === "undefined") return () => {};
  const handler = () => cb();
  window.addEventListener(CART_EVENT, handler);
  return () => window.removeEventListener(CART_EVENT, handler);
}

/**
 * Get current cart items – returns empty array if not logged in or error
 */
export async function getCart(): Promise<any[]> {
  const token = typeof window !== "undefined" ? localStorage.getItem("customerToken") : null;
  if (!token) return [];

  try {
    const json = await customerApi.cart.get();
    return Array.isArray(json?.data) ? json.data : [];
  } catch (err: any) {
    // If session expired, clear token
    if (err?.message?.includes("401") || err?.message?.includes("SESSION_EXPIRED")) {
      customerApi.auth.logout();
    }
    return [];
  }
}

/**
 * Calculate cart summary (count & total)
 */
export function calcCartSummary(items: any[]) {
  const count = (items || []).reduce(
    (sum, item) => sum + Number(item?.quantity || 0),
    0
  );

  const total = (items || []).reduce(
    (sum, item) =>
      sum + Number(item?.quantity || 0) * Number(item?.price || item?.unit_price || 0),
    0
  );

  return { count, total };
}

/**
 * Add product to cart – throws LOGIN_REQUIRED if not logged in
 */
export async function addToCart(product_id: number, quantity: number, price: number) {
  const token = typeof window !== "undefined" ? localStorage.getItem("customerToken") : null;
  if (!token) throw new Error("LOGIN_REQUIRED");

  if (!product_id) throw new Error("Product id is required");
  if (!quantity || quantity < 1) throw new Error("Quantity must be at least 1");
  if (price === undefined || price === null || Number.isNaN(Number(price))) {
    throw new Error("Price is required");
  }

  const data = await customerApi.cart.add(product_id, quantity, price);
  emitCartUpdated();
  return data;
}