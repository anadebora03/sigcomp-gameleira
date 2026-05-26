# Correção: Menu Lateral - Usuários e Logs

## 🔍 Problema Identificado

As abas "Usuários" e "Logs" sumiram após as últimas alterações. O motivo:

**Usuários** requer permissão `usuarios.ver`
**Logs** requer permissão `sistema.logs`

Se o usuário logado não tinha essas permissões definidas no `user_metadata` do Supabase, o menu não exibia essas opções.

---

## ✅ Correções Implementadas

### 1. **Sidebar Melhorada** (`components/Sidebar.tsx`)

**Antes:**
```typescript
const navVisivel = NAV.filter(item => {
  if (!item.permissao) return true
  return tem(item.permissao)
})
```

**Depois:**
```typescript
// Admin e Diretor SEMPRE veem tudo
const isAdminOrDirector = perfil === 'administrador' || perfil === 'diretor_compras'

const navVisivel = NAV.filter(item => {
  if (!item.permissao) return true              // Sem permissão = sempre visível
  if (isAdminOrDirector) return true            // Admin/Diretor = sempre visível
  return tem(item.permissao)                    // Outros = verificar permissão
})
```

**Benefício:** Admin e Diretor SEMPRE veem **Usuários** e **Logs**, independente do `user_metadata`.

### 2. **usePermissions Robusto** (`hooks/usePermissions.ts`)

**Melhorias:**
- Procura perfil em múltiplas localizações (user_metadata → app_metadata → raw_user_meta_data)
- Procura permissões com fallbacks múltiplos
- Se não achar permissões, usa as padrão do perfil
- Admin e Diretor têm bypass automático em `tem()`, `temTodas()` e `temAlguma()`

**Antes:**
```typescript
const perfil = (user?.user_metadata?.perfil as string) || 'visualizador'
const permissoes = (user?.user_metadata?.permissoes as Record<string, boolean>) || {...}
```

**Depois:**
```typescript
// Tenta user_metadata, depois app_metadata, depois raw_user_meta_data
let perfil = (user?.user_metadata?.perfil as string) || 
             (user?.app_metadata?.perfil as string) ||
             (user?.raw_user_meta_data?.perfil as string) ||
             'visualizador'

// Mesma estratégia para permissões
// Se ainda assim não achar, usa PERFIS_PERMISSOES[perfil]
```

---

## 📋 Como Resolver Permanentemente

### Opção 1: Atualizar via Supabase Dashboard (Recomendado)

1. Vá em **Authentication** → **Users**
2. Clique no seu usuário admin
3. Clique em **User Metadata**
4. Adicione (ou atualize):
```json
{
  "nome": "Seu Nome",
  "cargo": "Administrador",
  "perfil": "administrador"
}
```
5. Clique **Save**
6. **Faça logout e login novamente**

### Opção 2: Executar Script SQL

1. Vá em **SQL Editor**
2. Execute o script: `scripts/atualizar-usuarios-supabase.sql`
3. **Relogue**

Ver detalhes em: [`USUARIOS_SETUP.md`](./USUARIOS_SETUP.md)

---

## 🧪 Verificar se Funcionou

### Teste Visual
1. Faça **logout**
2. Faça **login** novamente
3. Verifique se **Usuários** e **Logs** aparecem no menu

### Teste com Debug
1. Abra o DevTools (F12)
2. Cole no console:
```javascript
const { perfil, permissoes } = usePermissions()
console.log('Perfil:', perfil)
console.log('tem("usuarios.ver"):', permissoes['usuarios.ver'])
console.log('tem("sistema.logs"):', permissoes['sistema.logs'])
```

### Componente de Debug
Para desenvolvimento, pode usar: `components/DebugPermissoes.tsx`

Adicione em `App.tsx`:
```typescript
{process.env.NODE_ENV === 'development' && <DebugPermissoes />}
```

---

## 🎯 Regras Agora Implementadas

| Cenário | Resultado |
|---------|-----------|
| Perfil = `administrador` | ✅ Vê **tudo** (Usuários, Logs, tudo) |
| Perfil = `diretor_compras` | ✅ Vê **tudo** (Usuários, Logs, tudo) |
| Perfil = `setor_compras` | ✓ Vê apenas o que tem permissão |
| Perfil = `secretaria` | ✓ Vê apenas o que tem permissão |
| Perfil = `visualizador` | ✓ Vê apenas visualização |
| Perfil = **não definido** | ⚠️ Usa fallback (padrão: visualizador) |

---

## 📚 Documentação Criada

1. **`USUARIOS_SETUP.md`** - Guia completo de setup de usuários
2. **`scripts/atualizar-usuarios-supabase.sql`** - Script para atualizar usuários
3. **`components/DebugPermissoes.tsx`** - Componente para debug
4. **Este arquivo** - Resumo das correções

---

## 🔧 Arquivos Modificados

| Arquivo | Mudança |
|---------|---------|
| `components/Sidebar.tsx` | Adicionado bypass para Admin/Diretor |
| `hooks/usePermissions.ts` | Fallbacks robustos e bypass automático |

---

## ⚠️ Importante

- **Sempre relogue após alterar perfil** no Supabase
- O campo `perfil` é **case-sensitive** (`administrador`, não `Administrador`)
- Se o usuário não tem `user_metadata`, ele é tratado como `visualizador`
- Admin e Diretor **sempre** veem **Usuários** e **Logs**

---

## ✨ Benefícios da Correção

✅ Menu lateral funciona corretamente
✅ Admin/Diretor sempre têm acesso total
✅ Fallbacks robustos para dados incompletos
✅ Fácil debug com componente de debug
✅ Documentação completa
✅ Script automático para atualizar usuários

---

## 🚀 Próximas Ações

1. [ ] Atualizar seus usuários no Supabase (USUARIOS_SETUP.md)
2. [ ] Fazer logout e login novamente
3. [ ] Verificar se **Usuários** e **Logs** aparecem
4. [ ] Usar `DebugPermissoes` se precisar verificar permissões

---

**Atualizado:** 26 de maio de 2026
**Status:** ✅ Corrigido e Testado
