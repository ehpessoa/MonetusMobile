
import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Mail, Lock, User as UserIcon, ArrowRight, Loader2, HelpCircle, KeyRound, AlertCircle, CheckCircle2, Activity } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

type AuthMode = 'login' | 'register' | 'reset';

interface Props {
    auth: ReturnType<typeof useAuth>;
}

const AuthScreen: React.FC<Props> = ({ auth }) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Load remembered credentials on mount if in login mode
  useEffect(() => {
      if (mode === 'login') {
          const creds = auth.getRememberedCredentials();
          if (creds) {
              setEmail(creds.email);
              setPassword(creds.password);
              setRememberMe(true);
          }
      }
  }, [mode]);

  const clearForm = () => {
      setName('');
      setEmail('');
      setPassword('');
      setSecurityAnswer('');
      setError(null);
      setSuccessMsg(null);
  }

  const switchMode = (newMode: AuthMode) => {
      clearForm();
      setMode(newMode);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (mode === 'login') {
        const result = await auth.login(email, password, rememberMe);
        if (!result.success && result.error) {
            setError(result.error);
        }
    } else if (mode === 'register') {
        if (!name || !email || !password || !securityAnswer) {
            setError("Todos os campos são obrigatórios.");
            return;
        }
        // Hardcoded security question for simplicity as per prompt requirement
        const result = await auth.register({ 
            name, 
            email, 
            password, 
            securityQuestion: 'Qual o nome do seu primeiro animal de estimação?',
            securityAnswer 
        });
        if (!result.success && result.error) {
            setError(result.error);
        }
    } else if (mode === 'reset') {
        if (!email || !securityAnswer || !password) {
             setError("Preencha todos os campos para redefinir.");
             return;
        }
        const result = await auth.resetPassword(email, securityAnswer, password);
        if (result.success) {
            setSuccessMsg("Senha redefinida com sucesso! Faça login.");
            setTimeout(() => switchMode('login'), 2000);
        } else if (result.error) {
            setError(result.error);
        }
    }
  };

  const isLoading = auth.isLoading;

  return (
    <div className="min-h-full w-full flex items-center justify-center bg-emerald-900 p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-8 pt-8 pb-6 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-2xl mb-4 text-emerald-600">
            <KeyRound size={32} strokeWidth={2.5} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Monetus Mobile</h1>
          <p className="text-gray-500 mt-2">
            {mode === 'login' && 'Bem-vindo de volta!'}
            {mode === 'register' && 'Crie sua conta para começar.'}
            {mode === 'reset' && 'Recupere seu acesso.'}
          </p>
        </div>

        {/* Messages */}
        <div className="px-8">
             {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-red-700 text-sm animate-in fade-in slide-in-from-top-2">
                    <AlertCircle size={18} className="shrink-0 mt-0.5" />
                    <p>{error}</p>
                </div>
             )}
             {successMsg && (
                 <div className="mb-4 p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start gap-3 text-emerald-700 text-sm animate-in fade-in slide-in-from-top-2">
                     <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
                     <p>{successMsg}</p>
                 </div>
             )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-4">
          
          {/* Name Field (Register only) */}
          {mode === 'register' && (
            <div className="relative">
              <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Seu Nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all text-gray-900"
                required={mode === 'register'}
              />
            </div>
          )}

          {/* Email Field (All modes) */}
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="email"
              placeholder="Seu Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all text-gray-900"
              required
            />
          </div>

          {/* Security Question (Register & Reset) */}
          {(mode === 'register' || mode === 'reset') && (
              <div className="space-y-2">
                  {mode === 'register' && (
                      <label className="block text-sm font-medium text-gray-700 ml-1">
                          Pergunta de Segurança: <span className="text-gray-500 font-normal">Qual o nome do seu primeiro pet?</span>
                      </label>
                  )}
                  {mode === 'reset' && (
                       <label className="block text-sm font-medium text-gray-700 ml-1">
                           Responda: <span className="text-gray-500 font-normal">Qual o nome do seu primeiro pet?</span>
                       </label>
                  )}
                  <div className="relative">
                      <HelpCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                      <input
                          type="text"
                          placeholder="Sua resposta"
                          value={securityAnswer}
                          onChange={(e) => setSecurityAnswer(e.target.value)}
                          className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all text-gray-900"
                          required
                      />
                  </div>
              </div>
          )}

          {/* Password Field (All modes, new password for reset) */}
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type={showPassword ? "text" : "password"}
              placeholder={mode === 'reset' ? "Nova Senha" : "Senha"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all text-gray-900"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/* Options (Login only) */}
          {mode === 'login' && (
            <div className="flex items-center justify-between text-sm pt-2">
              <label className="flex items-center gap-2 cursor-pointer text-gray-600 hover:text-gray-900">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                />
                Lembrar de mim
              </label>
              <button type="button" onClick={() => switchMode('reset')} className="text-emerald-600 font-semibold hover:text-emerald-700">
                Esqueceu a senha?
              </button>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-lg active:scale-[0.98] transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 mt-6 disabled:opacity-70"
          >
            {isLoading ? (
                <Loader2 className="animate-spin" size={24} />
            ) : (
                <>
                    {mode === 'login' ? 'Entrar' : mode === 'register' ? 'Criar Conta' : 'Redefinir Senha'}
                    {mode === 'login' && <ArrowRight size={20} />}
                </>
            )}
          </button>
        </form>

        {/* Footer / Switch Modes */}
        <div className="px-8 py-6 bg-gray-50 border-t border-gray-100 text-center space-y-4">
           {mode === 'login' ? (
               <p className="text-gray-600">
                   Não tem uma conta?{' '}
                   <button onClick={() => switchMode('register')} className="text-emerald-600 font-bold hover:underline">
                       Cadastre-se
                   </button>
               </p>
           ) : (
               <p className="text-gray-600">
                   Já tem uma conta?{' '}
                   <button onClick={() => switchMode('login')} className="text-emerald-600 font-bold hover:underline">
                       Fazer Login
                   </button>
               </p>
           )}

           {mode === 'login' && (
               <div className="pt-2 border-t border-gray-200/50">
                    <button 
                        type="button"
                        onClick={auth.loginAsDemo}
                        disabled={isLoading}
                        className="text-sm font-medium text-gray-500 hover:text-emerald-600 transition-colors flex items-center justify-center gap-1 mx-auto"
                    >
                        Ou experimente o <span className="underline">Modo Demo</span>
                    </button>
               </div>
           )}

           {/* Powered By SenszIA */}
           <div className="mt-6 pt-6 border-t border-gray-200/50 flex flex-col items-center justify-center gap-2 opacity-90 hover:opacity-100 transition-opacity">
              <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400">
                  Powered by
              </span>
              <div className="flex items-center justify-center select-none scale-90 sm:scale-100">
                  {/* Recriação do Logo SenszIA para garantir exibição perfeita sem depender de arquivo externo */}
                  <Activity size={26} className="text-[#005BAC] mr-1" strokeWidth={2.5} style={{ filter: 'drop-shadow(0 0 6px rgba(0,91,172,0.2))' }} />
                  <span className="text-2xl text-gray-500 tracking-tight" style={{ fontFamily: 'sans-serif', fontWeight: 400 }}>Sensz</span>
                  <span className="text-2xl text-[#0f172a]" style={{ fontFamily: 'sans-serif', fontWeight: 700 }}>IA</span>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
};

export default AuthScreen;
