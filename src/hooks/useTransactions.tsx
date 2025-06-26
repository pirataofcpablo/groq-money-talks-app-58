
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
      console.log('Carregando transações para o usuário:', user.phone);
      
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
      
      console.log('Transações carregadas:', data);
      
      // Garantir que os tipos estão corretos e filtrar por usuário
      const typedTransactions: Transaction[] = (data || [])
        .filter(item => item.user_phone === user.phone)
        .map(item => ({
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
      console.error('Tentativa de adicionar transação sem usuário autenticado');
      toast.error('Usuário não autenticado');
      return;
    }

    try {
      console.log('Adicionando transação:', transaction);
      console.log('Usuário atual:', user.phone);

      const newTransaction = {
        type: transaction.type,
        value: Number(transaction.value),
        description: transaction.description,
        timestamp: transaction.timestamp,
        user_phone: user.phone
      };

      console.log('Dados para inserir no Supabase:', newTransaction);

      const { data, error } = await supabase
        .from('transactions')
        .insert([newTransaction])
        .select()
        .single();

      if (error) {
        console.error('Erro do Supabase ao adicionar transação:', error);
        toast.error('Erro ao salvar transação: ' + error.message);
        return;
      }

      console.log('Transação salva com sucesso no Supabase:', data);

      // Garantir que o tipo está correto e que pertence ao usuário atual
      if (data && data.user_phone === user.phone) {
        const typedTransaction: Transaction = {
          ...data,
          type: data.type as 'gasto' | 'lucro'
        };

        setTransactions(prev => [typedTransaction, ...prev]);
        toast.success('Transação salva com sucesso!');
      } else {
        console.error('Dados retornados inválidos:', data);
        toast.error('Erro: dados inválidos retornados');
      }
    } catch (error) {
      console.error('Erro interno ao adicionar transação:', error);
      toast.error('Erro interno: ' + (error as Error).message);
    }
  };

  useEffect(() => {
    if (user) {
      console.log('Usuário autenticado, carregando transações...');
      loadTransactions();
    } else {
      console.log('Usuário não autenticado, limpando transações');
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
