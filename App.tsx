
import React, { useState } from 'react';
import BottomNav from './components/BottomNav';
import DashboardScreen from './screens/DashboardScreen';
import TransactionsScreen from './screens/TransactionsScreen';
import GoalsScreen from './screens/GoalsScreen';
import AuthScreen from './screens/AuthScreen';
import SyncModal from './components/SyncModal';
import { useFinanceData } from './hooks/useFinanceData';
import { useAuth } from './hooks/useAuth';
import { AppTab } from './types';
import { Loader2, LogOut, RefreshCw } from 'lucide-react';

const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<AppTab>(AppTab.TRANSACTIONS);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const auth = useAuth();
  // Pass userId to finance hook to ensure data isolation. 
  // If null, it will load nothing, but we won't render main app anyway.
  const financeData = useFinanceData(auth.user?.id || null);

  // Global loading state (checking auth session)
  if (auth.isLoading) {
      return (
          <div className="h-full w-full flex items-center justify-center bg-emerald-900">
              <Loader2 className="animate-spin text-emerald-400" size={48} />
          </div>
      );
  }

  // Not authenticated -> Show Auth Screen
  if (!auth.user) {
      return <AuthScreen auth={auth} />;
  }

  // Authenticated but finance data still loading
  if (financeData.isLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-secondary" size={40} />
      </div>
    );
  }

  const renderScreen = () => {
    switch (currentTab) {
      case AppTab.DASHBOARD:
        return <DashboardScreen data={financeData} />;
      case AppTab.TRANSACTIONS:
        return <TransactionsScreen data={financeData} />;
      case AppTab.GOALS:
        return <GoalsScreen data={financeData} />;
      default:
        return <TransactionsScreen data={financeData} />;
    }
  };

  return (
    <div className="h-full w-full relative max-w-md mx-auto bg-white shadow-2xl overflow-hidden flex flex-col">
       {/* 
         Note: 'max-w-md mx-auto' simulates a phone screen on desktop browsers 
         while taking full width on actual mobile devices due to standard viewport meta.
       */}
      
      {/* Mini Header for User Info, Sync & Logout */}
      {auth.user.isDemo && (
        <div className="bg-amber-100 text-amber-800 text-xs text-center py-1 font-medium">
           Modo Demonstração
        </div>
      )}
      <div className="bg-white px-4 py-2 flex justify-between items-center border-b border-gray-100">
          <span className="text-xs font-semibold text-gray-500 truncate max-w-[150px]">
              Olá, {auth.user.name.split(' ')[0]}
          </span>
          <div className="flex items-center gap-1">
              <button
                  onClick={() => setIsSyncModalOpen(true)}
                  className="text-secondary/80 hover:text-secondary transition-colors p-1.5 bg-secondary/5 rounded-full"
                  title="Sincronizar Dispositivos"
              >
                  <RefreshCw size={16} />
              </button>
              <div className="h-4 w-px bg-gray-200 mx-1"></div>
              <button 
                onClick={auth.logout}
                className="text-gray-400 hover:text-red-500 transition-colors p-1.5"
                title="Sair"
              >
                  <LogOut size={16} />
              </button>
          </div>
      </div>

      <main className="flex-1 overflow-hidden relative">
        {renderScreen()}
      </main>
      <BottomNav currentTab={currentTab} onTabChange={setCurrentTab} />

      <SyncModal 
          isOpen={isSyncModalOpen} 
          onClose={() => setIsSyncModalOpen(false)}
          getSyncData={financeData.getSyncData}
          mergeSyncData={financeData.mergeSyncData}
      />
    </div>
  );
};

export default App;
