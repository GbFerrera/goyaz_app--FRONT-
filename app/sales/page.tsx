"use client";
import { useEffect, useMemo, useState } from "react";
import { IconPlus, IconPencil, IconTrash, IconMapPin, IconRulerMeasure, IconPhoto, IconCloudRain, IconCheck, IconX, IconAlertCircle, IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
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
  created_at?: string;
};

export default function Sales() {
  const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3433";
  const STANDARD_CATEGORIES = ["Reserva legal", "Imóvel rural", "Imóvel urbano"];
  const token = useMemo(() => (typeof window !== "undefined" ? localStorage.getItem("token") : null), []);
  const [sales, setSales] = useState<Sale[]>([]);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [category, setCategory] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [isOtherCategory, setIsOtherCategory] = useState(false);
  const [size, setSize] = useState("");
  const [sizeUnit, setSizeUnit] = useState("Hectares (ha)");
  const [price, setPrice] = useState<number | "">("");
  const [localization, setLocalization] = useState("");
  const [descriptions, setDescriptions] = useState("");
  const [existingPhotos, setExistingPhotos] = useState<string[]>([]);
  const [existingPluviometria, setExistingPluviometria] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [pluviometriaFile, setPluviometriaFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [filterCategory, setFilterCategory] = useState("");
  
  // Estados para o Visualizador de Imagens (Lightbox)
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerImages, setViewerImages] = useState<string[]>([]);
  const [viewerIndex, setViewerIndex] = useState(0);

  const openViewer = (images: string[], index: number = 0) => {
    setViewerImages(images);
    setViewerIndex(index);
    setViewerOpen(true);
  };

  const nextImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setViewerIndex((prev) => (prev + 1) % viewerImages.length);
  };

  const prevImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setViewerIndex((prev) => (prev - 1 + viewerImages.length) % viewerImages.length);
  };

  const formatCurrency = (value: number | "") => {
    if (value === "") return "";
    return new Intl.NumberFormat("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    if (!value) {
      setPrice("");
      return;
    }
    const numericValue = Number(value) / 100;
    setPrice(numericValue);
  };

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

  const filteredSales = useMemo(() => {
    if (!filterCategory) return sales;
    if (filterCategory === "Outros") {
      return sales.filter((s) => s.category && !STANDARD_CATEGORIES.includes(s.category));
    }
    return sales.filter((s) => s.category === filterCategory);
  }, [sales, filterCategory]);

  function openCreate() {
    setEditingId(null);
    setCategory("");
    setCustomCategory("");
    setIsOtherCategory(false);
    setSize("");
    setSizeUnit("Hectares (ha)");
    setPrice("");
    setLocalization("");
    setDescriptions("");
    setExistingPhotos([]);
    setExistingPluviometria(null);
    setSelectedFiles([]);
    setPluviometriaFile(null);
    setOpen(true);
  }

  function openEdit(s: Sale) {
    setEditingId(s.id);
    
    if (s.category && STANDARD_CATEGORIES.includes(s.category)) {
      setCategory(s.category);
      setIsOtherCategory(false);
    } else if (s.category) {
      setCategory("Outros");
      setCustomCategory(s.category);
      setIsOtherCategory(true);
    } else {
      setCategory("");
      setIsOtherCategory(false);
    }
    
    setSize(s.size ? s.size.split(" ")[0] : "");
    
    if (s.size && s.size.includes(" ")) {
      const unit = s.size.split(" ")[1];
      if (["Hectares (ha)", "Alqueire", "m2"].includes(unit)) {
        setSizeUnit(unit);
      } else {
        setSizeUnit("Hectares (ha)");
      }
    } else {
      setSizeUnit("Hectares (ha)");
    }
    
    // Garantir que o preço seja tratado como número para a máscara funcionar
    const numericPrice = typeof s.price === "number" ? s.price : Number(s.price);
    setPrice(!isNaN(numericPrice) ? numericPrice : "");
    
    setLocalization(s.localization || "");
    setDescriptions(s.descriptions || "");
    setExistingPhotos(Array.isArray(s.photos) ? s.photos : []);
    setExistingPluviometria(typeof s.pluviometria === "string" ? s.pluviometria : null);
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

  async function deleteFileFromStorage(url: string) {
    try {
      // Extrair o caminho do objeto da URL do Firebase Storage
      // Exemplo: https://firebasestorage.googleapis.com/v0/b/goyaz-a7f6f.firebasestorage.app/o/sales%2F...
      const decodedUrl = decodeURIComponent(url);
      const parts = decodedUrl.split("/o/");
      if (parts.length < 2) return;
      
      const pathWithToken = parts[1];
      const objectPath = pathWithToken.split("?")[0];

      await fetch(`${API_BASE}/uploads`, {
        method: "DELETE",
        headers: { 
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "" 
        },
        body: JSON.stringify({ path: objectPath }),
      });
    } catch (error) {
      console.error("Erro ao deletar arquivo:", error);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

    // Captura os estados atuais para evitar problemas com processos assíncronos
    const currentEditingId = editingId;
    const currentCategory = category;
    const currentCustomCategory = customCategory;
    const currentIsOtherCategory = isOtherCategory;
    const currentSize = size;
    const currentSizeUnit = sizeUnit;
    const currentPrice = price;
    const currentLocalization = localization;
    const currentDescriptions = descriptions;
    const currentExistingPhotos = [...existingPhotos];
    const currentExistingPluviometria = existingPluviometria;
    const currentSelectedFiles = [...selectedFiles];
    const currentPluviometriaFile = pluviometriaFile;

    setLoading(true);

    try {
      // 1. Upload das Fotos da Propriedade
      const newUrls = currentSelectedFiles.length ? await uploadFiles(currentSelectedFiles) : [];
      
      // 2. Upload da Pluviometria (se houver novo arquivo)
      let pluvUrl: string | null = currentExistingPluviometria;
      
      if (currentPluviometriaFile) {
        const fd = new FormData();
        fd.append("file", currentPluviometriaFile);
        fd.append("folder", "pluviometria");
        
        const resUpload = await fetch(`${API_BASE}/uploads`, {
          method: "POST",
          headers: { Authorization: token ? `Bearer ${token}` : "" },
          body: fd,
        });
        
        if (resUpload.ok) {
          const data = await resUpload.json();
          pluvUrl = data?.url;
        }
      }

      // 3. Montagem do corpo da requisição final
      const body = {
        category: currentIsOtherCategory ? currentCustomCategory : currentCategory || undefined,
        size: currentSize ? `${currentSize} ${currentSizeUnit}` : undefined,
        price: typeof currentPrice === "number" ? currentPrice : undefined,
        localization: currentLocalization || undefined,
        descriptions: currentDescriptions || undefined,
        pluviometria: pluvUrl,
        photos: [...currentExistingPhotos, ...newUrls],
      };

      const method = currentEditingId ? "PUT" : "POST";
      const url = currentEditingId ? `${API_BASE}/sales/${currentEditingId}` : `${API_BASE}/sales`;

      const res = await fetch(url, {
        method,
        headers: { 
          "Content-Type": "application/json", 
          Authorization: token ? `Bearer ${token}` : "" 
        },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setOpen(false);
        fetchSales();
      } else {
        const errorData = await res.json();
        console.error("Erro ao salvar propriedade:", errorData);
        alert("Erro ao salvar propriedade. Por favor, tente novamente.");
      }
    } catch (error) {
      console.error("Erro no processo de submissão:", error);
      alert("Ocorreu um erro inesperado. Verifique sua conexão e tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number) {
    const saleToDelete = sales.find(s => s.id === id);
    
    if (saleToDelete) {
      // 1. Deletar fotos do Storage
      if (saleToDelete.photos && Array.isArray(saleToDelete.photos)) {
        for (const photoUrl of saleToDelete.photos) {
          await deleteFileFromStorage(photoUrl);
        }
      }
      
      // 2. Deletar pluviometria do Storage
      if (saleToDelete.pluviometria) {
        await deleteFileFromStorage(saleToDelete.pluviometria);
      }
    }

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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 bg-white dark:bg-slate-900 p-6 rounded-xl border shadow-sm gap-4">
        <div className="flex flex-col md:flex-row md:items-center gap-6 w-full md:w-auto">
          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Lista de Propriedades</h2>
            <p className="text-sm text-slate-500">{filteredSales.length} itens encontrados</p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-500 whitespace-nowrap">Filtrar por:</span>
            <select
              className="flex h-9 w-full md:w-48 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="">Todas as categorias</option>
              {STANDARD_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
              <option value="Outros">Outros</option>
            </select>
          </div>
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
                  <div className="space-y-2">
                    <select
                      id="category"
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                      value={category}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCategory(val);
                        setIsOtherCategory(val === "Outros");
                        // Limpar campos se for Outros
                        if (val === "Outros") {
                          setSize("");
                          setPluviometriaFile(null);
                          setExistingPluviometria(null);
                        }
                      }}
                    >
                      <option value="">Selecione uma categoria</option>
                      <option value="Reserva legal">Reserva legal</option>
                      <option value="Imóvel rural">Imóvel rural</option>
                      <option value="Imóvel urbano">Imóvel urbano</option>
                      <option value="Outros">Outros</option>
                    </select>

                    {isOtherCategory && (
                      <Input
                        placeholder="Digite a nova categoria..."
                        value={customCategory}
                        onChange={(e) => setCustomCategory(e.target.value)}
                        className="animate-in fade-in slide-in-from-top-1 duration-200"
                      />
                    )}
                  </div>
                </Field>
                {category !== "Outros" && (
                  <Field>
                    <FieldLabel htmlFor="size">Tamanho / Área</FieldLabel>
                    <div className="flex gap-2">
                      <Input 
                        id="size" 
                        placeholder="Ex: 500"
                        value={size} 
                        onChange={(e) => setSize(e.target.value)} 
                        className="flex-1"
                      />
                      <select
                        className="flex h-9 w-32 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        value={sizeUnit}
                        onChange={(e) => setSizeUnit(e.target.value)}
                      >
                        <option value="Hectares (ha)">Hectares</option>
                        <option value="Alqueire">Alqueire</option>
                        <option value="m2">m2</option>
                      </select>
                    </div>
                  </Field>
                )}
                <Field>
                  <FieldLabel htmlFor="price">Valor de Venda (R$)</FieldLabel>
                  <Input
                    id="price"
                    type="text"
                    placeholder="0,00"
                    value={formatCurrency(price)}
                    onChange={handlePriceChange}
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
                {category !== "Outros" && (
                  <div className="space-y-4">
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
                    <div className="flex flex-wrap gap-2">
                      {existingPluviometria && (
                        <div className="relative w-20 h-20 rounded-lg overflow-hidden border bg-white group">
                          <img src={existingPluviometria} alt="Pluviometria Atual" className="w-full h-full object-cover" />
                          <div className="absolute top-0 left-0 bg-black/60 text-[8px] text-white px-1 font-bold uppercase">Atual</div>
                          <button
                            type="button"
                            onClick={() => {
                              deleteFileFromStorage(existingPluviometria);
                              setExistingPluviometria(null);
                            }}
                            className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <IconX className="w-5 h-5 text-white" />
                          </button>
                        </div>
                      )}
                      {pluviometriaFile && (
                        <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-blue-400 bg-white group">
                          <img src={URL.createObjectURL(pluviometriaFile)} alt="Nova Pluviometria" className="w-full h-full object-cover" />
                          <div className="absolute top-0 left-0 bg-blue-500 text-[8px] text-white px-1 font-bold uppercase">Nova</div>
                          <button
                            type="button"
                            onClick={() => setPluviometriaFile(null)}
                            className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <IconX className="w-5 h-5 text-white" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className={category === "Outros" ? "col-span-2 space-y-4" : "space-y-4"}>
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
                      onChange={(e) => setSelectedFiles(prev => [...prev, ...Array.from(e.target.files || [])])}
                    />
                  </Field>
                  
                  <div className="grid grid-cols-4 gap-2">
                    {/* Fotos Existentes */}
                    {existingPhotos.map((url, idx) => (
                      <div key={`existing-${idx}`} className="relative aspect-square rounded-lg overflow-hidden border bg-white group cursor-pointer" onClick={() => openViewer(existingPhotos, idx)}>
                          <img src={url} alt={`Foto Existente ${idx + 1}`} className="w-full h-full object-cover" />
                          <div className="absolute top-0 left-0 bg-black/60 text-[8px] text-white px-1 font-bold uppercase">Atual</div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteFileFromStorage(url);
                              setExistingPhotos(prev => prev.filter((_, i) => i !== idx));
                            }}
                            className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <IconX className="w-5 h-5 text-white" />
                          </button>
                        </div>
                      ))}

                    {/* Fotos Novas (Preview) */}
                    {selectedFiles.map((file, idx) => (
                      <div key={`new-${idx}`} className="relative aspect-square rounded-lg overflow-hidden border border-purple-400 bg-white group animate-in zoom-in-50 duration-300 cursor-pointer" onClick={() => openViewer(selectedFiles.map(f => URL.createObjectURL(f)), idx)}>
                          <img src={URL.createObjectURL(file)} alt={`Nova Foto ${idx + 1}`} className="w-full h-full object-cover" />
                          <div className="absolute top-0 left-0 bg-purple-500 text-[8px] text-white px-1 font-bold uppercase">Nova</div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedFiles(prev => prev.filter((_, i) => i !== idx));
                            }}
                            className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <IconX className="w-5 h-5 text-white" />
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              </div>

              <DialogFooter className="gap-4">
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

      {filteredSales.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-dashed">
          <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
            <IconAlertCircle className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">
            {filterCategory ? "Nenhum item nesta categoria" : "Nenhuma venda cadastrada"}
          </h3>
          <p className="text-slate-500 max-w-xs text-center mt-1">
            {filterCategory 
              ? "Tente selecionar outra categoria ou limpar o filtro para ver mais propriedades."
              : 'Clique no botão "Nova Venda" para começar a cadastrar suas propriedades.'}
          </p>
          {filterCategory && (
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => setFilterCategory("")}
            >
              Limpar Filtro
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {filteredSales.map((s) => (
            <div
              key={s.id}
              className="group bg-card border rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
            >
              {/* Preview da Imagem */}
              <div 
                className="relative h-48 bg-slate-100 dark:bg-slate-800 overflow-hidden cursor-pointer group/img"
                onClick={() => s.photos && Array.isArray(s.photos) && s.photos.length > 0 && openViewer(s.photos, 0)}
              >
                {s.photos && Array.isArray(s.photos) && s.photos.length > 0 ? (
                  <>
                    <img 
                      src={s.photos[0]} 
                      alt={s.category} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/20 transition-colors flex items-center justify-center">
                      <IconPhoto className="text-white opacity-0 group-hover/img:opacity-100 w-8 h-8 transition-opacity" />
                    </div>
                  </>
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
                  {Number(s.price) > 0
                    ? Number(s.price).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
                    : "Preço sob consulta"}
                </div>
              </div>

              {/* Conteúdo do Card */}
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-full">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="inline-block px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded uppercase tracking-tighter">
                        {s.category || "Geral"}
                      </span>
                      {s.pluviometria && s.category && STANDARD_CATEGORIES.includes(s.category) && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-blue-500 uppercase">
                          <IconCloudRain className="w-3 h-3" />
                          Pluviometria
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 line-clamp-1 group-hover:text-primary transition-colors">
                      {s.localization || "Localização não informada"}
                    </h3>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  {s.category && STANDARD_CATEGORIES.includes(s.category) && (
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center border">
                        <IconRulerMeasure className="w-4 h-4 text-slate-500" />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-slate-400 leading-none">Tamanho</p>
                        <p className="text-sm font-semibold truncate">{s.size || "-"}</p>
                      </div>
                    </div>
                  )}
                  <div className={s.category && STANDARD_CATEGORIES.includes(s.category) ? "flex items-center gap-2 text-slate-600 dark:text-slate-400" : "col-span-2 flex items-center gap-2 text-slate-600 dark:text-slate-400"}>
                    <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center border">
                      <IconMapPin className="w-4 h-4 text-slate-500" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400 leading-none">Região</p>
                      <p className="text-sm font-semibold truncate">{s.localization || "-"}</p>
                    </div>
                  </div>
                </div>

                <div className="mb-6 flex-1">
                  <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 italic whitespace-pre-wrap">
                    {s.descriptions ? `"${s.descriptions}"` : "Sem descrição disponível."}
                  </p>
                </div>

                <div className="pt-4 border-t flex justify-between items-center mt-auto">
                  <div className="flex flex-col gap-1">
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
                    {s.created_at && (
                      <span className="text-[10px] text-slate-400 font-medium">
                        Cadastrado em: {new Date(s.created_at).toLocaleDateString("pt-BR")}
                      </span>
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
      {/* Visualizador de Imagens (Lightbox) */}
      <Dialog open={viewerOpen} onOpenChange={setViewerOpen}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-black/95 border-none h-auto max-h-[90vh] flex flex-col items-center justify-center">
          <div className="relative w-full h-full flex items-center justify-center p-4">
            <button
              onClick={() => setViewerOpen(false)}
              className="absolute top-4 right-4 z-50 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
            >
              <IconX className="w-6 h-6" />
            </button>

            {viewerImages.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 z-50 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                >
                  <IconChevronLeft className="w-8 h-8" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 z-50 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                >
                  <IconChevronRight className="w-8 h-8" />
                </button>
              </>
            )}

            <div className="w-full h-full flex flex-col items-center gap-4">
              <img
                src={viewerImages[viewerIndex]}
                alt={`Imagem ${viewerIndex + 1}`}
                className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-2xl"
              />
              
              <div className="px-4 py-2 bg-white/10 rounded-full text-white text-sm font-medium">
                {viewerIndex + 1} / {viewerImages.length}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}
