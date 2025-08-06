import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface User {
  id?: number;
  login: string;
  nome: string;
  nivel: number;
  xp: number;
  escola: string;
  serie: string;
  turma: string;
  posicaoTurma?: number;
  posicaoSerie?: number;
  posicaoEscola?: number;
  posicaoTurmaGeral?: number;
  posicaoEscolaGeral?: number;
  xp_atual?: number;
  erros?: number;
  id_q1?: number;
  response_q1?: boolean;
  id_q2?: number;
  response_q2?: boolean;
  id_q3?: number;
  response_q3?: boolean;
  id_q4?: number;
  response_q4?: boolean;
  id_q5?: number;
  response_q5?: boolean;
}

interface UserContextType {
  user: User;
  setUser: (user: User) => void;
  updateXP: (newXP: number) => void;
  addXP: (amount: number) => void;
  updateLevel: (newLevel: number) => void;
  updateRanking: (rankingData: Partial<User>) => void;
  refreshUserData: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser deve ser usado dentro de um UserProvider');
  }
  return context;
};

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  // Carregar dados do localStorage se existirem
  const getInitialUser = (): User => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch (error) {
        console.error('Erro ao carregar dados do localStorage:', error);
      }
    }
    
    return {
      login: '',
      nome: '',
      nivel: 1,
      xp: 0,
      escola: '',
      serie: '',
      turma: '',
      // Remover dados de ranking padrão - serão calculados pela API
    };
  };

  const [user, setUser] = useState<User>(getInitialUser);

  // Função para salvar usuário no localStorage
  const saveUserToStorage = (userData: User) => {
    try {
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      console.error('Erro ao salvar dados no localStorage:', error);
    }
  };

  // Wrapper para setUser que também salva no localStorage
  const setUserWithStorage = (userData: User | ((prev: User) => User)) => {
    if (typeof userData === 'function') {
      setUser(prev => {
        const newUser = userData(prev);
        saveUserToStorage(newUser);
        return newUser;
      });
    } else {
      setUser(userData);
      saveUserToStorage(userData);
    }
  };

  const updateXP = (newXP: number) => {
    setUserWithStorage(prev => ({ ...prev, xp: newXP }));
  };

  const addXP = (amount: number) => {
    setUserWithStorage(prev => {
      const newXP = prev.xp + amount;
      const newLevel = Math.floor(newXP / 50) + 1;
      return { 
        ...prev, 
        xp: newXP,
        nivel: newLevel
      };
    });
  };

  const updateLevel = (newLevel: number) => {
    setUserWithStorage(prev => ({ ...prev, nivel: newLevel }));
  };

  const updateRanking = (rankingData: Partial<User>) => {
    setUserWithStorage(prev => ({ ...prev, ...rankingData }));
  };

  // Função para forçar atualização dos dados do usuário
  const refreshUserData = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(getInitialUser());
  };

  const value = {
    user,
    setUser: setUserWithStorage,
    updateXP,
    addXP,
    updateLevel,
    updateRanking,
    refreshUserData
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}; 