'use client';

import { useState, useEffect, useTransition, useMemo } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast, Toaster } from "sonner";
import { FaUsers, FaBalanceScale, FaPlus, FaEdit, FaTrash, FaSpinner, FaUserShield, FaUser, FaSearch } from "react-icons/fa";

import { getInternalUsers, updateUserAdminStatus, getLaws, createLaw, updateLaw, deleteLaw } from "@/app/actions/adminActions";

// Tipos
interface InternalUser {
  id: string;
  nome: string;
  email: string;
  administrador: boolean;
}

interface Law {
  id: string;
  nome: string;
  sigla: string;
}

const leiSchema = z.object({
  nome: z.string().min(1, { message: "O nome é obrigatório." }),
  sigla: z.string().min(1, { message: "A sigla é obrigatória." }),
});

type LeiForm = z.infer<typeof leiSchema>;

// Componente do Modal para Leis
const LawModal = ({ isOpen, onClose, onSave, law }: { isOpen: boolean; onClose: () => void; onSave: (data: LeiForm, id?: string) => void; law?: Law | null; }) => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<LeiForm>({
    resolver: zodResolver(leiSchema),
    defaultValues: law || { nome: "", sigla: "" }
  });

  useEffect(() => {
    reset(law || { nome: "", sigla: "" });
  }, [law, reset]);

  if (!isOpen) return null;

  const onSubmit = (data: LeiForm) => {
    onSave(data, law?.id);
  };

  return (
    <div className="fixed inset-0 bg-white-off dark:bg-blue-fcsn flex justify-center items-center z-50">
      <div className="bg-white dark:bg-blue-fcsn3 backdrop-opacity-100 p-6 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-blue-fcsn dark:text-white-off">{law ? "Editar Lei" : "Nova Lei"}</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block mb-1 font-bold text-gray-700 dark:text-white-off">Nome</label>
            <input {...register("nome")} className="w-full p-2 rounded border bg-white border-gray-300 dark:border-blue-fcsn dark:bg-blue-fcsn3 focus:outline-none focus:ring-2 focus:ring-blue-fcsn" />
            {errors.nome && <p className="text-red-500 text-sm mt-1">{errors.nome.message}</p>}
          </div>
          <div>
            <label className="block mb-1 font-bold text-gray-700 dark:text-white-off">Sigla</label>
            <input {...register("sigla")} className="w-full p-2 rounded border bg-white border-gray-300 dark:border-blue-fcsn dark:bg-blue-fcsn3 focus:outline-none focus:ring-2 focus:ring-blue-fcsn" />
            {errors.sigla && <p className="text-red-500 text-sm mt-1">{errors.sigla.message}</p>}
          </div>
          <div className="flex justify-end gap-4">
            <button type="button" onClick={onClose} className="py-2 px-4 rounded-lg bg-gray-200 dark:bg-blue-fcsn hover:bg-gray-300 dark:hover:bg-blue-fcsn2 cursor-pointer">Cancelar</button>
            <button type="submit" className="py-2 px-4 rounded-lg bg-blue-fcsn text-white hover:bg-blue-fcsn2 cursor-pointer">Salvar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Componente de Gerenciamento de Colaboradores
const UserManagement = () => {
  const [users, setUsers] = useState<InternalUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    getInternalUsers().then(data => {
      setUsers(data);
      setLoading(false);
    });
  }, []);

  const handleStatusChange = (userId: string, isAdmin: boolean) => {
    startTransition(async () => {
      const result = await updateUserAdminStatus(userId, isAdmin);
      if (result.success) {
        setUsers(users.map(u => u.id === userId ? { ...u, administrador: isAdmin } : u));
        toast.success(`Status de ${isAdmin ? 'administrador' : 'colaborador'} atribuído.`);
      } else {
        toast.error("Falha ao atualizar o status.");
      }
    });
  };

  const filteredUsers = useMemo(() =>
    users.filter(user =>
      user.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    ), [users, searchTerm]);

  if (loading) return <div className="flex justify-center items-center h-full"><FaSpinner className="animate-spin text-4xl" /></div>;

  return (
    <div className="min-w-[400px]">
      <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold">Colaboradores</h2>
          <div className="relative">
              <input
                  type="text"
                  placeholder="Buscar por nome ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full md:w-64 p-2 pl-10 rounded-lg border bg-white border-gray-300 dark:border-blue-fcsn dark:bg-blue-fcsn3 focus:outline-none focus:ring-2 focus:ring-blue-fcsn"
              />
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
      </div>
      <div className="space-y-4">
        {filteredUsers.map(user => (
          <div key={user.id} className="bg-white dark:bg-blue-fcsn3 p-4 rounded-lg shadow flex justify-between items-center">
            <div>
              <p className="font-bold text-lg">{user.nome}</p>
              <p className="text-sm text-gray-500 dark:text-gray-300">{user.email}</p>
            </div>
            <div className="flex items-center gap-4">
              <span className={`px-3 py-1 rounded-full text-sm ${user.administrador ? 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100' : 'bg-gray-200 text-gray-700'}`}>
                {user.administrador ? 'Admin' : 'Colaborador'}
              </span>
              {user.administrador ? (
                <button onClick={() => handleStatusChange(user.id, false)} disabled={isPending} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-blue-fcsn2 disabled:opacity-50 cursor-pointer">
                  <FaUser title="Rebaixar para Colaborador" />
                </button>
              ) : (
                <button onClick={() => handleStatusChange(user.id, true)} disabled={isPending} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-blue-fcsn2 disabled:opacity-50 cursor-pointer">
                  <FaUserShield title="Promover para Admin" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Componente de Gerenciamento de Leis
const LawManagement = () => {
  const [laws, setLaws] = useState<Law[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLaw, setEditingLaw] = useState<Law | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [, startTransition] = useTransition();

  useEffect(() => {
    getLaws().then(data => {
      setLaws(data);
      setLoading(false);
    });
  }, []);

  const handleSaveLaw = (data: LeiForm, id?: string) => {
    startTransition(async () => {
      const result = id ? await updateLaw(id, data.nome, data.sigla) : await createLaw(data.nome, data.sigla);
      if (result.success) {
        const updatedLaws = await getLaws();
        setLaws(updatedLaws);
        toast.success(`Lei ${id ? 'atualizada' : 'criada'} com sucesso!`);
        setIsModalOpen(false);
      } else {
        toast.error("Falha ao salvar a lei.");
      }
    });
  };

  const handleDeleteLaw = (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir esta lei?")) {
      startTransition(async () => {
        const result = await deleteLaw(id);
        if (result.success) {
          setLaws(laws.filter(l => l.id !== id));
          toast.success("Lei excluída com sucesso!");
        } else {
          toast.error("Falha ao excluir a lei.");
        }
      });
    }
  };

  const filteredLaws = useMemo(() =>
    laws.filter(law =>
      law.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      law.sigla.toLowerCase().includes(searchTerm.toLowerCase())
    ), [laws, searchTerm]);

  if (loading) return <div className="flex justify-center items-center h-full"><FaSpinner className="animate-spin text-4xl" /></div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Leis de Incentivo</h2>
        <div className="flex items-center gap-4">
            <div className="relative">
                <input
                    type="text"
                    placeholder="Buscar por nome ou sigla..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full md:w-64 p-2 pl-10 rounded-lg border bg-white border-gray-300 dark:border-blue-fcsn dark:bg-blue-fcsn3 focus:outline-none focus:ring-2 focus:ring-blue-fcsn"
                />
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
            <button onClick={() => { setEditingLaw(null); setIsModalOpen(true); }} className="flex items-center gap-2 bg-blue-fcsn dark:bg-blue-fcsn3 text-white py-2 px-4 rounded-lg hover:bg-blue-fcsn2 cursor-pointer">
              <FaPlus /> Nova Lei
            </button>
        </div>
      </div>
      <div className="space-y-4">
        {filteredLaws.map(law => (
          <div key={law.id} className="bg-white dark:bg-blue-fcsn3 p-4 rounded-lg shadow flex justify-between items-center">
            <div>
              <p className="font-bold text-lg">{law.nome}</p>
              <p className="text-sm text-gray-500 dark:text-gray-300">{law.sigla}</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => { setEditingLaw(law); setIsModalOpen(true); }} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-blue-fcsn2 cursor-pointer">
                <FaEdit />
              </button>
              <button onClick={() => handleDeleteLaw(law.id)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-blue-fcsn2 cursor-pointer">
                <FaTrash />
              </button>
            </div>
          </div>
        ))}
      </div>
      <LawModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveLaw} law={editingLaw} />
    </div>
  );
};

// Componente Principal da Página
export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'users' | 'laws'>('users');

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-blue-fcsn text-gray-900 dark:text-gray-100">
      <Toaster richColors closeButton />
      <aside className="w-64 bg-white dark:bg-blue-fcsn2 p-6 shadow-lg">
        <h1 className="text-2xl font-bold mb-8 text-blue-fcsn dark:text-white-off">Admin</h1>
        <nav className="space-y-4">
          <button
            onClick={() => setActiveTab('users')}
            className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${activeTab === 'users' ? 'bg-pink-fcsn text-white' : 'hover:bg-gray-100 dark:hover:bg-blue-fcsn3'}`}
          >
            <FaUsers /> Colaboradores
          </button>
          <button
            onClick={() => setActiveTab('laws')}
            className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${activeTab === 'laws' ? 'bg-pink-fcsn text-white' : 'hover:bg-gray-100 dark:hover:bg-blue-fcsn3'}`}
          >
            <FaBalanceScale /> Leis
          </button>
        </nav>
      </aside>
      <main className="flex-1 p-8 overflow-y-auto">
        {activeTab === 'users' && <UserManagement />}
        {activeTab === 'laws' && <LawManagement />}
      </main>
    </div>
  );
}
