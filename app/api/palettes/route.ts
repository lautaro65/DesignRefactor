// app/api/palettes/route.ts
// GET  → listar paletas del usuario
// POST → guardar paleta nueva

import { NextRequest, NextResponse } from "next/server";
import  prisma  from "@/app/lib/prisma"

// GET /api/palettes?userId=xxx
export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");
  if (!userId) {
    return NextResponse.json({ error: "userId requerido" }, { status: 400 });
  }

  const palettes = await prisma.savedPalette.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ palettes });
}

// POST /api/palettes
// body: { userId, name, colors }
export async function POST(req: NextRequest) {
  try {
    const { userId, name, colors } = await req.json();

    if (!userId || !colors?.length) {
      return NextResponse.json(
        { error: "userId y colors son requeridos" },
        { status: 400 }
      );
    }

    const palette = await prisma.savedPalette.create({
      data: {
        userId,
        name: name ?? `Palette ${Date.now()}`,
        colors,
      },
    });

    return NextResponse.json({ palette }, { status: 201 });
  } catch (err) {
    console.error("[palettes POST] error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}