import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "Missing url" }, { status: 400 });
  }

  // Optional safety: only allow your domain
  const allowedHost = "admin.bezalelsolar.com";
  try {
    const u = new URL(url);
    if (u.host !== allowedHost) {
      return NextResponse.json({ error: "Host not allowed" }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: "Invalid url" }, { status: 400 });
  }

  // ✅ forward browser cookies to upstream
  const cookie = req.headers.get("cookie") ?? "";

  const upstream = await fetch(url, {
    headers: {
      cookie,
      accept: "image/*",
      // These sometimes help when servers validate fetch origin-like headers:
      referer: "https://admin.bezalelsolar.com/",
      origin: "https://admin.bezalelsolar.com",
    },
    cache: "no-store",
  });

  // If upstream is still 403, return a useful debug payload
  if (!upstream.ok) {
    const text = await upstream.text().catch(() => "");
    return NextResponse.json(
      { error: "Upstream error", status: upstream.status, body: text.slice(0, 300) },
      { status: upstream.status }
    );
  }

  const contentType = upstream.headers.get("content-type") || "application/octet-stream";
  const bytes = await upstream.arrayBuffer();

  return new NextResponse(bytes, {
    status: 200,
    headers: {
      "content-type": contentType,
      "cache-control": "no-store",
    },
  });
}
