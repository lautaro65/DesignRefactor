"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function AuthPage() {
  const router = useRouter()
  const [tab, setTab] = useState<"login" | "register">("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleCredentials(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    if (tab === "register") {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Error al registrarse")
        setLoading(false)
        return
      }
    }

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    })

    setLoading(false)

    if (result?.error) {
      setError("Email o contraseña incorrectos")
    } else {
      router.push("/es-ES/redesign")
    }
  }

  async function handleGoogle() {
    await signIn("google", { callbackUrl: "/es-ES/redesign" })
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center px-4 relative overflow-hidden">

      {/* Grid background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          maskImage: "radial-gradient(ellipse 70% 70% at 50% 50%, black 20%, transparent 100%)",
        }}
      />

      {/* Logo */}
      <Link
        href="/"
        className="absolute top-6 left-7 flex items-center gap-2 text-foreground/80 hover:text-foreground text-sm font-medium tracking-tight transition-colors z-10"
      >
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
          <path d="M10 1L19 6.5V13.5L10 19L1 13.5V6.5L10 1Z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
          <path d="M10 5L15 8V12L10 15L5 12V8L10 5Z" fill="currentColor" opacity="0.4"/>
        </svg>
        DesignRefactor
      </Link>

      {/* Card */}
      <div className="relative z-10 w-full max-w-sm bg-card border border-border rounded-xl p-7 animate-in fade-in slide-in-from-bottom-2 duration-300">

        {/* Header */}
        <div className="mb-5">
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            {tab === "login" ? "Welcome back" : "Create account"}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {tab === "login" ? "Sign in to continue designing" : "Start optimizing your space"}
          </p>
        </div>

        {/* Tabs */}
        <div className="relative flex bg-muted rounded-lg p-0.5 mb-5">
          <button
            onClick={() => { setTab("login"); setError("") }}
            className={`flex-1 py-1.5 text-sm font-medium rounded-md relative z-10 transition-colors ${
              tab === "login" ? "text-foreground" : "text-muted-foreground"
            }`}
          >
            Sign in
          </button>
          <button
            onClick={() => { setTab("register"); setError("") }}
            className={`flex-1 py-1.5 text-sm font-medium rounded-md relative z-10 transition-colors ${
              tab === "register" ? "text-foreground" : "text-muted-foreground"
            }`}
          >
            Register
          </button>
          {/* Sliding indicator */}
          <div
            className={`absolute top-0.5 bottom-0.5 w-[calc(50%-2px)] bg-accent border border-border rounded-md transition-all duration-200 ${
              tab === "register" ? "left-[calc(50%+1px)]" : "left-0.5"
            }`}
          />
        </div>

        {/* Google */}
        <button
          onClick={handleGoogle}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-secondary hover:bg-accent border border-border rounded-lg text-sm font-medium text-secondary-foreground transition-colors mb-4"
        >
          <svg width="16" height="16" viewBox="0 0 18 18">
            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
            <path d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 6.293C4.672 4.166 6.656 3.58 9 3.58z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-border" />
          <span className="text-[11px] text-muted-foreground uppercase tracking-widest">or</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Form */}
        <form onSubmit={handleCredentials} className="flex flex-col gap-3">
          {tab === "register" && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">Full name</label>
              <input
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                className="w-full px-3 py-2 bg-input border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-ring transition-colors"
              />
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 bg-input border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-ring transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-muted-foreground">Password</label>
              {tab === "login" && (
                <a href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                  Forgot password?
                </a>
              )}
            </div>
            <input
              type="password"
              placeholder={tab === "register" ? "Min. 8 characters" : "••••••••"}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 bg-input border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-ring transition-colors"
            />
          </div>

          {error && (
            <p className="text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-1 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:opacity-85 active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-primary-foreground/25 border-t-primary-foreground rounded-full animate-spin" />
            ) : tab === "login" ? "Sign in" : "Create account"}
          </button>
        </form>

        <p className="mt-5 text-[11px] text-muted-foreground/60 text-center leading-relaxed">
          By continuing you agree to our{" "}
          <a href="#" className="underline underline-offset-2 hover:text-muted-foreground transition-colors">Terms</a>
          {" "}and{" "}
          <a href="#" className="underline underline-offset-2 hover:text-muted-foreground transition-colors">Privacy Policy</a>
        </p>
      </div>
    </div>
  )
}