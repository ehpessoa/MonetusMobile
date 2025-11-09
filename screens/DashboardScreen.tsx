import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useFinanceData } from '../hooks/useFinanceData';
import { TransactionType } from '../types';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6b7280'];

const DashboardScreen: React.FC<{ data: ReturnType<typeof useFinanceData> }> = ({ data }) => {
  const { transactions, categories, getSummary } = data;
  const summary = getSummary();

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthlyTx = transactions.filter(tx => new Date(tx.date) >= startOfMonth && tx.type === TransactionType.EXPENSE);

  const categoryTotals = monthlyTx.reduce((acc, tx) => {
    const catName = categories.find(c => c.id === tx.categoryId)?.name || 'Outros';
    acc[catName] = (acc[catName] || 0) + tx.amount;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(categoryTotals)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => Number(b.value) - Number(a.value));

  const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="h-full flex flex-col bg-gray-50 overflow-y-auto pb-20 no-scrollbar">
      <header className="bg-primary px-6 pt-10 pb-20 text-white rounded-b-[3rem] shadow-lg shadow-primary/20">
        <p className="text-blue-200 text-sm font-semibold mb-2 uppercase tracking-wider">Saldo Total</p>
        <h1 className="text-5xl font-bold tracking-tight">{formatCurrency(data.getBalance())}</h1>

        <div className="flex gap-4 mt-8">
          <div className="flex-1 bg-white/10 rounded-2xl p-4 backdrop-blur-md border border-white/5">
            <div className="flex items-center gap-2 text-emerald-300 mb-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]"></div>
              <span className="text-xs font-bold uppercase tracking-wider">Receitas</span>
            </div>
            <p className="text-xl font-semibold tracking-tight">{formatCurrency(summary.income)}</p>
          </div>
          <div className="flex-1 bg-white/10 rounded-2xl p-4 backdrop-blur-md border border-white/5">
            <div className="flex items-center gap-2 text-red-300 mb-2">
              <div className="w-2 h-2 rounded-full bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.6)]"></div>
              <span className="text-xs font-bold uppercase tracking-wider">Despesas</span>
            </div>
            <p className="text-xl font-semibold tracking-tight">{formatCurrency(summary.expense)}</p>
          </div>
        </div>
      </header>

      <div className="px-5 -mt-10">
        {/* Monthly Spending Card */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Despesas do Mês</h3>
          <div className="h-64">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => formatCurrency(Number(value))}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-3">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                   <span className="text-2xl opacity-50">💸</span>
                </div>
                <p className="font-medium">Sem despesas este mês</p>
              </div>
            )}
          </div>
          {/* Legend */}
          <div className="grid grid-cols-1 gap-3 mt-6">
             {pieData.slice(0, 5).map((entry, index) => (
               <div key={entry.name} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                 <div className="flex items-center">
                    <div className="w-4 h-4 rounded-full mr-3 shadow-sm" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                    <span className="text-sm font-medium text-gray-700 truncate">{entry.name}</span>
                 </div>
                 <span className="text-sm font-bold text-gray-900">{formatCurrency(Number(entry.value))}</span>
               </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardScreen;