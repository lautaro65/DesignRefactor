import { NextRequest, NextResponse } from "next/server"
import  prisma  from "@/app/lib/prisma"

type TransformLevel = "simple" | "medium" | "complete"
type Category = "decoracion" | "pintura" | "textiles" | "iluminacion" | "asientos" | "fijos"

interface MLProduct {
  id: string; title: string; price: number
  thumbnail: string; thumbnail_id?: string
  permalink: string; condition: string
}

interface Product {
  id: string; name: string; price: string; priceRaw: number
  img: string; url: string; condition: string
  category: Category; categoryLabel: string; overBudget: boolean
}

// ─── TOKEN MANAGER (DB-backed) ────────────────────────────────────────────────

async function getValidToken(): Promise<string> {
  const TEN_MINUTES = 10 * 60 * 1000

  // Leer tokens de la DB
  const [accessRow, refreshRow, expiresRow] = await Promise.all([
    prisma.appConfig.findUnique({ where: { key: "ml_access_token" } }),
    prisma.appConfig.findUnique({ where: { key: "ml_refresh_token" } }),
    prisma.appConfig.findUnique({ where: { key: "ml_token_expires_at" } }),
  ])

  const accessToken = accessRow?.value ?? process.env.ML_ACCESS_TOKEN ?? ""
  const refreshToken = refreshRow?.value ?? process.env.ML_REFRESH_TOKEN ?? ""
  const expiresAt = expiresRow ? Number(expiresRow.value) : 0

  // Token vigente
  if (accessToken && expiresAt > Date.now() + TEN_MINUTES) {
    return accessToken
  }

  // Token vencido o por vencer → refresh
  if (!refreshToken) {
    if (accessToken) return accessToken // último intento
    throw new Error("Sin tokens ML. Visitá /api/ml-auth para autenticarte.")
  }

  console.log("[ML] Token por vencer, renovando...")

  const res = await fetch("https://api.mercadolibre.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      client_id: process.env.ML_CLIENT_ID!,
      client_secret: process.env.ML_CLIENT_SECRET!,
      refresh_token: refreshToken,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    console.error("[ML] Refresh failed:", res.status, err)
    if (accessToken) return accessToken
    throw new Error(`ML token refresh failed: ${res.status}`)
  }

  const data = await res.json()
  const newExpiresAt = Date.now() + data.expires_in * 1000

  // Guardar nuevos tokens en DB
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
      update: { value: String(newExpiresAt) },
      create: { key: "ml_token_expires_at", value: String(newExpiresAt) },
    }),
  ])

  console.log(`[ML] Token renovado y guardado en DB, expira en ${Math.round(data.expires_in / 3600)}hs`)
  return data.access_token
}

// ─── CATEGORÍAS ───────────────────────────────────────────────────────────────

const CATEGORIES_BY_LEVEL: Record<TransformLevel, Category[]> = {
  simple:   ["decoracion", "textiles"],
  medium:   ["decoracion", "pintura", "textiles", "iluminacion", "asientos"],
  complete: ["decoracion", "pintura", "textiles", "iluminacion", "asientos", "fijos"],
}

const CATEGORY_META: Record<Category, { label: string; priority: number }> = {
  decoracion:  { label: "Decoración",  priority: 1 },
  pintura:     { label: "Pintura",     priority: 2 },
  textiles:    { label: "Textiles",    priority: 3 },
  iluminacion: { label: "Iluminación", priority: 4 },
  asientos:    { label: "Asientos",    priority: 5 },
  fijos:       { label: "Fijos",       priority: 6 },
}

