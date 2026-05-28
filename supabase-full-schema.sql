-- ============================================================
-- SIGCOMP Gameleira — Schema Completo para Supabase
-- Execute este script no Supabase SQL Editor
-- ============================================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Função auxiliar para atualizar updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função auxiliar para preencher auth_user_id quando ausente
CREATE OR REPLACE FUNCTION public.usuarios_set_auth_user_id()
RETURNS trigger AS $$
BEGIN
  IF NEW.auth_user_id IS NULL THEN
    NEW.auth_user_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- Tabela de secretarias
CREATE TABLE IF NOT EXISTS public.secretarias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  legacy_id BIGINT GENERATED ALWAYS AS IDENTITY UNIQUE,
  nome TEXT NOT NULL,
  sigla TEXT NOT NULL,
  cor TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_secretarias_sigla ON public.secretarias(sigla);
CREATE UNIQUE INDEX IF NOT EXISTS idx_secretarias_legacy_id ON public.secretarias(legacy_id);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'secretarias_set_updated_at'
  ) THEN
    CREATE TRIGGER secretarias_set_updated_at
      BEFORE UPDATE ON public.secretarias
      FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
END
$$;

ALTER TABLE public.secretarias ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Autenticados podem ver secretarias" ON public.secretarias;
CREATE POLICY "Autenticados podem ver secretarias" ON public.secretarias
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Autenticados podem manipular secretarias" ON public.secretarias;
CREATE POLICY "Autenticados podem manipular secretarias" ON public.secretarias
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- ============================================================
-- Tabela de usuários
CREATE TABLE IF NOT EXISTS public.usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  nome_completo TEXT,
  display_name TEXT,
  cargo TEXT,
  secretaria TEXT,
  perfil TEXT NOT NULL,
  ativo BOOLEAN NOT NULL DEFAULT true,
  status TEXT NOT NULL DEFAULT 'ativo',
  permissoes JSONB DEFAULT '{}'::jsonb,
  observacoes TEXT,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_usuarios_perfil ON public.usuarios(perfil);
CREATE INDEX IF NOT EXISTS idx_usuarios_status ON public.usuarios(status);
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON public.usuarios(email);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'usuarios_set_updated_at'
  ) THEN
    CREATE TRIGGER usuarios_set_updated_at
      BEFORE UPDATE ON public.usuarios
      FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'usuarios_set_auth_user_id'
  ) THEN
    CREATE TRIGGER usuarios_set_auth_user_id
      BEFORE INSERT ON public.usuarios
      FOR EACH ROW EXECUTE FUNCTION public.usuarios_set_auth_user_id();
  END IF;
END
$$;

ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuários podem ver seus próprios dados" ON public.usuarios;
CREATE POLICY "Usuários podem ver seus próprios dados" ON public.usuarios
  FOR SELECT USING (
    auth.role() = 'authenticated' AND (
      auth.uid() = auth_user_id OR
      (SELECT raw_user_meta_data->>'perfil' FROM auth.users WHERE id = auth.uid()) = 'administrador'
    )
  );

DROP POLICY IF EXISTS "Admins podem ver todos os usuários" ON public.usuarios;
CREATE POLICY "Admins podem ver todos os usuários" ON public.usuarios
  FOR SELECT USING (
    auth.role() = 'authenticated' AND (
      (SELECT raw_user_meta_data->>'perfil' FROM auth.users WHERE id = auth.uid()) = 'administrador'
    )
  );

DROP POLICY IF EXISTS "Admins podem criar usuários" ON public.usuarios;
CREATE POLICY "Admins podem criar usuários" ON public.usuarios
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND (
      (SELECT raw_user_meta_data->>'perfil' FROM auth.users WHERE id = auth.uid()) = 'administrador'
    )
  );

DROP POLICY IF EXISTS "Usuários podem atualizar próprios dados" ON public.usuarios;
CREATE POLICY "Usuários podem atualizar próprios dados" ON public.usuarios
  FOR UPDATE USING (
    auth.role() = 'authenticated' AND (
      auth.uid() = auth_user_id OR
      (SELECT raw_user_meta_data->>'perfil' FROM auth.users WHERE id = auth.uid()) = 'administrador'
    )
  ) WITH CHECK (
    auth.role() = 'authenticated' AND (
      auth.uid() = auth_user_id OR
      (SELECT raw_user_meta_data->>'perfil' FROM auth.users WHERE id = auth.uid()) = 'administrador'
    )
  );

