import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Plus, X, Target, Calendar, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import AddMoneyModal from '@/components/finance/AddMoneyModal';

const emojiOptions = ['🐷', '🏠', '🚗', '✈️', '🎓', '💍', '🎮', '📱', '👗', '🎁', '🏝️', '💰'];

const colorOptions = [
  'from-amber-400 to-orange-500',
  'from-emerald-400 to-teal-500',
  'from-pink-400 to-rose-500',
  'from-blue-400 to-indigo-500',
  'from-violet-400 to-purple-500',
  'from-cyan-400 to-sky-500',
];

export default function PiggyBanks() {
  const [showForm, setShowForm] = useState(false);
  const [selectedPiggyBank, setSelectedPiggyBank] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    goal_amount: '',
    icon: '🐷',
    color: colorOptions[0],
    target_date: ''
  });
  const queryClient = useQueryClient();

  const { data: piggyBanks = [], isLoading } = useQuery({
    queryKey: ['piggyBanks'],
    queryFn: () => base44.entities.PiggyBank.list('-created_date'),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.PiggyBank.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['piggyBanks'] });
      setShowForm(false);
      setFormData({ name: '', goal_amount: '', icon: '🐷', color: colorOptions[0], target_date: '' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.PiggyBank.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['piggyBanks'] });
    },
  });

  const addToPiggyMutation = useMutation({
    mutationFn: async ({ piggyBank, amount }) => {
      await base44.entities.PiggyBank.update(piggyBank.id, {
        current_amount: (piggyBank.current_amount || 0) + amount
      });
      await base44.entities.Transaction.create({
        description: `Guardado em ${piggyBank.name}`,
        amount: amount,
        type: 'transfer',
        category: 'Cofrinho',
        to_piggybank_id: piggyBank.id,
        date: new Date().toISOString().split('T')[0]
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['piggyBanks'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      setIsModalOpen(false);
      setSelectedPiggyBank(null);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate({
      ...formData,
      goal_amount: parseFloat(formData.goal_amount),
      current_amount: 0
    });
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleAddMoney = (piggyBank) => {
    setSelectedPiggyBank(piggyBank);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 pt-14 pb-8 px-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <h1 className="text-2xl font-bold text-white">Meus Cofrinhos</h1>
          <Button
            onClick={() => setShowForm(true)}
            className="bg-white/20 hover:bg-white/30 text-white rounded-2xl"
          >
            <Plus className="w-5 h-5 mr-2" />
            Novo
          </Button>
        </motion.div>
      </div>

      {/* Content */}
      <div className="px-6 py-6 space-y-4">
        {isLoading ? (
          <div className="grid gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 rounded-3xl bg-gray-200 animate-pulse" />
            ))}
          </div>
        ) : piggyBanks.length > 0 ? (
          piggyBanks.map((piggy, index) => {
            const progress = (piggy.current_amount / piggy.goal_amount) * 100;
            
            return (
              <motion.div
                key={piggy.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative overflow-hidden rounded-3xl p-6 text-white bg-gradient-to-br ${piggy.color || colorOptions[index % colorOptions.length]}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{piggy.icon || '🐷'}</span>
                    <div>
                      <h3 className="text-xl font-bold">{piggy.name}</h3>
                      {piggy.target_date && (
                        <p className="text-white/70 text-sm flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Meta: {new Date(piggy.target_date).toLocaleDateString('pt-BR')}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteMutation.mutate(piggy.id)}
                    className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-semibold text-lg">{formatCurrency(piggy.current_amount || 0)}</span>
                    <span className="text-white/70">{formatCurrency(piggy.goal_amount)}</span>
                  </div>
                  <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(progress, 100)}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="h-full bg-white rounded-full"
                    />
                  </div>
                  <p className="text-sm text-white/80 mt-2">
                    {progress >= 100 ? '🎉 Meta atingida!' : `${progress.toFixed(1)}% completo`}
                  </p>
                </div>

                <Button
                  onClick={() => handleAddMoney(piggy)}
                  className="w-full bg-white/20 hover:bg-white/30 text-white rounded-2xl h-12"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Adicionar dinheiro
                </Button>
              </motion.div>
            );
          })
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="text-6xl mb-4">🐷</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Nenhum cofrinho ainda</h3>
            <p className="text-gray-500 mb-6">Comece a guardar para realizar seus sonhos!</p>
            <Button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 rounded-2xl h-12 px-8"
            >
              <Plus className="w-5 h-5 mr-2" />
              Criar primeiro cofrinho
            </Button>
          </motion.div>
        )}
      </div>

      {/* Create Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center"
            onClick={() => setShowForm(false)}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-t-3xl sm:rounded-3xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Novo Cofrinho</h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <Label className="text-gray-700">Escolha um ícone</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {emojiOptions.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setFormData({ ...formData, icon: emoji })}
                        className={`w-12 h-12 text-2xl rounded-xl flex items-center justify-center transition-all ${
                          formData.icon === emoji
                            ? 'bg-violet-100 ring-2 ring-violet-500'
                            : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-gray-700">Cor do cofrinho</Label>
                  <div className="flex gap-2 mt-2">
                    {colorOptions.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setFormData({ ...formData, color })}
                        className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} transition-transform ${
                          formData.color === color ? 'ring-2 ring-offset-2 ring-violet-500 scale-110' : ''
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="name" className="text-gray-700">Nome do cofrinho</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Viagem dos sonhos"
                    className="mt-1 h-12 rounded-xl"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="goal" className="text-gray-700">Meta (R$)</Label>
                  <div className="relative mt-1">
                    <Target className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="goal"
                      type="number"
                      step="0.01"
                      min="1"
                      value={formData.goal_amount}
                      onChange={(e) => setFormData({ ...formData, goal_amount: e.target.value })}
                      placeholder="0,00"
                      className="pl-10 h-12 rounded-xl"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="date" className="text-gray-700">Data alvo (opcional)</Label>
                  <div className="relative mt-1">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="date"
                      type="date"
                      value={formData.target_date}
                      onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
                      className="pl-10 h-12 rounded-xl"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="w-full h-14 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-lg font-semibold"
                >
                  {createMutation.isPending ? 'Criando...' : 'Criar Cofrinho'}
                </Button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AddMoneyModal
        piggyBank={selectedPiggyBank}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedPiggyBank(null);
        }}
        onConfirm={(amount) => addToPiggyMutation.mutate({ piggyBank: selectedPiggyBank, amount })}
        isLoading={addToPiggyMutation.isPending}
      />
    </div>
  );
}