-- ============================================================
-- SIGCOMP — Controle de Ordem de Fornecimento
-- Execute este script no SQL Editor do Supabase
-- Reutiliza: processos, secretarias, auth.users, bucket/tabela "documentos"
-- ============================================================

-- Função auxiliar (já existe nas migrations anteriores; recriada por segurança)
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- Tabela de ordens de fornecimento
CREATE TABLE IF NOT EXISTS public.ordens_fornecimento (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero_ordem TEXT NOT NULL UNIQUE,
  processo_id UUID REFERENCES public.processos(id) ON DELETE SET NULL,
  -- Não existe tabela de fornecedores: o fornecedor vem do contrato do processo (processos.contrato->>'empresa')
  fornecedor TEXT NOT NULL,
  fornecedor_cnpj TEXT,
  secretaria_id BIGINT REFERENCES public.secretarias(legacy_id) ON DELETE SET NULL,
  data_emissao DATE,
  data_envio DATE NOT NULL,
  prazo_final_entrega DATE NOT NULL,
  data_entrega DATE,
  -- Situação gravada. Pendente / Próximo do vencimento / Vencendo hoje / Atrasado são calculados pela data atual.
  status TEXT NOT NULL DEFAULT 'aberta' CHECK (status IN ('aberta', 'entregue', 'cancelada')),
  observacoes TEXT,
  obs_entrega TEXT,
  -- Metadados do PDF no Storage (bucket "documentos"): {id, nome, caminho, mime_type, tamanho, data}. Nunca o conteúdo.
  arquivo JSONB,
  comprovante_entrega JSONB,
  created_by UUID REFERENCES auth.users(id) DEFAULT auth.uid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT ordens_prazo_apos_envio CHECK (prazo_final_entrega >= data_envio),
  CONSTRAINT ordens_entregue_tem_data CHECK (status <> 'entregue' OR data_entrega IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_ordens_processo ON public.ordens_fornecimento(processo_id);
CREATE INDEX IF NOT EXISTS idx_ordens_secretaria ON public.ordens_fornecimento(secretaria_id);
CREATE INDEX IF NOT EXISTS idx_ordens_prazo ON public.ordens_fornecimento(prazo_final_entrega);
CREATE INDEX IF NOT EXISTS idx_ordens_status ON public.ordens_fornecimento(status);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'ordens_fornecimento_set_updated_at'
  ) THEN
    CREATE TRIGGER ordens_fornecimento_set_updated_at
      BEFORE UPDATE ON public.ordens_fornecimento
      FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
END
$$;

-- ============================================================
-- RLS: usuários autenticados trabalham com as ordens.
-- O controle fino (ver/criar/editar/excluir/entregar) é feito pelas permissões do sistema (ordens.*).
ALTER TABLE public.ordens_fornecimento ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Autenticados veem ordens" ON public.ordens_fornecimento;
CREATE POLICY "Autenticados veem ordens" ON public.ordens_fornecimento
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Autenticados criam ordens" ON public.ordens_fornecimento;
CREATE POLICY "Autenticados criam ordens" ON public.ordens_fornecimento
  FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());

DROP POLICY IF EXISTS "Autenticados atualizam ordens" ON public.ordens_fornecimento;
CREATE POLICY "Autenticados atualizam ordens" ON public.ordens_fornecimento
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Autenticados excluem ordens" ON public.ordens_fornecimento;
CREATE POLICY "Autenticados excluem ordens" ON public.ordens_fornecimento
  FOR DELETE TO authenticated USING (true);

-- ============================================================
-- Conferência (rode depois e veja se aparecem as 4 policies):
-- SELECT policyname, cmd FROM pg_policies WHERE tablename = 'ordens_fornecimento';
