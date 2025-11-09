
import React, { useState } from 'react';
import { Target, Plus, Trash2, AlertCircle } from 'lucide-react';
import * as Icons from 'lucide-react';
import { useFinanceData } from '../hooks/useFinanceData';
import GoalForm from '../components/GoalForm';
import { TransactionType } from '../types';

const GoalsScreen: React.FC<{ data: ReturnType<typeof useFinanceData> }> = ({ data }) => {
  const { goals, categories, transactions, addGoal, deleteGoal } = data;
  const [isFormOpen, setIsFormOpen] = useState(false);

  const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);

  const handleDelete = (id: string, categoryName: string) => {
    if (window.confirm(`Tem certeza que deseja excluir a meta de "${categoryName}"?`)) {
      deleteGoal(id);
    }
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <header className="bg-white px-6 pt-6 pb-4 border-b border-gray-200 sticky top-0 z-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Metas Financeiras</h1>
        <p className="text-gray-500 font-medium text-sm">Acompanhe seus limites de gastos e objetivos.</p>
      </header>

      <div className="flex-1 overflow-y-auto p-6 pb-24 no-scrollbar space-y-5">
        {goals.length === 0 ? (
           <div className="flex flex-col items-center justify-center h-[50vh] text-gray-400 dashed-border rounded-3xl bg-white/50 p-8 text-center">
             <Target size={48} className="mb-4 opacity-30 text-secondary"/>
             <h3 className="text-lg font-semibold text-gray-700 mb-2">Nenhuma meta ainda</h3>
             <p className="text-sm max-w-[200px]">Defina objetivos vinculados a categorias para acompanhar automaticamente.</p>
           </div>
        ) : (
          goals.map(goal => {
            const category = categories.find(c => c.id === goal.categoryId);
            const IconComponent = category ? (Icons[category.icon as keyof typeof Icons] as React.ElementType) : Target;
            const goalName = category ? category.name : 'Categoria Desconhecida';
            const isExpense = category?.type === TransactionType.EXPENSE;

            // Calculate current amount based on category type (Income vs Expense)
            const currentAmount = transactions
              .filter(tx => tx.categoryId === goal.categoryId)
              .reduce((acc, tx) => {
                 if (isExpense) {
                   // For expense goals, sum expenses, subtract refunds/income in that category
                   return tx.type === TransactionType.EXPENSE ? acc + tx.amount : acc - tx.amount;
                 } else {
                   // For income goals, sum income, subtract expenses (if any weird case)
                   return tx.type === TransactionType.INCOME ? acc + tx.amount : acc - tx.amount;
                 }
              }, 0);

            const safeCurrentAmount = Math.max(0, currentAmount);
            const progressPercent = (safeCurrentAmount / goal.targetAmount) * 100;
            const isReached = safeCurrentAmount >= goal.targetAmount;

            // Determine colors based on state and type
            let progressBarColor = category?.color ? `bg-${category.color.match(/text-(\w+)-600/)?.[1] || 'blue'}-500` : 'bg-blue-500';
            let badgeColor = 'bg-gray-100 text-gray-600';
            let amountTextColor = 'text-gray-400';

            if (isReached) {
                if (isExpense) {
                    // ALERT: Expense goal reached or exceeded
                    progressBarColor = 'bg-red-500';
                    badgeColor = 'bg-red-100 text-red-700';
                    amountTextColor = 'text-red-500 font-semibold';
                } else {
                    // SUCCESS: Income goal reached
                    progressBarColor = 'bg-emerald-500';
                    badgeColor = 'bg-emerald-100 text-emerald-700';
                    amountTextColor = 'text-emerald-600 font-semibold';
                }
            }

            return (
              <div
                key={goal.id}
                className={`bg-white p-5 rounded-3xl border shadow-sm relative group overflow-hidden transition-colors ${isReached && isExpense ? 'border-red-200 bg-red-50/30' : 'border-gray-100'}`}
              >
                 {/* Quick Delete Button */}
                 <button
                    onClick={() => handleDelete(goal.id, goalName)}
                    className="absolute top-3 right-3 p-2 text-gray-300 hover:text-red-500 transition-colors sm:opacity-0 group-hover:opacity-100"
                 >
                   <Trash2 size={16} />
                 </button>

                <div className="flex items-start justify-between mb-5 pr-8">
                  <div className="flex items-center">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mr-4 ${category?.color || 'bg-blue-100 text-blue-600'}`}>
                      <IconComponent size={24} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-gray-900 text-lg line-clamp-1">{goalName}</h3>
                        {isReached && isExpense && (
                            <AlertCircle size={16} className="text-red-500" />
                        )}
                      </div>
                      <p className={`text-xs mt-1 ${amountTextColor}`}>
                        {formatCurrency(safeCurrentAmount)} <span className="font-normal text-gray-400">de</span> {formatCurrency(goal.targetAmount)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex justify-between items-baseline mb-2">
                      <span className={`text-xs font-extrabold px-2.5 py-1 rounded-full ${badgeColor}`}>
                        {progressPercent.toFixed(0)}%
                      </span>
                      {goal.deadline && (
                        <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                          Até {new Date(goal.deadline).toLocaleDateString('pt-BR')}
                        </span>
                      )}
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${progressBarColor}`}
                        style={{ width: `${Math.min(progressPercent, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <button
        onClick={() => setIsFormOpen(true)}
        className="fixed right-5 bottom-24 w-16 h-16 bg-primary text-white rounded-full shadow-xl shadow-primary/30 flex items-center justify-center active:scale-95 transition-transform z-40"
      >
        <Plus size={32} strokeWidth={2.5} />
      </button>

      <GoalForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={addGoal}
        categories={categories}
      />
    </div>
  );
};

export default GoalsScreen;
