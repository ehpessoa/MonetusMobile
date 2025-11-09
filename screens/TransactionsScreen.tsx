
import React, { useState, useMemo } from 'react';
import { Plus, Search, Receipt as ReceiptOff, TrendingUp, TrendingDown } from 'lucide-react';
import TransactionItem from '../components/TransactionItem';
import TransactionForm from '../components/TransactionForm';
import TransactionDetails from '../components/TransactionDetails';
import { useFinanceData } from '../hooks/useFinanceData';
import { TransactionEntry, TransactionType } from '../types';

const TransactionsScreen: React.FC<{ data: ReturnType<typeof useFinanceData> }> = ({ data }) => {
  const { transactions, categories, addTransaction, updateTransaction, deleteTransaction, addCategory } = data;
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionEntry | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<TransactionEntry | null>(null);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx =>
      tx.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tx.merchant && tx.merchant.toLowerCase().includes(searchQuery.toLowerCase())) ||
      categories.find(c => c.id === tx.categoryId)?.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [transactions, searchQuery, categories]);

  // Separar e ordenar receitas e despesas
  const { incomeTransactions, expenseTransactions } = useMemo(() => {
    const sorted = [...filteredTransactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return {
      incomeTransactions: sorted.filter(tx => tx.type === TransactionType.INCOME),
      expenseTransactions: sorted.filter(tx => tx.type === TransactionType.EXPENSE),
    };
  }, [filteredTransactions]);

  const handleTransactionPress = (tx: TransactionEntry) => {
    setSelectedTransaction(tx);
  };

  const handleEditPress = (tx: TransactionEntry) => {
    setSelectedTransaction(null); // Close details
    setEditingTransaction(tx); // Set data for form
    setIsFormOpen(true); // Open form
  };

  const handleSaveTransaction = (txData: TransactionEntry | Omit<TransactionEntry, 'id'>) => {
    if ('id' in txData) {
        updateTransaction(txData as TransactionEntry);
    } else {
        addTransaction(txData);
    }
    setEditingTransaction(null);
  };

  const handleCloseForm = () => {
      setIsFormOpen(false);
      setEditingTransaction(null);
  }

  const hasAnyTransaction = incomeTransactions.length > 0 || expenseTransactions.length > 0;

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white px-5 pt-5 pb-3 border-b border-gray-200 sticky top-0 z-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-3">Lançamentos</h1>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar lançamentos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-100 border-transparent rounded-2xl text-base focus:bg-white focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none transition-all"
          />
        </div>
      </header>

      {/* List Content */}
      <div className="flex-1 overflow-y-auto pb-20 no-scrollbar">
        {!hasAnyTransaction ? (
          <div className="flex flex-col items-center justify-center h-[60vh] text-gray-400 px-4 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <ReceiptOff size={32} className="opacity-50" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-1">Nenhum lançamento</h3>
            <p className="text-sm text-gray-500 max-w-[250px]">Toque no botão "+" para adicionar sua primeira receita ou despesa.</p>
          </div>
        ) : (
          <div>
            {/* Seção de Receitas */}
            {incomeTransactions.length > 0 && (
              <div className="mb-6">
                <div className="sticky top-0 bg-gray-50/95 backdrop-blur-md px-5 py-3 z-0 shadow-sm flex items-center text-emerald-700">
                  <TrendingUp size={16} className="mr-2" />
                  <span className="text-xs font-bold uppercase tracking-wider">Receitas</span>
                  <span className="ml-auto text-xs font-semibold opacity-70">{incomeTransactions.length} itens</span>
                </div>
                <div className="bg-white divide-y divide-gray-50 border-y border-gray-100 shadow-sm">
                  {incomeTransactions.map(tx => (
                    <TransactionItem
                      key={tx.id}
                      transaction={tx}
                      category={categories.find(c => c.id === tx.categoryId)}
                      onPress={handleTransactionPress}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Seção de Despesas */}
            {expenseTransactions.length > 0 && (
              <div className="mb-6">
                <div className="sticky top-0 bg-gray-50/95 backdrop-blur-md px-5 py-3 z-0 shadow-sm flex items-center text-red-700">
                  <TrendingDown size={16} className="mr-2" />
                  <span className="text-xs font-bold uppercase tracking-wider">Despesas</span>
                   <span className="ml-auto text-xs font-semibold opacity-70">{expenseTransactions.length} itens</span>
                </div>
                <div className="bg-white divide-y divide-gray-50 border-y border-gray-100 shadow-sm">
                  {expenseTransactions.map(tx => (
                    <TransactionItem
                      key={tx.id}
                      transaction={tx}
                      category={categories.find(c => c.id === tx.categoryId)}
                      onPress={handleTransactionPress}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => setIsFormOpen(true)}
        className="fixed right-5 bottom-24 w-16 h-16 bg-secondary text-white rounded-full shadow-xl shadow-secondary/30 flex items-center justify-center active:scale-95 transition-transform z-40"
        aria-label="Adicionar Transação"
      >
        <Plus size={32} strokeWidth={2.5} />
      </button>

      {/* Details Modal */}
      <TransactionDetails
        transaction={selectedTransaction}
        category={selectedTransaction ? categories.find(c => c.id === selectedTransaction.categoryId) : undefined}
        onClose={() => setSelectedTransaction(null)}
        onEdit={handleEditPress}
        onDelete={deleteTransaction}
      />

      {/* Form Modal (New & Edit) */}
      <TransactionForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleSaveTransaction}
        categories={categories}
        onAddCategory={addCategory}
        initialData={editingTransaction}
      />
    </div>
  );
};

export default TransactionsScreen;
