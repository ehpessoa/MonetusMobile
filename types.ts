
export enum TransactionType {
  INCOME = 'receita',
  EXPENSE = 'despesa',
}

export interface CategoryItem {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: TransactionType;
}

export interface TransactionEntry {
  id: string;
  description: string;
  merchant?: string;
  amount: number;
  date: string; // ISO string
  type: TransactionType;
  categoryId: string;
  receiptUrl?: string;
  isGeminiParsed?: boolean;
}

export interface GoalEntry {
  id: string;
  targetAmount: number;
  categoryId: string;
  deadline?: string; // ISO string date
}

export interface BudgetItem {
  categoryId: string;
  limit: number;
  spent: number;
  period: 'monthly' | 'weekly';
}

export enum AppTab {
  DASHBOARD = 'dashboard',
  TRANSACTIONS = 'transactions',
  GOALS = 'goals',
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // Opcional na interface para não trafegar sempre, mas salvo no storage local simulado
  securityQuestion?: string;
  securityAnswer?: string;
  isDemo?: boolean;
}

// Dados Iniciais (Seed) em Português - Lista Atualizada
export const DEFAULT_CATEGORIES: CategoryItem[] = [
  // --- RECEITAS ---
  { id: 'inc-1', name: 'Abono', icon: 'Banknote', color: 'bg-emerald-100 text-emerald-700', type: TransactionType.INCOME },
  { id: 'inc-2', name: 'Adicional Salarial', icon: 'PlusCircle', color: 'bg-emerald-100 text-emerald-700', type: TransactionType.INCOME },
  { id: 'inc-3', name: 'Aluguel de Imóvel', icon: 'Key', color: 'bg-teal-100 text-teal-700', type: TransactionType.INCOME },
  { id: 'inc-4', name: 'Aposentadoria', icon: 'Armchair', color: 'bg-blue-100 text-blue-700', type: TransactionType.INCOME },
  { id: 'inc-5', name: 'Auxílio', icon: 'HelpingHand', color: 'bg-green-100 text-green-700', type: TransactionType.INCOME },
  { id: 'inc-6', name: 'Bônus', icon: 'Gift', color: 'bg-lime-100 text-lime-700', type: TransactionType.INCOME },
  { id: 'inc-7', name: 'Cashback', icon: 'RefreshCcw', color: 'bg-green-100 text-green-700', type: TransactionType.INCOME },
  { id: 'inc-8', name: 'Comissões', icon: 'Percent', color: 'bg-emerald-100 text-emerald-700', type: TransactionType.INCOME },
  { id: 'inc-9', name: 'Décimo Terceiro', icon: 'CalendarPlus', color: 'bg-emerald-100 text-emerald-700', type: TransactionType.INCOME },
  { id: 'inc-10', name: 'Férias', icon: 'Palmtree', color: 'bg-cyan-100 text-cyan-700', type: TransactionType.INCOME },
  { id: 'inc-11', name: 'Horas Extras', icon: 'Clock', color: 'bg-green-100 text-green-700', type: TransactionType.INCOME },
  { id: 'inc-12', name: 'Part. Lucros', icon: 'TrendingUp', color: 'bg-emerald-100 text-emerald-700', type: TransactionType.INCOME },
  { id: 'inc-13', name: 'Salário Base', icon: 'Wallet', color: 'bg-green-100 text-green-700', type: TransactionType.INCOME },
  { id: 'inc-14', name: 'Vale-Transporte', icon: 'Ticket', color: 'bg-teal-100 text-teal-700', type: TransactionType.INCOME },
  { id: 'inc-15', name: 'Outros Recebimentos', icon: 'Plus', color: 'bg-gray-100 text-gray-700', type: TransactionType.INCOME },

  // --- DESPESAS ---
  { id: 'exp-1', name: 'Academia', icon: 'Dumbbell', color: 'bg-orange-100 text-orange-700', type: TransactionType.EXPENSE },
  { id: 'exp-2', name: 'Aluguel', icon: 'Home', color: 'bg-blue-100 text-blue-700', type: TransactionType.EXPENSE },
  { id: 'exp-3', name: 'Água', icon: 'Droplet', color: 'bg-cyan-100 text-cyan-700', type: TransactionType.EXPENSE },
  { id: 'exp-4', name: 'Assinaturas Software', icon: 'Code', color: 'bg-purple-100 text-purple-700', type: TransactionType.EXPENSE },
  { id: 'exp-5', name: 'Beleza/Cuidados', icon: 'Scissors', color: 'bg-pink-100 text-pink-700', type: TransactionType.EXPENSE },
  { id: 'exp-6', name: 'Boletos', icon: 'FileText', color: 'bg-gray-100 text-gray-700', type: TransactionType.EXPENSE },
  { id: 'exp-7', name: 'Cartão de Crédito', icon: 'CreditCard', color: 'bg-red-100 text-red-700', type: TransactionType.EXPENSE },
  { id: 'exp-8', name: 'Celular', icon: 'Smartphone', color: 'bg-blue-100 text-blue-700', type: TransactionType.EXPENSE },
  { id: 'exp-9', name: 'Cinema', icon: 'Film', color: 'bg-indigo-100 text-indigo-700', type: TransactionType.EXPENSE },
  { id: 'exp-10', name: 'Condomínio', icon: 'Building', color: 'bg-blue-100 text-blue-700', type: TransactionType.EXPENSE },
  { id: 'exp-11', name: 'Conta de Luz', icon: 'Zap', color: 'bg-yellow-100 text-yellow-700', type: TransactionType.EXPENSE },
  { id: 'exp-12', name: 'Educação', icon: 'GraduationCap', color: 'bg-indigo-100 text-indigo-700', type: TransactionType.EXPENSE },
  { id: 'exp-13', name: 'Farmácia', icon: 'Pill', color: 'bg-red-100 text-red-700', type: TransactionType.EXPENSE },
  { id: 'exp-14', name: 'Mercado', icon: 'ShoppingCart', color: 'bg-orange-100 text-orange-700', type: TransactionType.EXPENSE },
  { id: 'exp-15', name: 'Financiamento', icon: 'Bank', color: 'bg-gray-100 text-gray-700', type: TransactionType.EXPENSE },
  { id: 'exp-16', name: 'Gás', icon: 'Flame', color: 'bg-orange-100 text-orange-700', type: TransactionType.EXPENSE },
  { id: 'exp-17', name: 'Combustível', icon: 'Fuel', color: 'bg-red-100 text-red-700', type: TransactionType.EXPENSE },
  { id: 'exp-18', name: 'Impostos', icon: 'Landmark', color: 'bg-red-100 text-red-700', type: TransactionType.EXPENSE },
  { id: 'exp-19', name: 'Internet/TV', icon: 'Wifi', color: 'bg-cyan-100 text-cyan-700', type: TransactionType.EXPENSE },
  { id: 'exp-20', name: 'Lazer Geral', icon: 'PartyPopper', color: 'bg-pink-100 text-pink-700', type: TransactionType.EXPENSE },
  { id: 'exp-21', name: 'Manutenção Veículo', icon: 'Wrench', color: 'bg-gray-100 text-gray-700', type: TransactionType.EXPENSE },
  { id: 'exp-22', name: 'Saúde', icon: 'HeartPulse', color: 'bg-red-100 text-red-700', type: TransactionType.EXPENSE },
  { id: 'exp-23', name: 'Restaurantes', icon: 'Utensils', color: 'bg-orange-100 text-orange-700', type: TransactionType.EXPENSE },
  { id: 'exp-24', name: 'Seguros', icon: 'Shield', color: 'bg-blue-100 text-blue-700', type: TransactionType.EXPENSE },
  { id: 'exp-25', name: 'Streaming', icon: 'Tv', color: 'bg-purple-100 text-purple-700', type: TransactionType.EXPENSE },
  { id: 'exp-26', name: 'Transporte', icon: 'Car', color: 'bg-blue-100 text-blue-700', type: TransactionType.EXPENSE },
  { id: 'exp-27', name: 'Outras Despesas', icon: 'Tag', color: 'bg-gray-100 text-gray-600', type: TransactionType.EXPENSE },
];
