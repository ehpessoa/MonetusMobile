
import React, { useState, useEffect } from 'react';
import { X, Edit2, Trash2, Calendar, Store, Tag, Sparkles, AlertTriangle, CheckCircle2 } from 'lucide-react';
import * as Icons from 'lucide-react';
import { TransactionEntry, CategoryItem, TransactionType } from '../types';

interface Props {
  transaction: TransactionEntry | null;
  category?: CategoryItem;
  onClose: () => void;
  onEdit: (tx: TransactionEntry) => void;
  onDelete: (id: string) => void;
}

const TransactionDetails: React.FC<Props> = ({ transaction, category, onClose, onEdit, onDelete }) => {
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  // Reset state when transaction changes or modal opens/closes
  useEffect(() => {
    if (transaction) {
      setIsConfirmingDelete(false);
    }
  }, [transaction]);

  if (!transaction) return null;

  const isExpense = transaction.type === TransactionType.EXPENSE;
  const IconComponent = category ? (Icons[category.icon as keyof typeof Icons] as React.ElementType) : Icons.HelpCircle;

  const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
  };

  const handleConfirmDelete = () => {
    onDelete(transaction.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity animation-fade-in">
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl overflow-hidden flex flex-col max-h-[85vh] shadow-2xl">
        {/* Header Compacto */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 shrink-0">
          <h2 className={`text-base font-bold ${isConfirmingDelete ? 'text-red-600 flex items-center gap-2' : 'text-gray-900'}`}>
            {isConfirmingDelete ? (
              <>
                <AlertTriangle size={18} />
                Confirmar Exclusão
              </>
            ) : (
              'Detalhes'
            )}
          </h2>
          <button 
            onClick={onClose} 
            className="p-1.5 -mr-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100" 
            aria-label="Fechar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content Compacto */}
        <div className="p-5 overflow-y-auto flex-1">
          {isConfirmingDelete ? (
            <div className="flex flex-col items-center justify-center py-8 text-center space-y-4 animate-in fade-in slide-in-from-bottom-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-600 mb-2">
                <Trash2 size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Tem certeza?</h3>
              <p className="text-gray-600 max-w-[260px]">
                Esta ação não pode ser desfeita. O lançamento será removido permanentemente.
              </p>
            </div>
          ) : (
            <>
              {/* Main Amount Compacto */}
              <div className="flex flex-col items-center justify-center py-2 mb-4 animate-in fade-in">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3 shadow-sm ${category?.color || 'bg-gray-100 text-gray-500'}`}>
                   {IconComponent && <IconComponent size={28} />}
                </div>
                <h1 className={`text-3xl font-bold tracking-tight mb-1 ${isExpense ? 'text-gray-900' : 'text-emerald-600'}`}>
                  {isExpense ? '-' : '+'}{formatCurrency(transaction.amount)}
                </h1>
                <p className="text-base font-medium text-gray-700 text-center px-4 line-clamp-2">
                  {transaction.description || category?.name || 'Sem descrição'}
                </p>
                 {transaction.isGeminiParsed && (
                  <div className="mt-2 flex items-center gap-1 px-2.5 py-0.5 bg-blue-50 text-blue-700 rounded-full text-[10px] font-bold uppercase tracking-wider">
                    <Sparkles size={10} />
                    IA
                  </div>
                )}
              </div>

              {/* Details List Compacta */}
              <div className="space-y-3 bg-gray-50 p-4 rounded-2xl animate-in fade-in slide-in-from-bottom-2">
                {transaction.merchant && (
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-gray-400 shrink-0 shadow-sm">
                      <Store size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Estabelecimento</p>
                      <p className="text-sm text-gray-900 font-medium truncate">{transaction.merchant}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-gray-400 shrink-0 shadow-sm">
                    <Calendar size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Data</p>
                    <p className="text-sm text-gray-900 font-medium capitalize truncate">{formatDate(transaction.date)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-gray-400 shrink-0 shadow-sm">
                    <Tag size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Categoria</p>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-900 font-medium truncate">{category?.name || 'Desconhecida'}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider ${isExpense ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                         {isExpense ? 'Despesa' : 'Receita'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Actions Footer Compacto */}
        <div className="p-5 pt-0 shrink-0 flex gap-3 bg-white">
           {isConfirmingDelete ? (
             <>
                <button
                 onClick={() => setIsConfirmingDelete(false)}
                 className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold text-sm active:scale-[0.98] transition-transform"
               >
                 Cancelar
               </button>
               <button
                 onClick={handleConfirmDelete}
                 className="flex-[2] py-3 bg-red-600 text-white rounded-xl font-semibold text-sm active:scale-[0.98] transition-transform flex items-center justify-center gap-2 shadow-lg shadow-red-600/20"
               >
                 <Trash2 size={18} />
                 Sim, Excluir
               </button>
             </>
           ) : (
             <>
               <button
                 onClick={() => onEdit(transaction)}
                 className="flex-1 py-3 bg-secondary/10 text-secondary rounded-xl font-semibold text-sm active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
               >
                 <Edit2 size={16} />
                 Editar
               </button>
               <button
                 onClick={() => setIsConfirmingDelete(true)}
                 className="flex-1 py-3 bg-red-50 text-red-600 rounded-xl font-semibold text-sm active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
               >
                 <Trash2 size={16} />
                 Excluir
               </button>
             </>
           )}
        </div>

      </div>
    </div>
  );
};

export default TransactionDetails;
