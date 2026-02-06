import React from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, TrendingUp, TrendingDown } from 'lucide-react';

export default function BalanceCard({ balance, income, expenses, showBalance, onToggleBalance }) {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 p-6 text-white shadow-2xl"
    >
      <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
      <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-2">
          <span className="text-white/70 text-sm font-medium">Saldo total</span>
          <button 
            onClick={onToggleBalance}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            {showBalance ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
          </button>
        </div>
        
        <motion.h2 
          className="text-4xl font-bold mb-6"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
        >
          {showBalance ? formatCurrency(balance) : '••••••'}
        </motion.h2>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1.5 rounded-full bg-emerald-400/20">
                <TrendingUp className="w-4 h-4 text-emerald-300" />
              </div>
              <span className="text-white/70 text-xs">Receitas</span>
            </div>
            <p className="text-lg font-semibold">
              {showBalance ? formatCurrency(income) : '••••'}
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1.5 rounded-full bg-rose-400/20">
                <TrendingDown className="w-4 h-4 text-rose-300" />
              </div>
              <span className="text-white/70 text-xs">Despesas</span>
            </div>
            <p className="text-lg font-semibold">
              {showBalance ? formatCurrency(expenses) : '••••'}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}