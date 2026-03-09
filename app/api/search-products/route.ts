// app/api/search-products/route.ts
import { NextRequest, NextResponse } from "next/server";

// ─── TIPOS ────────────────────────────────────────────────────────────────────

type TransformLevel = "simple" | "medium" | "complete";
type Category = "decoracion" | "pintura" | "textiles" | "iluminacion" | "asientos" | "fijos";

interface MLProduct {
  id: string;
  title: string;
  price: number;
  thumbnail: string;
  thumbnail_id?: string;
  permalink: string;
  condition: string;
  seller_address?: { city?: { name: string }; state?: { name: string } };
}

interface Product {
  id: string;
  name: string;
  price: string;
  priceRaw: number;
  img: string;
  url: string;
  condition: string;
  category: Category;
  categoryLabel: string;
  overBudget: boolean;
}

// ─── TOKEN CACHE (en memoria, dura hasta que el server se reinicia) ───────────

let cachedToken: { value: string; expiresAt: number } | null = null;

async function getMLToken(): Promise<string> {
  // Si el token existe y le quedan más de 5 minutos, lo reutilizamos
  if (cachedToken && cachedToken.expiresAt > Date.now() + 5 * 60 * 1000) {
    return cachedToken.value;
  }

  const clientId = process.env.ML_CLIENT_ID;
  const clientSecret = process.env.ML_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("ML_CLIENT_ID o ML_CLIENT_SECRET no configurados en .env.local");
  }

  const res = await fetch("https://api.mercadolibre.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`ML auth error ${res.status}: ${err}`);
  }

  const data = await res.json();
  // ML devuelve expires_in en segundos
  cachedToken = {
    value: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };

  console.log("[ML] Token obtenido, expira en", data.expires_in, "segundos");
  return cachedToken.value;
}

// ─── CATEGORÍAS POR NIVEL ─────────────────────────────────────────────────────

const CATEGORIES_BY_LEVEL: Record<TransformLevel, Category[]> = {
  simple:   ["decoracion", "textiles"],
  medium:   ["decoracion", "pintura", "textiles", "iluminacion", "asientos"],
  complete: ["decoracion", "pintura", "textiles", "iluminacion", "asientos", "fijos"],
};

const CATEGORY_META: Record<Category, { label: string; priority: number }> = {
  decoracion:  { label: "Decoración",  priority: 1 },
  pintura:     { label: "Pintura",     priority: 2 },
  textiles:    { label: "Textiles",    priority: 3 },
  iluminacion: { label: "Iluminación", priority: 4 },
  asientos:    { label: "Asientos",    priority: 5 },
  fijos:       { label: "Fijos",       priority: 6 },
};

// ─── QUERIES POR ESTILO + ROOM + CATEGORÍA ────────────────────────────────────

type RoomQueries = Partial<Record<Category, string[]>>;