DROP POLICY IF EXISTS "Admins podem excluir usuários" ON public.usuarios;
CREATE POLICY "Admins podem excluir usuários" ON public.usuarios
  FOR DELETE USING (
    auth.role() = 'authenticated' AND (
      (SELECT raw_user_meta_data->>'perfil' FROM auth.users WHERE id = auth.uid()) = 'administrador'
    )
  );

-- ============================================================
-- Tabela de ofícios
CREATE TABLE IF NOT EXISTS public.oficios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero TEXT NOT NULL UNIQUE,
  secretaria_id BIGINT REFERENCES public.secretarias(legacy_id),
  destinatario TEXT,
  responsavel TEXT,
  resp_acomp TEXT,
  data TEXT,
  assunto TEXT,
  descricao TEXT,
  tipo TEXT,
  prioridade TEXT,
  prazo TEXT,
  status TEXT,
  obs TEXT,
  favorito BOOLEAN DEFAULT FALSE,
  historico JSONB DEFAULT '[]'::jsonb,
  comentarios JSONB DEFAULT '[]'::jsonb,
  anexos JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_oficios_numero ON public.oficios(numero);
CREATE INDEX IF NOT EXISTS idx_oficios_secretaria ON public.oficios(secretaria_id);
CREATE INDEX IF NOT EXISTS idx_oficios_status ON public.oficios(status);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'oficios_set_updated_at'
  ) THEN
    CREATE TRIGGER oficios_set_updated_at
      BEFORE UPDATE ON public.oficios
      FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
END
$$;

ALTER TABLE public.oficios ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Autenticados podem ver ofícios" ON public.oficios;
CREATE POLICY "Autenticados podem ver ofícios" ON public.oficios
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Autenticados podem manipular ofícios" ON public.oficios;
CREATE POLICY "Autenticados podem manipular ofícios" ON public.oficios
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- ============================================================
-- Tabela de processos
CREATE TABLE IF NOT EXISTS public.processos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero TEXT NOT NULL UNIQUE,
  secretaria_id BIGINT REFERENCES public.secretarias(legacy_id),
  objeto TEXT,
  modalidade TEXT,
  assunto TEXT,
  status TEXT,
  data_abertura TEXT,
  data_prevista TEXT,
  responsavel TEXT,
  valor_estimado TEXT,
  valor_final TEXT,
  obs TEXT,
  anexos JSONB DEFAULT '[]'::jsonb,
  contrato JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_processos_numero ON public.processos(numero);
CREATE INDEX IF NOT EXISTS idx_processos_secretaria ON public.processos(secretaria_id);
CREATE INDEX IF NOT EXISTS idx_processos_status ON public.processos(status);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'processos_set_updated_at'
  ) THEN
    CREATE TRIGGER processos_set_updated_at
      BEFORE UPDATE ON public.processos
      FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
END
$$;

ALTER TABLE public.processos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Autenticados podem ver processos" ON public.processos;
CREATE POLICY "Autenticados podem ver processos" ON public.processos
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Autenticados podem manipular processos" ON public.processos;
CREATE POLICY "Autenticados podem manipular processos" ON public.processos
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- ============================================================
-- Tabela de pesquisas de preço
CREATE TABLE IF NOT EXISTS public.pesquisas_preco (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero TEXT NOT NULL UNIQUE,
  secretaria_id BIGINT REFERENCES public.secretarias(legacy_id),
  objeto TEXT,
  descricao TEXT,
  fornecedor TEXT,
  valor TEXT,
  oficio_ref TEXT,
  periodo TEXT,
  prazo_cotacao TEXT,
  responsavel TEXT,
  status TEXT,
  obs TEXT,
  fornecedores JSONB DEFAULT '[]'::jsonb,
  anexos JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pesquisas_preco_numero ON public.pesquisas_preco(numero);
CREATE INDEX IF NOT EXISTS idx_pesquisas_preco_secretaria ON public.pesquisas_preco(secretaria_id);
CREATE INDEX IF NOT EXISTS idx_pesquisas_preco_status ON public.pesquisas_preco(status);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'pesquisas_preco_set_updated_at'
  ) THEN
    CREATE TRIGGER pesquisas_preco_set_updated_at
      BEFORE UPDATE ON public.pesquisas_preco
      FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
