
import { useState, useEffect, useCallback } from 'react';
import { TransactionEntry, CategoryItem, DEFAULT_CATEGORIES, TransactionType, GoalEntry } from '../types';

export const useFinanceData = (userId: string | null) => {
  const [transactions, setTransactions] = useState<TransactionEntry[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>(DEFAULT_CATEGORIES);
  const [goals, setGoals] = useState<GoalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Keys now depend on userId to isolate data
  const getStorageKey = (key: string) => userId ? `${key}_${userId}` : null;

  // Load data on mount or when userId changes
  useEffect(() => {
    if (!userId) {
        setTransactions([]);
        setGoals([]);
        setCategories(DEFAULT_CATEGORIES);
        setIsLoading(false);
        return;
    }

    setIsLoading(true);
    const loadData = () => {
      try {
        const txKey = getStorageKey('monetus_br_transactions_v1');
        const catKey = getStorageKey('monetus_br_categories_v1');
        const goalKey = getStorageKey('monetus_br_goals_v1');

        const storedTx = txKey ? localStorage.getItem(txKey) : null;
        const storedCats = catKey ? localStorage.getItem(catKey) : null;
        const storedGoals = goalKey ? localStorage.getItem(goalKey) : null;

        if (storedTx) setTransactions(JSON.parse(storedTx));
        else setTransactions([]); // Reset if no data for this user yet

        if (storedCats) setCategories(JSON.parse(storedCats));
        else setCategories(DEFAULT_CATEGORIES);

        if (storedGoals) setGoals(JSON.parse(storedGoals));
        else setGoals([]);

      } catch (e) {
        console.error("Falha ao carregar dados locais", e);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [userId]);

  // Persist data on change
  useEffect(() => {
    if (!isLoading && userId) {
      const txKey = getStorageKey('monetus_br_transactions_v1');
      const catKey = getStorageKey('monetus_br_categories_v1');
      const goalKey = getStorageKey('monetus_br_goals_v1');
      
      if (txKey) localStorage.setItem(txKey, JSON.stringify(transactions));
      if (catKey) localStorage.setItem(catKey, JSON.stringify(categories));
      if (goalKey) localStorage.setItem(goalKey, JSON.stringify(goals));
    }
  }, [transactions, goals, categories, isLoading, userId]);

  const addTransaction = useCallback((tx: Omit<TransactionEntry, 'id'>) => {
    const newTx: TransactionEntry = {
      ...tx,
      id: crypto.randomUUID(),
    };
    setTransactions(prev => [newTx, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  }, []);

  const updateTransaction = useCallback((updatedTx: TransactionEntry) => {
    setTransactions(prev => 
      prev.map(tx => tx.id === updatedTx.id ? updatedTx : tx)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    );
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    setTransactions(prev => prev.filter(tx => tx.id !== id));
  }, []);

  // Goal Methods
  const addGoal = useCallback((goal: Omit<GoalEntry, 'id'>) => {
    const newGoal: GoalEntry = {
      ...goal,
      id: crypto.randomUUID(),
    };
    setGoals(prev => [...prev, newGoal]);
  }, []);

  const deleteGoal = useCallback((id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
  }, []);

  // Category Methods
  const addCategory = useCallback((category: Omit<CategoryItem, 'id'>) => {
    const newCat: CategoryItem = {
        ...category,
        id: crypto.randomUUID()
    };
    setCategories(prev => [...prev, newCat]);
    return newCat.id;
  }, []);

  const getBalance = useCallback(() => {
    return transactions.reduce((acc, tx) => {
      return tx.type === TransactionType.INCOME ? acc + tx.amount : acc - tx.amount;
    }, 0);
  }, [transactions]);

  const getSummary = useCallback(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const monthlyTx = transactions.filter(tx => new Date(tx.date) >= startOfMonth);

    const income = monthlyTx
      .filter(tx => tx.type === TransactionType.INCOME)
      .reduce((sum, tx) => sum + tx.amount, 0);
    const expense = monthlyTx
      .filter(tx => tx.type === TransactionType.EXPENSE)
      .reduce((sum, tx) => sum + tx.amount, 0);

    return { income, expense, balance: income - expense };
  }, [transactions]);

  // --- SYNC METHODS ---
  const getSyncData = useCallback(() => {
    return {
      transactions,
      categories,
      goals
    };
  }, [transactions, categories, goals]);

  const mergeSyncData = useCallback((remoteData: any) => {
      if (!remoteData || !remoteData.transactions || !remoteData.categories) {
          console.error("Dados de sincronização inválidos recebidos.");
          return false;
      }

      // Helper to merge lists by ID (preferring existing if conflict, or could prefer remote. 
      // For simple sync, union by ID is usually enough if we assume no concurrent edits of SAME item)
      const mergeLists = <T extends { id: string }>(local: T[], remote: T[]) => {
          const map = new Map(local.map(i => [i.id, i]));
          // We might want remote to overwrite local if we assume 'sync' means 'get latest', 
          // but without timestamps, let's just ensure we have ALL items from both.
          // If we want remote to win conflicts:
          remote.forEach(i => map.set(i.id, i));
          return Array.from(map.values());
      };

      setCategories(prev => mergeLists<CategoryItem>(prev, remoteData.categories));
      setGoals(prev => mergeLists<GoalEntry>(prev, remoteData.goals || []));
      setTransactions(prev => {
          const merged = mergeLists<TransactionEntry>(prev, remoteData.transactions);
          return merged.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      });
      
      return true;
  }, []);

  return {
    transactions,
    categories,
    goals,
    isLoading,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addGoal,
    deleteGoal,
    addCategory,
    getBalance,
    getSummary,
    getSyncData,
    mergeSyncData
  };
};
