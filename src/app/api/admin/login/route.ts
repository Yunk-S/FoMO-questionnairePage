import { NextResponse } from "next/server";
import { createAdminToken, setAdminCookie, verifyAdminPassword } from "@/lib/admin-auth";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "请求体不是有效 JSON" }, { status: 400 });
  }

  const password = (body as Record<string, unknown>).password;

  if (!process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "ADMIN_PASSWORD 尚未配置" }, { status: 500 });
  }

  if (!verifyAdminPassword(password)) {
    return NextResponse.json({ error: "管理口令不正确" }, { status: 401 });
  }

  await setAdminCookie(createAdminToken());

  return NextResponse.json({ ok: true });
}
