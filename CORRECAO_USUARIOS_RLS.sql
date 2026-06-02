-- ============================================================
-- CORREÇÃO: Policies RLS para tabela usuarios
-- Execute no SQL Editor do Supabase
-- ============================================================

-- Esta correção adiciona a policy que falta:
-- "Autenticados podem ver todos os usuários"
-- Sem isso, usuarios comuns não conseguem carregar a lista

-- Adicionar policy nova para permitir SELECT a autenticados
DROP POLICY IF EXISTS "Autenticados podem ver todos os usuários" ON public.usuarios;
CREATE POLICY "Autenticados podem ver todos os usuários" ON public.usuarios
  FOR SELECT USING (auth.role() = 'authenticated');

-- ============================================================
-- Verificação: Policies atuais da tabela usuarios (SELECT)
-- ============================================================

-- Execute isso para ver as policies ativas:
-- SELECT schemaname, tablename, policyname, permissive, roles, qual, with_check
-- FROM pg_policies
-- WHERE tablename = 'usuarios'
-- ORDER BY policyname;

-- ============================================================
-- Se tiver erro de política duplicada, execute:
-- ============================================================

-- DROP POLICY IF EXISTS "Autenticados podem ver todos os usuários" ON public.usuarios;
-- DROP POLICY IF EXISTS "Usuários podem ver seus próprios dados" ON public.usuarios;
-- DROP POLICY IF EXISTS "Admins podem ver todos os usuários" ON public.usuarios;

-- CREATE POLICY "Usuários podem ver seus próprios dados" ON public.usuarios
--   FOR SELECT USING (
--     auth.role() = 'authenticated' AND (
--       auth.uid() = id OR
--       (SELECT raw_user_meta_data->>'perfil' FROM auth.users WHERE id = auth.uid()) = 'administrador'
--     )
--   );

-- CREATE POLICY "Admins podem ver todos os usuários" ON public.usuarios
--   FOR SELECT USING (
--     auth.role() = 'authenticated' AND (
--       (SELECT raw_user_meta_data->>'perfil' FROM auth.users WHERE id = auth.uid()) = 'administrador'
--     )
--   );

-- CREATE POLICY "Autenticados podem ver todos os usuários" ON public.usuarios
--   FOR SELECT USING (auth.role() = 'authenticated');
