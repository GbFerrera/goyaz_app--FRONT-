 "use client";
import { useEffect, useMemo, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { PageLayout } from "@/components/page-layout";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { IconPlus, IconPencil, IconTrash } from "@tabler/icons-react";

type Column = {
  id: number;
  admin_id: number;
  title: string;
  position: number;
  color?: string | null;
};

type Card = {
  id: number;
  column_id: number;
  title: string;
  description?: string | null;
  position: number;
};

export default function Kanban() {
  const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3433";
  const [columns, setColumns] = useState<Column[]>([]);
 const [cardsByColumn, setCardsByColumn] = useState<Record<number, Card[]>>({});
  const [openColumn, setOpenColumn] = useState(false);
  const [editingColumnId, setEditingColumnId] = useState<number | null>(null);
  const [columnTitle, setColumnTitle] = useState("");
  const [columnColor, setColumnColor] = useState<string>("#64748B");
  const [openCard, setOpenCard] = useState(false);
  const [editingCardId, setEditingCardId] = useState<number | null>(null);
  const [cardTitle, setCardTitle] = useState("");
  const [cardDescription, setCardDescription] = useState("");
  const [targetColumnForCard, setTargetColumnForCard] = useState<number | null>(null);
 const [loading, setLoading] = useState(false);
 const token = useMemo(() => (typeof window !== "undefined" ? localStorage.getItem("token") : null), []);

  async function fetchColumns() {
    const res = await fetch(`${API_BASE}/kanban/columns`, {
      headers: { Authorization: token ? `Bearer ${token}` : "" },
    });
    const data = await res.json();
    if (Array.isArray(data)) setColumns(data);
  }

  async function fetchCards(columnId: number) {
    const res = await fetch(`${API_BASE}/kanban/cards?column_id=${columnId}`, {
      headers: { Authorization: token ? `Bearer ${token}` : "" },
    });
    const data = await res.json();
    if (Array.isArray(data)) {
      setCardsByColumn((prev) => ({ ...prev, [columnId]: data }));
    }
  }

  useEffect(() => {
    fetchColumns();
  }, []);

  useEffect(() => {
    columns.forEach((c) => fetchCards(c.id));
  }, [columns.length]);

  function openCreateColumn() {
    setEditingColumnId(null);
    setColumnTitle("");
    setColumnColor("#64748B");
    setOpenColumn(true);
  }

  function openEditColumn(col: Column) {
    setEditingColumnId(col.id);
    setColumnTitle(col.title);
    setColumnColor(col.color ?? "#64748B");
    setOpenColumn(true);
  }

  async function submitColumn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const method = editingColumnId ? "PUT" : "POST";
    const url = editingColumnId ? `${API_BASE}/kanban/columns/${editingColumnId}` : `${API_BASE}/kanban/columns`;
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json", Authorization: token ? `Bearer ${token}` : "" },
      body: JSON.stringify({ title: columnTitle, color: columnColor }),
    });
    setLoading(false);
    if (res.ok) {
      setOpenColumn(false);
      fetchColumns();
    }
  }
 
  async function deleteColumn(id: number) {
     const res = await fetch(`${API_BASE}/kanban/columns/${id}`, {
       method: "DELETE",
       headers: { Authorization: token ? `Bearer ${token}` : "" },
     });
     if (res.ok) {
       setColumns((prev) => prev.filter((c) => c.id !== id));
       setCardsByColumn((prev) => {
         const next = { ...prev };
         delete next[id];
         return next;
       });
     }
  }

  function resequenceCards(arr: Card[]) {
    return arr.map((c, idx) => ({ ...c, position: idx + 1 }));
  }

  async function persistCards(columnId: number, cards: Card[]) {
    await Promise.all(
      cards.map((c) =>
        fetch(`${API_BASE}/kanban/cards/${c.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: token ? `Bearer ${token}` : "" },
          body: JSON.stringify({ position: c.position, column_id: c.column_id }),
        })
      )
    );
    await fetchCards(columnId);
  }

  async function onDragEnd(result: any) {
    const { source, destination, type } = result;
    if (!destination) return;
    if (type === "COLUMN") {
      const from = source.index;
      const to = destination.index;
      const list = [...columns];
      const [moved] = list.splice(from, 1);
      list.splice(to, 0, moved);
      const next = list.map((c, idx) => ({ ...c, position: idx + 1 }));
      setColumns(next);
      await Promise.all(
        next.map((c) =>
          fetch(`${API_BASE}/kanban/columns/${c.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json", Authorization: token ? `Bearer ${token}` : "" },
            body: JSON.stringify({ position: c.position }),
          })
        )
      );
      return;
    }
    const parseColumnId = (droppableId: string) => Number(droppableId.replace("column-", ""));
    const sourceColumnId = parseColumnId(source.droppableId);
    const destColumnId = parseColumnId(destination.droppableId);
    const sourceCards = [...(cardsByColumn[sourceColumnId] || [])];
    const destCards = sourceColumnId === destColumnId ? sourceCards : [...(cardsByColumn[destColumnId] || [])];
    const [movedCard] = sourceCards.splice(source.index, 1);
    const movedUpdated = { ...movedCard, column_id: destColumnId };
    destCards.splice(destination.index, 0, movedUpdated);
    const sourceNext = resequenceCards(sourceCards);
    const destNext = resequenceCards(destCards);
    setCardsByColumn((prev) => ({ ...prev, [sourceColumnId]: sourceNext, [destColumnId]: destNext }));
    await fetch(`${API_BASE}/kanban/cards/${movedCard.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: token ? `Bearer ${token}` : "" },
      body: JSON.stringify({ column_id: destColumnId }),
    });
    await persistCards(sourceColumnId, sourceNext);
    await persistCards(destColumnId, destNext);
  }

   function openCreateCard(columnId: number) {
     setEditingCardId(null);
     setTargetColumnForCard(columnId);
     setCardTitle("");
     setCardDescription("");
     setOpenCard(true);
   }
 
   function openEditCard(card: Card) {
     setEditingCardId(card.id);
     setTargetColumnForCard(card.column_id);
     setCardTitle(card.title);
     setCardDescription(card.description || "");
     setOpenCard(true);
   }
 
   async function submitCard(e: React.FormEvent) {
     e.preventDefault();
     if (!targetColumnForCard) return;
     setLoading(true);
     const method = editingCardId ? "PUT" : "POST";
     const url = editingCardId ? `${API_BASE}/kanban/cards/${editingCardId}` : `${API_BASE}/kanban/cards`;
     const body = editingCardId
       ? { title: cardTitle, description: cardDescription, column_id: targetColumnForCard }
       : { column_id: targetColumnForCard, title: cardTitle, description: cardDescription };
     const res = await fetch(url, {
       method,
       headers: { "Content-Type": "application/json", Authorization: token ? `Bearer ${token}` : "" },
       body: JSON.stringify(body),
     });
     setLoading(false);
     if (res.ok) {
       setOpenCard(false);
       fetchCards(targetColumnForCard);
     }
   }
 
   async function deleteCard(id: number, columnId: number) {
     const res = await fetch(`${API_BASE}/kanban/cards/${id}`, {
       method: "DELETE",
       headers: { Authorization: token ? `Bearer ${token}` : "" },
     });
     if (res.ok) {
       fetchCards(columnId);
     }
   }
 
   return (
    <PageLayout title="Kanban" description="Organize suas tarefas de forma visual e eficiente">
      <div className="flex justify-end mb-6">
        <Dialog open={openColumn} onOpenChange={setOpenColumn}>
          <DialogTrigger asChild>
            <Button onClick={openCreateColumn} className="gap-2 shadow-sm">
              <IconPlus className="w-5 h-5" />
              Nova Coluna
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{editingColumnId ? "Editar Coluna" : "Nova Coluna"}</DialogTitle>
              <DialogDescription>Personalize sua coluna com um título e cor</DialogDescription>
            </DialogHeader>
            <form onSubmit={submitColumn} className="space-y-6">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="columnTitle">Título</FieldLabel>
                  <Input id="columnTitle" value={columnTitle} onChange={(e) => setColumnTitle(e.target.value)} placeholder="Ex: A fazer, Em progresso..." required />
                </Field>
                <Field>
                  <FieldLabel htmlFor="columnColor">Cor da Coluna</FieldLabel>
                  <div className="flex items-center gap-3">
                    <div className="relative group">
                      <input
                        id="columnColor"
                        type="color"
                        className="h-10 w-14 p-1 bg-background border rounded cursor-pointer transition-all group-hover:border-primary"
                        value={columnColor}
                        onChange={(e) => setColumnColor(e.target.value)}
                      />
                    </div>
                    <Input
                      aria-label="Código de cor"
                      value={columnColor}
                      onChange={(e) => setColumnColor(e.target.value)}
                      placeholder="#000000"
                      className="font-mono uppercase"
                    />
                  </div>
                </Field>
                <DialogFooter className="mt-4">
                  <Button type="button" variant="outline" onClick={() => setOpenColumn(false)}>Cancelar</Button>
                  <Button type="submit" disabled={loading}>{loading ? "Salvando..." : "Salvar Coluna"}</Button>
                </DialogFooter>
              </FieldGroup>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="columns" direction="horizontal" type="COLUMN">
          {(provided) => (
            <div 
              className="flex gap-6 overflow-x-auto pb-6 min-h-[calc(100vh-250px)] scrollbar-hide" 
              ref={provided.innerRef} 
              {...provided.droppableProps}
            >
              {columns.map((col, index) => (
                <Draggable draggableId={`col-${col.id}`} index={index} key={col.id}>
                  {(provCol) => (
                    <div
                      ref={provCol.innerRef}
                      {...provCol.draggableProps}
                      className="flex flex-col min-w-[320px] w-[320px] bg-slate-50/50 dark:bg-slate-900/20 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm transition-shadow hover:shadow-md"
                    >
                      {/* Header da Coluna */}
                      <div 
                        className="p-4 flex items-center justify-between border-b"
                        style={{ borderTop: `4px solid ${col.color ?? "#64748B"}` }}
                        {...provCol.dragHandleProps}
                      >
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-slate-800 dark:text-slate-100 tracking-tight">
                            {col.title}
                          </h3>
                          <span className="bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold px-2 py-0.5 rounded-full">
                            {(cardsByColumn[col.id] || []).length}
                          </span>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-slate-900" onClick={() => openEditColumn(col)}>
                            <IconPencil className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-600" onClick={() => deleteColumn(col.id)}>
                            <IconTrash className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Lista de Cards */}
                      <Droppable droppableId={`column-${col.id}`} direction="vertical">
                        {(provCards) => (
                          <div 
                            className="flex-1 p-3 space-y-3 min-h-[150px] overflow-y-auto max-h-[600px] scrollbar-thin" 
                            ref={provCards.innerRef} 
                            {...provCards.droppableProps}
                          >
                            {(cardsByColumn[col.id] || []).map((card, ci) => (
                              <Draggable draggableId={`card-${card.id}`} index={ci} key={card.id}>
                                {(provCard) => (
                                  <div
                                    ref={provCard.innerRef}
                                    {...provCard.draggableProps}
                                    {...provCard.dragHandleProps}
                                    className="group relative bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-4 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all active:scale-[0.98]"
                                  >
                                    <div className="flex flex-col gap-2">
                                      <div className="flex justify-between items-start">
                                        <div className="font-semibold text-slate-800 dark:text-slate-100 leading-tight pr-8">
                                          {card.title}
                                        </div>
                                        <div className="opacity-0 group-hover:opacity-100 flex gap-1 absolute top-2 right-2 transition-opacity">
                                          <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400" onClick={(e) => { e.stopPropagation(); openEditCard(card); }}>
                                            <IconPencil className="w-3.5 h-3.5" />
                                          </Button>
                                          <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-red-500" onClick={(e) => { e.stopPropagation(); deleteCard(card.id, col.id); }}>
                                            <IconTrash className="w-3.5 h-3.5" />
                                          </Button>
                                        </div>
                                      </div>
                                      
                                      {card.description && (
                                        <div className="text-sm text-slate-500 dark:text-slate-400 line-clamp-3">
                                          {card.description}
                                        </div>
                                      )}
                                      
                                      <div className="mt-2 flex items-center justify-between">
                                        <div 
                                          className="h-1.5 w-12 rounded-full" 
                                          style={{ backgroundColor: col.color ?? "#64748B" }} 
                                        />
                                        <div className="text-[10px] text-slate-400 font-mono">
                                          #{card.id}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provCards.placeholder}
                          </div>
                        )}
                      </Droppable>

                      {/* Footer da Coluna / Novo Card */}
                      <div className="p-3 bg-slate-50/80 dark:bg-slate-900/40 border-t border-slate-200 dark:border-slate-800">
                        <Button 
                          variant="ghost" 
                          className="w-full justify-start gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-white dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all" 
                          onClick={() => openCreateCard(col.id)}
                        >
                          <IconPlus className="w-4 h-4" />
                          Adicionar tarefa
                        </Button>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
              
              {/* Botão para adicionar coluna extra no final */}
              <button 
                onClick={openCreateColumn}
                className="flex flex-col items-center justify-center min-w-[320px] w-[320px] h-[120px] border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl hover:border-slate-400 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-all group"
              >
                <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-full group-hover:bg-white dark:group-hover:bg-slate-700 transition-colors">
                  <IconPlus className="w-6 h-6 text-slate-400 group-hover:text-slate-600" />
                </div>
                <span className="mt-2 text-sm font-medium text-slate-500 group-hover:text-slate-700">Adicionar Coluna</span>
              </button>
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* Dialog para Novo/Editar Card */}
      <Dialog open={openCard} onOpenChange={setOpenCard}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingCardId ? "Editar Card" : "Novo Card"}</DialogTitle>
            <DialogDescription>Defina os detalhes da tarefa</DialogDescription>
          </DialogHeader>
          <form onSubmit={submitCard} className="space-y-6">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="cardTitle">Título da Tarefa</FieldLabel>
                <Input id="cardTitle" value={cardTitle} onChange={(e) => setCardTitle(e.target.value)} placeholder="O que precisa ser feito?" required />
              </Field>
              <Field>
                <FieldLabel htmlFor="cardDescription">Descrição (opcional)</FieldLabel>
                <textarea 
                  id="cardDescription" 
                  value={cardDescription} 
                  onChange={(e) => setCardDescription(e.target.value)} 
                  className="w-full min-h-[100px] p-3 rounded-md border border-input bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Detalhes adicionais..."
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="cardColumn">Mover para Coluna</FieldLabel>
                <select
                  id="cardColumn"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={targetColumnForCard ?? ""}
                  onChange={(e) => setTargetColumnForCard(Number(e.target.value))}
                >
                  <option value="" disabled>Selecione a coluna</option>
                  {columns.map((c) => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </Field>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpenCard(false)}>Cancelar</Button>
                <Button type="submit" disabled={loading || !targetColumnForCard}>
                  {loading ? "Salvando..." : "Salvar Card"}
                </Button>
              </DialogFooter>
            </FieldGroup>
          </form>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}