type RoomQueries = Partial<Record<Category, string[]>>
const QUERIES: Record<string, Record<string, RoomQueries>> = {
  minimalist: {
    kitchen: {
      decoracion:  ["especiero minimalista", "organizador cocina", "maceta interior"],
      pintura:     ["pintura látex blanca interior", "pintura esmalte blanco"],
      textiles:    ["repasador lino", "cortina cocina"],
      iluminacion: ["lámpara colgante cocina", "aplique pared cocina"],
      asientos:    ["taburete cocina blanco", "silla cocina minimalista"],
      fijos:       ["heladera no frost blanca", "cocina gas acero inoxidable"],
    },
    living: {
      decoracion:  ["cuadro minimalista", "planta interior maceta", "vela decorativa"],
      pintura:     ["pintura látex blanca interior", "pintura gris claro"],
      textiles:    ["almohadón lino", "manta tejida beige"],
      iluminacion: ["lámpara pie minimalista", "aplique pared moderno"],
      asientos:    ["sillón minimalista", "silla nórdica"],
      fijos:       ["sofá minimalista", "mesa centro madera"],
    },
    bedroom: {
      decoracion:  ["cuadro dormitorio", "difusor aromas", "planta interior"],
      pintura:     ["pintura látex blanca", "pintura gris suave"],
      textiles:    ["acolchado blanco", "almohadón blanco"],
      iluminacion: ["velador minimalista", "tira led dormitorio"],
      asientos:    ["silla dormitorio", "banqueta pie cama"],
      fijos:       ["cama minimalista", "mesa luz"],
    },
    office: {
      decoracion:  ["planta escritorio", "organizador escritorio", "cuadro"],
      pintura:     ["pintura látex blanca", "pintura gris claro"],
      textiles:    ["cortina oficina", "almohadón silla"],
      iluminacion: ["lámpara escritorio", "tira led monitor"],
      asientos:    ["silla ergonómica", "silla escritorio"],
      fijos:       ["escritorio minimalista", "estantería oficina"],
    },
    bathroom: {
      decoracion:  ["dispensador jabón", "planta baño", "canasto baño"],
      pintura:     ["pintura látex baño blanca", "esmalte blanco"],
      textiles:    ["toalla blanca", "alfombra baño"],
      iluminacion: ["aplique espejo baño", "lámpara baño"],
      asientos:    ["taburete baño", "banquito madera baño"],
      fijos:       ["espejo baño", "mueble bajo mesada"],
    },
  },
  scandinavian: {
    kitchen: {
      decoracion:  ["especiero madera", "cesta mimbre", "planta hierbas"],
      pintura:     ["pintura látex blanco roto", "pintura gris nórdico"],
      textiles:    ["repasador algodón", "delantal cocina lino"],
      iluminacion: ["lámpara colgante madera", "lámpara nórdica"],
      asientos:    ["taburete madera natural", "silla madera cocina"],
      fijos:       ["heladera blanca", "cocina gas"],
    },
    living: {
      decoracion:  ["planta interior", "cesta ratán", "vela nórdica"],
      pintura:     ["pintura blanco roto", "pintura gris suave"],
      textiles:    ["almohadón lana", "manta escandinava"],
      iluminacion: ["lámpara pie madera", "lámpara techo nórdica"],
      asientos:    ["sillón escandinavo", "silla madera tapizada"],
      fijos:       ["sofá escandinavo", "mesa centro madera"],
    },
    bedroom: {
      decoracion:  ["planta dormitorio", "cuadro nórdico", "espejo madera"],
      pintura:     ["pintura blanco nórdico", "pintura gris claro"],
      textiles:    ["acolchado blanco", "almohadón lana"],
      iluminacion: ["velador madera", "lámpara nórdica"],
      asientos:    ["silla nórdica", "banco dormitorio madera"],
      fijos:       ["cama madera", "placard madera"],
    },
  },
  industrial: {
    kitchen: {
      decoracion:  ["especiero metal", "reloj pared industrial", "planta interior"],
      pintura:     ["pintura gris oscuro", "pintura cemento"],
      textiles:    ["repasador cuadros", "cortina lino gris"],
      iluminacion: ["lámpara colgante industrial", "aplique metal negro"],
      asientos:    ["taburete hierro", "silla metal cocina"],
      fijos:       ["heladera acero inoxidable", "cocina industrial"],
    },
    living: {
      decoracion:  ["cuadro industrial", "reloj metal", "planta interior"],
      pintura:     ["pintura gris oscuro", "pintura negro mate"],
      textiles:    ["almohadón cuero", "manta gris"],
      iluminacion: ["lámpara industrial", "aplique pared metal"],
      asientos:    ["sillón cuero", "silla metal"],
      fijos:       ["sofá cuero", "mesa hierro madera"],
    },
  },
  japandi: {
    kitchen: {
      decoracion:  ["especiero bambú", "cuenco madera", "planta interior"],
      pintura:     ["pintura blanca interior", "pintura beige suave"],
      textiles:    ["repasador lino natural", "cortina lino beige"],
      iluminacion: ["lámpara bambú colgante", "lámpara papel arroz"],
      asientos:    ["taburete madera clara", "silla japandi"],
      fijos:       ["heladera blanca", "cocina gas"],
    },
    living: {
      decoracion:  ["planta interior", "cuenco cerámica", "vela zen"],
      pintura:     ["pintura blanco cálido", "pintura beige arena"],
      textiles:    ["almohadón lino", "manta algodón natural"],
      iluminacion: ["lámpara papel", "lámpara bambú"],
      asientos:    ["sillón moderno", "silla meditación"],
      fijos:       ["sofá moderno", "mesa baja madera"],
    },
  },
}

const FALLBACK_QUERIES: Record<Category, string[]> = {
  decoracion:  ["objeto decorativo", "planta interior"],
  pintura:     ["pintura látex blanca"],
  textiles:    ["almohadón decorativo"],
  iluminacion: ["lámpara moderna"],
  asientos:    ["silla moderna"],
  fijos:       ["mueble moderno"],
}

function paletteToColorModifier(palette: string[]): string {
  const hex = palette[0] ?? "#FFFFFF"
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  const brightness = (r * 299 + g * 587 + b * 114) / 1000
  if (brightness > 200) return "blanco"
  if (brightness < 60)  return "negro"
  if (r > g + 40 && r > b + 40) return "terracota"
  if (g > r + 20) return "verde"
  if (b > r + 20) return "azul"
  if (r > 160 && g > 130) return "madera"
  return ""
}

