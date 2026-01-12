"use client";
import { IconPlus, IconPencil, IconTrash } from "@tabler/icons-react";
import { useState } from "react";

const mockClientes = [
  {
    id: 1,
    nome: "Maria Santos Silva",
    telefone: "(11) 98765-4321",
    email: "maria.santos@email.com"
  },
  {
    id: 2,
    nome: "João Pedro Oliveira",
    telefone: "(19) 99123-4567",
    email: "joao.oliveira@email.com"
  },
  {
    id: 3,
    nome: "Ana Carolina Souza",
    telefone: "(11) 97654-3210",
    email: "ana.souza@email.com"
  },
  {
    id: 4,
    nome: "Carlos Eduardo Lima",
    telefone: "(16) 98888-7777",
    email: "carlos.lima@email.com"
  },
  {
    id: 5,
    nome: "Fernanda Alves Costa",
    telefone: "(11) 96543-2109",
    email: "fernanda.costa@email.com"
  },
  {
    id: 6,
    nome: "Roberto Mendes",
    telefone: "(19) 99876-5432",
    email: "roberto.mendes@email.com"
  }
];

export default function Clients() {
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const handleEdit = (id: number) => {
    console.log("Editar cliente:", id);
    // Implementar lógica de edição
  };

  const handleDelete = (id: number) => {
    console.log("Deletar cliente:", id);
    setDeleteConfirm(null);
    // Implementar lógica de exclusão
  };

  const handleNew = () => {
    console.log("Novo cliente");
    // Implementar lógica de criação
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-foreground">Clientes</h1>
        <button
          onClick={handleNew}
          className="flex items-center gap-2 px-4 py-2 bg-secondary border-2 border-primary rounded-lg hover:bg-secondary/80 transition-colors"
        >
          <IconPlus className="w-5 h-5 text-green-600" />
          <span className="text-foreground font-medium">Novo Cliente</span>
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockClientes.map((cliente) => (
          <div key={cliente.id} className="bg-card border-2 border-primary/60 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow relative">
            <div className="space-y-4 pb-12">
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-1">Nome</h3>
                <p className="text-lg font-medium text-primary">{cliente.nome}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-1">Telefone</h3>
                <p className="text-muted-foreground">{cliente.telefone}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-1">E-mail</h3>
                <p className="text-muted-foreground break-all">{cliente.email}</p>
              </div>
            </div>
            
            {/* Ações */}
            <div className="absolute bottom-4 right-4 flex gap-2">
              <button
                onClick={() => handleEdit(cliente.id)}
                className="p-2 hover:bg-primary/10 rounded transition-colors"
                title="Editar"
              >
                <IconPencil className="w-4 h-4 text-[#4A2A1A]" />
              </button>
              {deleteConfirm === cliente.id ? (
                <div className="flex gap-1">
                  <button
                    onClick={() => handleDelete(cliente.id)}
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
                  onClick={() => setDeleteConfirm(cliente.id)}
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