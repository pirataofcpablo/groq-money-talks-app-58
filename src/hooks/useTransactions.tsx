
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface Transaction {
  id: string;
  type: 'gasto' | 'lucro';
  value: number;
  description: string;
  timestamp: string;
  user_phone: string;
}

export const useTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const loadTransactions = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Definir configuração de usuário para RLS
      await supabase.rpc('set_config', {
        parameter: 'app.current_user_phone',
        value: user.phone
      });
      
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_phone', user.phone)
        .order('timestamp', { ascending: false });
      
      if (error) {
        console.error('Erro ao carregar transações:', error);
        toast.error('Erro ao carregar transações');
        return;
      }
      
      // Garantir que os tipos estão corretos
      const typedTransactions: Transaction[] = (data || []).map(item => ({
        ...item,
        type: item.type as 'gasto' | 'lucro'
      }));
      
      setTransactions(typedTransactions);
    } catch (error) {
      console.error('Erro interno:', error);
      toast.error('Erro interno');
    } finally {
      setLoading(false);
    }
  };

  const addTransaction = async (transaction: Omit<Transaction, 'id' | 'user_phone'>) => {
    if (!user) {
      toast.error('Usuário não autenticado');
      return;
    }

    try {
      // Definir configuração de usuário para RLS
      await supabase.rpc('set_config', {
        parameter: 'app.current_user_phone',
        value: user.phone
      });
      
      const newTransaction = {
        ...transaction,
        user_phone: user.phone
      };

      const { data, error } = await supabase
        .from('transactions')
        .insert([newTransaction])
        .select()
        .single();

      if (error) {
        console.error('Erro ao adicionar transação:', error);
        toast.error('Erro ao salvar transação');
        return;
      }

      // Garantir que o tipo está correto
      const typedTransaction: Transaction = {
        ...data,
        type: data.type as 'gasto' | 'lucro'
      };

      setTransactions(prev => [typedTransaction, ...prev]);
      toast.success('Transação salva com sucesso!');
    } catch (error) {
      console.error('Erro interno:', error);
      toast.error('Erro interno');
    }
  };

  useEffect(() => {
    if (user) {
      loadTransactions();
    } else {
      setTransactions([]);
    }
  }, [user]);

  return {
    transactions,
    addTransaction,
    loading,
    refetch: loadTransactions
  };
};
