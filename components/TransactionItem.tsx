
import React from 'react';
import * as Icons from 'lucide-react';
import { TransactionEntry, CategoryItem, TransactionType } from '../types';

interface Props {
  transaction: TransactionEntry;
  category?: CategoryItem;
  onPress: (tx: TransactionEntry) => void;
}

const TransactionItem: React.FC<Props> = ({ transaction, category, onPress }) => {
  // Dynamic icon loading
  const IconComponent = category ? (Icons[category.icon as keyof typeof Icons] as React.ElementType) : Icons.HelpCircle;
  const isExpense = transaction.type === TransactionType.EXPENSE;

  const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  
  // Formatação compacta da data para caber na coluna (DD/MM/AA)
  const formattedDate = new Date(transaction.date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit'
  });

  return (
    <div
      onClick={() => onPress(transaction)}
      className="flex items-center p-4 bg-white border-b border-gray-100 active:bg-gray-50 transition-colors cursor-pointer gap-3"
    >
      {/* Ícone */}
      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${category?.color || 'bg-gray-100 text-gray-500'}`}>
        {IconComponent && <IconComponent size={20} />}
      </div>

      {/* Descrição (ocupa o espaço restante) */}
      <div className="flex-1 min-w-0 mr-2">
        <div className="flex items-center gap-1.5">
          {/* Título Principal: Categoria */}
          <h4 className="text-sm font-semibold text-gray-900 truncate">{category?.name || 'Sem Categoria'}</h4>
          {transaction.isGeminiParsed && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-blue-100 text-blue-800 uppercase tracking-wider shrink-0">
              IA
            </span>
          )}
        </div>
        {/* Subtítulo: Descrição (se existir e for diferente da categoria) */}
        {transaction.description && transaction.description !== category?.name && (
            <p className="text-xs text-gray-500 truncate mt-0.5">{transaction.description}</p>
        )}
      </div>

      {/* Data (Coluna antes do valor) */}
      <div className="text-xs text-gray-400 font-medium whitespace-nowrap shrink-0">
        {formattedDate}
      </div>

      {/* Valor */}
      <div className={`text-sm font-semibold whitespace-nowrap shrink-0 min-w-[80px] text-right ${isExpense ? 'text-gray-900' : 'text-emerald-600'}`}>
        {isExpense ? '-' : '+'}{formatCurrency(Math.abs(transaction.amount))}
      </div>
    </div>
  );
};

export default TransactionItem;
