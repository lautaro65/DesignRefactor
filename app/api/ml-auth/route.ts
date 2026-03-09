import { NextResponse } from "next/server"

export async function GET() {
  const clientId = process.env.ML_CLIENT_ID!
  const redirectUri = "https://design-refactor.vercel.app/api/ml-callback"

  const url = new URL("https://auth.mercadolibre.com.ar/authorization")
  url.searchParams.set("response_type", "code")
  url.searchParams.set("client_id", clientId)
  url.searchParams.set("redirect_uri", redirectUri)

  return NextResponse.redirect(url.toString())
}