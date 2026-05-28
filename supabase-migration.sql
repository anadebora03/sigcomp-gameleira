-- ============================================================
-- SIGCOMP Gameleira - SQL de Migração de Banco de Dados
-- Execute este script no SQL Editor do Supabase
-- ============================================================

-- 1. Tabela de secretarias
CREATE TABLE IF NOT EXISTS public.secretarias (
  id INTEGER PRIMARY KEY,
  nome TEXT NOT NULL,
  sigla TEXT NOT NULL,
  cor TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_secretarias_sigla ON public.secretarias(sigla);

-- 2. Tabela de ofícios
CREATE TABLE IF NOT EXISTS public.oficios (
  id SERIAL PRIMARY KEY,
  numero TEXT NOT NULL UNIQUE,
  secretaria_id INTEGER REFERENCES public.secretarias(id) ON DELETE SET NULL,
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
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_oficios_numero ON public.oficios(numero);
CREATE INDEX IF NOT EXISTS idx_oficios_secretaria ON public.oficios(secretaria_id);
CREATE INDEX IF NOT EXISTS idx_oficios_status ON public.oficios(status);

-- 3. Tabela de processos
CREATE TABLE IF NOT EXISTS public.processos (
  id SERIAL PRIMARY KEY,
  numero TEXT NOT NULL UNIQUE,
  secretaria_id INTEGER REFERENCES public.secretarias(id) ON DELETE SET NULL,
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
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_processos_numero ON public.processos(numero);
CREATE INDEX IF NOT EXISTS idx_processos_secretaria ON public.processos(secretaria_id);
CREATE INDEX IF NOT EXISTS idx_processos_status ON public.processos(status);

-- 4. Tabela de pesquisas de preço
CREATE TABLE IF NOT EXISTS public.pesquisas_preco (
  id SERIAL PRIMARY KEY,
  numero TEXT NOT NULL UNIQUE,
  secretaria_id INTEGER REFERENCES public.secretarias(id) ON DELETE SET NULL,
  objeto TEXT,
  descricao TEXT,
  oficio_ref TEXT,
  periodo TEXT,
  prazo_cotacao TEXT,
  responsavel TEXT,
  status TEXT,
  obs TEXT,
  fornecedores JSONB DEFAULT '[]'::jsonb,
  anexos JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pesquisas_preco_numero ON public.pesquisas_preco(numero);
CREATE INDEX IF NOT EXISTS idx_pesquisas_preco_secretaria ON public.pesquisas_preco(secretaria_id);
CREATE INDEX IF NOT EXISTS idx_pesquisas_preco_status ON public.pesquisas_preco(status);

-- 5. Tabela de logs
CREATE TABLE IF NOT EXISTS public.logs (
  id SERIAL PRIMARY KEY,
  usuario TEXT,
  modulo TEXT,
  tipo TEXT,
  descricao TEXT,
  data TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_logs_modulo ON public.logs(modulo);
CREATE INDEX IF NOT EXISTS idx_logs_tipo ON public.logs(tipo);

-- 6. Tabela de configurações
CREATE TABLE IF NOT EXISTS public.configuracoes (
  id SERIAL PRIMARY KEY,
  chave TEXT NOT NULL UNIQUE,
  valor JSONB DEFAULT '{}'::jsonb,
  descricao TEXT,
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_configuracoes_chave ON public.configuracoes(chave);

-- 7. Tabela de usuários
CREATE TABLE IF NOT EXISTS public.usuarios (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  nome TEXT NOT NULL,
  nome_completo TEXT,
  display_name TEXT,
  cargo TEXT,
  secretaria TEXT,
  perfil TEXT NOT NULL CHECK (perfil IN ('administrador','diretor_compras','setor_compras','secretaria','visualizador')),
  permissoes JSONB DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'convite_enviado' CHECK (status IN ('convite_enviado','aguardando_ativacao','ativo','bloqueado')),
  is_admin BOOLEAN GENERATED ALWAYS AS (perfil = 'administrador') STORED,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  last_login TIMESTAMPTZ,
  observacoes TEXT
);

CREATE INDEX IF NOT EXISTS idx_usuarios_email ON public.usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_perfil ON public.usuarios(perfil);
CREATE INDEX IF NOT EXISTS idx_usuarios_status ON public.usuarios(status);

-- 8. Tabela de perfis (opcional)
CREATE TABLE IF NOT EXISTS public.perfis (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT,
  nome_completo TEXT,
  display_name TEXT,
  cargo TEXT,
  perfil TEXT DEFAULT 'setor_compras',
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.perfis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.secretarias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.oficios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.processos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pesquisas_preco ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configuracoes ENABLE ROW LEVEL SECURITY;

-- Policies for users
DROP POLICY IF EXISTS "Usuários podem ver seus próprios dados" ON public.usuarios;
DROP POLICY IF EXISTS "Admins podem ver todos os usuários" ON public.usuarios;
DROP POLICY IF EXISTS "Admins podem criar usuários" ON public.usuarios;
DROP POLICY IF EXISTS "Usuários podem atualizar próprios dados" ON public.usuarios;
DROP POLICY IF EXISTS "Admins podem excluir usuários" ON public.usuarios;

CREATE POLICY "Usuários podem ver seus próprios dados" ON public.usuarios
  FOR SELECT USING (
    auth.role() = 'authenticated' AND auth.uid() = id
  );

CREATE POLICY "Admins podem ver todos os usuários" ON public.usuarios
  FOR SELECT USING (
    auth.role() = 'authenticated' AND (
      (SELECT perfil FROM public.usuarios WHERE id = auth.uid()) = 'administrador'
    )
  );

CREATE POLICY "Admins podem criar usuários" ON public.usuarios
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND (
      (SELECT perfil FROM public.usuarios WHERE id = auth.uid()) = 'administrador'
    )
  );

CREATE POLICY "Usuários podem atualizar próprios dados" ON public.usuarios
  FOR UPDATE USING (
    auth.role() = 'authenticated' AND (
      auth.uid() = id OR (SELECT perfil FROM public.usuarios WHERE id = auth.uid()) = 'administrador'
    )
  ) WITH CHECK (
    auth.role() = 'authenticated' AND (
      auth.uid() = id OR (SELECT perfil FROM public.usuarios WHERE id = auth.uid()) = 'administrador'
    )
  );

CREATE POLICY "Admins podem excluir usuários" ON public.usuarios
  FOR DELETE USING (
    auth.role() = 'authenticated' AND (
      (SELECT perfil FROM public.usuarios WHERE id = auth.uid()) = 'administrador'
    )
  );

-- Policies for perfis
DROP POLICY IF EXISTS "Usuários podem ver seus próprios perfis" ON public.perfis;
DROP POLICY IF EXISTS "Admins podem ver todos perfis" ON public.perfis;

CREATE POLICY "Usuários podem ver seus próprios perfis" ON public.perfis
  FOR SELECT USING (
    auth.role() = 'authenticated' AND auth.uid() = id
  );

CREATE POLICY "Admins podem ver todos perfis" ON public.perfis
  FOR SELECT USING (
    auth.role() = 'authenticated' AND (
      (SELECT perfil FROM public.usuarios WHERE id = auth.uid()) = 'administrador'
    )
  );

-- Policies for secretarias
DROP POLICY IF EXISTS "Autenticados podem ver secretarias" ON public.secretarias;
DROP POLICY IF EXISTS "Autenticados podem inserir secretarias" ON public.secretarias;
DROP POLICY IF EXISTS "Admin pode alterar secretarias" ON public.secretarias;
DROP POLICY IF EXISTS "Admin pode deletar secretarias" ON public.secretarias;

CREATE POLICY "Autenticados podem ver secretarias" ON public.secretarias
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admin pode inserir secretarias" ON public.secretarias
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND (
      (SELECT perfil FROM public.usuarios WHERE id = auth.uid()) = 'administrador'
    )
  );

CREATE POLICY "Admin pode alterar secretarias" ON public.secretarias
  FOR UPDATE USING (
    auth.role() = 'authenticated' AND (
      (SELECT perfil FROM public.usuarios WHERE id = auth.uid()) = 'administrador'
    )
  ) WITH CHECK (
    auth.role() = 'authenticated' AND (
      (SELECT perfil FROM public.usuarios WHERE id = auth.uid()) = 'administrador'
    )
  );

CREATE POLICY "Admin pode deletar secretarias" ON public.secretarias
  FOR DELETE USING (
    auth.role() = 'authenticated' AND (
      (SELECT perfil FROM public.usuarios WHERE id = auth.uid()) = 'administrador'
    )
  );

-- Policies for oficios
DROP POLICY IF EXISTS "Autenticados podem ver oficios" ON public.oficios;
DROP POLICY IF EXISTS "Autenticados podem manipular oficios" ON public.oficios;

CREATE POLICY "Autenticados podem ver oficios" ON public.oficios
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Autenticados podem manipular oficios" ON public.oficios
  FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- Policies for processos
DROP POLICY IF EXISTS "Autenticados podem ver processos" ON public.processos;
DROP POLICY IF EXISTS "Autenticados podem manipular processos" ON public.processos;

CREATE POLICY "Autenticados podem ver processos" ON public.processos
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Autenticados podem manipular processos" ON public.processos
  FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- Policies for pesquisas_preco
DROP POLICY IF EXISTS "Autenticados podem ver pesquisas_preco" ON public.pesquisas_preco;
DROP POLICY IF EXISTS "Autenticados podem manipular pesquisas_preco" ON public.pesquisas_preco;

CREATE POLICY "Autenticados podem ver pesquisas_preco" ON public.pesquisas_preco
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Autenticados podem manipular pesquisas_preco" ON public.pesquisas_preco
  FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- Policies for logs
DROP POLICY IF EXISTS "Autenticados podem ver logs" ON public.logs;
DROP POLICY IF EXISTS "Autenticados podem manipular logs" ON public.logs;

CREATE POLICY "Autenticados podem ver logs" ON public.logs
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Autenticados podem manipular logs" ON public.logs
  FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- Policies for configuracoes
DROP POLICY IF EXISTS "Autenticados podem ver configuracoes" ON public.configuracoes;
DROP POLICY IF EXISTS "Admins podem manipular configuracoes" ON public.configuracoes;

CREATE POLICY "Autenticados podem ver configuracoes" ON public.configuracoes
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins podem manipular configuracoes" ON public.configuracoes
  FOR ALL USING (
    auth.role() = 'authenticated' AND (
      (SELECT perfil FROM public.usuarios WHERE id = auth.uid()) = 'administrador'
    )
  ) WITH CHECK (
    auth.role() = 'authenticated' AND (
      (SELECT perfil FROM public.usuarios WHERE id = auth.uid()) = 'administrador'
    )
  );

-- 9. Seed de secretarias
INSERT INTO public.secretarias (id, nome, sigla, cor)
VALUES
  (1, 'Secretaria de Saúde e Saneamento', 'SAÚDE', '#1a5c38'),
  (2, 'Secretaria de Educação', 'EDUC', '#1a5c38'),
  (3, 'Secretaria de Assistência Social', 'ASSIST', '#1a5c38'),
  (4, 'Secretaria de Esportes, Cultura, Turismo e Juventude', 'ECTJ', '#1a5c38'),
  (5, 'Secretaria de Desenvolvimento Econômico', 'DECO', '#1a5c38'),
  (6, 'Secretaria de Infraestrutura, Obras e Transportes', 'INFRA', '#1a5c38'),
  (7, 'Secretaria de Administração', 'ADMIN', '#1a5c38'),
  (8, 'Secretaria da Fazenda', 'FAZ', '#1a5c38'),
  (9, 'Secretaria de Finanças', 'FIN', '#1a5c38'),
  (10, 'Secretaria de Agricultura', 'AGRI', '#1a5c38')
ON CONFLICT (id) DO NOTHING;

-- 10. Mensagem de finalização
SELECT 'Migração de schemas e policies finalizada com sucesso.' AS resultado;
