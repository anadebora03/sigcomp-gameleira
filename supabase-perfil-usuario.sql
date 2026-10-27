-- ============================================================
-- SIGCOMP — Perfil do usuário + foto (avatar)
-- Execute este script no SQL Editor do Supabase
-- Reutiliza a tabela public.usuarios (não cria tabela nova). Só ACRESCENTA colunas, funções e o bucket "avatars".
-- ============================================================

-- 1. Colunas do perfil (as que já existirem são ignoradas)
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS nome_completo TEXT;
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS cargo TEXT;
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS secretaria TEXT;
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS telefone TEXT;
-- Caminho da foto no bucket "avatars" (ex.: <uuid>/profile-1730000000000.webp). Nunca a imagem em si.
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS avatar_path TEXT;

-- ============================================================
-- 2. Ler o próprio perfil (não depende das policies de SELECT de usuarios)
CREATE OR REPLACE FUNCTION public.meu_perfil()
RETURNS TABLE (id UUID, email TEXT, nome TEXT, nome_completo TEXT, cargo TEXT, telefone TEXT, secretaria TEXT, avatar_path TEXT)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT u.id, u.email, u.nome, u.nome_completo, u.cargo, u.telefone, u.secretaria, u.avatar_path
  FROM public.usuarios u
  WHERE u.id = auth.uid();
$$;

-- ============================================================
-- 3. Salvar o próprio perfil.
-- Só altera nome, cargo, telefone, secretaria e foto — e só da linha do próprio auth.uid().
-- Perfil de acesso, permissões, status e e-mail NÃO podem ser alterados por aqui.
CREATE OR REPLACE FUNCTION public.atualizar_meu_perfil(
  p_nome TEXT,
  p_cargo TEXT,
  p_telefone TEXT,
  p_secretaria TEXT,
  p_avatar_path TEXT
) RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_email TEXT;
  v_meta JSONB;
  v_perfil TEXT;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Não autenticado';
  END IF;
  IF coalesce(trim(p_nome), '') = '' THEN
    RAISE EXCEPTION 'Informe o nome';
  END IF;
  IF p_avatar_path IS NOT NULL AND p_avatar_path NOT LIKE v_uid::text || '/%' THEN
    RAISE EXCEPTION 'Caminho de foto inválido';
  END IF;

  -- Conta sem linha em usuarios (ex.: acesso liberado só pelo e-mail): cria a linha mantendo perfil e permissões atuais
  IF NOT EXISTS (SELECT 1 FROM public.usuarios WHERE id = v_uid) THEN
    SELECT email, raw_user_meta_data INTO v_email, v_meta FROM auth.users WHERE id = v_uid;
    v_perfil := CASE
      WHEN v_email = 'deboramelo391997@gmail.com' THEN 'administrador'
      WHEN v_email = 'setordecompras@gameleira.pe.gov.br' THEN 'diretor_compras'
      WHEN v_meta->>'perfil' = 'admin' THEN 'administrador'
      WHEN v_meta->>'perfil' = 'diretor_setor_compras' THEN 'diretor_compras'
      WHEN v_meta->>'perfil' IN ('administrador', 'diretor_compras', 'setor_compras', 'secretaria', 'visualizador') THEN v_meta->>'perfil'
      ELSE 'visualizador'
    END;
    INSERT INTO public.usuarios (id, email, nome, perfil, permissoes, status)
    VALUES (v_uid, v_email, trim(p_nome), v_perfil, coalesce(v_meta->'permissoes', '{}'::jsonb), 'ativo');
  END IF;

  UPDATE public.usuarios SET
    nome = trim(p_nome),
    nome_completo = trim(p_nome),
    cargo = nullif(trim(p_cargo), ''),
    telefone = nullif(trim(p_telefone), ''),
    secretaria = nullif(trim(p_secretaria), ''),
    avatar_path = p_avatar_path
  WHERE id = v_uid;
END;
$$;

REVOKE ALL ON FUNCTION public.meu_perfil() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.atualizar_meu_perfil(TEXT, TEXT, TEXT, TEXT, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.meu_perfil() TO authenticated;
GRANT EXECUTE ON FUNCTION public.atualizar_meu_perfil(TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated;

-- ============================================================
-- 4. Bucket "avatars" — PRIVADO, 5 MB, só JPG/PNG/WEBP
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('avatars', 'avatars', false, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

-- 5. Policies do Storage: cada usuário só mexe na pasta com o próprio id (avatars/<auth.uid()>/...)
DROP POLICY IF EXISTS "Avatar: autenticados veem fotos" ON storage.objects;
CREATE POLICY "Avatar: autenticados veem fotos" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Avatar: envia na propria pasta" ON storage.objects;
CREATE POLICY "Avatar: envia na propria pasta" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Avatar: altera na propria pasta" ON storage.objects;
CREATE POLICY "Avatar: altera na propria pasta" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text)
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Avatar: apaga na propria pasta" ON storage.objects;
CREATE POLICY "Avatar: apaga na propria pasta" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- ============================================================
-- 6. Conferência (rode depois). Deve listar as 4 policies "Avatar: ..." e, de preferência, NENHUMA outra
-- policy de INSERT/UPDATE/DELETE em storage.objects sem "bucket_id" — uma policy assim abriria a pasta de todos.
-- SELECT policyname, cmd, qual, with_check FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects';
