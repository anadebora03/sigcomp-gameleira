/**
 * Script para atualizar perfis de usuários existentes no Supabase
 * Execute isto no SQL Editor do Supabase para garantir que todos os usuários têm perfil definido
 */

-- 1. Atualizar usuário admin (se já existe)
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{perfil}',
  '"administrador"'
)
WHERE email = 'admin@gameleira.pe.gov.br'
  AND (raw_user_meta_data->>'perfil' IS NULL OR raw_user_meta_data->>'perfil' = '');

-- 2. Atualizar usuários sem perfil (atribuir como visualizador por padrão)
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{perfil}',
  '"visualizador"'
)
WHERE (raw_user_meta_data->>'perfil' IS NULL OR raw_user_meta_data->>'perfil' = '');

-- 3. Adicionar status = 'ativo' se não existe
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{status}',
  '"ativo"'
)
WHERE (raw_user_meta_data->>'status' IS NULL OR raw_user_meta_data->>'status' = '');

-- 4. Verificar resultado
SELECT 
  id,
  email,
  raw_user_meta_data->>'nome' as nome,
  raw_user_meta_data->>'perfil' as perfil,
  raw_user_meta_data->>'status' as status
FROM auth.users
ORDER BY created_at DESC;
