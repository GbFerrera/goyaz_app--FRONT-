 "use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { IconMail, IconLock, IconArrowRight, IconShieldCheck, IconAlertCircle, IconLoader2 } from "@tabler/icons-react"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3433"

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE}/sessions/admin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data?.message ?? "E-mail ou senha incorretos")
        return
      }
      localStorage.setItem("token", data.token)
      router.push("/admins")
    } catch {
      setError("Falha de rede ao tentar login")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={cn("w-full max-w-[1000px] mx-auto", className)} {...props}>
      <Card className="overflow-hidden border-none shadow-2xl rounded-[2.5rem] bg-white dark:bg-slate-900">
        <CardContent className="grid p-0 md:grid-cols-2 min-h-[600px]">
          <div className="p-8 md:p-12 lg:p-16 flex flex-col justify-center">
            <div className="mb-10">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 text-primary border border-primary/20">
                <IconShieldCheck className="w-10 h-10" />
              </div>
              <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">
                Portal Admin
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-lg">
                Bem-vindo de volta ao sistema Goiaz. Por favor, identifique-se.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
                    E-mail Institucional
                  </label>
                  <div className="relative group">
                    <IconMail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu.nome@goiaz.com"
                      required
                      value={email}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                      className="h-14 pl-12 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 focus:ring-primary/20 transition-all text-base"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
                    Senha de Acesso
                  </label>
                  <div className="relative group">
                    <IconLock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      required
                      value={password}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                      className="h-14 pl-12 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 focus:ring-primary/20 transition-all text-base"
                    />
                  </div>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 text-sm font-medium animate-in fade-in slide-in-from-top-2 duration-300">
                  <IconAlertCircle className="w-5 h-5 shrink-0" />
                  {error}
                </div>
              )}

              <Button 
                type="submit" 
                disabled={loading} 
                className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white text-lg font-bold shadow-xl shadow-primary/20 transition-all hover:-translate-y-0.5 active:translate-y-0 flex gap-2 group"
              >
                {loading ? (
                  <>
                    <IconLoader2 className="w-6 h-6 animate-spin" />
                    Autenticando...
                  </>
                ) : (
                  <>
                    Entrar no Sistema
                    <IconArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-10 pt-10 border-t border-slate-100 dark:border-slate-800 text-center">
              <p className="text-slate-400 text-sm font-medium">
                © {new Date().getFullYear()} Goiaz Tecnologia. Todos os direitos reservados.
              </p>
            </div>
          </div>

          <div className="hidden md:flex relative overflow-hidden bg-primary p-12 lg:p-16 flex-col justify-between">
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-indigo-900" />
            
            {/* Abstract shapes for visual interest */}
            <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-white/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-indigo-500/20 rounded-full blur-3xl" />
            
            <div className="relative z-10">
             
              
              <div className="space-y-6">
                <h2 className="text-4xl lg:text-5xl font-black text-white leading-tight">
                  Gestão inteligente para o seu agronegócio.
                </h2>
                <p className="text-primary-foreground/80 text-lg max-w-md">
                  A plataforma definitiva para controle de vendas, clientes e gestão administrativa com alta performance.
                </p>
              </div>
            </div>

          
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
