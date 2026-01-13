 "use client";
 import { useEffect, useState } from "react";
 import { PageLayout } from "@/components/page-layout";
 import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
 import { Input } from "@/components/ui/input";
 import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { 
  Drawer, 
  DrawerContent, 
  DrawerHeader, 
  DrawerTitle, 
  DrawerDescription, 
  DrawerFooter 
} from "@/components/ui/drawer";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
 import { 
  IconPlus, 
  IconPencil, 
  IconDownload, 
  IconFileDescription, 
  IconMail, 
  IconPhone, 
  IconCalendar, 
  IconUser, 
  IconSearch, 
  IconDotsVertical, 
  IconFileUpload,
  IconTrash,
  IconAlertCircle,
  IconClock,
  IconCheck
} from "@tabler/icons-react";
 
 export default function Clients() {
   type Client = {
     id: number;
     admin_id: number;
     name: string;
     phone_number?: string | null;
     email?: string | null;
     created_at?: string;
   };
   const [adminId, setAdminId] = useState<number | null>(null);
   const [name, setName] = useState("");
   const [email, setEmail] = useState("");
   const [phone, setPhone] = useState("");
   const [loading, setLoading] = useState(false);
   const [message, setMessage] = useState<string | null>(null);
   const [error, setError] = useState<string | null>(null);
   const [open, setOpen] = useState(false);
   const [clients, setClients] = useState<Client[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [openDocs, setOpenDocs] = useState(false);
  const [docsClient, setDocsClient] = useState<Client | null>(null);
  const [docFiles, setDocFiles] = useState<File[]>([]);
  const [docDescription, setDocDescription] = useState("");
  const [viewDocsDrawer, setViewDocsDrawer] = useState(false);
  const [selectedClientDocs, setSelectedClientDocs] = useState<Client | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.email?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.phone_number?.includes(searchTerm)
  );

  // Simulação de documentos (já que o backend/firebase ainda não está integrado para listagem)
  const mockDocuments = [
    { id: 1, name: "contrato_social.pdf", size: "1.2 MB", description: "Contrato assinado em 2023", date: "2023-10-15" },
    { id: 2, name: "comprovante_endereco.jpg", size: "450 KB", description: "Referente ao mês de Dezembro", date: "2023-12-05" },
  ];

  const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3433";
 
   async function fetchAdminFromToken() {
     const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
     if (!token) return;
     try {
       const res = await fetch(`${API_BASE}/sessions/validate`, {
         headers: {
           Authorization: `Bearer ${token}`,
         },
       });
       const data = await res.json();
       if (res.ok && data?.admin?.id) {
         setAdminId(Number(data.admin.id));
       }
     } catch {}
   }
 
   async function fetchClients(targetAdminId?: number) {
     setLoadingList(true);
     try {
       const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
       const res = await fetch(`${API_BASE}/clients?admin_id=${targetAdminId ?? adminId ?? ""}`, {
         headers: {
           Authorization: token ? `Bearer ${token}` : "",
         },
       });
       const data = await res.json();
       setClients(Array.isArray(data) ? data : []);
     } catch {
       setClients([]);
     } finally {
       setLoadingList(false);
     }
   }
 
   useEffect(() => {
     fetchAdminFromToken();
   }, []);
 
   useEffect(() => {
     if (adminId) {
       fetchClients(adminId);
     }
   }, [adminId]);
 
   function openCreateDialog() {
     setIsEditing(false);
     setEditingId(null);
     setName("");
     setEmail("");
     setPhone("");
     setMessage(null);
     setError(null);
     setOpen(true);
   }
 
  function openEditDialog(client: Client) {
    setIsEditing(true);
    setEditingId(client.id);
    setName(client.name || "");
    setEmail(client.email || "");
    setPhone(client.phone_number || "");
    setMessage(null);
    setError(null);
    setOpen(true);
  }

  function openDocsDialog(client: Client) {
    setDocsClient(client);
    setDocFiles([]);
    setDocDescription("");
    setOpenDocs(true);
  }

  function openViewDocsDrawer(client: Client) {
    setSelectedClientDocs(client);
    setViewDocsDrawer(true);
  }

  function onSelectDocs(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files ? Array.from(e.target.files) : [];
    setDocFiles(files);
  }

  function removeDocAt(index: number) {
    setDocFiles((prev) => prev.filter((_, i) => i !== index));
  }

  function closeDocs() {
    setOpenDocs(false);
    setDocsClient(null);
    setDocFiles([]);
    setDocDescription("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);
     try {
       const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
       const url = isEditing && editingId ? `${API_BASE}/clients/${editingId}` : `${API_BASE}/clients`;
       const method = isEditing ? "PUT" : "POST";
       const body = isEditing
         ? JSON.stringify({
             name,
             phone_number: phone || undefined,
             email: email || undefined,
           })
         : JSON.stringify({
             admin_id: adminId,
             name,
             phone_number: phone || undefined,
             email: email || undefined,
           });
       const res = await fetch(url, {
         method,
         headers: { "Content-Type": "application/json", Authorization: token ? `Bearer ${token}` : "" },
         body,
       });
       const data = await res.json();
       if (!res.ok) {
         setError(data?.message ?? (isEditing ? "Erro ao atualizar cliente" : "Erro ao criar cliente"));
         return;
       }
       setMessage(isEditing ? "Cliente atualizado com sucesso" : "Cliente criado com sucesso");
       setName("");
       setEmail("");
       setPhone("");
       setIsEditing(false);
       setEditingId(null);
       setOpen(false);
       if (adminId) fetchClients(adminId);
     } catch {
       setError(isEditing ? "Falha de rede ao atualizar cliente" : "Falha de rede ao criar cliente");
     } finally {
       setLoading(false);
     }
   }
 
   return (
    <PageLayout 
      title="Clientes" 
      description="Gerencie sua base de contatos e documentos"
    >
      {/* Cabeçalho de Ações */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 bg-white dark:bg-slate-900 p-6 rounded-2xl border shadow-sm">
        <div className="flex-1 w-full md:w-auto">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <IconUser className="w-6 h-6 text-primary" />
            Lista de Clientes
          </h2>
          <p className="text-sm text-slate-500 mt-1">{clients.length} clientes cadastrados</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          {/* Barra de Pesquisa */}
          <div className="relative w-full sm:w-64">
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Buscar por nome, email..." 
              className="pl-9 bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreateDialog} className="w-full sm:w-auto gap-2 font-semibold shadow-sm hover:shadow-md transition-all">
                <IconPlus className="w-5 h-5" />
                Novo Cliente
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                  {isEditing ? <IconPencil className="w-6 h-6 text-primary" /> : <IconPlus className="w-6 h-6 text-primary" />}
                  {isEditing ? "Editar Cliente" : "Novo Cliente"}
                </DialogTitle>
                <DialogDescription>
                  {isEditing ? "Atualize as informações de contato do cliente." : "Cadastre um novo cliente para gerenciar suas vendas."}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6 pt-4">
                <div className="space-y-4">
                  <Field>
                    <FieldLabel htmlFor="name">Nome Completo</FieldLabel>
                    <div className="relative">
                      <IconUser className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        id="name"
                        className="pl-9"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        placeholder="Nome do cliente"
                      />
                    </div>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="email">Email</FieldLabel>
                    <div className="relative">
                      <IconMail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        id="email"
                        type="email"
                        className="pl-9"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="exemplo@email.com"
                      />
                    </div>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="phone">Telefone / WhatsApp</FieldLabel>
                    <div className="relative">
                      <IconPhone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        id="phone"
                        className="pl-9"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="(00) 00000-0000"
                      />
                    </div>
                  </Field>
                </div>
                
                {error && (
                  <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm flex items-center gap-2 border border-red-100">
                    <IconAlertCircle className="w-4 h-4" />
                    {error}
                  </div>
                )}

                <DialogFooter className="gap-2 sm:gap-0">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                  <Button type="submit" disabled={loading || (!isEditing && !adminId)}>
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Salvando...
                      </span>
                    ) : isEditing ? "Salvar Alterações" : "Cadastrar Cliente"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Upload de Documentos Dialog */}
      <Dialog open={openDocs} onOpenChange={setOpenDocs}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2 text-slate-800">
              <IconFileUpload className="w-6 h-6 text-primary" />
              Anexar Documentos
            </DialogTitle>
            <DialogDescription>
              {docsClient ? (
                <span className="font-medium text-slate-600">Cliente: <span className="text-primary">{docsClient.name}</span></span>
              ) : "Selecione um cliente para adicionar documentos"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 pt-4">
            <div className="space-y-4">
              <div className="border-2 border-dashed rounded-2xl p-8 text-center bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 transition-all group">
                <input id="docs" type="file" multiple onChange={onSelectDocs} className="hidden" />
                <label htmlFor="docs" className="cursor-pointer flex flex-col items-center">
                  <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <IconPlus className="w-6 h-6" />
                  </div>
                  <span className="font-bold text-slate-700 dark:text-slate-200">Clique para selecionar</span>
                  <span className="text-sm text-slate-500 mt-1">Ou arraste e solte seus arquivos aqui</span>
                </label>
              </div>

              {docFiles.length > 0 && (
                <div className="space-y-2 max-h-[180px] overflow-y-auto pr-2 custom-scrollbar">
                  {docFiles.map((f, i) => (
                    <div key={`${f.name}-${i}`} className="flex items-center justify-between rounded-xl border bg-white dark:bg-slate-900 px-4 py-3 text-sm shadow-sm group hover:border-primary/30 transition-all">
                      <div className="flex items-center gap-3 truncate">
                        <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center text-slate-500">
                          <IconFileDescription className="w-5 h-5" />
                        </div>
                        <div className="truncate">
                          <div className="font-bold text-slate-700 dark:text-slate-200 truncate">{f.name}</div>
                          <div className="text-[10px] text-slate-500 uppercase font-bold">{(f.size / 1024).toFixed(1)} KB</div>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50" onClick={() => removeDocAt(i)}>
                        <IconTrash className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <Field>
                <FieldLabel htmlFor="docDescription" className="font-bold text-slate-700">Descrição dos Documentos</FieldLabel>
                <textarea
                  id="docDescription"
                  className="w-full min-h-[100px] p-4 rounded-xl border border-input bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-all"
                  placeholder="Ex: Documentos pessoais, contrato assinado, etc..."
                  value={docDescription}
                  onChange={(e) => setDocDescription(e.target.value)}
                />
              </Field>
            </div>
          </div>
          <DialogFooter className="pt-4 border-t">
            <Button variant="outline" onClick={closeDocs}>Cancelar</Button>
            <Button onClick={closeDocs} className="gap-2">
              <IconCheck className="w-4 h-4" />
              Salvar Documentos
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Gaveta Lateral para Visualização de Documentos */}
      <Drawer open={viewDocsDrawer} onOpenChange={setViewDocsDrawer} direction="right">
        <DrawerContent className="h-full sm:max-w-md ml-auto">
          <div className="flex flex-col h-full bg-white dark:bg-slate-950 shadow-2xl">
            <DrawerHeader className="p-8 border-b bg-slate-50 dark:bg-slate-900/50">
              <div className="flex items-center gap-3 text-primary mb-2">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <IconFileDescription className="w-6 h-6 text-primary" />
                </div>
                <DrawerTitle className="text-2xl font-bold text-slate-800 dark:text-slate-100">Documentos</DrawerTitle>
              </div>
              <DrawerDescription className="text-base">
                {selectedClientDocs ? (
                  <span className="flex items-center gap-2">
                    <IconUser className="w-4 h-4 text-slate-400" />
                    Cliente: <span className="font-bold text-slate-700 dark:text-slate-200">{selectedClientDocs.name}</span>
                  </span>
                ) : "Carregando..."}
              </DrawerDescription>
            </DrawerHeader>

            <div className="flex-1 p-8 space-y-6 overflow-y-auto">
              {mockDocuments.length > 0 ? (
                <div className="space-y-4">
                  {mockDocuments.map((doc) => (
                    <div 
                      key={doc.id} 
                      className="group border rounded-2xl p-5 bg-card hover:border-primary/50 transition-all shadow-sm hover:shadow-lg"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                            <IconFileDescription className="w-6 h-6" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-slate-800 dark:text-slate-100 truncate group-hover:text-primary transition-colors">
                              {doc.name}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{doc.size}</span>
                              <span className="text-slate-300">•</span>
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                                <IconCalendar className="w-3 h-3" />
                                {new Date(doc.date).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="shrink-0 h-10 w-10 rounded-xl hover:bg-primary hover:text-white transition-all shadow-sm"
                          title="Baixar arquivo"
                        >
                          <IconDownload className="w-5 h-5" />
                        </Button>
                      </div>
                      
                      {doc.description && (
                        <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800">
                          <p className="text-sm text-slate-600 dark:text-slate-400 italic leading-relaxed">
                            "{doc.description}"
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-12">
                  <div className="w-20 h-20 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mb-4">
                    <IconFileDescription className="w-10 h-10 text-slate-300" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200">Nenhum documento</h3>
                  <p className="text-slate-500 mt-1">Este cliente ainda não possui arquivos anexados.</p>
                </div>
              )}
            </div>

            <DrawerFooter className="p-8 border-t bg-slate-50/50 dark:bg-slate-900/20">
              <Button 
                variant="outline" 
                className="w-full h-12 rounded-xl font-bold shadow-sm" 
                onClick={() => setViewDocsDrawer(false)}
              >
                Fechar
              </Button>
            </DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>

      {/* Lista de Clientes */}
      {loadingList ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-48 bg-slate-100 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : filteredClients.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-dashed shadow-sm">
          <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
            <IconUser className="w-10 h-10 text-slate-300" />
          </div>
          <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200">Nenhum cliente encontrado</h3>
          <p className="text-slate-500 max-w-xs text-center mt-2">
            {searchTerm ? "Não encontramos clientes com os termos da sua busca." : "Comece cadastrando seu primeiro cliente no botão acima."}
          </p>
          {searchTerm && (
            <Button variant="link" className="mt-4 text-primary font-bold" onClick={() => setSearchTerm("")}>
              Limpar busca
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredClients.map((c) => (
            <div 
              key={c.id} 
              className="group relative bg-white dark:bg-slate-900 border rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border-slate-200 dark:border-slate-800 overflow-hidden"
              onClick={() => openViewDocsDrawer(c)}
            >
              {/* Indicador de Hover */}
              <div className="absolute top-0 left-0 w-1 h-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="flex justify-between items-start mb-5">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-xl font-black shadow-inner group-hover:scale-110 transition-transform">
                    {c.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 truncate group-hover:text-primary transition-colors">
                      {c.name}
                    </h3>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1 mt-0.5">
                      <IconClock className="w-3 h-3" />
                      ID: {c.id}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-9 w-9 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
                    onClick={() => openEditDialog(c)}
                  >
                    <IconPencil className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-9 w-9 rounded-lg hover:bg-primary/10 hover:text-primary text-slate-500"
                    onClick={() => openDocsDialog(c)}
                  >
                    <IconFileUpload className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400 group/item">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center group-hover/item:bg-primary/5 transition-colors">
                    <IconMail className="w-4 h-4 text-slate-400 group-hover/item:text-primary" />
                  </div>
                  <span className="text-sm truncate font-medium">{c.email ?? "Sem email"}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400 group/item">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center group-hover/item:bg-primary/5 transition-colors">
                    <IconPhone className="w-4 h-4 text-slate-400 group-hover/item:text-primary" />
                  </div>
                  <span className="text-sm font-medium">{c.phone_number ?? "Sem telefone"}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between mt-auto">
                <div className="flex items-center gap-2">
                  <IconCalendar className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-[11px] font-bold text-slate-400 uppercase">
                    {c.created_at ? new Date(c.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }) : "-"}
                  </span>
                </div>
                
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-400">
                    <IconFileDescription className="w-4 h-4" />
                  </div>
                  <div className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
                    {mockDocuments.length}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </PageLayout>
  );
 }
