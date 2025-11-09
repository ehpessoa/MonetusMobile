
import { useState, useEffect, useCallback } from 'react';
import { User } from '../types';

const STORAGE_KEY_USERS = 'monetus_users_db_v1';
const STORAGE_KEY_SESSION = 'monetus_session_v1';
const STORAGE_KEY_REMEMBER = 'monetus_remember_v1';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load session on mount
  useEffect(() => {
    const loadSession = () => {
      try {
        const sessionUserId = localStorage.getItem(STORAGE_KEY_SESSION);
        if (sessionUserId) {
          const usersStr = localStorage.getItem(STORAGE_KEY_USERS);
          const users: User[] = usersStr ? JSON.parse(usersStr) : [];
          const foundUser = users.find(u => u.id === sessionUserId);
          if (foundUser) {
            setUser(foundUser);
          } else {
             // Session invalid
             localStorage.removeItem(STORAGE_KEY_SESSION);
          }
        }
      } catch (e) {
        console.error("Failed to load auth session", e);
      } finally {
        setIsLoading(false);
      }
    };
    // Simulate a tiny network delay for smoother UX on first load if wanted, but instant is fine too.
    loadSession();
  }, []);

  const login = async (email: string, password?: string, rememberMe: boolean = false): Promise<{ success: boolean, error?: string }> => {
    setIsLoading(true);
    // Simulate network request
    await new Promise(resolve => setTimeout(resolve, 800));

    try {
      const usersStr = localStorage.getItem(STORAGE_KEY_USERS);
      const users: User[] = usersStr ? JSON.parse(usersStr) : [];
      const foundUser = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);

      if (foundUser) {
        setUser(foundUser);
        localStorage.setItem(STORAGE_KEY_SESSION, foundUser.id);
        if (rememberMe && password) {
             // Simple base64 encoding for "Remember Me" as requested (NOT SECURE for production, good for MVP/Demo)
             localStorage.setItem(STORAGE_KEY_REMEMBER, btoa(`${email}:${password}`));
        } else {
             localStorage.removeItem(STORAGE_KEY_REMEMBER);
        }
        setIsLoading(false);
        return { success: true };
      } else {
        setIsLoading(false);
        return { success: false, error: 'Email ou senha incorretos.' };
      }
    } catch (e) {
      setIsLoading(false);
      return { success: false, error: 'Erro ao processar login.' };
    }
  };

  const register = async (userData: Omit<User, 'id' | 'isDemo'>): Promise<{ success: boolean, error?: string }> => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
      const usersStr = localStorage.getItem(STORAGE_KEY_USERS);
      const users: User[] = usersStr ? JSON.parse(usersStr) : [];

      if (users.some(u => u.email.toLowerCase() === userData.email.toLowerCase())) {
        setIsLoading(false);
        return { success: false, error: 'Este email já está cadastrado.' };
      }

      const newUser: User = {
        ...userData,
        id: crypto.randomUUID(),
        isDemo: false
      };

      users.push(newUser);
      localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
      
      // Auto-login after register
      setUser(newUser);
      localStorage.setItem(STORAGE_KEY_SESSION, newUser.id);

      setIsLoading(false);
      return { success: true };
    } catch (e) {
      setIsLoading(false);
      return { success: false, error: 'Erro ao registrar usuário.' };
    }
  };

  const resetPassword = async (email: string, securityAnswer: string, newPassword: string): Promise<{ success: boolean, error?: string }> => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1200));

      try {
          const usersStr = localStorage.getItem(STORAGE_KEY_USERS);
          const users: User[] = usersStr ? JSON.parse(usersStr) : [];
          const userIndex = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());

          if (userIndex === -1) {
              setIsLoading(false);
              return { success: false, error: 'Usuário não encontrado.' };
          }

          const userToReset = users[userIndex];
          if (!userToReset.securityAnswer || userToReset.securityAnswer.toLowerCase() !== securityAnswer.toLowerCase()) {
              setIsLoading(false);
              return { success: false, error: 'Resposta de segurança incorreta.' };
          }

          // Update password
          users[userIndex] = { ...userToReset, password: newPassword };
          localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));

          setIsLoading(false);
          return { success: true };
      } catch (e) {
          setIsLoading(false);
          return { success: false, error: 'Erro ao redefinir senha.' };
      }
  }

  const loginAsDemo = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 600));

    const demoUser: User = {
      id: 'demo-user-v1',
      name: 'Visitante Demo',
      email: 'demo@monetus.app',
      isDemo: true
    };
    
    setUser(demoUser);
    localStorage.setItem(STORAGE_KEY_SESSION, demoUser.id);
    setIsLoading(false);
  };

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY_SESSION);
    // Optional: decide if we want to clear "remember me" on explicit logout. Usually yes.
    // localStorage.removeItem(STORAGE_KEY_REMEMBER); 
  }, []);

  const getRememberedCredentials = () => {
      try {
          const remembered = localStorage.getItem(STORAGE_KEY_REMEMBER);
          if (remembered) {
              const decoded = atob(remembered);
              const [email, password] = decoded.split(':');
              if (email && password) return { email, password };
          }
      } catch (e) {
          return null;
      }
      return null;
  };

  return {
    user,
    isLoading,
    login,
    register,
    resetPassword,
    loginAsDemo,
    logout,
    getRememberedCredentials
  };
};
