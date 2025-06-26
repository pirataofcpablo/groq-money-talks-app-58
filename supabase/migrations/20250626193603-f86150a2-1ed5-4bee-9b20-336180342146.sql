
-- Criar tabela de transações financeiras
CREATE TABLE public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_phone TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('gasto', 'lucro')),
  value DECIMAL(10,2) NOT NULL,
  description TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de usuários
CREATE TABLE public.users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  phone TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS nas tabelas
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Políticas para transações - usuários só veem suas próprias transações
CREATE POLICY "Usuários podem ver suas próprias transações" 
  ON public.transactions 
  FOR SELECT 
  USING (user_phone = current_setting('app.current_user_phone', true));

CREATE POLICY "Usuários podem criar suas próprias transações" 
  ON public.transactions 
  FOR INSERT 
  WITH CHECK (user_phone = current_setting('app.current_user_phone', true));

CREATE POLICY "Usuários podem atualizar suas próprias transações" 
  ON public.transactions 
  FOR UPDATE 
  USING (user_phone = current_setting('app.current_user_phone', true));

CREATE POLICY "Usuários podem deletar suas próprias transações" 
  ON public.transactions 
  FOR DELETE 
  USING (user_phone = current_setting('app.current_user_phone', true));

-- Política para usuários
CREATE POLICY "Usuários podem ver seu próprio perfil" 
  ON public.users 
  FOR SELECT 
  USING (phone = current_setting('app.current_user_phone', true));

-- Índices para melhor performance
CREATE INDEX idx_transactions_user_phone ON public.transactions(user_phone);
CREATE INDEX idx_transactions_timestamp ON public.transactions(timestamp);
CREATE INDEX idx_users_phone ON public.users(phone);
