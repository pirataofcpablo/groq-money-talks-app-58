import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface User {
  phone: string;
}

interface AuthContextType {
  user: User | null;
  signUp: (phone: string, password: string) => Promise<boolean>;
  signIn: (phone: string, password: string) => Promise<boolean>;
  signOut: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar se existe sessão armazenada
    const storedUser = localStorage.getItem('financial-user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const signUp = async (phone: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      // Verificar se o usuário já existe
      const { data: existingUser } = await supabase
        .from('users')
        .select('phone')
        .eq('phone', phone)
        .maybeSingle();
      
      if (existingUser) {
        toast.error('Este número já está cadastrado');
        return false;
      }
      
      // Hash da senha (versão simples - em produção use bcrypt)
      const passwordHash = btoa(password);
      
      const { error } = await supabase
        .from('users')
        .insert([{ phone, password_hash: passwordHash }]);
      
      if (error) {
        console.error('Erro ao criar conta:', error);
        toast.error('Erro ao criar conta');
        return false;
      }
      
      toast.success('Conta criada com sucesso!');
      return true;
    } catch (error) {
      console.error('Erro interno:', error);
      toast.error('Erro interno');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (phone: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      const passwordHash = btoa(password);
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('phone', phone)
        .eq('password_hash', passwordHash)
        .maybeSingle();
      
      if (error || !data) {
        toast.error('Telefone ou senha incorretos');
        return false;
      }
      
      const userData = { phone };
      setUser(userData);
      localStorage.setItem('financial-user', JSON.stringify(userData));
      
      toast.success('Login realizado com sucesso!');
      return true;
    } catch (error) {
      console.error('Erro interno:', error);
      toast.error('Erro interno');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem('financial-user');
    localStorage.removeItem('financial-transactions');
    toast.success('Logout realizado com sucesso!');
  };

  return (
    <AuthContext.Provider value={{ user, signUp, signIn, signOut, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
