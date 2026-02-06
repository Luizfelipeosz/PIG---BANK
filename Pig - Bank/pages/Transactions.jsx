import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Search, Filter, TrendingUp, TrendingDown, ArrowRightLeft } from 'lucide-react';
import { Input } from '@/components/ui/input';
import TransactionItem from '@/components/finance/TransactionItem';

const filterOptions = [
  { value: 'all', label: 'Todas', icon: null },
  { value: 'income', label: 'Receitas', icon: TrendingUp },
  { value: 'expense', label: 'Despesas', icon: TrendingDown },
  { value: 'transfer', label: 'Transferências', icon: ArrowRightLeft },
];

export default function Transactions() {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => base44.entities.Transaction.list('-created_date'),
  });

  const filteredTransactions = transactions.filter(t => {
    const matchesFilter = filter === 'all' || t.type === filter;
    const matchesSearch = search === '' || 
      t.description?.toLowerCase().includes(search.toLowerCase()) ||
      t.category?.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const totalIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const totalExpense = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 pt-14 pb-8 px-6">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold text-white mb-6"
        >
          Transações
        </motion.h1>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-3">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/10 backdrop-blur-sm rounded-2xl p-4"
          >
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-emerald-300" />
              <span className="text-white/70 text-sm">Receitas</span>
            </div>
            <p className="text-xl font-bold text-white">{formatCurrency(totalIncome)}</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/10 backdrop-blur-sm rounded-2xl p-4"
          >
            <div className="flex items-center gap-2 mb-1">
              <TrendingDown className="w-4 h-4 text-rose-300" />
              <span className="text-white/70 text-sm">Despesas</span>
            </div>
            <p className="text-xl font-bold text-white">{formatCurrency(totalExpense)}</p>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-6">
        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mb-4"
        >
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar transações..."
            className="pl-12 h-14 rounded-2xl bg-white border-0 shadow-sm"
          />
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex gap-2 mb-6 overflow-x-auto pb-2"
        >
          {filterOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setFilter(option.value)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap font-medium text-sm transition-all ${
                filter === option.value
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/30'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {option.icon && <option.icon className="w-4 h-4" />}
              {option.label}
            </button>
          ))}
        </motion.div>

        {/* Transactions List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl shadow-sm overflow-hidden"
        >
          {isLoading ? (
            <div className="p-4 space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="flex items-center gap-4 animate-pulse">
                  <div className="w-12 h-12 rounded-xl bg-gray-200" />
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-32 mb-2" />
                    <div className="h-3 bg-gray-100 rounded w-24" />
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-20" />
                </div>
              ))}
            </div>
          ) : filteredTransactions.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {filteredTransactions.map((transaction, index) => (
                <TransactionItem
                  key={transaction.id}
                  transaction={transaction}
                  index={index}
                />
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <div className="text-5xl mb-4">📊</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-1">Nenhuma transação</h3>
              <p className="text-gray-500">
                {search ? 'Tente buscar por outro termo' : 'Registre sua primeira transação'}
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}