function extractPromptKeyword(prompt: string): string {
  const lower = prompt.toLowerCase()
  const materials: Record<string, string> = {
    "madera": "madera", "metal": "metal", "hierro": "hierro",
    "ratán": "ratán", "bambú": "bambú", "lino": "lino", "cuero": "cuero",
  }
  for (const [word, kw] of Object.entries(materials)) {
    if (lower.includes(word)) return kw
  }
  return ""
}

async function fetchMLProducts(query: string, token: string): Promise<MLProduct[]> {
  const params = new URLSearchParams({ q: query, limit: "4", sort: "relevance" })
  const res = await fetch(
    `https://api.mercadolibre.com/sites/MLA/search?${params}`,
    { headers: { Authorization: `Bearer ${token}` }, next: { revalidate: 3600 } }
  )
  if (!res.ok) {
    const body = await res.text()
    console.error(`[ML] Error ${res.status} para "${query}":`, body.slice(0, 150))
    return []
  }
  const data = await res.json()
  return (data.results ?? []) as MLProduct[]
}

export async function POST(req: NextRequest) {
  try {
    const {
      style = "minimalist", roomType = "living", palette = ["#FFFFFF"],
      prompt = "", maxPrice = 0, transformLevel = "medium",
    } = await req.json()

    let token: string
    try {
      token = await getValidToken()
    } catch (err) {
      console.error("[search-products] Sin token:", err)
      return NextResponse.json(
        { error: "Sin token de ML. Visitá /api/ml-auth para autenticarte." },
        { status: 502 }
      )
    }

    const activeCategories = CATEGORIES_BY_LEVEL[transformLevel as TransformLevel] ?? CATEGORIES_BY_LEVEL.medium
    const colorMod = paletteToColorModifier(palette)
    const promptKw = extractPromptKeyword(prompt)

    console.log(`[search-products] style=${style} room=${roomType} level=${transformLevel} color=${colorMod||"—"} prompt=${promptKw||"—"}`)

    const styleMap = QUERIES[style] ?? QUERIES["minimalist"]
    const roomMap = styleMap[roomType] ?? styleMap[Object.keys(styleMap)[0]] ?? {}

    const categoryResults = await Promise.allSettled(
      activeCategories.map(async (category) => {
        const meta = CATEGORY_META[category]
        const queries = roomMap[category] ?? FALLBACK_QUERIES[category]
        let best: MLProduct | undefined
        for (const base of queries.slice(0, 3)) {
          let q = base
          if (colorMod && !q.toLowerCase().includes(colorMod)) q += ` ${colorMod}`
          if (promptKw && !q.toLowerCase().includes(promptKw)) q += ` ${promptKw}`
          console.log(`[search-products] ${category} → "${q}"`)
          const products = await fetchMLProducts(q, token)
          best = products.find(p => p.thumbnail && p.permalink)
          if (best) break
        }
        if (!best) return null
        return { ...best, category, categoryLabel: meta.label, priority: meta.priority }
      })
    )

    let budgetUsed = 0
    const withinBudget: Product[] = []
    const overBudget: Product[] = []

    const valid = categoryResults
      .filter((r): r is PromiseFulfilledResult<NonNullable<any>> =>
        r.status === "fulfilled" && r.value !== null)
      .map(r => r.value)
      .sort((a, b) => a.priority - b.priority)

    for (const r of valid) {
      const img = r.thumbnail_id
        ? `https://http2.mlstatic.com/D_NQ_NP_${r.thumbnail_id}-O.jpg`
        : r.thumbnail.replace("http://", "https://").replace("-I.jpg", "-O.jpg")

      const product: Product = {
        id: r.id, name: r.title,
        price: `ARS $${Math.round(r.price).toLocaleString("es-AR")}`,
        priceRaw: r.price, img, url: r.permalink,
        condition: r.condition, category: r.category,
        categoryLabel: r.categoryLabel, overBudget: false,
      }

      if (!maxPrice || maxPrice === 0) {
        withinBudget.push(product); budgetUsed += r.price
      } else if (budgetUsed + r.price > maxPrice) {
        overBudget.push({ ...product, overBudget: true })
      } else {
        budgetUsed += r.price; withinBudget.push(product)
      }
    }

    console.log(`[search-products] within: ${withinBudget.length}, over: ${overBudget.length}, used: $${Math.round(budgetUsed)}`)

    return NextResponse.json({
      withinBudget, overBudget,
      budgetUsed: Math.round(budgetUsed),
      budgetTotal: maxPrice,
      budgetRemaining: maxPrice > 0 ? Math.max(0, maxPrice - Math.round(budgetUsed)) : null,
    })

  } catch (err) {
    console.error("[search-products] error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}