export const BASE_URL = "https://admin.bezalelsolar.com";

export function toAbsoluteMediaUrl(pathOrUrl: string | null | undefined) {
  if (!pathOrUrl) return null;
  if (pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://")) return pathOrUrl;
  // ensure no double slash
  return `${BASE_URL}/${pathOrUrl.replace(/^\/+/, "")}`;
}
