import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Calendar, Tag, FileText, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const categories = {
  income: [
    { value: 'salário', emoji: '💼' },
    { value: 'freelance', emoji: '💻' },
    { value: 'investimentos', emoji: '📈' },
    { value: 'presente', emoji: '🎁' },
    { value: 'outros', emoji: '📦' },
  ],
  expense: [
    { value: 'alimentação', emoji: '🍔' },
    { value: 'transporte', emoji: '🚗' },
    { value: 'moradia', emoji: '🏠' },
    { value: 'lazer', emoji: '🎮' },
    { value: 'saúde', emoji: '💊' },
    { value: 'educação', emoji: '📚' },
    { value: 'compras', emoji: '🛍️' },
    { value: 'tecnologia', emoji: '📱' },
    { value: 'viagem', emoji: '✈️' },
    { value: 'outros', emoji: '📦' },
  ],
};

export default function NewTransaction() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const initialType = urlParams.get('type') || 'expense';

  const [type, setType] = useState(initialType);
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [showSuccess, setShowSuccess] = useState(false);

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Transaction.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      setShowSuccess(true);
      setTimeout(() => {
        navigate(createPageUrl('Home'));
      }, 1500);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate({
      ...formData,
      amount: parseFloat(formData.amount),
      type,
    });
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-6"
          >
            <Check className="w-12 h-12 text-white" />
          </motion.div>
          <h2 className="text-2xl font-bold text-white mb-2">
            {type === 'income' ? 'Receita registrada!' : 'Despesa registrada!'}
          </h2>
          <p className="text-white/70">Redirecionando...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className={`pt-14 pb-8 px-6 ${
        type === 'income' 
          ? 'bg-gradient-to-br from-emerald-500 to-teal-600'
          : 'bg-gradient-to-br from-rose-500 to-pink-600'
      }`}>
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl bg-white/20 hover:bg-white/30 transition-colors text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-white">
            Nova {type === 'income' ? 'Receita' : 'Despesa'}
          </h1>
        </div>

        {/* Type Toggle */}
        <div className="flex gap-2 bg-white/10 rounded-2xl p-1">
          <button
            onClick={() => setType('income')}
            className={`flex-1 py-3 rounded-xl font-medium transition-all ${
              type === 'income'
                ? 'bg-white text-emerald-600'
                : 'text-white/70 hover:text-white'
            }`}
          >
            Receita
          </button>
          <button
            onClick={() => setType('expense')}
            className={`flex-1 py-3 rounded-xl font-medium transition-all ${
              type === 'expense'
                ? 'bg-white text-rose-600'
                : 'text-white/70 hover:text-white'
            }`}
          >
            Despesa
          </button>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
        {/* Amount */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Label className="text-gray-700 text-lg">Valor</Label>
          <div className="relative mt-2">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl text-gray-400 font-semibold">
              R$
            </span>
            <Input
              type="number"
              step="0.01"
              min="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="0,00"
              className="pl-14 h-16 text-3xl font-bold rounded-2xl border-2 focus:border-violet-500"
              required
              autoFocus
            />
          </div>
        </motion.div>

        {/* Description */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Label className="text-gray-700">Descrição</Label>
          <div className="relative mt-2">
            <FileText className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Ex: Almoço no restaurante"
              className="pl-12 min-h-[80px] rounded-2xl resize-none"
              required
            />
          </div>
        </motion.div>

        {/* Category */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Label className="text-gray-700 flex items-center gap-2">
            <Tag className="w-4 h-4" /> Categoria
          </Label>
          <div className="flex flex-wrap gap-2 mt-3">
            {categories[type].map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => setFormData({ ...formData, category: cat.value })}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all ${
                  formData.category === cat.value
                    ? type === 'income'
                      ? 'bg-emerald-100 text-emerald-700 ring-2 ring-emerald-500'
                      : 'bg-rose-100 text-rose-700 ring-2 ring-rose-500'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span>{cat.emoji}</span>
                <span className="capitalize">{cat.value}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Date */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Label className="text-gray-700">Data</Label>
          <div className="relative mt-2">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="pl-12 h-14 rounded-2xl"
              required
            />
          </div>
        </motion.div>

        {/* Submit */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="pt-4"
        >
          <Button
            type="submit"
            disabled={createMutation.isPending || !formData.amount || !formData.category}
            className={`w-full h-16 rounded-2xl text-lg font-semibold ${
              type === 'income'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700'
                : 'bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700'
            }`}
          >
            {createMutation.isPending ? 'Salvando...' : `Registrar ${type === 'income' ? 'Receita' : 'Despesa'}`}
          </Button>
        </motion.div>
      </form>
    </div>
  );
}