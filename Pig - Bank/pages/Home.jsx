import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ChevronRight, Plus, Bell } from 'lucide-react';
import BalanceCard from '@/components/finance/BalanceCard';
import PiggyBankCard from '@/components/finance/PiggyBankCard';
import TransactionItem from '@/components/finance/TransactionItem';
import QuickActions from '@/components/finance/QuickActions';
import AddMoneyModal from '@/components/finance/AddMoneyModal';

export default function Home() {
  const [showBalance, setShowBalance] = useState(true);
  const [selectedPiggyBank, setSelectedPiggyBank] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: accounts = [] } = useQuery({
    queryKey: ['accounts'],
    queryFn: () => base44.entities.Account.list(),
  });

  const { data: piggyBanks = [] } = useQuery({
    queryKey: ['piggyBanks'],
    queryFn: () => base44.entities.PiggyBank.list(),
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => base44.entities.Transaction.list('-created_date', 5),
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

  const totalBalance = accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

  const handleAddMoney = (piggyBank) => {
    setSelectedPiggyBank(piggyBank);
    setIsModalOpen(true);
  };

  const handleConfirmAdd = (amount) => {
    if (selectedPiggyBank) {
      addToPiggyMutation.mutate({ piggyBank: selectedPiggyBank, amount });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 pt-12 pb-32 px-6">
        <div className="flex items-center justify-between mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <p className="text-white/70 text-sm">Olá,</p>
            <h1 className="text-2xl font-bold text-white">
              {user?.full_name?.split(' ')[0] || 'Usuário'}
            </h1>
          </motion.div>
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative p-3 rounded-2xl bg-white/10 hover:bg-white/20 transition-colors"
          >
            <Bell className="w-6 h-6 text-white" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500" />
          </motion.button>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 -mt-24 space-y-6">
        {/* Balance Card */}
        <BalanceCard
          balance={totalBalance}
          income={totalIncome}
          expenses={totalExpenses}
          showBalance={showBalance}
          onToggleBalance={() => setShowBalance(!showBalance)}
        />

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <QuickActions />
        </motion.div>

        {/* Piggy Banks */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Meus Cofrinhos</h2>
            <Link 
              to={createPageUrl('PiggyBanks')}
              className="flex items-center gap-1 text-violet-600 text-sm font-medium hover:text-violet-700"
            >
              Ver todos <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {piggyBanks.length > 0 ? (
            <div className="flex gap-4 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-hide">
              {piggyBanks.slice(0, 4).map((piggy, index) => (
                <PiggyBankCard
                  key={piggy.id}
                  piggyBank={piggy}
                  onAddMoney={handleAddMoney}
                  index={index}
                />
              ))}
            </div>
          ) : (
            <Link to={createPageUrl('PiggyBanks')}>
              <div className="bg-gradient-to-br from-violet-100 to-purple-100 rounded-2xl p-6 text-center border-2 border-dashed border-violet-300 hover:border-violet-400 transition-colors">
                <div className="w-12 h-12 rounded-full bg-violet-200 flex items-center justify-center mx-auto mb-3">
                  <Plus className="w-6 h-6 text-violet-600" />
                </div>
                <p className="text-violet-700 font-medium">Criar primeiro cofrinho</p>
                <p className="text-violet-500 text-sm mt-1">Comece a guardar para seus sonhos</p>
              </div>
            </Link>
          )}
        </motion.div>

        {/* Recent Transactions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Transações Recentes</h2>
            <Link 
              to={createPageUrl('Transactions')}
              className="flex items-center gap-1 text-violet-600 text-sm font-medium hover:text-violet-700"
            >
              Ver todas <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
            {transactions.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {transactions.map((transaction, index) => (
                  <TransactionItem 
                    key={transaction.id} 
                    transaction={transaction} 
                    index={index}
                  />
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <p className="text-gray-500">Nenhuma transação ainda</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      <AddMoneyModal
        piggyBank={selectedPiggyBank}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedPiggyBank(null);
        }}
        onConfirm={handleConfirmAdd}
        isLoading={addToPiggyMutation.isPending}
      />
    </div>
  );
}