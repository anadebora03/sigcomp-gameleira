# 🚀 Gerenciamento Automático - Referência Rápida

## Setup Inicial (Uma Única Vez)

```
1. Abra: scripts/supabase-usuarios-sync.sql
2. Copy all → paste no Supabase SQL Editor
3. Execute (Ctrl+Enter)
4. Pronto! ✅ Tudo funcionará automaticamente
```

---

## Operações Comuns

### Criar Admin

**Via Interface:**
1. Usuários → Novo Usuário
2. Nome: "Geraldo Silva"
3. Perfil: "Administrador"
4. Criar → Automático: permissões geradas, sincronizadas, email enviado

**Via Backend:**
```typescript
await createUserWithInvite({
  email: 'admin@gameleira.pe.gov.br',
  nome: 'Geraldo Silva',
  cargo: 'Administrador',
  perfil: 'administrador'
});
// ✅ Tudo automático
```

### Criar Diretor

**Via Interface:**
1. Usuários → Novo Usuário
2. Perfil: "Diretor do Setor de Compras"
3. Criar → Automático: acesso total granted

### Editar Perfil

**Via Interface:**
1. Usuários → Editar (ícone lápis)
2. Mudar "Setor de Compras" para "Administrador"
3. Salvar → Automático: permissões regeneradas

### Bloquear Usuário

**Via Interface:**
1. Usuários → Editar
2. Status: "Bloqueado"
3. Salvar → Automático: próximo login rejeitado

---

## Verificação Rápida

### Check no Supabase

```sql
-- Ver todos os usuários
SELECT id, email, nome, perfil, status FROM public.usuarios;

-- Ver permissões de um usuário
SELECT permissoes FROM public.usuarios 
WHERE email = 'user@gameleira.pe.gov.br';

-- Ver auditoria (últimas 10 mudanças)
SELECT * FROM public.usuarios_auditoria 
ORDER BY created_at DESC LIMIT 10;

-- Regenerar permissões de um usuário (se necessário)
SELECT regenerate_permissions('uuid...');
```

### Check no Frontend

```typescript
// Ver perfil do usuário logado
const { perfil, permissoes } = usePermissions();
console.log('Perfil:', perfil);
console.log('Tem usuarios.ver:', permissoes['usuarios.ver']);

// Listar todos os usuários
const { usuarios, loading } = useSupabaseUsers();
usuarios.forEach(u => console.log(u.nome, u.perfil));
```

---

## O Que Funciona Automaticamente

| Ação | Automático? | Detalhes |
|------|-----------|----------|
| Criar usuário | ✅ | Auth → DB → Sync → Permissions → Email |
| Editar usuário | ✅ | Update DB → Trigger → Sync → Audit |
| Mudar perfil | ✅ | Update → Regen perms → Sync → Audit |
| Mudar status | ✅ | Update → Sync |
| Gerar permissões | ✅ | Automático ao criar/mudar perfil |
| Sincronizar com Auth | ✅ | Trigger automático |
| Registrar auditoria | ✅ | Trigger automático |
| Email de convite | ✅ | Ao criar novo usuário |

---

## Perfis e Acesso Automático

```
administrador        → Acesso Total ✅
diretor_compras      → Acesso Total ✅
setor_compras        → Compras + Pesquisas + Relatórios
secretaria           → Ofícios + Documentos + Relatórios
visualizador         → Apenas visualização
```

---

## Troubleshooting Rápido

| Problema | Solução |
|----------|---------|
| Menu não mostra Usuarios/Logs | Logout → Login |
| Permissões não atualizaram | Espere 2s (trigger) |
| Email não foi enviado | Check: dados no Supabase → auth rules |
| Usuário não aparece na lista | Refresh page (F5) |

---

## Próximas Ações

1. Execute `supabase-usuarios-sync.sql`
2. Crie um usuário admin
3. Faça login
4. Teste criar outro usuário
5. Pronto! ✅

---

**Tudo automático. Zero configuração manual de metadata.** 🎉