END
$$;

ALTER TABLE public.pesquisas_preco ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Autenticados podem ver pesquisas_preco" ON public.pesquisas_preco;
CREATE POLICY "Autenticados podem ver pesquisas_preco" ON public.pesquisas_preco
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Autenticados podem manipular pesquisas_preco" ON public.pesquisas_preco;
CREATE POLICY "Autenticados podem manipular pesquisas_preco" ON public.pesquisas_preco
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- ============================================================
-- Tabela de logs
CREATE TABLE IF NOT EXISTS public.logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario TEXT,
  modulo TEXT,
  tipo TEXT,
  descricao TEXT,
  data TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_logs_modulo ON public.logs(modulo);
CREATE INDEX IF NOT EXISTS idx_logs_tipo ON public.logs(tipo);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'logs_set_updated_at'
  ) THEN
    CREATE TRIGGER logs_set_updated_at
      BEFORE UPDATE ON public.logs
      FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
END
$$;

ALTER TABLE public.logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Autenticados podem ver logs" ON public.logs;
CREATE POLICY "Autenticados podem ver logs" ON public.logs
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Autenticados podem manipular logs" ON public.logs;
CREATE POLICY "Autenticados podem manipular logs" ON public.logs
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- ============================================================
-- Tabela de configurações
CREATE TABLE IF NOT EXISTS public.configuracoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chave TEXT NOT NULL UNIQUE,
  valor JSONB DEFAULT '{}'::jsonb,
  descricao TEXT,
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_configuracoes_chave ON public.configuracoes(chave);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'configuracoes_set_updated_at'
  ) THEN
    CREATE TRIGGER configuracoes_set_updated_at
      BEFORE UPDATE ON public.configuracoes
      FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
END
$$;

ALTER TABLE public.configuracoes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Autenticados podem ver configuracoes" ON public.configuracoes;
CREATE POLICY "Autenticados podem ver configuracoes" ON public.configuracoes
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins podem manipular configuracoes" ON public.configuracoes;
CREATE POLICY "Admins podem manipular configuracoes" ON public.configuracoes
  FOR ALL USING (
    auth.role() = 'authenticated' AND (
      (SELECT raw_user_meta_data->>'perfil' FROM auth.users WHERE id = auth.uid()) = 'administrador'
    )
  )
  WITH CHECK (
    auth.role() = 'authenticated' AND (
      (SELECT raw_user_meta_data->>'perfil' FROM auth.users WHERE id = auth.uid()) = 'administrador'
    )
  );

-- ============================================================
-- Seed inicial de secretarias
INSERT INTO public.secretarias (nome, sigla, cor)
VALUES
  ('Secretaria de Saúde e Saneamento', 'SAÚDE', '#1a5c38'),
  ('Secretaria de Educação', 'EDUC', '#1a5c38'),
  ('Secretaria de Assistência Social', 'ASSIST', '#1a5c38'),
  ('Secretaria de Esportes, Cultura, Turismo e Juventude', 'ECTJ', '#1a5c38'),
  ('Secretaria de Desenvolvimento Econômico', 'DECO', '#1a5c38'),
  ('Secretaria de Infraestrutura, Obras e Transportes', 'INFRA', '#1a5c38'),
  ('Secretaria de Administração', 'ADMIN', '#1a5c38'),
  ('Secretaria da Fazenda', 'FAZ', '#1a5c38'),
  ('Secretaria de Finanças', 'FIN', '#1a5c38'),
  ('Secretaria de Agricultura', 'AGRI', '#1a5c38')
ON CONFLICT (sigla) DO NOTHING;

-- ============================================================
-- Fim do schema completo
SELECT 'Schema completo criado ou validado com sucesso.' AS resultado;
