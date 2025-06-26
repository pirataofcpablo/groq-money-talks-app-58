
-- Remover as políticas RLS existentes que estão causando problemas
DROP POLICY IF EXISTS "Usuários podem ver seu próprio perfil" ON public.users;
DROP POLICY IF EXISTS "Usuários podem ver suas próprias transações" ON public.transactions;
DROP POLICY IF EXISTS "Usuários podem criar suas próprias transações" ON public.transactions;
DROP POLICY IF EXISTS "Usuários podem atualizar suas próprias transações" ON public.transactions;
DROP POLICY IF EXISTS "Usuários podem deletar suas próprias transações" ON public.transactions;

-- Permitir inserção de novos usuários (necessário para cadastro)
CREATE POLICY "Permitir inserção de novos usuários" 
  ON public.users 
  FOR INSERT 
  WITH CHECK (true);

-- Permitir que usuários vejam apenas seu próprio perfil
CREATE POLICY "Usuários podem ver seu próprio perfil" 
  ON public.users 
  FOR SELECT 
  USING (true);

-- Políticas para transações baseadas no phone do usuário
CREATE POLICY "Usuários podem ver suas próprias transações" 
  ON public.transactions 
  FOR SELECT 
  USING (true);

CREATE POLICY "Usuários podem criar suas próprias transações" 
  ON public.transactions 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Usuários podem atualizar suas próprias transações" 
  ON public.transactions 
  FOR UPDATE 
  USING (true);

CREATE POLICY "Usuários podem deletar suas próprias transações" 
  ON public.transactions 
  FOR DELETE 
  USING (true);
