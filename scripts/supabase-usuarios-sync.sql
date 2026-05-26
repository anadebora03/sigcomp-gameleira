-- ============================================================
-- SIGCOMP — Gerenciamento Automático de Usuários e Perfis
-- Sincronização entre Supabase Auth e Database
-- Execute este script no SQL Editor do Supabase
-- ============================================================

-- 1. Criar tabela principal de usuários com campos completos
-- (Esta tabela será a source-of-truth para perfis e permissões)
CREATE TABLE IF NOT EXISTS public.usuarios (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  nome TEXT NOT NULL,
  cargo TEXT,
  perfil TEXT NOT NULL CHECK (perfil IN ('administrador', 'diretor_compras', 'setor_compras', 'secretaria', 'visualizador')),
  
  -- Permissões armazenadas como JSONB para flexibilidade
  permissoes JSONB DEFAULT '{}'::jsonb,
  
  -- Status do usuário
  status TEXT DEFAULT 'convite_enviado' CHECK (status IN ('convite_enviado', 'aguardando_ativacao', 'ativo', 'bloqueado')),
  
  -- Flags para facilitar queries
  is_admin BOOLEAN GENERATED ALWAYS AS (perfil = 'administrador') STORED,
  is_director BOOLEAN GENERATED ALWAYS AS (perfil = 'diretor_compras') STORED,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  last_login TIMESTAMPTZ,
  
  -- Observações para auditoria
  observacoes TEXT
);

-- 2. Índices para performance
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON public.usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_perfil ON public.usuarios(perfil);
CREATE INDEX IF NOT EXISTS idx_usuarios_status ON public.usuarios(status);
CREATE INDEX IF NOT EXISTS idx_usuarios_is_admin ON public.usuarios(is_admin);

-- 3. Habilitar RLS
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

-- 4. Políticas de RLS
-- Usuários veem seus próprios dados
CREATE POLICY "Usuários veem seus dados" ON public.usuarios
  FOR SELECT USING (auth.uid() = id);

-- Admins veem todos
CREATE POLICY "Admins veem todos" ON public.usuarios
  FOR ALL USING (
    (SELECT perfil FROM public.usuarios WHERE id = auth.uid()) = 'administrador'
  );

-- Criar novo usuário (apenas admins)
CREATE POLICY "Admins criam usuários" ON public.usuarios
  FOR INSERT WITH CHECK (
    (SELECT perfil FROM public.usuarios WHERE id = auth.uid()) = 'administrador'
  );

