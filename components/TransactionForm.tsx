
import React, { useState, useRef, useEffect } from 'react';
import { X, Camera, Loader2, ArrowLeft, Check, Tag } from 'lucide-react';
import { CategoryItem, TransactionType, TransactionEntry } from '../types';
import { scanReceiptWithGemini } from '../services/geminiService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (tx: TransactionEntry | Omit<TransactionEntry, 'id'>) => void;
  categories: CategoryItem[];
  onAddCategory: (category: Omit<CategoryItem, 'id'>) => string;
  initialData?: TransactionEntry | null;
}

const NEW_CATEGORY_ID = 'NEW_CATEGORY_OPTION';

const COLOR_PALETTE = [
    { name: 'blue', bg: 'bg-blue-500', val: 'bg-blue-100 text-blue-700' },
    { name: 'purple', bg: 'bg-purple-500', val: 'bg-purple-100 text-purple-700' },
    { name: 'pink', bg: 'bg-pink-500', val: 'bg-pink-100 text-pink-700' },
    { name: 'orange', bg: 'bg-orange-500', val: 'bg-orange-100 text-orange-700' },
    { name: 'cyan', bg: 'bg-cyan-500', val: 'bg-cyan-100 text-cyan-700' },
    { name: 'indigo', bg: 'bg-indigo-500', val: 'bg-indigo-100 text-indigo-700' },
    { name: 'gray', bg: 'bg-gray-500', val: 'bg-gray-100 text-gray-700' },
];

