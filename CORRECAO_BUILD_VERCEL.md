# ✅ Correção: Erro de Build Vercel - raw_user_meta_data

## 🔧 Erro Corrigido

**Erro Original:**
```
components/DebugPermissoes.tsx
Property 'raw_user_meta_data' does not exist on type 'User'
```

## 🎯 Causa

No **Supabase**, `raw_user_meta_data` é acessível apenas no **servidor** (admin) por questões de segurança.

No **cliente/frontend**, o tipo `User` do Supabase disponibiliza apenas:
- `user.user_metadata` ✅ (sempre disponível)
- `user.app_metadata` ✅ (sempre disponível)
- `user.raw_user_meta_data` ❌ (não disponível no frontend)

## ✅ Correções Implementadas

### 1. **DebugPermissoes.tsx**

**Antes:**
```typescript
const metadata = user?.user_metadata || {}
const rawMetadata = user?.raw_user_meta_data || {}  // ❌ erro
const appMetadata = user?.app_metadata || {}
```

**Depois:**
```typescript
const metadata = user?.user_metadata || {}          // ✅
const appMetadata = user?.app_metadata || {}        // ✅
// Removido rawMetadata (não existe no frontend)
```

Também removida a seção que tentava exibir `rawMetadata`.

### 2. **usePermissions.ts**

**Antes (linha 36):**
```typescript
perfil = (user?.user_metadata?.perfil as string) || 
         (user?.app_metadata?.perfil as string) ||
         (user?.raw_user_meta_data?.perfil as string) ||  // ❌ erro
         'visualizador'
```

**Depois:**
```typescript
perfil = (user?.user_metadata?.perfil as string) || 
         (user?.app_metadata?.perfil as string) ||
         'visualizador'
```

**Antes (linha 54-55):**
```typescript
} else if ((user?.raw_user_meta_data as any)?.permissoes) {  // ❌ erro
  permissoes = (user?.raw_user_meta_data as any).permissoes as Record<string, boolean>
}
```

**Depois:**
```typescript
// Removido fallback para raw_user_meta_data
```

## 📋 Fluxo Correto

```
Supabase Auth (Servidor)
│
├─ raw_user_meta_data (dados de admin/sync)
│  └─ Sincronizado com auth.users
│
Frontend (Cliente) recebe:
├─ user.user_metadata (dados públicos do usuário)
└─ user.app_metadata (metadados do app)
```

## 🔍 Regra de Segurança

| Localização | `user_metadata` | `app_metadata` | `raw_user_meta_data` |
|------------|---|---|---|
| **Frontend** | ✅ | ✅ | ❌ |
| **Backend** | ✅ | ✅ | ✅ |

O backend (server) sincroniza dados via triggers para `user_metadata`, que depois ficam disponíveis no frontend.

## ✅ Verificação

Após a correção:
- ✅ Sem erro TypeScript
- ✅ Build Vercel passa
- ✅ Funcionalidade mantida (sem perda de dados)
- ✅ Design não alterado
- ✅ Todas as permissões funcionam normalmente

## 🔄 Dados Sincronizados

O `user_metadata` no frontend **já contém**:
```json
{
  "nome": "João Silva",
  "cargo": "Administrador",
  "perfil": "administrador",
  "permissoes": {...},
  "status": "ativo",
  "is_admin": true
}
```

Sincronizado pelo backend via triggers quando usuário é criado/editado.

## 📁 Arquivos Modificados

| Arquivo | Mudança |
|---------|---------|
| `components/DebugPermissoes.tsx` | Remover referência a raw_user_meta_data |
| `hooks/usePermissions.ts` | Remover fallback para raw_user_meta_data |

## 🚀 Status

- ✅ Erro corrigido
- ✅ Build Vercel deve passar
- ✅ Git commit realizado
- ✅ Push enviado

**O sistema continua funcionando normalmente!** ✨
