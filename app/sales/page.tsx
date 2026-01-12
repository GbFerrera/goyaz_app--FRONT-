"use client";
import { IconPlus, IconPencil, IconTrash } from "@tabler/icons-react";
import { useState } from "react";

const mockVendas = [
  {
    id: 1,
    fotos: "5 fotos",
    categoria: "Casa",
    tamanho: "120m²",
    valor: "R$ 450.000,00",
    localizacao: "Centro, São Paulo - SP",
    descricao: "Casa ampla com 3 quartos, 2 banheiros, garagem para 2 carros. Próximo a escolas e comércio."
  },
  {
    id: 2,
    fotos: "8 fotos",
    categoria: "Chácara",
    tamanho: "5 hectares",
    valor: "R$ 850.000,00",
    localizacao: "Zona Rural, Campinas - SP",
    descricao: "Chácara com casa sede, pomar, açude e área de lazer completa. Ideal para quem busca tranquilidade."
  },
  {
    id: 3,
    fotos: "3 fotos",
    categoria: "Casa",
    tamanho: "85m²",
    valor: "R$ 280.000,00",
    localizacao: "Jardim das Flores, Ribeirão Preto - SP",
    descricao: "Casa térrea com 2 quartos, sala, cozinha e quintal. Ótima oportunidade para primeira moradia."
  }
];

export default function Sales() {
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const handleEdit = (id: number) => {
    console.log("Editar venda:", id);
    // Implementar lógica de edição
  };

  const handleDelete = (id: number) => {
    console.log("Deletar venda:", id);
    setDeleteConfirm(null);
    // Implementar lógica de exclusão
  };

  const handleNew = () => {
    console.log("Nova venda");
    // Implementar lógica de criação
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-foreground">Vendas</h1>
        <button
          onClick={handleNew}
          className="flex items-center gap-2 px-4 py-2 bg-secondary border-2 border-primary rounded-lg hover:bg-secondary/80 transition-colors"
        >
          <IconPlus className="w-5 h-5 text-green-600" />
          <span className="text-foreground font-medium">Nova Venda</span>
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {mockVendas.map((venda) => (
          <div key={venda.id} className="bg-card border-2 border-primary rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow relative">
            {/* Header com fotos */}
            <div className="bg-secondary p-4 border-b-2 border-primary">
              <p className="text-sm font-semibold text-primary">{venda.fotos}</p>
            </div>
            
            {/* Conteúdo */}
            <div className="p-5 space-y-3 pb-14">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-1">Categoria</h3>
                  <p className="text-muted-foreground">{venda.categoria}</p>
                </div>
                <div className="text-right">
                  <h3 className="text-sm font-semibold text-foreground mb-1">Tamanho</h3>
                  <p className="text-muted-foreground">{venda.tamanho}</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-1">Valor</h3>
                <p className="text-xl font-bold text-foreground">{venda.valor}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-1">Localização</h3>
                <p className="text-muted-foreground">{venda.localizacao}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-1">Descrição</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{venda.descricao}</p>
              </div>
            </div>
            
            {/* Ações */}
            <div className="absolute bottom-4 right-4 flex gap-2">
              <button
                onClick={() => handleEdit(venda.id)}
                className="p-2 hover:bg-primary/10 rounded transition-colors"
                title="Editar"
              >
                <IconPencil className="w-4 h-4 text-[#4A2A1A]" />
              </button>
              {deleteConfirm === venda.id ? (
                <div className="flex gap-1">
                  <button
                    onClick={() => handleDelete(venda.id)}
                    className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                  >
                    Confirmar
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="px-2 py-1 text-xs bg-gray-400 text-white rounded hover:bg-gray-500 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setDeleteConfirm(venda.id)}
                  className="p-2 hover:bg-red-50 rounded transition-colors"
                  title="Deletar"
                >
                  <IconTrash className="w-4 h-4 text-red-600" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}