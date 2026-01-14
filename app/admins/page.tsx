 "use client";
 import { PageLayout } from "@/components/page-layout";
 import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { IconPlus, IconPencil, IconKey, IconSearch, IconMail, IconPhone, IconId, IconCalendar, IconShield, IconCheck, IconX, IconUser } from "@tabler/icons-react";

export default function Admins() {
  type Admin = {
    id: number;
    name: string;
    email: string;
    phone_number?: string | null;
    document?: string | null;
    created_at?: string;
  };
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [document, setDocument] = useState("");

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 10) {
      return numbers
        .replace(/(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{4})(\d)/, "$1-$2")
        .substring(0, 14);
    }
    return numbers
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .substring(0, 15);
  };

  const formatDocument = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 11) {
      return numbers
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
        .substring(0, 14);
    }
    return numbers
      .replace(/(\d{2})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1/$2")
      .replace(/(\d{4})(\d{1,2})$/, "$1-$2")
      .substring(0, 18);
  };
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [openReset, setOpenReset] = useState(false);
  const [resettingId, setResettingId] = useState<number | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loadingReset, setLoadingReset] = useState(false);
  const [errorReset, setErrorReset] = useState<string | null>(null);
  const [messageReset, setMessageReset] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3433";

  const filteredAdmins = admins.filter(a => 
    a.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    a.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.phone_number?.includes(searchTerm) ||
    a.document?.includes(searchTerm)
  );
 
  async function fetchAdmins() {
    setLoadingList(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const res = await fetch(`${API_BASE}/admins`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });
      const data = await res.json();
      setAdmins(Array.isArray(data) ? data : []);
    } catch {
      setAdmins([]);
    } finally {
      setLoadingList(false);
    }
  }
 
   useEffect(() => {
     fetchAdmins();
   }, []);
 
  function openCreateDialog() {
    setIsEditing(false);
    setEditingId(null);
    setName("");
    setEmail("");
    setPhone("");
    setDocument("");
    setPassword("");
    setMessage(null);
    setError(null);
    setOpen(true);
  }

  function openEditDialog(admin: Admin) {
    setIsEditing(true);
    setEditingId(admin.id);
    setName(admin.name || "");
    setEmail(admin.email || "");
    setPhone(admin.phone_number || "");
    setDocument(admin.document || "");
    setPassword("");
    setMessage(null);
    setError(null);
    setOpen(true);
  }

  function openResetDialog(admin: Admin) {
    setResettingId(admin.id);
    setNewPassword("");
    setConfirmPassword("");
    setMessageReset(null);
    setErrorReset(null);
    setOpenReset(true);
  }

  async function handleResetSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoadingReset(true);
    setMessageReset(null);
    setErrorReset(null);
    try {
      if (!resettingId) {
        setErrorReset("Administrador inválido");
        return;
      }
      if (!newPassword || newPassword.length < 6) {
        setErrorReset("Senha deve ter ao menos 6 caracteres");
        return;
      }
      if (newPassword !== confirmPassword) {
        setErrorReset("As senhas não conferem");
        return;
      }
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const res = await fetch(`${API_BASE}/admins/${resettingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: token ? `Bearer ${token}` : "" },
        body: JSON.stringify({ password: newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorReset(data?.message ?? "Erro ao redefinir senha");
        return;
      }
      setMessageReset("Senha redefinida com sucesso");
      setOpenReset(false);
      fetchAdmins();
    } catch {
      setErrorReset("Falha de rede ao redefinir senha");
    } finally {
      setLoadingReset(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);
    try {
      const url = isEditing && editingId ? `${API_BASE}/admins/${editingId}` : `${API_BASE}/admins`;
      const method = isEditing ? "PUT" : "POST";
      const body = isEditing
        ? JSON.stringify({
            name,
            email,
            phone_number: phone || undefined,
            document: document || undefined,
          })
        : JSON.stringify({
            name,
            email,
            phone_number: phone || undefined,
            document: document || undefined,
            password,
          });
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: token ? `Bearer ${token}` : "" },
        body,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.message ?? (isEditing ? "Erro ao atualizar administrador" : "Erro ao criar administrador"));
        return;
      }
      setMessage(isEditing ? "Administrador atualizado com sucesso" : "Administrador criado com sucesso");
      setName("");
      setEmail("");
      setPhone("");
      setDocument("");
      setPassword("");
      setIsEditing(false);
      setEditingId(null);
      setOpen(false);
      fetchAdmins();
    } catch {
      setError(isEditing ? "Falha de rede ao atualizar administrador" : "Falha de rede ao criar administrador");
    } finally {
      setLoading(false);
    }
  }
 
   return (
    <PageLayout title="Administradores" description="Gestão de administradores da plataforma">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-8">
        <div className="relative w-full md:w-96 group">
          <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
          <Input
            placeholder="Buscar por nome, email, telefone ou documento..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-12 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-primary/20 transition-all shadow-sm"
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
            >
              <IconX className="w-4 h-4 text-slate-400" />
            </button>
          )}
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog} className="w-full md:w-auto h-12 px-6 rounded-2xl bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 active:translate-y-0 flex gap-2">
              <IconPlus className="w-5 h-5" />
              Novo Administrador
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg rounded-3xl border-none shadow-2xl overflow-hidden p-0">
            <div className="bg-primary/5 p-8 border-b border-primary/10">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-slate-900 dark:text-white">
                  {isEditing ? "Editar Administrador" : "Novo Administrador"}
                </DialogTitle>
                <DialogDescription className="text-slate-500 dark:text-slate-400">
                  {isEditing ? "Atualize os dados do administrador" : "Preencha os dados para criar um novo acesso administrativo"}
                </DialogDescription>
              </DialogHeader>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-1 gap-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <IconUser className="w-4 h-4 text-primary" /> Nome Completo
                  </label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Ex: João Silva"
                    className="h-11 rounded-xl bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 focus:ring-primary/20"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <IconMail className="w-4 h-4 text-primary" /> Email Profissional
                  </label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="email@empresa.com"
                    className="h-11 rounded-xl bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 focus:ring-primary/20"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      <IconPhone className="w-4 h-4 text-primary" /> Telefone
                    </label>
                    <Input
                      value={phone}
                      onChange={(e) => setPhone(formatPhone(e.target.value))}
                      placeholder="(00) 00000-0000"
                      className="h-11 rounded-xl bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 focus:ring-primary/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      <IconId className="w-4 h-4 text-primary" /> Documento
                    </label>
                    <Input
                      value={document}
                      onChange={(e) => setDocument(formatDocument(e.target.value))}
                      placeholder="CPF ou CNPJ"
                      className="h-11 rounded-xl bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 focus:ring-primary/20"
                    />
                  </div>
                </div>

                {!isEditing && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      <IconShield className="w-4 h-4 text-primary" /> Senha de Acesso
                    </label>
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="Mínimo 6 caracteres"
                      className="h-11 rounded-xl bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 focus:ring-primary/20"
                    />
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-3 pt-4">
                <Button type="submit" disabled={loading} className="w-full h-12 rounded-xl text-base font-semibold transition-all shadow-lg shadow-primary/10">
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Salvando...
                    </div>
                  ) : isEditing ? "Salvar Alterações" : "Criar Administrador"}
                </Button>
                {message && (
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 p-3 rounded-xl text-sm font-medium border border-emerald-100 dark:border-emerald-500/20">
                    <IconCheck className="w-4 h-4" /> {message}
                  </div>
                )}
                {error && (
                  <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 p-3 rounded-xl text-sm font-medium border border-rose-100 dark:border-rose-500/20">
                    <IconX className="w-4 h-4" /> {error}
                  </div>
                )}
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loadingList ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse border border-slate-200 dark:border-slate-700" />
          ))}
        </div>
      ) : filteredAdmins.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
          <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
            <IconUser className="w-10 h-10 text-slate-300" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
            Nenhum administrador encontrado
          </h3>
          <p className="text-slate-500 dark:text-slate-400 text-center max-w-xs px-4">
            {searchTerm ? "Tente ajustar sua busca para encontrar o que procura." : "Comece adicionando o primeiro administrador da plataforma."}
          </p>
          {searchTerm && (
            <Button variant="ghost" onClick={() => setSearchTerm("")} className="mt-4 text-primary">
              Limpar busca
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredAdmins.map((a) => (
            <div key={a.id} className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:border-primary/30 transition-all duration-300 flex flex-col">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-xl font-bold border border-primary/20 group-hover:scale-110 transition-transform duration-300">
                    {a.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-lg leading-tight group-hover:text-primary transition-colors">
                      {a.name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400 mt-1 uppercase tracking-wider">
                      <IconShield className="w-3.5 h-3.5" /> Administrador
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3 flex-1 py-4 border-y border-slate-50 dark:border-slate-800/50 my-4">
                <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors">
                    <IconMail className="w-4 h-4" />
                  </div>
                  <span className="text-sm truncate font-medium">{a.email}</span>
                </div>
                
                {a.phone_number && (
                  <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors">
                      <IconPhone className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium">{a.phone_number}</span>
                  </div>
                )}

                {a.document && (
                  <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors">
                      <IconId className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium">{a.document}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium uppercase tracking-widest">
                  <IconCalendar className="w-3 h-3" />
                  {a.created_at ? new Date(a.created_at).toLocaleDateString() : "-"}
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => openEditDialog(a)}
                    className="h-9 w-9 rounded-xl hover:bg-primary/10 hover:text-primary transition-colors"
                    title="Editar"
                  >
                    <IconPencil className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => openResetDialog(a)}
                    className="h-9 w-9 rounded-xl hover:bg-amber-100 hover:text-amber-600 transition-colors"
                    title="Redefinir Senha"
                  >
                    <IconKey className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={openReset} onOpenChange={setOpenReset}>
        <DialogContent className="sm:max-w-md rounded-3xl border-none shadow-2xl overflow-hidden p-0">
          <div className="bg-amber-500/5 p-8 border-b border-amber-500/10">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <IconKey className="text-amber-500" /> Redefinir Senha
              </DialogTitle>
              <DialogDescription className="text-slate-500 dark:text-slate-400">
                Informe a nova senha para este administrador.
              </DialogDescription>
            </DialogHeader>
          </div>

          <form onSubmit={handleResetSubmit} className="p-8 space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Nova Senha</label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  required
                  className="h-11 rounded-xl bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 focus:ring-amber-500/20"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Confirmar Senha</label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="h-11 rounded-xl bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 focus:ring-amber-500/20"
                />
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-4">
              <Button type="submit" disabled={loadingReset} className="w-full h-12 rounded-xl text-base font-semibold bg-amber-500 hover:bg-amber-600 text-white transition-all shadow-lg shadow-amber-500/10">
                {loadingReset ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Redefinindo...
                  </div>
                ) : "Redefinir Senha"}
              </Button>
              {messageReset && (
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 p-3 rounded-xl text-sm font-medium border border-emerald-100 dark:border-emerald-500/20">
                  <IconCheck className="w-4 h-4" /> {messageReset}
                </div>
              )}
              {errorReset && (
                <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 p-3 rounded-xl text-sm font-medium border border-rose-100 dark:border-rose-500/20">
                  <IconX className="w-4 h-4" /> {errorReset}
                </div>
              )}
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}
