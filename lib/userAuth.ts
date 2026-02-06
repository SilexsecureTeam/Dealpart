const BASE_URL = "https://admin.bezalelsolar.com";

export function setUserSession(payload: { token: string; expires_at?: string; user?: any }) {
  localStorage.setItem("userToken", payload.token);

  if (payload.expires_at) {
    localStorage.setItem("userTokenExpiresAt", payload.expires_at);
  }

  if (payload.user) {
    localStorage.setItem("userProfile", JSON.stringify(payload.user));
  }
}

export function getUserToken() {
  return localStorage.getItem("userToken");
}

export function getUser() {
  const profile = localStorage.getItem("userProfile");
  return profile ? JSON.parse(profile) : null;
}

export function isUserLoggedIn() {
  return !!getUserToken();
}

export function clearUserSession() {
  localStorage.removeItem("userToken");
  localStorage.removeItem("userTokenExpiresAt");
  localStorage.removeItem("userProfile");
}

async function postJson(path: string, body: any) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const validation = data?.errors ? Object.values(data.errors).flat().join(" ") : null;
    throw new Error(validation || data.message || "Request failed");
  }

  return data;
}

export async function registerStep1(form: {
  name: string;
  email: string;
  phone?: string;
  password: string;
  password_confirmation: string;
}) {
  return await postJson("/api/register", {
    name: form.name,
    email: form.email,
    phone: form.phone || undefined,
    password: form.password,
    password_confirmation: form.password_confirmation,
  });
}

export async function registerStep2Verify(payload: { email: string; code: string }) {
  const data = await postJson("/api/verify-code", payload);

  if (!data.token) throw new Error("Token not returned by verify-code");

  setUserSession({ token: data.token, user: data.user, expires_at: data.expires_at });

  return data;
}

export async function loginUser(login: string, password: string) {
  const data = await postJson("/api/login", { login, password });

  if (!data.token) throw new Error("Token not returned by login");

  setUserSession({ token: data.token, user: data.user || data.data, expires_at: data.expires_at });

  return data;
}