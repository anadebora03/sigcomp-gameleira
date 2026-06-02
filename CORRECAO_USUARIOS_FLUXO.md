# Correção: Fluxo de Usuários e Nova Senha

**Commit**: `32194a1`  
**Data**: 2 de junho de 2026

---

## 🔴 PROBLEMA 1: Usuário não aparece na listagem

### Causa Identificada
- O convite era enviado com sucesso
- O Supabase não retornava erro
- Mas a tela `UsuariosPage` continuava mostrando 0 usuário(s)

### Investigação Realizada
Verifiquei o fluxo completo:

1. **`app/api/users/invite/route.ts`** (linhas 45-68):
   - ✅ Cria usuário em `auth.users` via `inviteUserByEmail`
   - ✅ Insere em `public.usuarios` com status `convite_enviado`
   - ✅ Sincronização automática via trigger

2. **`app/api/users/list/route.ts`** (nova rota criada):
   - ✅ Usa `createAdminClient()` com service role
   - ✅ Consulta apenas `public.usuarios`
   - ✅ Sem acesso direto a `auth.users`

3. **`services/auth.ts` → `listUsers()`** (linha 187-207):
   - ✅ Alterado de query direta para chamar `/api/users/list`
   - ✅ Backend faz SELECT com admin client

### Solução Implementada

**Arquivo**: [app/api/users/list/route.ts](app/api/users/list/route.ts)
```typescript
// Query admin em public.usuarios
const { data, error, count } = await supabase
  .from('usuarios')
  .select('*', { count: 'exact' })
  .order('created_at', { ascending: false })
  .range(offset, offset + limit - 1)
```

**Logs Adicionados**:
- `[api/users/list] GET recebido` - requisição
- `[api/users/list] Query executada` - resultado com status
- `[api/users/list] ERRO do Supabase` - erros detalhados
- `[api/users/list] Retornando X usuários` - sucesso

**Fluxo Completo**:
```
UsuariosPage (carrega)
  ↓
useSupabaseUsers() hook
  ↓
listUsers() em services/auth.ts
  ↓
GET /api/users/list (backend)
  ↓
createAdminClient() com service role
  ↓
SELECT * FROM public.usuarios
  ↓
Retorna ao frontend com cache
```

---

## 🔴 PROBLEMA 2: Redirecionamento prematuro em /nova-senha

### Causa Identificada
**Arquivo**: [components/pages/NovaSenhaPage.tsx](components/pages/NovaSenhaPage.tsx) (linhas 18-24)

```typescript
// ❌ PROBLEMA: useEffect redireciona se !user após 2 segundos
useEffect(() => {
  const timer = setTimeout(() => {
    if (!user) router.push('/login')
  }, 2000)
  return () => clearTimeout(timer)
}, [user])
```

**Por que quebrava**:
1. Usuário clica no link de convite: `https://...nova-senha?code=...`
2. Supabase envia `token_hash` como parâmetro
3. `AuthProvider.tsx` chama `getSession()`, que retorna `null` (token não é sessão automaticamente)
4. `user` fica `null`
5. `useEffect` redireciona para `/login` após 2 segundos
6. Usuário nunca vê o formulário de definir senha

### Solução Implementada

**Adicionada detecção de token na URL**:
```typescript
const [temToken, setTemToken] = useState(false)

useEffect(() => {
  const params = new URLSearchParams(window.location.search)
  const code = params.get('code')
  const type = params.get('type')
  
  console.log('[NovaSenhaPage] URL params:', { code, type, hasUser: !!user })
  
  // Se tem token de convite/recovery, não redirecionar
  if (code || type === 'invite' || type === 'recovery') {
    setTemToken(true)
    console.log('[NovaSenhaPage] Token de convite/recuperação detectado')
    return
  }
  
  // Só redirecionar se NÃO tem token e NÃO tem usuário
  const timer = setTimeout(() => {
    if (!user) {
      console.log('[NovaSenhaPage] Sem token e sem usuário, redirecionando para /login')
      router.push('/login')
    }
  }, 3000)
  return () => clearTimeout(timer)
}, [user])
```