const QUERIES: Record<string, Record<string, RoomQueries>> = {
  minimalist: {
    kitchen: {
      decoracion:  ["especiero minimalista", "maceta interior blanca", "organizador cocina"],
      pintura:     ["pintura látex blanca interior", "pintura esmalte blanco"],
      textiles:    ["repasador lino", "cortina cocina blanca"],
      iluminacion: ["lámpara colgante cocina minimalista", "aplique pared cocina"],
      asientos:    ["taburete cocina blanco", "silla cocina minimalista"],
      fijos:       ["heladera no frost blanca", "cocina gas acero inoxidable"],
    },
    living: {
      decoracion:  ["cuadro minimalista", "planta interior maceta", "vela decorativa"],
      pintura:     ["pintura látex blanca interior", "pintura gris claro"],
      textiles:    ["almohadón lino blanco", "manta tejida beige"],
      iluminacion: ["lámpara pie minimalista", "aplique pared moderno"],
      asientos:    ["sillón minimalista", "silla nórdica"],
      fijos:       ["sofá minimalista", "mesa centro minimalista"],
    },
    bedroom: {
      decoracion:  ["cuadro dormitorio minimalista", "planta interior pequeña", "difusor aromas"],
      pintura:     ["pintura látex blanca", "pintura gris suave"],
      textiles:    ["almohadón blanco", "acolchado blanco"],
      iluminacion: ["lámpara velador minimalista", "tira led dormitorio"],
      asientos:    ["silla dormitorio", "banqueta pie cama"],
      fijos:       ["cama minimalista", "mesa luz minimalista"],
    },
    office: {
      decoracion:  ["planta escritorio", "organizador escritorio madera", "cuadro"],
      pintura:     ["pintura látex blanca", "pintura gris claro"],
      textiles:    ["cortina oficina blanca", "almohadón silla"],
      iluminacion: ["lámpara escritorio minimalista", "tira led monitor"],
      asientos:    ["silla ergonómica", "silla escritorio moderna"],
      fijos:       ["escritorio minimalista", "estantería oficina"],
    },
    bathroom: {
      decoracion:  ["dispensador jabón minimalista", "planta baño", "canasto baño"],
      pintura:     ["pintura látex baño blanca", "esmalte blanco"],
      textiles:    ["toalla blanca", "alfombra baño blanca"],
      iluminacion: ["aplique espejo baño", "lámpara baño"],
      asientos:    ["taburete baño", "banquito madera baño"],
      fijos:       ["espejo baño minimalista", "mueble bajo mesada"],
    },
  },
  scandinavian: {
    kitchen: {
      decoracion:  ["especiero madera", "cesta mimbre cocina", "planta hierbas"],
      pintura:     ["pintura látex blanco roto", "pintura gris nórdico"],
      textiles:    ["repasador algodón", "delantal cocina lino"],
      iluminacion: ["lámpara colgante madera", "lámpara nórdica cocina"],
      asientos:    ["taburete madera natural", "silla madera cocina"],
      fijos:       ["heladera blanca", "cocina gas blanca"],
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
      fijos:       ["cama madera", "placard madera natural"],
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
      decoracion:  ["especiero bambú", "planta interior", "cuenco madera"],
      pintura:     ["pintura blanco japonés", "pintura beige suave"],
      textiles:    ["repasador lino natural", "cortina lino beige"],
      iluminacion: ["lámpara papel arroz", "lámpara bambú colgante"],
      asientos:    ["taburete madera clara", "silla japandi"],
      fijos:       ["heladera blanca", "cocina gas minimalista"],
    },
    living: {
      decoracion:  ["planta bonsai", "cuenco cerámica", "vela zen"],
      pintura:     ["pintura blanco cálido", "pintura beige arena"],
      textiles:    ["almohadón lino", "manta algodón natural"],
      iluminacion: ["lámpara papel", "lámpara bambú"],
      asientos:    ["sillón japandi", "silla meditación"],
      fijos:       ["sofá bajo japandi", "mesa baja madera"],
    },
  },
};

const FALLBACK_QUERIES: Record<Category, string[]> = {
  decoracion:  ["objeto decorativo moderno", "planta interior"],
  pintura:     ["pintura látex blanca interior"],
  textiles:    ["almohadón decorativo", "manta decorativa"],
  iluminacion: ["lámpara moderna", "aplique pared"],
  asientos:    ["silla moderna", "sillón moderno"],
  fijos:       ["mueble moderno"],
};

// ─── PALETA → COLOR KEYWORDS ──────────────────────────────────────────────────

function hexToColorKeywords(hex: string): string[] {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;

  if (brightness > 200) return ["blanco"];
  if (brightness < 60)  return ["negro"];
  if (r > g + 40 && r > b + 40) return ["terracota"];
  if (g > r + 20 && g > b + 20) return ["verde"];
  if (b > r + 20 && b > g + 20) return ["azul"];
  if (r > 160 && g > 130 && b > 100) return ["madera natural"];
  return ["gris"];
}

function paletteToColorModifiers(palette: string[]): string[] {
  return [...new Set(palette.flatMap(hexToColorKeywords))].slice(0, 2);
}

// ─── PROMPT → KEYWORDS ───────────────────────────────────────────────────────

function extractPromptKeywords(prompt: string): string[] {
  const lower = prompt.toLowerCase();
  const materialMap: Record<string, string> = {
    "madera": "madera", "metal": "metal", "hierro": "hierro",
    "ratán": "ratán", "bambú": "bambú", "lino": "lino",
    "cuero": "cuero", "mármol": "mármol", "cemento": "cemento",
  };
  return Object.entries(materialMap)
    .filter(([word]) => lower.includes(word))
    .map(([, kw]) => kw)
    .slice(0, 1); // solo 1 para no saturar la query
}

// ─── BUILD QUERY ─────────────────────────────────────────────────────────────

function buildQuery(base: string, colorMods: string[], promptKws: string[]): string {
  // Solo el primer color modifier, solo si no está ya en la query base
  const color = colorMods[0] ?? "";
  const material = promptKws[0] ?? "";
  let q = base;
  if (color && !q.toLowerCase().includes(color)) q += ` ${color}`;
  if (material && !q.toLowerCase().includes(material)) q += ` ${material}`;
  return q.trim();
}

// ─── FETCH ML CON TOKEN ───────────────────────────────────────────────────────

