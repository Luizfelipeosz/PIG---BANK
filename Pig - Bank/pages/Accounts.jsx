import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Plus, X, Wallet, CreditCard, Landmark, Trash2, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const accountTypes = [
  { value: 'checking', label: 'Conta Corrente', icon: Wallet, color: 'bg-blue-500' },
  { value: 'savings', label: 'Poupança', icon: Landmark, color: 'bg-emerald-500' },
  { value: 'credit', label: 'Cartão de Crédito', icon: CreditCard, color: 'bg-purple-500' },
];

export default function Accounts() {
  const [showForm, setShowForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'checking',
    balance: '',
  });
  const queryClient = useQueryClient();

  const { data: accounts = [], isLoading } = useQuery({
    queryKey: ['accounts'],
    queryFn: () => base44.entities.Account.list('-created_date'),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Account.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      closeForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Account.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      closeForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Account.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
  });

  const closeForm = () => {
    setShowForm(false);
    setEditingAccount(null);
    setFormData({ name: '', type: 'checking', balance: '' });
  };

  const openEditForm = (account) => {
    setEditingAccount(account);
    setFormData({
      name: account.name,
      type: account.type,
      balance: account.balance?.toString() || '0',
    });
    setShowForm(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      ...formData,
      balance: parseFloat(formData.balance) || 0,
    };

    if (editingAccount) {
      updateMutation.mutate({ id: editingAccount.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const totalBalance = accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 pt-14 pb-8 px-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <h1 className="text-2xl font-bold text-white">Minhas Contas</h1>
          <Button
            onClick={() => setShowForm(true)}
            className="bg-white/20 hover:bg-white/30 text-white rounded-2xl"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nova
          </Button>
        </motion.div>

        {/* Total Balance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center"
        >
          <p className="text-white/70 text-sm mb-1">Saldo total</p>
          <p className="text-3xl font-bold text-white">{formatCurrency(totalBalance)}</p>
        </motion.div>
      </div>

      {/* Content */}
      <div className="px-6 py-6 space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 rounded-2xl bg-gray-200 animate-pulse" />
            ))}
          </div>
        ) : accounts.length > 0 ? (
          accounts.map((account, index) => {
            const typeConfig = accountTypes.find(t => t.value === account.type) || accountTypes[0];
            const Icon = typeConfig.icon;

            return (
              <motion.div
                key={account.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-5 shadow-sm flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl ${typeConfig.color} flex items-center justify-center`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{account.name}</h3>
                    <p className="text-sm text-gray-500">{typeConfig.label}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <p className="font-bold text-lg text-gray-900">
                    {formatCurrency(account.balance || 0)}
                  </p>
                  <div className="flex gap-1">
                    <button
                      onClick={() => openEditForm(account)}
                      className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteMutation.mutate(account.id)}
                      className="p-2 rounded-xl hover:bg-red-50 transition-colors text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="w-20 h-20 rounded-full bg-violet-100 flex items-center justify-center mx-auto mb-4">
              <Wallet className="w-10 h-10 text-violet-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Nenhuma conta cadastrada</h3>
            <p className="text-gray-500 mb-6">Adicione suas contas bancárias para começar</p>
            <Button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 rounded-2xl h-12 px-8"
            >
              <Plus className="w-5 h-5 mr-2" />
              Adicionar conta
            </Button>
          </motion.div>
        )}
      </div>

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center"
            onClick={closeForm}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-t-3xl sm:rounded-3xl p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingAccount ? 'Editar Conta' : 'Nova Conta'}
                </h2>
                <button
                  onClick={closeForm}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <Label className="text-gray-700">Tipo de conta</Label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {accountTypes.map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, type: type.value })}
                        className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                          formData.type === type.value
                            ? 'border-violet-500 bg-violet-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-xl ${type.color} flex items-center justify-center`}>
                          <type.icon className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xs font-medium text-gray-700">{type.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="name" className="text-gray-700">Nome da conta</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Nubank"
                    className="mt-1 h-12 rounded-xl"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="balance" className="text-gray-700">Saldo atual</Label>
                  <div className="relative mt-1">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">R$</span>
                    <Input
                      id="balance"
                      type="number"
                      step="0.01"
                      value={formData.balance}
                      onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                      placeholder="0,00"
                      className="pl-12 h-12 rounded-xl"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="w-full h-14 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-lg font-semibold"
                >
                  {createMutation.isPending || updateMutation.isPending
                    ? 'Salvando...'
                    : editingAccount
                    ? 'Salvar alterações'
                    : 'Adicionar conta'}
                </Button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}