const TransactionForm: React.FC<Props> = ({ isOpen, onClose, onSubmit, categories, onAddCategory, initialData }) => {
  // Transaction Form State
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [merchant, setMerchant] = useState('');
  const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // New Category Form State
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState(COLOR_PALETTE[0].val);

  // Effect to load initial data when editing
  useEffect(() => {
    if (isOpen && initialData) {
      setAmount(initialData.amount.toString().replace('.', ','));
      setDescription(initialData.description);
      setMerchant(initialData.merchant || '');
      setType(initialData.type);
      setCategoryId(initialData.categoryId);
      setDate(initialData.date.split('T')[0]);
      setIsCreatingCategory(false);
    } else if (isOpen && !initialData) {
      resetForm();
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const resetForm = () => {
    setAmount('');
    setDescription('');
    setMerchant('');
    setType(TransactionType.EXPENSE);
    setCategoryId('');
    setDate(new Date().toISOString().split('T')[0]);
    setScanError(null);
    setIsCreatingCategory(false);
    resetNewCatForm();
  };

  const resetNewCatForm = () => {
      setNewCatName('');
      setNewCatColor(COLOR_PALETTE[0].val);
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !categoryId) return;

    const txData = {
      amount: parseFloat(amount.replace(',', '.')),
      description,
      merchant,
      type,
      categoryId,
      date,
      isGeminiParsed: initialData ? initialData.isGeminiParsed : isScanning
    };

    if (initialData) {
        onSubmit({ ...txData, id: initialData.id });
    } else {
        onSubmit(txData);
    }
    
    resetForm();
    onClose();
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const value = e.target.value;
      if (value === NEW_CATEGORY_ID) {
          setIsCreatingCategory(true);
          // Set a default color based on current type
          setNewCatColor(type === TransactionType.EXPENSE ? 'bg-orange-100 text-orange-700' : 'bg-emerald-100 text-emerald-700');
      } else {
          setCategoryId(value);
      }
  }

  const handleSaveNewCategory = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newCatName) return;

      const newId = onAddCategory({
          name: newCatName,
          icon: 'Tag', // Default icon for custom categories
          color: newCatColor,
          type: type // Matches the current transaction type being created
      });

      setCategoryId(newId); // Auto-select the new category
      setIsCreatingCategory(false);
      resetNewCatForm();
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    setScanError(null);

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = (reader.result as string).split(',')[1];
        try {
          const result = await scanReceiptWithGemini(base64String);

          if (result.total) setAmount(result.total.toString().replace('.', ','));
          if (result.date) setDate(result.date);
          if (result.merchant) setMerchant(result.merchant);

          let catMatch: CategoryItem | undefined;

          if (result.categorySuggestion) {
             // Flexible matching for PT-BR categories
             const normalizedSuggestion = result.categorySuggestion.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
             catMatch = categories.find(c =>
               c.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(normalizedSuggestion)
             );
          }

          if (catMatch) {
            setCategoryId(catMatch.id);
            setDescription(catMatch.name);
          } else {
            const outrosCat = categories.find(c => c.name === 'Outros Despesas') || categories.find(c => c.name === 'Outros');
            if (outrosCat) {
               setCategoryId(outrosCat.id);
               setDescription(outrosCat.name);
            } else {
               setDescription('Outros');
            }
          }

          if (result.description) {
              setDescription(result.description);
          }

          setType(TransactionType.EXPENSE);

        } catch (err) {
          setScanError("Não foi possível ler o recibo. Tente manualmente.");
        } finally {
          setIsScanning(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      setIsScanning(false);
      setScanError("Erro ao processar imagem.");
    }
  };

  const isEditing = !!initialData;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity">
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* -- VIEW: CREATE NEW CATEGORY -- */}
        {isCreatingCategory ? (
             <div className="flex flex-col h-full">
                 <div className="flex items-center px-6 py-4 border-b border-gray-100 shrink-0">
                   <button onClick={() => setIsCreatingCategory(false)} className="p-2 -ml-2 text-gray-400 hover:text-gray-900 rounded-full">
                     <ArrowLeft size={24} />
                   </button>
                   <h2 className="text-xl font-bold text-gray-900 ml-2">Nova Categoria</h2>
                 </div>
                 
                 <form onSubmit={handleSaveNewCategory} className="flex-1 flex flex-col min-h-0">
                      <div className="flex-1 overflow-y-auto p-6 space-y-6">
                          <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">Nome da Categoria *</label>
                              <input
                                  type="text"
                                  value={newCatName}
                                  onChange={(e) => setNewCatName(e.target.value)}
                                  placeholder="Ex: Investimentos, Hobbies..."
                                  className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:border-secondary outline-none text-base text-gray-900 placeholder-gray-300"
                                  required
                                  autoFocus
                              />
                          </div>

                          <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-3">Cor</label>
                              <div className="flex flex-wrap gap-3">
                                  {COLOR_PALETTE.map((color) => (
                                      <button
                                          key={color.name}
                                          type="button"
                                          onClick={() => setNewCatColor(color.val)}
                                          className={`w-10 h-10 rounded-full ${color.bg} flex items-center justify-center transition-transform ${newCatColor === color.val ? 'scale-110 ring-2 ring-offset-2 ring-gray-300' : 'opacity-70 hover:opacity-100'}`}
                                      >
                                          {newCatColor === color.val && <Check size={16} className="text-white" strokeWidth={3} />}
                                      </button>
                                  ))}
                              </div>
                          </div>

                           <div className="p-4 bg-gray-50 rounded-2xl flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${newCatColor}`}>
                                  <Tag size={20} />
                              </div>
                              <div>
                                  <p className="text-sm font-semibold text-gray-900">{newCatName || 'Nome da Categoria'}</p>
                                  <p className="text-xs text-gray-500 capitalize">{type === TransactionType.EXPENSE ? 'Despesa' : 'Receita'}</p>
                              </div>
                          </div>
                      </div>

                      <div className="p-6 pt-4 border-t border-gray-100 bg-white shrink-0">
                          <button
                              type="submit"
                              className="w-full py-3.5 bg-primary text-white rounded-2xl font-bold text-lg active:scale-[0.98] transition-transform"
                          >
                              Criar Categoria
                          </button>
                      </div>
                 </form>
             </div>
        ) : (
        /* -- VIEW: TRANSACTION FORM (DEFAULT) -- */
        <>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
              <h2 className="text-xl font-bold text-gray-900">{isEditing ? 'Editar Transação' : 'Nova Transação'}</h2>
              <button onClick={onClose} className="p-2 -mr-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
                <X size={24} />
              </button>
            </div>

            {/* Scanning Area */}
            {!isEditing && (
              <div className="px-6 py-4 bg-blue-50/50 border-b border-blue-100/50 shrink-0">
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isScanning}
                  className="w-full flex items-center justify-center gap-3 py-3 bg-white border-2 border-blue-100 text-blue-600 rounded-2xl font-semibold text-sm active:bg-blue-50 transition-all shadow-sm"
                >
                   {isScanning ? <Loader2 className="animate-spin" size={20} /> : <Camera size={20} />}
                   {isScanning ? "Analisando Recibo..." : "Escanear Recibo com IA"}
                </button>
                {scanError && <p className="text-xs text-red-500 mt-2 text-center font-medium">{scanError}</p>}
              </div>
            )}

            {/* Main Form - Wrapped in flex-col with fixed footer */}
            <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                  <div className="flex bg-gray-100 p-1.5 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setType(TransactionType.EXPENSE)}
                      className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${type === TransactionType.EXPENSE ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}
                    >
                      Despesa
                    </button>
                    <button
                      type="button"
                      onClick={() => setType(TransactionType.INCOME)}
                      className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${type === TransactionType.INCOME ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}
                    >
                      Receita
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Valor *</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium text-lg">R$</span>
                      <input
                        type="text"
                        inputMode="decimal"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0,00"
                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:border-secondary focus:ring-4 focus:ring-secondary/10 outline-none text-2xl font-bold text-gray-900 placeholder-gray-300"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Categoria *</label>
                    <select
                      value={categoryId}
                      onChange={handleCategoryChange}
                      className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:border-secondary outline-none appearance-none text-gray-900 text-base"
                      required
                    >
                      <option value="" disabled>Selecione a categoria</option>
                      {categories.filter(c => c.type === type).map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                      <option disabled>──────────</option>
                      <option value={NEW_CATEGORY_ID} className="font-bold text-secondary">+ Nova Categoria...</option>
                    </select>
                  </div>

                   <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Data *</label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:border-secondary outline-none text-base text-gray-900"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Descrição (Opcional)</label>
                    <input
                      type="text"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Ex: Almoço de domingo"
                      className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:border-secondary outline-none text-base text-gray-900 placeholder-gray-300 transition-all"
                    />
                  </div>

                  {type === TransactionType.EXPENSE && (
                     <div>
                       <label className="block text-sm font-semibold text-gray-700 mb-2">Estabelecimento (Opcional)</label>
                       <input
                         type="text"
                         value={merchant}
                         onChange={(e) => setMerchant(e.target.value)}
                         placeholder="Ex: Restaurante Saboroso"
                         className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:border-secondary outline-none text-base text-gray-900 placeholder-gray-300 transition-all"
                       />
                     </div>
                  )}
              </div>

              {/* Sticky Footer */}
              <div className="p-6 pt-4 border-t border-gray-100 bg-white shrink-0">
                  <button
                    type="submit"
                    className="w-full py-3.5 bg-primary text-white rounded-2xl font-bold text-lg active:scale-[0.98] transition-transform shadow-lg shadow-primary/20"
                  >
                    {isEditing ? 'Salvar Alterações' : 'Salvar Lançamento'}
                  </button>
              </div>
            </form>
        </>
        )}
      </div>
    </div>
  );
};

export default TransactionForm;
