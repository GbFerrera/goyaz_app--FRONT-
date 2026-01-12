"use client";
import { IconPlus, IconPencil, IconTrash } from "@tabler/icons-react";
import { useState } from "react";

const mockRegularizacao = {
  urbana: {
    recibo: "Recibo de compra e venda - João Silva",
    iptu: "IPTU 2024 - R$ 1.250,00",
    benfeitorias: "Casa de alvenaria, 3 quartos, 2 banheiros",
    descricao: "Imóvel localizado na Rua das Flores, 123, Centro. Área construída de 120m², com garagem para 2 carros."
  },
  rural: {
    docPosse: "Escritura de Posse - Fazenda Santa Rita",
    ccir: "CCIR: 123.456.789.012-3",
    itr: "ITR 2024 - R$ 850,00 + Declaração de Atividade Rural",
    car: "CAR: BR-MG-1234567-ABCD1234",
    benfeitorias: "Casa sede, curral, cercas, açude",
  }
};

export default function Home() {
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleEdit = (tipo: string) => {
    console.log("Editar regularização:", tipo);
    // Implementar lógica de edição
  };

  const handleDelete = (tipo: string) => {
    console.log("Deletar regularização:", tipo);
    setDeleteConfirm(null);
    // Implementar lógica de exclusão
  };

  const handleNew = () => {
    console.log("Nova regularização");
    // Implementar lógica de criação
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-foreground">Regularização</h1>
        <button
          onClick={handleNew}
          className="flex items-center gap-2 px-4 py-2 bg-secondary border-2 border-primary rounded-lg hover:bg-secondary/80 transition-colors"
        >
          <IconPlus className="w-5 h-5 text-green-600" />
          <span className="text-foreground font-medium">Nova Regularização</span>
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Urbana */}
        <div className="bg-card border-2 border-primary/30 rounded-lg p-6 shadow-sm relative">
          <h2 className="text-2xl font-semibold text-primary mb-6 pb-3 border-b-2 border-primary/20">
            Urbana
          </h2>
          
          <div className="space-y-4 pb-12">
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-1">Recibo</h3>
              <p className="text-muted-foreground">{mockRegularizacao.urbana.recibo}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-1">IPTU</h3>
              <p className="text-muted-foreground">{mockRegularizacao.urbana.iptu}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-1">Benfeitorias</h3>
              <p className="text-muted-foreground">{mockRegularizacao.urbana.benfeitorias}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-1">Descrição do Imóvel</h3>
              <p className="text-muted-foreground">{mockRegularizacao.urbana.descricao}</p>
            </div>
          </div>
          
          {/* Ações */}
          <div className="absolute bottom-4 right-4 flex gap-2">
            <button
              onClick={() => handleEdit('urbana')}
              className="p-2 hover:bg-primary/10 rounded transition-colors"
              title="Editar"
            >
              <IconPencil className="w-4 h-4 text-[#4A2A1A]" />
            </button>
            {deleteConfirm === 'urbana' ? (
              <div className="flex gap-1">
                <button
                  onClick={() => handleDelete('urbana')}
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
                onClick={() => setDeleteConfirm('urbana')}
                className="p-2 hover:bg-red-50 rounded transition-colors"
                title="Deletar"
              >
                <IconTrash className="w-4 h-4 text-red-600" />
              </button>
            )}
          </div>
        </div>

        {/* Rural */}
        <div className="bg-card border-2 border-primary/30 rounded-lg p-6 shadow-sm relative">
          <h2 className="text-2xl font-semibold text-primary mb-6 pb-3 border-b-2 border-primary/20">
            Rural
          </h2>
          
          <div className="space-y-4 pb-12">
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-1">Doc. de Posse</h3>
              <p className="text-muted-foreground">{mockRegularizacao.rural.docPosse}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-1">CCIR</h3>
              <p className="text-muted-foreground">{mockRegularizacao.rural.ccir}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-1">ITR + declaração</h3>
              <p className="text-muted-foreground">{mockRegularizacao.rural.itr}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-1">CAR</h3>
              <p className="text-muted-foreground">{mockRegularizacao.rural.car}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-1">Benfeitorias</h3>
              <p className="text-muted-foreground">{mockRegularizacao.rural.benfeitorias}</p>
            </div>
          </div>
          
          {/* Ações */}
          <div className="absolute bottom-4 right-4 flex gap-2">
            <button
              onClick={() => handleEdit('rural')}
              className="p-2 hover:bg-primary/10 rounded transition-colors"
              title="Editar"
            >
              <IconPencil className="w-4 h-4 text-[#4A2A1A]" />
            </button>
            {deleteConfirm === 'rural' ? (
              <div className="flex gap-1">
                <button
                  onClick={() => handleDelete('rural')}
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
                onClick={() => setDeleteConfirm('rural')}
                className="p-2 hover:bg-red-50 rounded transition-colors"
                title="Deletar"
              >
                <IconTrash className="w-4 h-4 text-red-600" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