async function fetchMLProducts(query: string, token: string): Promise<MLProduct[]> {
  const params = new URLSearchParams({ q: query, limit: "3", sort: "relevance" });

  const res = await fetch(
    `https://api.mercadolibre.com/sites/MLA/search?${params}`,
    {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: 3600 },
    }
  );

  if (!res.ok) {
    console.error(`[ML] Error ${res.status} para query: "${query}"`);
    return [];
  }

  const data = await res.json();
  return (data.results ?? []) as MLProduct[];
}

// ─── HANDLER ─────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const {
      style = "minimalist",
      roomType = "living",
      palette = ["#FFFFFF"],
      prompt = "",
      maxPrice = 0,
      transformLevel = "medium",
    } = await req.json();

    // 1 — Obtener token de ML
    let token: string;
    try {
      token = await getMLToken();
    } catch (err) {
      console.error("[search-products] Error obteniendo token ML:", err);
      return NextResponse.json(
        { error: "No se pudo autenticar con Mercado Libre. Verificá ML_CLIENT_ID y ML_CLIENT_SECRET." },
        { status: 502 }
      );
    }

    // 2 — Categorías activas según nivel
    const activeCategories = CATEGORIES_BY_LEVEL[transformLevel as TransformLevel] ?? CATEGORIES_BY_LEVEL.medium;

    // 3 — Parsear paleta y prompt
    const colorMods = paletteToColorModifiers(palette);
    const promptKws = extractPromptKeywords(prompt);

    console.log("[search-products] color modifiers:", colorMods);
    console.log("[search-products] prompt keywords:", promptKws);

    // 4 — Queries base para estilo + room
    const styleMap = QUERIES[style] ?? QUERIES["minimalist"];
    const roomMap = styleMap[roomType] ?? styleMap[Object.keys(styleMap)[0]] ?? {};

    // 5 — Buscar en ML en paralelo
    const categoryResults = await Promise.allSettled(
      activeCategories.map(async (category) => {
        const meta = CATEGORY_META[category];
        const baseQueries = roomMap[category] ?? FALLBACK_QUERIES[category];

        // Try each query until we find a result with image
        let best: MLProduct | undefined;
        let usedQuery = "";
        for (const rawQuery of baseQueries.slice(0, 3)) {
          const finalQuery = buildQuery(rawQuery, colorMods, promptKws);
          console.log(`[search-products] ${category} → trying "${finalQuery}"`);
          const mlProducts = await fetchMLProducts(finalQuery, token);
          best = mlProducts.find((p) => p.thumbnail && p.permalink);
          if (best) { usedQuery = finalQuery; break; }
        }
        if (!best) return null;
        console.log(`[search-products] ${category} ✓ found via "${usedQuery}"`);

        return { ...best, category, categoryLabel: meta.label, priority: meta.priority };
      })
    );

    // 6 — Distribuir por budget
    let budgetUsed = 0;
    const withinBudget: Product[] = [];
    const overBudget: Product[] = [];

    const valid = categoryResults
      .filter((r): r is PromiseFulfilledResult<NonNullable<any>> =>
        r.status === "fulfilled" && r.value !== null
      )
      .map((r) => r.value)
      .sort((a, b) => a.priority - b.priority);

    for (const r of valid) {
      const product: Product = {
        id: r.id,
        name: r.title,
        price: `ARS $${Math.round(r.price).toLocaleString("es-AR")}`,
        priceRaw: r.price,
        img: r.thumbnail_id
          ? `https://http2.mlstatic.com/D_NQ_NP_${r.thumbnail_id}-O.jpg`
          : r.thumbnail.replace("http://", "https://").replace("-I.jpg", "-O.jpg").replace("-I.webp", "-O.webp"),
        url: r.permalink,
        condition: r.condition,
        category: r.category,
        categoryLabel: r.categoryLabel,
        overBudget: false,
      };

      if (!maxPrice || maxPrice === 0) {
        withinBudget.push(product);
        budgetUsed += r.price;
      } else if (budgetUsed + r.price > maxPrice) {
        overBudget.push({ ...product, overBudget: true });
      } else {
        budgetUsed += r.price;
        withinBudget.push(product);
      }
    }

    console.log(`[search-products] within: ${withinBudget.length}, over: ${overBudget.length}, used: $${Math.round(budgetUsed)}`);

    return NextResponse.json({
      withinBudget,
      overBudget,
      budgetUsed: Math.round(budgetUsed),
      budgetTotal: maxPrice,
      budgetRemaining: maxPrice > 0 ? Math.max(0, maxPrice - Math.round(budgetUsed)) : null,
    });

  } catch (err) {
    console.error("[search-products] error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}