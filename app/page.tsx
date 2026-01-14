import { LoginForm } from "@/components/login-form"
import Image from "next/image"

export default function LoginPage() {
  return (
    <main className="fixed inset-0 flex items-center justify-center bg-slate-50 dark:bg-slate-950 overflow-hidden p-4">
      {/* Imagem de Fundo com Opacidade */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <Image
          src="/image.png"
          alt="Background"
          fill
          className="object-cover opacity-20 dark:opacity-10"
          priority
        />
        {/* Overlay para garantir legibilidade */}
        <div className="absolute inset-0 bg-gradient-to-tr from-slate-50/50 via-transparent to-slate-50/50 dark:from-slate-950/50 dark:to-slate-950/50" />
      </div>

      <div className="relative z-10 w-full flex justify-center items-center h-full">
        <LoginForm />
      </div>
    </main>
  )
}
