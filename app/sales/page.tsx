"use client";
import { useEffect, useMemo, useState } from "react";
import { IconPlus, IconPencil, IconTrash, IconMapPin, IconRulerMeasure, IconPhoto, IconCloudRain, IconCheck, IconX, IconAlertCircle } from "@tabler/icons-react";
import { PageLayout } from "@/components/page-layout";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Sale = {
  id: number;
  admin_id: number;
  photos?: any;
  category?: string;
  size?: string;
  price?: number;
  localization?: string;
  descriptions?: string;
  pluviometria?: string;
};

export default function Sales() {
  const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3433";
  const token = useMemo(() => (typeof window !== "undefined" ? localStorage.getItem("token") : null), []);
  const [sales, setSales] = useState<Sale[]>([]);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [category, setCategory] = useState("");
  const [size, setSize] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [localization, setLocalization] = useState("");
  const [descriptions, setDescriptions] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [pluviometriaFile, setPluviometriaFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  async function fetchSales() {
    const res = await fetch(`${API_BASE}/sales`, {
      headers: { Authorization: token ? `Bearer ${token}` : "" },
    });
    const data = await res.json();
    setSales(Array.isArray(data) ? data : []);
  }

  useEffect(() => {
    fetchSales();
  }, []);

  function openCreate() {
    setEditingId(null);
    setCategory("");
    setSize("");
    setPrice("");
    setLocalization("");
    setDescriptions("");
    setSelectedFiles([]);
    setPluviometriaFile(null);
    setOpen(true);
  }

  function openEdit(s: Sale) {
    setEditingId(s.id);
    setCategory(s.category || "");
    setSize(s.size || "");
    setPrice(typeof s.price === "number" ? s.price : "");
    setLocalization(s.localization || "");
    setDescriptions(s.descriptions || "");
    setSelectedFiles([]);
    setPluviometriaFile(null);
    setOpen(true);
  }

  async function uploadFiles(files: File[]) {
    const uploads = files.map(async (file) => {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "sales");
      const res = await fetch(`${API_BASE}/uploads`, {
        method: "POST",
        headers: { Authorization: token ? `Bearer ${token}` : "" },
        body: fd,
      });
      const data = await res.json();
      return data?.url as string;
    });
    const urls = await Promise.all(uploads);
    return urls.filter(Boolean);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const newUrls = selectedFiles.length ? await uploadFiles(selectedFiles) : [];
    let pluvUrl: string | undefined = undefined;
    if (pluviometriaFile) {
      const fd = new FormData();
      fd.append("file", pluviometriaFile);
      fd.append("folder", "pluviometria");
      const res = await fetch(`${API_BASE}/uploads`, {
        method: "POST",
        headers: { Authorization: token ? `Bearer ${token}` : "" },
        body: fd,
      });
      const data = await res.json();
      pluvUrl = data?.url;
    }
    const body = {
      category: category || undefined,
      size: size || undefined,
      price: typeof price === "number" ? price : undefined,
      localization: localization || undefined,
      descriptions: descriptions || undefined,
      pluviometria: pluvUrl || undefined,
      photos: newUrls.length ? newUrls : undefined,
    };
    const method = editingId ? "PUT" : "POST";
    const url = editingId ? `${API_BASE}/sales/${editingId}` : `${API_BASE}/sales`;
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json", Authorization: token ? `Bearer ${token}` : "" },
      body: JSON.stringify(body),
    });
    setLoading(false);
    if (res.ok) {
      setOpen(false);
      fetchSales();
    }
  }

  async function handleDelete(id: number) {
    const res = await fetch(`${API_BASE}/sales/${id}`, {
      method: "DELETE",
      headers: { Authorization: token ? `Bearer ${token}` : "" },
    });
    if (res.ok) {
      setDeleteConfirm(null);
      fetchSales();
    }
  }

  return (
    <PageLayout 
      title="Vendas" 
      description="Gerencie as propriedades e oportunidades de negócio"
    >
      <div className="flex justify-between items-center mb-8 bg-white dark:bg-slate-900 p-4 rounded-xl border shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Lista de Propriedades</h2>
          <p className="text-sm text-slate-500">{sales.length} itens cadastrados</p>
        </div>
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={openCreate}
              className="flex items-center gap-2 rounded-lg shadow-sm hover:shadow-md transition-all font-semibold"
            >
              <IconPlus className="w-5 h-5" />
              <span>Nova Venda</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                {editingId ? <IconPencil className="w-6 h-6 text-primary" /> : <IconPlus className="w-6 h-6 text-primary" />}
                {editingId ? "Editar Venda" : "Nova Venda"}
              </DialogTitle>
              <DialogDescription>
                {editingId 
                  ? "Atualize as informações da propriedade abaixo." 
                  : "Preencha as informações para cadastrar uma nova oportunidade de venda."}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field>
                  <FieldLabel htmlFor="category">Categoria</FieldLabel>
                  <Input 
                    id="category" 
                    placeholder="Ex: Fazenda, Sítio, Lote..."
                    value={category} 
                    onChange={(e) => setCategory(e.target.value)} 
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="size">Tamanho / Área</FieldLabel>
                  <Input 
                    id="size" 
                    placeholder="Ex: 500 hectares"
                    value={size} 
                    onChange={(e) => setSize(e.target.value)} 
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="price">Valor de Venda (R$)</FieldLabel>
                  <Input
                    id="price"
                    type="number"
                    placeholder="0,00"
                    value={price === "" ? "" : String(price)}
                    onChange={(e) => setPrice(e.target.value ? Number(e.target.value) : "")}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="localization">Localização</FieldLabel>
                  <div className="relative">
                    <IconMapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input 
                      id="localization" 
                      className="pl-9"
                      placeholder="Cidade - UF"
                      value={localization} 
                      onChange={(e) => setLocalization(e.target.value)} 
                    />
                  </div>
                </Field>
              </div>

              <Field>
                <FieldLabel htmlFor="descriptions">Descrição Detalhada</FieldLabel>
                <textarea
                  id="descriptions"
                  className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Descreva os detalhes da propriedade, benfeitorias, solo, etc..."
                  value={descriptions}
                  onChange={(e) => setDescriptions(e.target.value)}
                />
              </Field>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed">
                <Field>
                  <FieldLabel htmlFor="pluviometria" className="flex items-center gap-2">
                    <IconCloudRain className="w-4 h-4 text-blue-500" />
                    Pluviometria (Gráfico/Imagem)
                  </FieldLabel>
                  <Input
                    id="pluviometria"
                    type="file"
                    accept="image/*"
                    className="cursor-pointer bg-white dark:bg-slate-950"
                    onChange={(e) => setPluviometriaFile((e.target.files && e.target.files[0]) ? e.target.files[0] : null)}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="photos" className="flex items-center gap-2">
                    <IconPhoto className="w-4 h-4 text-purple-500" />
                    Fotos da Propriedade
                  </FieldLabel>
                  <Input
                    id="photos"
                    type="file"
                    multiple
                    className="cursor-pointer bg-white dark:bg-slate-950"
                    onChange={(e) => setSelectedFiles(Array.from(e.target.files || []))}
                  />
                </Field>
              </div>

              <DialogFooter className="gap-2 sm:gap-0">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setOpen(false)}
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Salvando...
                    </span>
                  ) : "Salvar Propriedade"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {sales.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-dashed">
          <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
            <IconAlertCircle className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">Nenhuma venda cadastrada</h3>
          <p className="text-slate-500 max-w-xs text-center mt-1">
            Clique no botão "Nova Venda" para começar a cadastrar suas propriedades.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {sales.map((s) => (
            <div
              key={s.id}
              className="group bg-card border rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
            >
              {/* Preview da Imagem */}
              <div className="relative h-48 bg-slate-100 dark:bg-slate-800 overflow-hidden">
                {s.photos && Array.isArray(s.photos) && s.photos.length > 0 ? (
                  <img 
                    src={s.photos[0]} 
                    alt={s.category} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                    <IconPhoto className="w-10 h-10 mb-2 opacity-20" />
                    <span className="text-xs font-medium uppercase tracking-wider opacity-50">Sem fotos</span>
                  </div>
                )}
                
                {/* Badge de Fotos */}
                {s.photos && Array.isArray(s.photos) && s.photos.length > 0 && (
                  <div className="absolute bottom-3 left-3 px-2 py-1 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold rounded-md flex items-center gap-1.5 uppercase tracking-wider">
                    <IconPhoto className="w-3 h-3" />
                    {s.photos.length} {s.photos.length === 1 ? "foto" : "fotos"}
                  </div>
                )}

                {/* Badge de Preço Flutuante */}
                <div className="absolute top-3 right-3 px-3 py-1.5 bg-primary text-white font-bold rounded-lg shadow-lg">
                  {typeof s.price === "number"
                    ? s.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
                    : "Preço sob consulta"}
                </div>
              </div>

              {/* Conteúdo do Card */}
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="inline-block px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded uppercase tracking-tighter mb-1.5">
                      {s.category || "Geral"}
                    </span>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 line-clamp-1 group-hover:text-primary transition-colors">
                      {s.localization || "Localização não informada"}
                    </h3>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center border">
                      <IconRulerMeasure className="w-4 h-4 text-slate-500" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400 leading-none">Tamanho</p>
                      <p className="text-sm font-semibold truncate">{s.size || "-"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center border">
                      <IconCloudRain className="w-4 h-4 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400 leading-none">Chuva</p>
                      <p className="text-sm font-semibold truncate">{s.pluviometria ? "Disponível" : "N/A"}</p>
                    </div>
                  </div>
                </div>

                <div className="mb-6 flex-1">
                  <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 italic">
                    {s.descriptions ? `"${s.descriptions}"` : "Sem descrição disponível."}
                  </p>
                </div>

                <div className="pt-4 border-t flex justify-between items-center mt-auto">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEdit(s)}
                      className="h-9 px-3 rounded-lg hover:bg-primary/5 hover:text-primary border-slate-200 transition-all"
                    >
                      <IconPencil className="w-4 h-4 mr-2" />
                      Editar
                    </Button>
                    
                    {deleteConfirm === s.id ? (
                      <div className="flex gap-1 animate-in fade-in slide-in-from-right-2 duration-300">
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(s.id)}
                          className="h-9 px-3"
                        >
                          <IconCheck className="w-4 h-4 mr-1" />
                          Sim
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setDeleteConfirm(null)}
                          className="h-9 px-3"
                        >
                          <IconX className="w-4 h-4 mr-1" />
                          Não
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setDeleteConfirm(s.id)}
                        className="h-9 w-9 rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-200 border-slate-200 transition-all"
                        title="Deletar"
                      >
                        <IconTrash className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  <div className="flex -space-x-2">
                    <div className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-500">
                      G
                    </div>
                    <div className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
                      A
                    </div>
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
