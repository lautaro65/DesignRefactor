import { NextRequest, NextResponse } from "next/server"
import  prisma  from "@/app/lib/prisma"

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code")
  if (!code) return NextResponse.json({ error: "No code received" }, { status: 400 })

  const clientId = process.env.ML_CLIENT_ID!
  const clientSecret = process.env.ML_CLIENT_SECRET!
  const redirectUri = "https://design-refactor.vercel.app/api/ml-callback"

  const res = await fetch("https://api.mercadolibre.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri,
    }),
  })

  const data = await res.json()
  if (!res.ok) return NextResponse.json({ error: "Token exchange failed", detail: data }, { status: 502 })

  const expiresAt = Date.now() + data.expires_in * 1000

  // Guardamos los tokens en la DB
  await Promise.all([
    prisma.appConfig.upsert({
      where: { key: "ml_access_token" },
      update: { value: data.access_token },
      create: { key: "ml_access_token", value: data.access_token },
    }),
    prisma.appConfig.upsert({
      where: { key: "ml_refresh_token" },
      update: { value: data.refresh_token },
      create: { key: "ml_refresh_token", value: data.refresh_token },
    }),
    prisma.appConfig.upsert({
      where: { key: "ml_token_expires_at" },
      update: { value: String(expiresAt) },
      create: { key: "ml_token_expires_at", value: String(expiresAt) },
    }),
  ])

  console.log("[ML] Tokens guardados en DB, expiran en", Math.round(data.expires_in / 3600), "hs")

  return new NextResponse(
    `<html><body style="font-family:monospace;padding:40px;background:#0a0a0a;color:#fff">
      <h2 style="color:#4ade80">✓ Tokens guardados en la base de datos</h2>
      <p style="color:#888;margin-bottom:8px">El access token y refresh token están guardados en la DB.</p>
      <p style="color:#888;">La app ahora renueva el token automáticamente sin intervención manual.</p>
      <p style="color:#888;margin-top:16px;font-size:12px">Expira en: ${Math.round(data.expires_in / 3600)}hs — se renovará solo.</p>
      <p style="color:#4ade80;margin-top:20px;font-size:13px">✓ Podés cerrar esta pestaña.</p>
    </body></html>`,
    { headers: { "Content-Type": "text/html" } }
  )
}