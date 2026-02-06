import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { Home, Receipt, PiggyBank, Wallet, User } from 'lucide-react';

const navItems = [
  { icon: Home, label: 'Início', page: 'Home' },
  { icon: Receipt, label: 'Transações', page: 'Transactions' },
  { icon: PiggyBank, label: 'Cofrinhos', page: 'PiggyBanks' },
  { icon: Wallet, label: 'Contas', page: 'Accounts' },
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  
  // Don't show nav on login page
  if (currentPageName === 'Login') {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {children}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 pb-6 pt-3 z-40">
        <div className="flex justify-around items-center max-w-md mx-auto">
          {navItems.map((item) => {
            const isActive = currentPageName === item.page;
            
            return (
              <Link
                key={item.page}
                to={createPageUrl(item.page)}
                className="relative flex flex-col items-center gap-1 py-2 px-4"
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute -top-3 w-12 h-1 rounded-full bg-gradient-to-r from-violet-600 to-purple-600"
                  />
                )}
                <item.icon
                  className={`w-6 h-6 transition-colors ${
                    isActive ? 'text-violet-600' : 'text-gray-400'
                  }`}
                />
                <span
                  className={`text-xs font-medium transition-colors ${
                    isActive ? 'text-violet-600' : 'text-gray-400'
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}