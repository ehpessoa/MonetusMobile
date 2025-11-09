
import React, { useState } from 'react';
import { X } from 'lucide-react';
import { CategoryItem, GoalEntry } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (goal: Omit<GoalEntry, 'id'>) => void;
  categories: CategoryItem[];
}

const GoalForm: React.FC<Props> = ({ isOpen, onClose, onSubmit, categories }) => {
  const [targetAmount, setTargetAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [deadline, setDeadline] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetAmount || !categoryId) return;

    onSubmit({
      targetAmount: parseFloat(targetAmount.replace(',', '.')),
      categoryId,
      deadline: deadline || undefined,
    });
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setTargetAmount('');
    setCategoryId('');
    setDeadline('');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity">
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <h2 className="text-xl font-bold text-gray-900">Nova Meta</h2>
          <button onClick={onClose} className="p-2 -mr-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
            <X size={24} />
          </button>
        </div>

        {/* Form with Scrollable Content and Sticky Footer */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {/* Categoria */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Categoria *</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:border-secondary outline-none appearance-none text-gray-900 text-base"
                required
              >
                <option value="" disabled>Selecione a categoria</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-2 ml-1">A meta será aplicada ao saldo desta categoria.</p>
            </div>

            {/* Valor Alvo */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Valor Alvo *</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">R$</span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  placeholder="0,00"
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:border-secondary outline-none text-lg font-bold text-gray-900"
                  required
                />
              </div>
            </div>

            {/* Data Limite */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Data Limite (Opcional)</label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:border-secondary outline-none text-base text-gray-900"
              />
            </div>
          </div>

          {/* Sticky Footer */}
          <div className="p-6 pt-4 border-t border-gray-100 bg-white shrink-0">
            <button
              type="submit"
              className="w-full py-3.5 bg-primary text-white rounded-2xl font-bold text-lg active:scale-[0.98] transition-transform shadow-lg shadow-primary/20"
            >
              Criar Meta
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GoalForm;
