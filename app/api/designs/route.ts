// app/api/designs/route.ts
// GET  → historial de diseños del usuario
// POST → crear design nuevo (antes de generar)

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/prisma";

// GET /api/designs?userId=xxx&limit=10
export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");
  const limit = parseInt(req.nextUrl.searchParams.get("limit") ?? "10");

  if (!userId) {
    return NextResponse.json({ error: "userId requerido" }, { status: 400 });
  }

  const designs = await prisma.design.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      createdAt: true,
      roomType: true,
      style: true,
      palette: true,
      originalImageUrl: true,
      generatedImageUrl: true,
      status: true,
    },
  });

  return NextResponse.json({ designs });
}

// POST /api/designs
// body: { userId, roomType, style, palette, prompt, maxPrice, originalImageUrl }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, roomType, style, palette, prompt, maxPrice, originalImageUrl } = body;

    if (!userId || !roomType || !style) {
      return NextResponse.json(
        { error: "userId, roomType y style son requeridos" },
        { status: 400 }
      );
    }

    const design = await prisma.design.create({
      data: {
        userId,
        roomType,
        style,
        palette: palette ?? [],
        prompt: prompt ?? null,
        maxPrice: maxPrice ?? null,
        originalImageUrl: originalImageUrl ?? "pending",
        status: "pending",
      },
    });

    return NextResponse.json({ design }, { status: 201 });
  } catch (err) {
    console.error("[designs POST] error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}