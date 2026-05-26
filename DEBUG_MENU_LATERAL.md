# 🔍 Debug: Menu Lateral - Verificação de Permissões

## Verificar no DevTools

### 1. Abrir DevTools (F12)
### 2. Ir em Console
### 3. Colar este código:

```javascript
// Verificar permissões do usuário logado
const authCtx = document.querySelector('[data-testid="auth-context"]');
console.group('🔐 Permissões do Usuário');

// Simular e ver o resultado
const { email } = JSON.parse(localStorage.getItem('sb-nfiwfbhutedzlaozynlh-auth-token') || '{"user":{}}')?.user || { email: 'n/a' };
console.log('📧 Email:', email);

// Para admin
if (email === 'deboramelo391997@gmail.com') {
  console.log('✅ Email é ADMIN - Acesso total garantido');
  console.log('Menu esperado: Dashboard, Ofícios, Processos, Pesquisas, Secretarias, Alertas, Relatórios, Usuários, Logs');
}

// Para diretor
if (email === 'setordecompras@gameleira.pe.gov.br') {
  console.log('✅ Email é DIRETOR - Acesso total garantido');
  console.log('Menu esperado: Dashboard, Ofícios, Processos, Pesquisas, Secretarias, Alertas, Relatórios, Usuários, Logs');
}

console.groupEnd();

// Verificar quais menus estão visíveis
console.group('👁️ Menus Visíveis na Sidebar');
const menuItems = document.querySelectorAll('nav button');
menuItems.forEach(btn => {
  const text = btn.innerText.trim();
  if (text) {
    console.log('✓', text);
  }
});
console.groupEnd();

// Verificar especificamente Usuarios e Logs
console.group('🎯 Verificação Específica');
const usuariosItem = Array.from(menuItems).find(btn => btn.innerText.includes('Usuários'));
const logsItem = Array.from(menuItems).find(btn => btn.innerText.includes('Logs'));
console.log('Usuários visível?', !!usuariosItem ? '✅ SIM' : '❌ NÃO');
console.log('Logs visível?', !!logsItem ? '✅ SIM' : '❌ NÃO');
console.groupEnd();
```

---

## Fluxo de Verificação

### Se você é `deboramelo391997@gmail.com`:
1. ✅ `isAdminOrDirector()` retorna `true` (email na lista ADMIN_EMAILS)
2. ✅ Todos os itens de menu com `permissao` definida aparecem
3. ✅ Especialmente "Usuários" (`usuarios.ver`) e "Logs" (`sistema.logs`)

### Se você é `setordecompras@gameleira.pe.gov.br`:
1. ✅ `isAdminOrDirector()` retorna `true` (email na lista DIRECTOR_EMAILS)
2. ✅ Todos os itens de menu com `permissao` definida aparecem
3. ✅ Especialmente "Usuários" e "Logs"

### Se você é outro perfil:
- Apenas menus onde `perfil` tem a permissão aparecem
- Admin/Diretor por perfil (não email) também veem tudo

---

## Correções Implementadas

### ✅ usePermissions.ts

**Antes:**
```typescript
if (perfil === 'administrador' || perfil === 'diretor_compras') return true
```

**Depois:**
```typescript
// Email é admin automático
if (ADMIN_EMAILS.includes(userEmail)) return true

// Email é diretor automático  
if (DIRECTOR_EMAILS.includes(userEmail)) return true

// Ou perfil (normalizado)
if (perfil === 'administrador' || perfil === 'admin') return true
if (perfil === 'diretor_compras' || perfil === 'diretor_setor_compras') return true
```

**Adicionado:** função `isAdminOrDirector()` que verifica tudo

### ✅ Sidebar.tsx

**Antes:**
```typescript
const isAdminOrDirector = perfil === 'administrador' || perfil === 'diretor_compras'
const navVisivel = NAV.filter(item => {
  if (isAdminOrDirector) return true
  return tem(item.permissao)
})
```

**Depois:**
```typescript
const { tem, isAdminOrDirector } = usePermissions()
const navVisivel = NAV.filter(item => {
  if (isAdminOrDirector()) return true  // chama a função completa
  return tem(item.permissao)
})
```

---

## Garantias Implementadas

| Cenário | Usuarios | Logs | Motivo |
|---------|----------|------|--------|
| Email `deboramelo391997@gmail.com` | ✅ | ✅ | Email em ADMIN_EMAILS |
| Email `setordecompras@gameleira.pe.gov.br` | ✅ | ✅ | Email em DIRECTOR_EMAILS |
| Perfil `administrador` | ✅ | ✅ | Bypass no `tem()` |
| Perfil `admin` | ✅ | ✅ | Normalizado para administrador |
| Perfil `diretor_compras` | ✅ | ✅ | Bypass no `tem()` |
| Perfil `diretor_setor_compras` | ✅ | ✅ | Normalizado para diretor_compras |
| Outro perfil | ❌ | ❌ | Sem permissão |

---

## Se Ainda Não Funcionar

### 1. Verificar raw_user_meta_data
```sql
SELECT 
  email,
  raw_user_meta_data->>'perfil' as perfil,
  raw_user_meta_data
FROM auth.users
WHERE email = 'seu-email@gameleira.pe.gov.br';
```

### 2. Verificar AuthProvider
- Confirmar que `user` object está chegando com os dados corretos

### 3. Clear cache
```javascript
// No console:
localStorage.clear()
location.reload()
```

### 4. Verificar logs no console
- Abrir DevTools
- Ir em Console
- Procurar por erros

---

## Pronto! ✅

Agora quando você fazer login:
- ✅ `usePermissions()` verifica email primeiro
- ✅ Se email está em ADMIN_EMAILS → acesso total
- ✅ Se email está em DIRECTOR_EMAILS → acesso total
- ✅ Senão, verifica perfil
- ✅ Sidebar filtra menu usando `isAdminOrDirector()`
- ✅ "Usuários" e "Logs" aparecem se condições atendidas

**Logout e login novamente para ativar!**
