import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function AddMoneyModal({ piggyBank, isOpen, onClose, onConfirm, isLoading }) {
  const [amount, setAmount] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (amount && parseFloat(amount) > 0) {
      onConfirm(parseFloat(amount));
      setAmount('');
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (!piggyBank) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{piggyBank.icon || '🐷'}</span>
                <div>
                  <h3 className="font-semibold text-lg">{piggyBank.name}</h3>
                  <p className="text-sm text-gray-500">
                    {formatCurrency(piggyBank.current_amount)} de {formatCurrency(piggyBank.goal_amount)}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quanto deseja guardar?
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0,00"
                  className="text-2xl font-semibold text-center h-16 rounded-2xl"
                  autoFocus
                />
              </div>

              <div className="flex gap-3">
                {[50, 100, 200].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setAmount(value.toString())}
                    className="flex-1 py-2 rounded-xl bg-violet-100 text-violet-700 font-medium hover:bg-violet-200 transition-colors"
                  >
                    R$ {value}
                  </button>
                ))}
              </div>

              <Button
                type="submit"
                disabled={!amount || parseFloat(amount) <= 0 || isLoading}
                className="w-full mt-6 h-14 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-lg font-semibold"
              >
                {isLoading ? 'Guardando...' : 'Guardar dinheiro'}
              </Button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}