-- SIGCOMP — Diagnóstico para a sprint de Perfil (SOMENTE LEITURA, não altera nada)
-- Cole no SQL Editor, rode e copie o resultado inteiro (uma tabela com as colunas "secao" e "info").

SELECT '1 colunas' AS secao, table_name || '.' || column_name || ' : ' || data_type AS info
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name IN ('usuarios', 'perfis')

UNION ALL
SELECT '2 policies', tablename || ' | ' || policyname || ' | ' || cmd || ' | USING: ' || coalesce(qual, '-') || ' | CHECK: ' || coalesce(with_check, '-')
FROM pg_policies
WHERE (schemaname = 'public' AND tablename IN ('usuarios', 'perfis')) OR (schemaname = 'storage' AND tablename = 'objects')

UNION ALL
SELECT '3 triggers', event_object_table || ' | ' || trigger_name || ' | ' || event_manipulation || ' | ' || action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'public' AND event_object_table IN ('usuarios', 'perfis')

UNION ALL
SELECT '4 buckets', id || ' | public=' || public::text || ' | limite=' || coalesce(file_size_limit::text, '-') || ' | tipos=' || coalesce(array_to_string(allowed_mime_types, ','), '-')
FROM storage.buckets

UNION ALL
SELECT '5 usuarios', email || ' | perfil=' || coalesce(perfil, '-') || ' | nome=' || coalesce(nome, '-')
FROM public.usuarios

UNION ALL
SELECT '6 contas sem linha em usuarios', u.email
FROM auth.users u
WHERE NOT EXISTS (SELECT 1 FROM public.usuarios x WHERE x.id = u.id)

ORDER BY 1, 2;