**Logs Adicionados**:
- `[NovaSenhaPage] URL params` - detecta código/tipo
- `[NovaSenhaPage] Token de convite/recuperação detectado` - token encontrado
- `[NovaSenhaPage] Atualizando senha...` - submissão
- `[NovaSenhaPage] Senha atualizada com sucesso` - sucesso
- `[NovaSenhaPage] Redirecionando para login` - redireção final

---

## 📊 Logs Detalhados Adicionados para Debug

### 1. **app/api/users/invite/route.ts** (linhas 9-76)
```
[invite] POST recebido
[invite] Criando admin client
[invite] Admin client criado com sucesso
[invite] Usuário criado em auth.users: { userId, email }
[invite] INSERT em public.usuarios: { userId, email, success, error }
[invite] Sucesso completo: auth.users + public.usuarios criados
```

### 2. **components/AuthProvider.tsx** (linhas 13-38)
```
[AuthProvider] Inicializando...
[AuthProvider] getSession retornou: { hasSession, user, email }
[AuthProvider] onAuthStateChange: { event, hasSession, user, email }
```

### 3. **lib/supabase/middleware.ts** (linhas 27-43)
```
[middleware] Rota acessada: { pathname, hasUser, userId }
[middleware] Sem usuário e não é rota pública, redirecionando para /login
[middleware] Usuário logado em rota pública, redirecionando para /
```

### 4. **app/api/users/[id]/route.ts** (PATCH e DELETE)
```
[api/users/[id] PATCH] Recebido: { userId, body }
[api/users/[id] PATCH] UPDATE resultado: { userId, success, error }
[api/users/[id] PATCH] regenerate_permissions: { userId, success, error }

[api/users/[id] DELETE] Recebido: { userId }
[api/users/[id] DELETE] DELETE resultado: { userId, success, error }
```

---

## ✅ Validações Realizadas

- ✅ `npm run build` passou sem erros
- ✅ Rotas API compiladas: `/api/users/list`, `/api/users/[id]`, `/api/users/invite`
- ✅ Pages atualizadas: `/nova-senha`, `/login`, `/recuperar-senha`
- ✅ Middleware atualizado com logs
- ✅ Git commit e push realizado

---

## 🧪 Como Testar

### Teste 1: Criar Usuário e Verificar Listagem
1. Ir para tela de Usuários
2. Cliar "Novo Usuário"
3. Preencher dados
4. Clicar "Criar e Enviar Convite"
5. ✅ Esperado: usuário aparece imediatamente na lista
6. 📊 Verificar logs no terminal: `[api/users/list] Retornando X usuários`

### Teste 2: Fluxo de Nova Senha
1. Receber email de convite
2. Clicar no link de convite
3. ✅ Esperado: formulário de "Nova Senha" aparece (não redireciona)
4. Preencher senha
5. Clicar "Definir Nova Senha"
6. ✅ Esperado: "Senha alterada!" → redireciona para /login
7. 📊 Verificar logs: `[NovaSenhaPage] Token de convite/recuperação detectado`

---

## 📁 Arquivos Modificados

| Arquivo | Linhas | Mudança |
|---------|--------|---------|
| `app/api/users/invite/route.ts` | 45-76 | ✅ Logs detalhados de INSERT |
| `app/api/users/list/route.ts` | ✨ NOVO | ✅ Rota server-side para listagem |
| `services/auth.ts` | 187-207 | ✅ listUsers() chama /api/users/list |
| `components/pages/NovaSenhaPage.tsx` | 1-38 | ✅ Detecção de token, impede redirecionamento prematuro |
| `components/AuthProvider.tsx` | 13-38 | ✅ Logs detalhados |
| `lib/supabase/middleware.ts` | 27-43 | ✅ Logs detalhados |
| `app/api/users/[id]/route.ts` | 1-80 | ✅ Logs PATCH/DELETE |

---

## 📌 Próximos Passos

1. **Monitorar logs em produção** durante testes
2. **Se problema persistir**: verificar RLS policies em `public.usuarios`
3. **Remover logs temporários** após confirmação que tudo funciona
4. **Implementar retry logic** para listagem se falhar

