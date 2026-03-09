// app/api/generate-image/route.ts
// Fase 4 — Generación de imagen con fal.ai (ControlNet + IP-Adapter)
// Por ahora retorna la imagen original como placeholder
// Se completa en Fase 4 cuando tengamos los productos reales de ML

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/prisma";

export async function POST(req: NextRequest) {
  try {
    const {
      originalImageBase64,
      style,
      roomType,
      palette,
      prompt,
      products,
      userId,      // opcional hasta que implementemos auth en Fase 5
      designId,    // si ya existe el design en DB, actualizamos
    } = await req.json();

    if (!originalImageBase64 || !style || !roomType) {
      return NextResponse.json(
        { error: "originalImageBase64, style y roomType son requeridos" },
        { status: 400 }
      );
    }

    // ── Si hay userId, guardamos/actualizamos el design en DB ──────────────
    let savedDesign = null;
    if (userId) {
      const designData = {
        roomType,
        style,
        palette: palette ?? [],
        prompt: prompt ?? null,
        products: products ?? null,
        status: "generating" as const,
        // originalImageUrl: en Fase 4 real subimos a Vercel Blob
        originalImageUrl: "pending",
      };

      if (designId) {
        savedDesign = await prisma.design.update({
          where: { id: designId },
          data: { ...designData, status: "generating" },
        });
      } else {
        savedDesign = await prisma.design.create({
          data: { ...designData, userId },
        });
      }
    }

    // ── TODO Fase 4: reemplazar este bloque con fal.ai ─────────────────────
    // const FAL_KEY = process.env.FAL_KEY;
    // const falRes = await fetch("https://fal.run/fal-ai/controlnet", {
    //   method: "POST",
    //   headers: { Authorization: `Key ${FAL_KEY}`, "Content-Type": "application/json" },
    //   body: JSON.stringify({
    //     image_url: originalImageBase64,
    //     prompt: buildPrompt(style, roomType, palette, prompt),
    //     ip_adapter_images: products?.map(p => p.img) ?? [],
    //   }),
    // });
    // const { images } = await falRes.json();
    // const generatedImageUrl = images[0].url;
    // ── FIN TODO ────────────────────────────────────────────────────────────

    // Placeholder: devuelve imagen original
    const generatedImageUrl = null;

    // Actualizar design como "done" si existe
    if (savedDesign) {
      await prisma.design.update({
        where: { id: savedDesign.id },
        data: {
          status: generatedImageUrl ? "done" : "pending",
          generatedImageUrl: generatedImageUrl ?? undefined,
        },
      });
    }

    return NextResponse.json({
      success: true,
      generatedImageUrl,
      designId: savedDesign?.id ?? null,
      // En Fase 4 real, acá viene la imagen generada por IA
      message: "Fase 4 pendiente — por ahora retorna imagen original",
    });
  } catch (err) {
    console.error("[generate-image] error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}