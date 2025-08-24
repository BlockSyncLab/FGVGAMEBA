import React, { useEffect } from 'react';
import { useUser } from '../contexts/UserContext';

interface AuthInterceptorProps {
  children: React.ReactNode;
}

const AuthInterceptor: React.FC<AuthInterceptorProps> = ({ children }) => {
  const { user, logout, isCheckingAuth } = useUser();

  useEffect(() => {
    // Interceptar erros de rede para detectar problemas de autenticação
    const handleNetworkError = (event: ErrorEvent) => {
      if (event.error && event.error.message && event.error.message.includes('Sessão expirada')) {
        console.log('Sessão expirada detectada, fazendo logout...');
        logout();
        window.location.href = '/';
      }
    };

    // Interceptar erros de fetch para detectar problemas de autenticação
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args);
        
        // Se for erro 401 (não autorizado), fazer logout
        if (response.status === 401) {
          console.log('Erro 401 detectado, fazendo logout...');
          logout();
          window.location.href = '/';
          return response;
        }
        
        return response;
      } catch (error) {
        throw error;
      }
    };

    // Adicionar listener para erros globais
    window.addEventListener('error', handleNetworkError);

    return () => {
      // Restaurar fetch original
      window.fetch = originalFetch;
      window.removeEventListener('error', handleNetworkError);
    };
  }, []); // Remover dependência para evitar loop infinito

  // Se ainda está verificando autenticação, mostrar loading
  if (isCheckingAuth) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 20px' }}>
        <div style={{ fontSize: 48, marginBottom: 20 }}>🔄</div>
        <h3>Verificando autenticação...</h3>
        <p>Por favor, aguarde...</p>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthInterceptor;
