-- ============================================================
-- SIGCOMP — Tabela de documentos (execute no SQL Editor)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.documentos (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome          TEXT NOT NULL,
  caminho       TEXT NOT NULL UNIQUE,        -- path no Storage
  mime_type     TEXT NOT NULL,
  tamanho       BIGINT NOT NULL,
  modulo        TEXT NOT NULL,               -- 'oficios' | 'processos' | 'pesquisas' | 'contratos'
  vinculo_id    TEXT NOT NULL,               -- numero do oficio/processo
  vinculo_num   TEXT NOT NULL,               -- numero legível (OFF-2025-0001)
  secretaria_id INTEGER,
  uploaded_by   UUID REFERENCES auth.users,
  uploaded_at   TIMESTAMPTZ DEFAULT now()
);

-- Índices para busca rápida
CREATE INDEX IF NOT EXISTS idx_documentos_vinculo ON public.documentos(vinculo_id);
CREATE INDEX IF NOT EXISTS idx_documentos_modulo  ON public.documentos(modulo);
CREATE INDEX IF NOT EXISTS idx_documentos_user    ON public.documentos(uploaded_by);

-- RLS: usuários autenticados podem ver e fazer upload
ALTER TABLE public.documentos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Autenticados leem documentos" ON public.documentos
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Autenticados inserem documentos" ON public.documentos
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = uploaded_by);

CREATE POLICY "Dono ou admin pode deletar" ON public.documentos
  FOR DELETE TO authenticated USING (
    auth.uid() = uploaded_by OR
    (SELECT raw_user_meta_data->>'perfil' FROM auth.users WHERE id = auth.uid()) = 'administrador'
  );

-- Storage: política no bucket 'documentos'
-- Execute também no Storage > Policies:
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documentos',
  'documentos',
  false,               -- bucket PRIVADO
  52428800,            -- 50 MB limite por arquivo
  ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/jpeg','image/png','image/gif','image/webp',
    'application/zip','application/x-zip-compressed'
  ]
) ON CONFLICT (id) DO NOTHING;

-- Políticas do Storage
CREATE POLICY "Autenticados fazem upload" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'documentos');

CREATE POLICY "Autenticados leem arquivos" ON storage.objects
  FOR SELECT TO authenticated USING (bucket_id = 'documentos');

CREATE POLICY "Dono pode deletar arquivo" ON storage.objects
  FOR DELETE TO authenticated USING (
    bucket_id = 'documentos' AND auth.uid()::text = (storage.foldername(name))[1]
  );
