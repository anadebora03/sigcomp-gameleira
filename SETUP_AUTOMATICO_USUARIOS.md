# 🤖 Gerenciamento Automático de Usuários e Perfis

## Visão Geral

Sistema completo de gerenciamento automático de usuários com sincronização bidirecional entre:
- **Supabase Auth** (raw_user_meta_data)
- **Tabela `usuarios`** (database)
- **Permissões** (regeneradas automaticamente)

**Benefícios:**
✅ Criar/editar usuário → sincronização automática  
✅ Perfil → permissões geradas automaticamente  
✅ Admin/Diretor → acesso total automaticamente  
✅ Sem precisar editar metadata manualmente  
✅ Auditoria de todas as alterações  
✅ Status de usuário rastreado (convite, ativo, bloqueado)

---

## 🚀 Setup Inicial (Uma Única Vez)

### Passo 1: Execute o Script SQL

1. Abra [supabase.com](https://supabase.com) → seu projeto
2. Vá em **SQL Editor** → **New Query**
3. Abra o arquivo: `scripts/supabase-usuarios-sync.sql`
4. **Copie TODO** o conteúdo
5. **Cole** no editor SQL do Supabase
6. **Execute** (Ctrl+Enter ou botão "Run")

**O script vai criar:**
- ✅ Tabela `usuarios` com sincronização automática
- ✅ Tabela `usuarios_auditoria` para rastrear tudo
- ✅ Tabela `perfil_permissoes` com permissões padrão
- ✅ **Triggers automáticos** para sincronização
- ✅ **Funções PL/pgSQL** para gerenciar permissões
- ✅ **Políticas RLS** para segurança

### Passo 2: Verificar Criação

Após executar, verifique:

```sql
-- Verificar se tabela foi criada
SELECT * FROM public.perfil_permissoes LIMIT 1;

-- Deve retornar 5 registros (um para cada perfil)
SELECT COUNT(*) FROM public.perfil_permissoes;
```

---

## 📝 Como Criar um Usuário

### Opção 1: Via Interface do Sistema (Automático)

1. Vá em **Usuários** no menu
2. Clique em **Novo Usuário**
3. Preencha:
   - Nome Completo ✓
   - Cargo (opcional)
   - Email ✓
   - Perfil ✓
4. Clique em **Criar e Enviar Convite**

**Automaticamente:**
- ✅ Usuário criado no Supabase Auth
- ✅ Dados salvos na tabela `usuarios`
- ✅ Permissões geradas baseado no perfil
- ✅ Sincronizado com raw_user_meta_data
- ✅ E-mail de convite enviado
- ✅ Auditoria registrada

### Opção 2: Via SQL (Para múltiplos usuários)

```sql
-- Inserir usuário direto na tabela
INSERT INTO public.usuarios (
  id,
  email,
  nome,
  cargo,
  perfil,
  status
) VALUES (
  gen_random_uuid(),
  'novo-user@gameleira.pe.gov.br',
  'Nome do Usuário',
  'Cargo',
  'setor_compras',
  'convite_enviado'
);
-- Trigger sincroniza automaticamente!
```

---

## 🔄 Como Editar um Usuário

### Via Interface

1. Vá em **Usuários**
2. Clique no botão **editar** (ícone de lápis)
3. Altere o que desejar
4. Clique em **Salvar**

**Automaticamente:**
- ✅ Dados atualizados
- ✅ Se perfil mudou → permissões regeneradas
- ✅ Sincronizado com auth.users
- ✅ Auditoria registrada
- ✅ Nenhuma edição manual necessária

### Via SQL

```sql
-- Editar perfil de um usuário
UPDATE public.usuarios
SET perfil = 'administrador'
WHERE email = 'user@gameleira.pe.gov.br';

-- Trigger regenera permissões automaticamente!
```

---

## 🎯 Automação de Perfis

### Admin: Acesso Total Automático ✅

```
perfil = 'administrador'
↓ (trigger regenera)
permissoes = { todos os módulos: true }
↓ (sincroniza)
auth.users.raw_user_meta_data = { perfil: 'administrador', is_admin: true }
↓
Menu lateral mostra: Ofícios, Usuarios, Logs, tudo
```

### Diretor do Setor de Compras: Acesso Total Automático ✅

```
perfil = 'diretor_compras'
↓ (trigger regenera)
permissoes = { todos os módulos: true }
↓ (sincroniza)
auth.users.raw_user_meta_data = { perfil: 'diretor_compras', is_admin: false }
↓
Menu lateral mostra: Ofícios, Usuarios, Logs, tudo
```

### Setor de Compras: Permissões Automáticas ✅

```
perfil = 'setor_compras'
↓ (trigger regenera)
permissoes = { 
  oficios: {ver:true, criar:true, editar:true},
  processos: {ver:true, criar:true},
  // ... conforme configurado em perfil_permissoes
}
↓ (sincroniza)
auth.users.raw_user_meta_data = { perfil: 'setor_compras' }
↓
Menu lateral mostra: Ofícios, Processos, Pesquisas, Relatórios (sem Usuarios/Logs)
```

---

## 🔒 Sistema de Sincronização

### Fluxo Automático

```
┌─────────────────────────────────────────────────────────┐
│ 1. Inserir/Atualizar em tabela `usuarios`                │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ↓
┌─────────────────────────────────────────────────────────┐
│ 2. Trigger `trg_sync_usuario` é acionado                │
│    - Atualiza `updated_at`                              │
│    - Executa `sync_user_to_auth()`                      │
│    - Registra auditoria                                 │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ↓
┌─────────────────────────────────────────────────────────┐
│ 3. Função `sync_user_to_auth()` é executada             │
│    - Lê dados da tabela `usuarios`                      │
│    - Regenera permissões se necessário                  │
│    - Atualiza auth.users.raw_user_meta_data            │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ↓
┌─────────────────────────────────────────────────────────┐
│ 4. Frontend pega dados atualizados                       │
│    - Hook `useSupabaseUsers` carrega do Supabase        │
│    - `useAuth` pega session/metadata                    │
│    - Menu e permissões controlados automaticamente      │
└─────────────────────────────────────────────────────────┘
```

### Tabelas Envolvidas

```
auth.users (Supabase Auth)
├── id (UUID)
├── email
├── raw_user_meta_data → {nome, cargo, perfil, permissoes, is_admin}
└── (sincronizado por trigger)

public.usuarios (Database)
├── id (UUID, FK → auth.users)
├── email
├── nome
├── cargo
├── perfil
├── permissoes (JSONB)
├── status
├── is_admin (GENERATED)
├── created_at, updated_at, last_login
└── (fonte de verdade)

public.perfil_permissoes (Referência)
├── perfil (administrador, diretor_compras, setor_compras, secretaria, visualizador)
├── permissoes (JSON padrão para cada perfil)
└── (usada pelos triggers para regenerar)

public.usuarios_auditoria (Auditoria)
├── usuario_id
├── acao (insert, update, sync_to_auth)
├── dados_anterior, dados_novo
├── realizado_por
└── created_at
```

---

## 🛠️ Funções Disponíveis

### No Backend (services/auth.ts)

```typescript
// Criar usuário
await createUserWithInvite({
  email: 'user@gameleira.pe.gov.br',
  nome: 'João Silva',
  cargo: 'Gerente',
  perfil: 'setor_compras'
});

// Editar usuário
await updateUser({
  userId: 'uuid...',
  nome: 'João Silva Atualizado',
  perfil: 'administrador'
});

// Mudar status
await changeUserStatus(userId, 'bloqueado');

// Listar usuários
await listUsers(50, 0);

// Obter usuário
await getUser(userId);

// Buscar por perfil
await getUsersByProfile('administrador');

// Registrar login
await recordLogin(userId);
```

### No Frontend (hooks/useSupabaseUsers.ts)

```typescript
const {
  // Estado
  usuarios,
  loading,
  error,
  
  // Ações
  createUser,
  editUser,
  updateStatus,
  deleteUser,
  loadUsuarios,
  
  // Helpers
  getPerfisDisponiveis(),
  getPermissoesForPerfil(perfil),
} = useSupabaseUsers();
```

---

## 📊 Verificar Sincronização

### Via Supabase Dashboard

1. Vá em **Table Editor**
2. Abra `public.usuarios`
3. Verifique se usuários aparecem com:
   - ✅ perfil correto
   - ✅ permissoes preenchidas (JSONB)
   - ✅ status correto
   - ✅ is_admin gerado automaticamente

### Verificar Auditoria

```sql
-- Ver todas as mudanças de um usuário
SELECT * FROM public.usuarios_auditoria
WHERE usuario_id = 'uuid...'
ORDER BY created_at DESC;

-- Ver últimas sincronizações
SELECT * FROM public.usuarios_auditoria
WHERE acao = 'sync_to_auth'
ORDER BY created_at DESC LIMIT 10;
```

### Verificar Auth.users

Via **Supabase Dashboard** → **Authentication** → **Users**:
- Clique no usuário
- Vá em **User Metadata**
- Deve conter: `nome`, `cargo`, `perfil`, `permissoes`, `is_admin`

---

## 🎓 Exemplos Práticos

### Exemplo 1: Criar Admin

```typescript
await createUserWithInvite({
  email: 'admin@gameleira.pe.gov.br',
  nome: 'Geraldo Silva',
  cargo: 'Administrador do Sistema',
  perfil: 'administrador'
});

// Resultado automático:
// - ✅ Usuário criado no Auth
// - ✅ Dados em `usuarios` com perfil='administrador'
// - ✅ Permissões = {todos os módulos: true}
// - ✅ is_admin = true
// - ✅ Sincronizado para auth.users.raw_user_meta_data
// - ✅ Menu mostra Usuários, Logs, tudo
```

### Exemplo 2: Criar Setor de Compras e Depois Promover para Diretor

```typescript
// 1. Criar como Setor de Compras
await createUserWithInvite({
  email: 'fulano@gameleira.pe.gov.br',
  nome: 'Fulano de Tal',
  cargo: 'Gerente de Compras',
  perfil: 'setor_compras'
});

// 2. Depois promover para Diretor
await updateUser({
  userId: 'uuid...',
  perfil: 'diretor_compras'
});

// Resultado automático:
// - ✅ Permissões regeneradas automaticamente
// - ✅ Agora vê menu de Usuarios e Logs
// - ✅ Sincronizado para auth.users
// - ✅ Auditoria registra: "Perfil alterado de setor_compras para diretor_compras"
```

### Exemplo 3: Bloquear Usuário

```typescript
await updateStatus(userId, 'bloqueado');

// Resultado automático:
// - ✅ Status atualizado
// - ✅ Sincronizado para auth.users
// - ✅ Na próxima tentativa de login, middleware rejeita
```

---

## ⚠️ Importante

### Quando um usuário faz login:

1. **AuthProvider** obtém session de Supabase
2. **useAuth** armazena user object com raw_user_meta_data
3. **usePermissions** lê perfil e permissões de user_metadata
4. **Sidebar** filtra menu baseado em permissões
5. **recordLogin** registra último login

### O ciclo está completo:

```
Criar usuário → Sincronizar → Login → Ler permissões → Menu
                     ↑___________________________|
                  (sem precisar editar nada)
```

---

## 🔍 Troubleshooting

### Problema: Usuário não vê Usuarios/Logs após criar

**Solução:**
1. Verifique se usuário tem perfil='administrador' ou 'diretor_compras'
2. Faça logout e login novamente
3. Verifique auditoria: `SELECT * FROM public.usuarios_auditoria WHERE usuario_id = '...'`

### Problema: Permissões não atualizam ao mudar perfil

**Solução:**
1. Trigger regenera automaticamente
2. Se não funcionar, execute manualmente:
```sql
SELECT regenerate_permissions('uuid...');
```

### Problema: Auth.users.raw_user_meta_data não tem dados

**Solução:**
1. Verifique se usuário está em tabela `usuarios`
2. Execute manualmente:
```sql
SELECT sync_user_to_auth('uuid...');
```

---

## 📚 Arquivos Relacionados

| Arquivo | Propósito |
|---------|-----------|
| `scripts/supabase-usuarios-sync.sql` | Setup inicial (execute uma vez) |
| `services/auth.ts` | Funções backend |
| `hooks/useSupabaseUsers.ts` | Hook para frontend |
| `hooks/usePermissions.ts` | Verificação de permissões |
| `components/pages/UsuariosPage.tsx` | Interface de usuários |

---

## ✅ Checklist de Implementação

- [ ] Executar `supabase-usuarios-sync.sql` no Supabase SQL Editor
- [ ] Verificar se tabelas foram criadas (`public.usuarios`, `perfil_permissoes`)
- [ ] Criar primeiro usuário admin
- [ ] Fazer login com admin
- [ ] Verificar se menu mostra Usuarios e Logs
- [ ] Criar usuário com outro perfil
- [ ] Verificar se tem permissões corretas
- [ ] Editar perfil de um usuário
- [ ] Verificar se permissões foram regeneradas
- [ ] Verificar auditoria

---

**Tudo pronto!** 🎉 O sistema está 100% automático. Nenhuma edição manual de metadata necessária.
