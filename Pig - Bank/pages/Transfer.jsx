import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, ArrowRight, Wallet, PiggyBank, Check, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function Transfer() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const toPiggy = urlParams.get('toPiggy') === 'true';

  const [transferType, setTransferType] = useState(toPiggy ? 'to_piggy' : 'between_accounts');
  const [amount, setAmount] = useState('');
  const [fromAccount, setFromAccount] = useState('');
  const [toAccount, setToAccount] = useState('');
  const [toPiggyBank, setToPiggyBank] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const { data: accounts = [] } = useQuery({
    queryKey: ['accounts'],
    queryFn: () => base44.entities.Account.list(),
  });

  const { data: piggyBanks = [] } = useQuery({
    queryKey: ['piggyBanks'],
    queryFn: () => base44.entities.PiggyBank.list(),
  });

  const transferMutation = useMutation({
    mutationFn: async () => {
      const amountValue = parseFloat(amount);
      
      if (transferType === 'between_accounts' && fromAccount && toAccount) {
        const from = accounts.find(a => a.id === fromAccount);
        const to = accounts.find(a => a.id === toAccount);
        
        await base44.entities.Account.update(fromAccount, {
          balance: (from?.balance || 0) - amountValue
        });
        await base44.entities.Account.update(toAccount, {
          balance: (to?.balance || 0) + amountValue
        });
        
        await base44.entities.Transaction.create({
          description: `Transferência para ${to?.name}`,
          amount: amountValue,
          type: 'transfer',
          category: 'transferência',
          from_account_id: fromAccount,
          to_account_id: toAccount,
          date: new Date().toISOString().split('T')[0]
        });
      } else if (transferType === 'to_piggy' && toPiggyBank) {
        const piggy = piggyBanks.find(p => p.id === toPiggyBank);
        
        await base44.entities.PiggyBank.update(toPiggyBank, {
          current_amount: (piggy?.current_amount || 0) + amountValue
        });
        
        if (fromAccount) {
          const from = accounts.find(a => a.id === fromAccount);
          await base44.entities.Account.update(fromAccount, {
            balance: (from?.balance || 0) - amountValue
          });
        }
        
        await base44.entities.Transaction.create({
          description: `Guardado em ${piggy?.name}`,
          amount: amountValue,
          type: 'transfer',
          category: 'Cofrinho',
          from_account_id: fromAccount || undefined,
          to_piggybank_id: toPiggyBank,
          date: new Date().toISOString().split('T')[0]
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['piggyBanks'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      setShowSuccess(true);
      setTimeout(() => {
        navigate(createPageUrl('Home'));
      }, 1500);
    },
  });

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const canSubmit = () => {
    if (!amount || parseFloat(amount) <= 0) return false;
    if (transferType === 'between_accounts') {
      return fromAccount && toAccount && fromAccount !== toAccount;
    }
    return toPiggyBank;
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
          <h2 className="text-2xl font-bold text-white mb-2">Transferência realizada!</h2>
          <p className="text-white/70">Redirecionando...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 pt-14 pb-8 px-6">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl bg-white/20 hover:bg-white/30 transition-colors text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-white">Transferir</h1>
        </div>

        {/* Type Toggle */}
        <div className="flex gap-2 bg-white/10 rounded-2xl p-1">
          <button
            onClick={() => setTransferType('between_accounts')}
            className={`flex-1 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
              transferType === 'between_accounts'
                ? 'bg-white text-violet-600'
                : 'text-white/70 hover:text-white'
            }`}
          >
            <Wallet className="w-4 h-4" />
            Entre contas
          </button>
          <button
            onClick={() => setTransferType('to_piggy')}
            className={`flex-1 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
              transferType === 'to_piggy'
                ? 'bg-white text-violet-600'
                : 'text-white/70 hover:text-white'
            }`}
          >
            <PiggyBank className="w-4 h-4" />
            Para cofrinho
          </button>
        </div>
      </div>

      {/* Form */}
      <div className="px-6 py-6 space-y-6">
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
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0,00"
              className="pl-14 h-16 text-3xl font-bold rounded-2xl border-2 focus:border-violet-500"
              autoFocus
            />
          </div>
          
          {/* Quick amounts */}
          <div className="flex gap-2 mt-3">
            {[50, 100, 200, 500].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setAmount(value.toString())}
                className="flex-1 py-2 rounded-xl bg-violet-100 text-violet-700 font-medium hover:bg-violet-200 transition-colors text-sm"
              >
                R$ {value}
              </button>
            ))}
          </div>
        </motion.div>

        {/* From Account */}
        {(transferType === 'between_accounts' || transferType === 'to_piggy') && accounts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Label className="text-gray-700">De qual conta?</Label>
            <div className="space-y-2 mt-3">
              {accounts.map((account) => (
                <button
                  key={account.id}
                  type="button"
                  onClick={() => setFromAccount(account.id)}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
                    fromAccount === account.id
                      ? 'border-violet-500 bg-violet-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      account.type === 'checking' ? 'bg-blue-100' :
                      account.type === 'savings' ? 'bg-green-100' : 'bg-purple-100'
                    }`}>
                      <Wallet className={`w-5 h-5 ${
                        account.type === 'checking' ? 'text-blue-600' :
                        account.type === 'savings' ? 'text-green-600' : 'text-purple-600'
                      }`} />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900">{account.name}</p>
                      <p className="text-sm text-gray-500">{formatCurrency(account.balance || 0)}</p>
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 ${
                    fromAccount === account.id
                      ? 'border-violet-500 bg-violet-500'
                      : 'border-gray-300'
                  }`}>
                    {fromAccount === account.id && (
                      <Check className="w-full h-full text-white p-0.5" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Arrow */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex justify-center"
        >
          <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center">
            <ArrowRight className="w-5 h-5 text-violet-600 rotate-90" />
          </div>
        </motion.div>

        {/* To Account or Piggy Bank */}
        {transferType === 'between_accounts' ? (
          accounts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Label className="text-gray-700">Para qual conta?</Label>
              <div className="space-y-2 mt-3">
                {accounts.filter(a => a.id !== fromAccount).map((account) => (
                  <button
                    key={account.id}
                    type="button"
                    onClick={() => setToAccount(account.id)}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
                      toAccount === account.id
                        ? 'border-violet-500 bg-violet-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        account.type === 'checking' ? 'bg-blue-100' :
                        account.type === 'savings' ? 'bg-green-100' : 'bg-purple-100'
                      }`}>
                        <Wallet className={`w-5 h-5 ${
                          account.type === 'checking' ? 'text-blue-600' :
                          account.type === 'savings' ? 'text-green-600' : 'text-purple-600'
                        }`} />
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-gray-900">{account.name}</p>
                        <p className="text-sm text-gray-500">{formatCurrency(account.balance || 0)}</p>
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 ${
                      toAccount === account.id
                        ? 'border-violet-500 bg-violet-500'
                        : 'border-gray-300'
                    }`}>
                      {toAccount === account.id && (
                        <Check className="w-full h-full text-white p-0.5" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Label className="text-gray-700">Para qual cofrinho?</Label>
            {piggyBanks.length > 0 ? (
              <div className="space-y-2 mt-3">
                {piggyBanks.map((piggy) => (
                  <button
                    key={piggy.id}
                    type="button"
                    onClick={() => setToPiggyBank(piggy.id)}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
                      toPiggyBank === piggy.id
                        ? 'border-violet-500 bg-violet-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{piggy.icon || '🐷'}</span>
                      <div className="text-left">
                        <p className="font-medium text-gray-900">{piggy.name}</p>
                        <p className="text-sm text-gray-500">
                          {formatCurrency(piggy.current_amount || 0)} / {formatCurrency(piggy.goal_amount)}
                        </p>
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 ${
                      toPiggyBank === piggy.id
                        ? 'border-violet-500 bg-violet-500'
                        : 'border-gray-300'
                    }`}>
                      {toPiggyBank === piggy.id && (
                        <Check className="w-full h-full text-white p-0.5" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="mt-3 p-6 rounded-2xl bg-gray-100 text-center">
                <PiggyBank className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">Nenhum cofrinho criado</p>
                <Button
                  variant="link"
                  onClick={() => navigate(createPageUrl('PiggyBanks'))}
                  className="text-violet-600"
                >
                  Criar um cofrinho
                </Button>
              </div>
            )}
          </motion.div>
        )}

        {/* Submit */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="pt-4"
        >
          <Button
            onClick={() => transferMutation.mutate()}
            disabled={!canSubmit() || transferMutation.isPending}
            className="w-full h-16 rounded-2xl text-lg font-semibold bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
          >
            {transferMutation.isPending ? 'Transferindo...' : 'Confirmar transferência'}
          </Button>
        </motion.div>
      </div>
    </div>
  );
}