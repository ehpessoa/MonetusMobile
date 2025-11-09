import React from 'react';
import { LayoutDashboard, Receipt, Target } from 'lucide-react';
import { AppTab } from '../types';

interface BottomNavProps {
  currentTab: AppTab;
  onTabChange: (tab: AppTab) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onTabChange }) => {
  const tabs = [
    { id: AppTab.TRANSACTIONS, label: 'Lançamentos', icon: Receipt },
    { id: AppTab.DASHBOARD, label: 'Resumo', icon: LayoutDashboard },
    { id: AppTab.GOALS, label: 'Metas', icon: Target },
  ];

  return (
    <nav className="bg-white border-t border-gray-200 fixed bottom-0 left-0 right-0 pb-safe-bottom z-50">
      <div className="flex justify-around items-center h-16">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center w-full h-full transition-colors duration-200 ${
                isActive ? 'text-secondary' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-xs mt-1 font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;