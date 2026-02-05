// src/lib/cart.ts
import { getUserToken, clearUserSession } from "@/lib/userAuth";

const BASE_URL = "https://admin.bezalelsolar.com";

// ===== Cart update event (so header can refresh) =====
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

// ===== Helpers =====
async function postJson(path: string, body: any, token?: string | null) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    if (res.status === 401) {
      clearUserSession();
      throw new Error("SESSION_EXPIRED");
    }
    const validation = data?.errors
      ? (Object.values(data.errors).flat() as string[]).join(" ")
      : null;

    throw new Error(validation || data.message || "Request failed");
  }

  return data;
}

// ===== API: GET CART =====
// Your cart endpoint returns: { message: "...", data: [...] }
export async function getCart(): Promise<any[]> {
  const token = getUserToken();

  // If user is not logged in, treat cart as empty (no error)
  if (!token) return [];

  try {
    const res = await fetch(`${BASE_URL}/api/cart`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    // If token expired, clear session and return empty cart
    if (res.status === 401) {
      clearUserSession();
      return [];
    }

    const json = await res.json().catch(() => ({}));
    return Array.isArray(json?.data) ? json.data : [];
  } catch {
    return [];
  }
}

// ===== Cart summary helpers (Header uses this) =====
export function calcCartSummary(items: any[]) {
  const totalQty = (items || []).reduce(
    (sum, item) => sum + Number(item?.quantity || 0),
    0
  );

  return { totalQty };
}

// ===== API: ADD TO CART =====
// Backend requires: product_id, quantity, price
export async function addToCart(product_id: number, quantity: number, price: number) {
  const token = getUserToken();
  if (!token) throw new Error("LOGIN_REQUIRED");

  if (!product_id) throw new Error("Product id is required");
  if (!quantity || quantity < 1) throw new Error("Quantity must be at least 1");

  // IMPORTANT: price must be a number (not "₦29.99")
  if (price === undefined || price === null || Number.isNaN(Number(price))) {
    throw new Error("Price is required");
  }

  const data = await postJson(
    "/api/cart/add",
    {
      product_id,
      quantity,
      price: Number(price),
    },
    token
  );

  emitCartUpdated();
  return data;
}
