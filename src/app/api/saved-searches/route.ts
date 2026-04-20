import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureSessionUser, requireSession } from "@/lib/api-helpers";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireSession();
  if ("error" in auth) return auth.error;

  const saved = await prisma.savedSearch.findMany({
    where: { userId: auth.userId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(
    saved.map((s) => ({
      id: s.id,
      name: s.name,
      query: s.query,
      filters: safeParse(s.filters),
      createdAt: s.createdAt,
    }))
  );
}

export async function POST(req: NextRequest) {
  const auth = await requireSession();
  if ("error" in auth) return auth.error;

  let body: { name?: string; query?: string; filters?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const name = (body.name ?? "").trim();
  if (!name || name.length > 80) {
    return NextResponse.json(
      { error: "Name is required (1-80 characters)" },
      { status: 400 }
    );
  }
  const query = (body.query ?? "").toString();
  const filters = body.filters ? JSON.stringify(body.filters) : "{}";

  try {
    await ensureSessionUser(auth);
    const created = await prisma.savedSearch.create({
      data: { userId: auth.userId, name, query, filters },
    });

    return NextResponse.json({
      id: created.id,
      name: created.name,
      query: created.query,
      filters: safeParse(created.filters),
      createdAt: created.createdAt,
    });
  } catch (e) {
    console.error("saved search write failed", e);
    return NextResponse.json(
      { error: "Could not save this search. Sign out and sign in again, then retry." },
      { status: 500 }
    );
  }
}

function safeParse(s: string): unknown {
  try {
    return JSON.parse(s);
  } catch {
    return {};
  }
}