-- 5. Criar tabela de auditoria
CREATE TABLE IF NOT EXISTS public.usuarios_auditoria (
  id BIGSERIAL PRIMARY KEY,
  usuario_id UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
  acao TEXT NOT NULL,
  dados_anterior JSONB,
  dados_novo JSONB,
  realizado_por UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_auditoria_usuario ON public.usuarios_auditoria(usuario_id);
CREATE INDEX IF NOT EXISTS idx_auditoria_acao ON public.usuarios_auditoria(acao);

-- 6. Função para sincronizar dados FROM public.usuarios TO auth.users
-- Esta função atualiza o raw_user_meta_data do Supabase Auth com os dados da tabela
CREATE OR REPLACE FUNCTION sync_user_to_auth(
  p_user_id UUID
) RETURNS void AS $$
DECLARE
  v_usuario public.usuarios;
BEGIN
  -- Obter usuário da tabela
  SELECT * INTO v_usuario FROM public.usuarios WHERE id = p_user_id;
  
  IF v_usuario IS NULL THEN
    RETURN;
  END IF;

  -- Atualizar auth.users com raw_user_meta_data
  UPDATE auth.users
  SET raw_user_meta_data = jsonb_build_object(
    'nome', v_usuario.nome,
    'cargo', v_usuario.cargo,
    'perfil', v_usuario.perfil,
    'permissoes', v_usuario.permissoes,
    'status', v_usuario.status,
    'is_admin', v_usuario.is_admin
  )
  WHERE id = p_user_id;
  
  -- Registrar na auditoria
  INSERT INTO public.usuarios_auditoria (usuario_id, acao, dados_novo)
  VALUES (p_user_id, 'sync_to_auth', to_jsonb(v_usuario));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Trigger para sincronizar AUTOMATICAMENTE ao inserir/atualizar
CREATE OR REPLACE FUNCTION trigger_sync_usuario()
RETURNS TRIGGER AS $$
BEGIN
  -- Atualizar updated_at
  NEW.updated_at = now();
  
  -- Sincronizar com auth.users
  PERFORM sync_user_to_auth(NEW.id);
  
  -- Registrar auditoria se é UPDATE
  IF TG_OP = 'UPDATE' THEN
    INSERT INTO public.usuarios_auditoria (usuario_id, acao, dados_anterior, dados_novo)
    VALUES (NEW.id, 'update', to_jsonb(OLD), to_jsonb(NEW));
  END IF;
  
  -- Registrar auditoria se é INSERT
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.usuarios_auditoria (usuario_id, acao, dados_novo)
    VALUES (NEW.id, 'insert', to_jsonb(NEW));
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. Dropar trigger antigo se existir
DROP TRIGGER IF EXISTS trg_sync_usuario ON public.usuarios;

-- 9. Criar trigger
CREATE TRIGGER trg_sync_usuario
AFTER INSERT OR UPDATE ON public.usuarios
FOR EACH ROW
EXECUTE FUNCTION trigger_sync_usuario();

-- 10. Função para atualizar último login
CREATE OR REPLACE FUNCTION update_last_login(p_user_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.usuarios
  SET last_login = now()
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. Tabela de permissões padrão por perfil (referência)
-- Isso facilita regenerar permissões se necessário
CREATE TABLE IF NOT EXISTS public.perfil_permissoes (
  id SERIAL PRIMARY KEY,
  perfil TEXT NOT NULL UNIQUE,
  permissoes JSONB NOT NULL,
  descricao TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 12. Inserir permissões padrão
DELETE FROM public.perfil_permissoes;

INSERT INTO public.perfil_permissoes (perfil, permissoes, descricao) VALUES
('administrador', '{
  "oficios": {"ver": true, "criar": true, "editar": true, "deletar": true, "aprovar": true, "rejeitar": true, "compartilhar": true},
  "processos": {"ver": true, "criar": true, "editar": true, "deletar": true, "aprovar": true},
  "pesquisas": {"ver": true, "criar": true, "editar": true, "deletar": true, "aprovar": true},
  "documentos": {"ver": true, "criar": true, "editar": true, "deletar": true},
  "secretarias": {"ver": true, "criar": true, "editar": true, "deletar": true},
  "relatorios": {"ver": true, "criar": true, "editar": true, "deletar": true},
  "usuarios": {"ver": true, "criar": true, "editar": true, "deletar": true, "resetar_senha": true},
  "sistema": {"logs": true, "auditoria": true, "configuracoes": true}
}'::jsonb, 'Acesso total ao sistema'),

('diretor_compras', '{
  "oficios": {"ver": true, "criar": true, "editar": true, "deletar": true, "aprovar": true, "rejeitar": true, "compartilhar": true},
  "processos": {"ver": true, "criar": true, "editar": true, "deletar": true, "aprovar": true},
  "pesquisas": {"ver": true, "criar": true, "editar": true, "deletar": true, "aprovar": true},
  "documentos": {"ver": true, "criar": true, "editar": true, "deletar": true},
  "secretarias": {"ver": true, "criar": true, "editar": true, "deletar": true},
  "relatorios": {"ver": true, "criar": true, "editar": true, "deletar": true},
  "usuarios": {"ver": true, "criar": true, "editar": true, "deletar": true, "resetar_senha": true},
  "sistema": {"logs": true, "auditoria": true, "configuracoes": true}
}'::jsonb, 'Acesso total ao sistema - Diretor de Compras'),

('setor_compras', '{
  "oficios": {"ver": true, "criar": true, "editar": true, "deletar": false, "aprovar": false, "rejeitar": false, "compartilhar": false},
  "processos": {"ver": true, "criar": true, "editar": true, "deletar": false, "aprovar": false},
  "pesquisas": {"ver": true, "criar": true, "editar": true, "deletar": false, "aprovar": false},
  "documentos": {"ver": true, "criar": true, "editar": true, "deletar": false},
  "secretarias": {"ver": false, "criar": false, "editar": false, "deletar": false},
  "relatorios": {"ver": true, "criar": true, "editar": false, "deletar": false},
  "usuarios": {"ver": false, "criar": false, "editar": false, "deletar": false, "resetar_senha": false},
  "sistema": {"logs": false, "auditoria": false, "configuracoes": false}
}'::jsonb, 'Acesso limitado a compras'),

('secretaria', '{
  "oficios": {"ver": true, "criar": true, "editar": true, "deletar": false, "aprovar": false, "rejeitar": false, "compartilhar": false},
  "processos": {"ver": true, "criar": false, "editar": false, "deletar": false, "aprovar": false},
  "pesquisas": {"ver": true, "criar": false, "editar": false, "deletar": false, "aprovar": false},
  "documentos": {"ver": true, "criar": true, "editar": true, "deletar": false},
  "secretarias": {"ver": false, "criar": false, "editar": false, "deletar": false},
  "relatorios": {"ver": true, "criar": false, "editar": false, "deletar": false},
  "usuarios": {"ver": false, "criar": false, "editar": false, "deletar": false, "resetar_senha": false},
  "sistema": {"logs": false, "auditoria": false, "configuracoes": false}
}'::jsonb, 'Acesso limitado a secretaria'),

('visualizador', '{
  "oficios": {"ver": true, "criar": false, "editar": false, "deletar": false, "aprovar": false, "rejeitar": false, "compartilhar": false},
  "processos": {"ver": true, "criar": false, "editar": false, "deletar": false, "aprovar": false},
  "pesquisas": {"ver": true, "criar": false, "editar": false, "deletar": false, "aprovar": false},
  "documentos": {"ver": true, "criar": false, "editar": false, "deletar": false},
  "secretarias": {"ver": false, "criar": false, "editar": false, "deletar": false},
  "relatorios": {"ver": true, "criar": false, "editar": false, "deletar": false},
  "usuarios": {"ver": false, "criar": false, "editar": false, "deletar": false, "resetar_senha": false},
  "sistema": {"logs": false, "auditoria": false, "configuracoes": false}
}'::jsonb, 'Apenas visualização');

-- 13. Função para regenerar permissões baseado no perfil
CREATE OR REPLACE FUNCTION regenerate_permissions(p_user_id UUID)
RETURNS void AS $$
DECLARE
  v_perfil TEXT;
  v_permissoes JSONB;
BEGIN
  -- Obter perfil do usuário
  SELECT usuarios.perfil, perfil_permissoes.permissoes
  INTO v_perfil, v_permissoes
  FROM public.usuarios
  LEFT JOIN public.perfil_permissoes ON usuarios.perfil = perfil_permissoes.perfil
  WHERE usuarios.id = p_user_id;
  
  IF v_perfil IS NOT NULL THEN
    -- Atualizar permissões
    UPDATE public.usuarios
    SET permissoes = v_permissoes
    WHERE id = p_user_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 14. Criar função para sincronizar FROM auth.users TO public.usuarios
-- (para quando um usuário é criado diretamente no Supabase Auth)
CREATE OR REPLACE FUNCTION sync_auth_to_usuarios(
  p_user_id UUID,
  p_email TEXT,
  p_raw_user_meta_data JSONB
) RETURNS void AS $$
BEGIN
  INSERT INTO public.usuarios (
    id,
    email,
    nome,
    cargo,
    perfil,
    permissoes,
    status
  ) VALUES (
    p_user_id,
    p_email,
    COALESCE(p_raw_user_meta_data->>'nome', 'Usuário sem nome'),
    p_raw_user_meta_data->>'cargo',
    COALESCE(p_raw_user_meta_data->>'perfil', 'visualizador'),
    COALESCE(p_raw_user_meta_data->'permissoes', '{}'::jsonb),
    COALESCE(p_raw_user_meta_data->>'status', 'convite_enviado')
  ) ON CONFLICT (id) DO UPDATE
  SET
    nome = EXCLUDED.nome,
    cargo = EXCLUDED.cargo,
    perfil = EXCLUDED.perfil,
    status = EXCLUDED.status,
    updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 15. Mensagem de sucesso
SELECT 'Tabelas, triggers e funções criadas com sucesso!' as resultado;

-- 16. Verificar dados (opcional)
-- SELECT * FROM public.perfil_permissoes;
