-- ============================================================
-- SIGCOMP Gameleira — Supabase Auth Setup
-- Execute este script no Supabase SQL Editor
-- Acesse: Dashboard > SQL Editor > New Query
-- ============================================================

-- 1. Habilitar confirmação automática de email (para o admin inicial)
-- Vá em: Authentication > Providers > Email
-- Desmarque "Confirm email" para desenvolvimento
-- Ou use o script abaixo para criar o admin sem confirmação:

-- 2. Criar usuário administrador via SQL
-- (Substitua o email e senha conforme desejado)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM auth.users WHERE email = 'admin@gameleira.pe.gov.br'
  ) THEN
    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      role,
      aud,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      recovery_token
    ) VALUES (
      gen_random_uuid(),
      '00000000-0000-0000-0000-000000000000',
      'admin@gameleira.pe.gov.br',       -- ← ALTERE O EMAIL
      crypt('Admin@2025!', gen_salt('bf')), -- ← ALTERE A SENHA
      now(),                              -- email já confirmado
      'authenticated',
      'authenticated',
      '{"provider":"email","providers":["email"]}',
      '{"nome":"Administrador","perfil":"administrador"}',
      now(),
      now(),
      '',
      ''
    );
  END IF;
END
$$;

-- 3. Criar tabela de perfis de usuários (opcional — para info extra)
CREATE TABLE IF NOT EXISTS public.perfis (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  nome TEXT,
  cargo TEXT,
  perfil TEXT DEFAULT 'setor_compras',
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS: cada usuário vê apenas seu perfil, admins veem tudo
ALTER TABLE public.perfis ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuários veem seu próprio perfil" ON public.perfis;
CREATE POLICY "Usuários veem seu próprio perfil" ON public.perfis
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins veem todos" ON public.perfis;
CREATE POLICY "Admins veem todos" ON public.perfis
  FOR ALL USING (
    (SELECT raw_user_meta_data->>'perfil' FROM auth.users WHERE id = auth.uid()) = 'administrador'
  );
