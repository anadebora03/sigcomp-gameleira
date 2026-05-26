-- ============================================================
-- SIGCOMP — Permissões de Usuários (Supabase Auth + Metadata)
-- Execute este script no Supabase SQL Editor
-- ============================================================

-- 1. Criar tabela de auditoria de permissões (opcional)
CREATE TABLE IF NOT EXISTS public.permissoes_auditoria (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id UUID REFERENCES auth.users ON DELETE CASCADE,
  alterado_por UUID REFERENCES auth.users,
  permissoes JSONB NOT NULL,
  alterado_em TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.permissoes_auditoria ENABLE ROW LEVEL SECURITY;

-- Admins podem ver auditoria
CREATE POLICY "Admins veem auditoria" ON public.permissoes_auditoria
  FOR SELECT USING (
    (SELECT raw_user_meta_data->>'perfil' FROM auth.users WHERE id = auth.uid()) = 'administrador'
  );

-- 2. Função para atualizar permissões de um usuário
CREATE OR REPLACE FUNCTION public.atualizar_permissoes_usuario(
  usuario_id UUID,
  novas_permissoes JSONB
)
RETURNS boolean AS $$
DECLARE
  v_perfil TEXT;
  v_admin UUID;
BEGIN
  -- Verificar se o usuário que está alterando é admin
  v_admin := auth.uid();
  IF NOT EXISTS (
    SELECT 1 FROM auth.users WHERE id = v_admin 
    AND raw_user_meta_data->>'perfil' = 'administrador'
  ) THEN
    RAISE EXCEPTION 'Apenas administradores podem alterar permissões';
  END IF;

  -- Atualizar permissões no raw_user_meta_data
  UPDATE auth.users
  SET raw_user_meta_data = jsonb_set(
    COALESCE(raw_user_meta_data, '{}'::jsonb),
    '{permissoes}',
    novas_permissoes
  )
  WHERE id = usuario_id;

  -- Registrar na auditoria
  INSERT INTO public.permissoes_auditoria (usuario_id, alterado_por, permissoes)
  VALUES (usuario_id, v_admin, novas_permissoes);

  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Exemplo: Atualizar permissões de um usuário
-- SELECT public.atualizar_permissoes_usuario(
--   'uuid-do-usuario',
--   '{
--     "oficios.ver": true,
--     "oficios.criar": true,
--     "oficios.editar": false,
--     "oficios.excluir": false,
--     "processos.ver": true,
--     "processos.criar": true
--   }'::jsonb
-- );

-- 4. RLS para proteger modificações de permissões
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Usuários podem ver suas próprias permissões
CREATE POLICY "Usuários veem suas permissões" ON auth.users
  FOR SELECT USING (auth.uid() = id);

-- Nota: Para modificar auth.users, use a função atualizar_permissoes_usuario
-- que já tem verificação de admin incorporada
