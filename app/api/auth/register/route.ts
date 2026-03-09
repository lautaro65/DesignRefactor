import { NextRequest, NextResponse } from "next/server"
import  prisma  from "@/app/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(req: NextRequest) {
  try {
    const { email, password, name } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email y contraseña requeridos" }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "La contraseña debe tener al menos 8 caracteres" }, { status: 400 })
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: "Ya existe una cuenta con ese email" }, { status: 409 })
    }

    const hashed = await bcrypt.hash(password, 12)

    await prisma.user.create({
      data: { email, passwordHash: hashed, name: name || null },
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[register] error:", err)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}