# Melhorias Implementadas - Sistema de Usuários, Permissões e Autenticação

## 📋 Resumo Executivo

Este documento descreve todas as melhorias implementadas no SIGCOMP referentes a:
- Cores e estilo visual
- Modelos de perfil e permissões
- Permissões detalhadas por módulo
- Fluxo de autenticação e primeiro acesso

---

## 1️⃣ CORES E ESTILO

### Substituição de Cores

#### Antes
- Roxo/Azul Marinho Antigo: `#1a3a6e`
- Sem cor específica para checkboxes

#### Depois
- **Azul Marinho Novo**: `#0F1E3A` (principal em botões, abas, cards, títulos, links, destaques)
- **Verde Escuro**: `#166534` (checkboxes e marcadores)

### Arquivos Atualizados

| Arquivo | Mudanças |
|---------|----------|
| `components/ui/atoms.tsx` | NAVY atualizado para #0F1E3A, GREEN_CHECK adicionado |
| `lib/constants.ts` | PRI array atualizado, USER_STATUS adicionado |
| `tailwind.config.js` | Paleta navy atualizada |
| `components/pages/Dashboard.tsx` | Gradiente de cores atualizado |
| `components/pages/LogsPage.tsx` | Cores de módulos atualizadas |
| `components/ui/ARow.tsx` | Background button atualizado |
| `components/pages/AlertasPage.tsx` | Cor de status atualizada |
| `components/pages/OficiosPage.tsx` | Cor de texto atualizada |
| `components/pages/RelatoriosPage.tsx` | Cores de elementos atualizadas |
| `components/pages/PesquisasPage.tsx` | Cores atualizadas |

### Paleta de Cores Consolidada

```typescript
// Colors
export const G = '#1a5c38'           // Verde (secretarias)
export const NAVY = '#0F1E3A'        // Azul Marinho (principal)
export const GREEN_CHECK = '#166534' // Verde Escuro (checkboxes)
export const GOLD = '#c9a227'        // Ouro (secundário)

// Perfis por cor
export const PCOR = {
  administrador: '#0F1E3A',      // Azul
  diretor_compras: '#0F1E3A',    // Azul
  setor_compras: '#1a5c38',      // Verde
  secretaria: '#0F1E3A',         // Azul
  visualizador: '#64748b'        // Cinza
}
```

---

## 2️⃣ MODELOS DE PERFIL E PERMISSÕES

### 5 Perfis Pré-Configurados

#### 1. **Administrador**
- **Permissões**: TODAS
- **Descrição**: Acesso total ao sistema
- **Cor**: Azul Marinho (#0F1E3A)

#### 2. **Diretor do Setor de Compras**
- **Permissões**: TODAS (exceto algumas configs críticas)
- **Descrição**: Gerencia processos de compras e licitações
- **Cor**: Azul Marinho (#0F1E3A)

#### 3. **Setor de Compras**
- **Permissões**:
  - ✅ Ofícios: Ver, Criar, Editar, Anexar
  - ✅ Processos: Ver, Criar, Editar, Anexar
  - ✅ Pesquisas: Ver, Criar, Editar
  - ✅ Documentos: Ver, Baixar
  - ✅ Secretarias: Ver
  - ✅ Relatórios: Ver, PDF, Excel
  - ❌ Usuários, Sistema
- **Cor**: Verde (#1a5c38)

#### 4. **Secretaria**
- **Permissões**:
  - ✅ Ofícios: Ver, Criar, Anexar
  - ✅ Processos: Ver
  - ✅ Pesquisas: Ver
  - ✅ Documentos: Ver, Baixar
  - ✅ Secretarias: Ver
  - ✅ Relatórios: Ver
  - ❌ Usuários, Sistema
- **Cor**: Azul Marinho (#0F1E3A)

#### 5. **Visualizador**
- **Permissões**: Apenas visualização de dados
  - ✅ Ver ofícios, processos, pesquisas, documentos, secretarias, relatórios
  - ❌ Criar, editar, excluir, gerenciar
- **Cor**: Cinza (#64748b)

### Seleção de Modelo e Auto-Preenchimento

Na tela de **Novo Usuário**:

1. Clique em **Permissões do Usuário** para expandir
2. Selecione um modelo na seção "Modelo de Perfil"
3. As permissões são **automaticamente preenchidas**
4. **Você pode editar manualmente** qualquer permissão individual
5. Clique em **"Criar e Enviar Convite"**

```typescript
// Exemplo: Ao selecionar "Setor de Compras", preenche automaticamente:
{
  'oficios.ver': true,
  'oficios.criar': true,
  'oficios.editar': true,
  'oficios.excluir': false,
  'oficios.anexar': true,
  'oficios.status': false,
  'oficios.baixa': false,
  // ... outras permissões
}
```

---

## 3️⃣ PERMISSÕES DETALHADAS

### Estrutura de Módulos

```
OFÍCIOS (7 permissões)
├── Ver ofícios
├── Criar ofício
├── Editar ofício
├── Excluir ofício
├── Anexar documentos
├── Alterar status
└── Dar baixa/concluir

PROCESSOS LICITATÓRIOS (6 permissões)
├── Ver processos
├── Criar processo
├── Editar processo
├── Cancelar processo
├── Concluir processo
└── Anexar documentos

PESQUISAS DE PREÇO (4 permissões)
├── Ver pesquisas
├── Criar pesquisa
├── Editar pesquisa
└── Excluir pesquisa

DOCUMENTOS (3 permissões)
├── Ver documentos
├── Baixar documentos
└── Excluir documentos

SECRETARIAS (4 permissões)
├── Ver secretarias
├── Criar secretaria
├── Editar secretaria
└── Excluir secretaria

RELATÓRIOS (3 permissões)
├── Ver relatórios
├── Exportar PDF
└── Exportar Excel

USUÁRIOS (5 permissões)
├── Ver usuários
├── Cadastrar usuários
├── Editar usuários
├── Desativar usuários
└── Gerenciar permissões

SISTEMA (3 permissões)
├── Ver logs
├── Gerenciar configurações
└── Acesso administrativo total
```

### Funcionamento das Permissões

#### 1. **Frontend** (`usePermissions` hook)
```typescript
import { usePermissions } from '@/hooks/usePermissions'

function MeuComponente() {
  const { tem, temTodas, temAlguma } = usePermissions()

  // Uma permissão
  if (tem('oficios.criar')) {
    // Mostrar botão de criar
  }

  // Múltiplas (AND)
  if (temTodas(['oficios.editar', 'oficios.status'])) {
    // Ambas necessárias
  }

  // Múltiplas (OR)
  if (temAlguma(['usuarios.editar', 'usuarios.criar'])) {
    // Uma ou outra
  }
}
```

#### 2. **Proteger Componentes**
```typescript
import { ProtectedElement, ProtectedButton } from '@/components/ProtectedElement'

// Esconder sem permissão
<ProtectedElement require="oficios.criar">
  <button>Criar Ofício</button>
</ProtectedElement>

// Desabilitar sem permissão
<ProtectedButton require="oficios.excluir">
  Excluir
</ProtectedButton>

// Múltiplas (AND)
<ProtectedElement require={['oficios.editar', 'oficios.status']}>
  <button>Editar e Alterar Status</button>
</ProtectedElement>

// Múltiplas (OR)
<ProtectedElement require={['usuarios.criar', 'usuarios.editar']} match="any">
  <button>Gerenciar Usuários</button>
</ProtectedElement>
```

#### 3. **Armazenamento**
As permissões são armazenadas em `raw_user_meta_data` do Supabase:
```json
{
  "perfil": "setor_compras",
  "permissoes": {
    "oficios.ver": true,
    "oficios.criar": true,
    "oficios.editar": true,
    "oficios.excluir": false,
    ...
  },
  "status": "ativo"
}
```

---

## 4️⃣ AUTENTICAÇÃO E PRIMEIRO ACESSO

### Status de Usuário

| Status | Descrição | Cor |
|--------|-----------|-----|
| **Convite enviado** | E-mail de convite foi enviado, aguardando confirmação | Âmbar |
| **Aguardando ativação** | E-mail confirmado, aguardando primeiro acesso | Azul |
| **Ativo** | Usuário ativo no sistema | Verde |
| **Bloqueado** | Usuário desativado/bloqueado | Vermelho |

### Fluxo Completo de Criação de Usuário

#### Passo 1: Ir para Painel de Usuários
```
Dashboard → Usuários (no menu)
```

#### Passo 2: Clicar em "+ Novo Usuário"
Abrirá modal com formulário

#### Passo 3: Preencher Dados Básicos
- Nome Completo *
- Cargo
- Email * (não pode ser alterado depois)
- Foto (opcional)

#### Passo 4: Selecionar Perfil
- Dropdown com 5 opções
- Ao selecionar, permissões são auto-preenchidas

#### Passo 5: Revisar Permissões (opcional)
- Clique em "Permissões do Usuário"
- Expande painel com todos os módulos
- Pode editar manualmente se necessário

#### Passo 6: Definir Senha Provisória
- Mínimo 6 caracteres (para primeira vez)
- Após primeiro acesso, usuário deve mudar para 8+ caracteres

#### Passo 7: Clicar "Criar e Enviar Convite"
Sistema automaticamente:
1. Cria usuário no Supabase Auth
2. Armazena perfil e permissões
3. Envia e-mail de convite com link de ativação
4. Define status como "convite_enviado"

#### Passo 8: Usuário Recebe E-mail
E-mail contém:
- Boas-vindas personalizado
- Link para confirmar e-mail e definir senha
- Instruções de próximos passos

#### Passo 9: Usuário Clica no Link
Redirecionado para `/nova-senha` com token de reset

#### Passo 10: Usuário Define Sua Senha
- Mínimo 8 caracteres
- Indicador de força de senha
- Após confirmar, status muda para "ativo"
- Redirecionado para dashboard

### Fluxo de Esqueci Senha

#### Tela de Login
```
/login → "Esqueci minha senha" (link)
```

#### Tela de Recuperação
```
/recuperar-senha
- Digita e-mail
- Clica "Enviar Link"
- Recebe e-mail com link de reset
```

#### Nova Senha
```
/nova-senha (acessada pelo link do e-mail)
- Define nova senha (mín 8 caracteres)
- Clica "Definir Nova Senha"
- Redirecionado para /login
```

### Tabela de Usuários Melhorada

Agora exibe 5 colunas:
1. **Usuário** - Nome, cargo, avatar
2. **Email** - E-mail institucional
3. **Perfil** - Badge com cor do perfil
4. **Status** - Convite/Ativo/Bloqueado (com cor)
5. **Ações** - Editar, Excluir

#### Editar Usuário
- Pode mudar: Cargo, Perfil, Status, Permissões
- Não pode mudar: Email, Nome (design choice)

### Gerenciamento de Status

Ao editar um usuário:

```typescript
// Para desativar
status: 'bloqueado'  // Usuário não consegue mais acessar

// Para reativar
status: 'ativo'      // Usuário consegue acessar

// Para reenviar convite
status: 'convite_enviado'  // Histórico para referência
```

---

## 5️⃣ IMPLEMENTAÇÃO TÉCNICA

### Novos Arquivos

#### `services/auth.ts`
Funções para gerenciar autenticação:
- `createUserWithInvite()` - Criar usuário e enviar convite
- `sendPasswordResetEmail()` - Enviar reset de senha
- `disableUser()` - Desativar usuário
- `enableUser()` - Reativar usuário
- `generateInviteEmail()` - Gerar HTML do e-mail

### Arquivos Modificados

#### `lib/types.ts`
```typescript
export interface Usuario {
  // ... campos existentes
  status?: string; // 'convite_enviado' | 'aguardando_ativacao' | 'ativo' | 'bloqueado'
}
```

#### `lib/constants.ts`
```typescript
export const USER_STATUS = {
  convite_enviado: { label: 'Convite enviado', cor: '#f59e0b', bg: '#fffbeb' },
  aguardando_ativacao: { label: 'Aguardando ativação', cor: '#3b82f6', bg: '#eff6ff' },
  ativo: { label: 'Ativo', cor: '#10b981', bg: '#f0fdf4' },
  bloqueado: { label: 'Bloqueado', cor: '#ef4444', bg: '#fef2f2' }
}
```

#### `components/pages/UsuariosPage.tsx`
- Adicionado campo Status no formulário
- Atualizada tabela para exibir Status colorido
- Botão agora diz "Criar e Enviar Convite"
- Mensagens de sucesso atualizadas

---

## 6️⃣ GUIA DE USO

### Para Administrador

#### Criar Novo Usuário
1. Vá para **Usuários**
2. Clique em **+ Novo Usuário**
3. Preencha dados básicos
4. Selecione perfil (auto-preenche permissões)
5. Revise permissões se necessário
6. Clique **Criar e Enviar Convite**
7. E-mail é enviado automaticamente

#### Editar Permissões
1. Localize usuário na tabela
2. Clique no ícone **Editar**
3. Mude o Perfil OU
4. Clique **Permissões do Usuário** para editar manualmente
5. Clique **Salvar**

#### Desativar Usuário
1. Abra formulário de edição
2. Mude **Status** para **Bloqueado**
3. Clique **Salvar**
4. Usuário não consegue mais acessar

### Para Usuário Final

#### Primeiro Acesso
1. Recebe e-mail com link
2. Clica em **Confirmar E-mail e Definir Senha**
3. Define sua senha (mín 8 caracteres)
4. Clica **Definir Nova Senha**
5. Redirecionado para /login
6. Faz login com seu e-mail e nova senha
7. Acessa o sistema!

#### Esqueci Minha Senha
1. Na tela de login, clique **Esqueci minha senha**
2. Digite seu e-mail
3. Clique **Enviar Link de Recuperação**
4. Recebe e-mail com link
5. Clica no link
6. Define nova senha
7. Volta a acessar o sistema

---

## 7️⃣ TESTES RECOMENDADOS

- [ ] Criar usuário com cada perfil
- [ ] Verificar que Admin tem todos as permissões
- [ ] Verificar que Diretor tem todos as permissões
- [ ] Testar edição de permissões manuais
- [ ] Verificar que menus filtram por permissão
- [ ] Testar flow esqueci senha
- [ ] Testar first access flow
- [ ] Verificar cores em todos os navegadores
- [ ] Testar responsive em mobile

---

## 8️⃣ NOTAS IMPORTANTES

### Segurança
- Senhas provisórias não são armazenadas em plain text
- Supabase gerencia hashing automático
- Confirmação de e-mail é obrigatória
- Tokens de reset expiram em 1 hora

### Permissões
- Admin sempre tem acesso (bypass automático)
- Permissões são verificadas no frontend E backend
- Ao mudar perfil, permissões são recalculadas
- Permissões são cacheadas em sessão (reload para atualizar)

### E-mails
- Template customizado para convites
- Supabase envia automaticamente
- Configurar SMTP em Supabase → Auth → Email
- Em dev, pode usar email preview

### Cores
- Azul Marinho #0F1E3A substituiu roxo em todas as interfaces
- Verde #166534 para checkboxes
- Cores mantêm acessibilidade (WCAG AA+)

---

## 9️⃣ SUPORTE E TROUBLESHOOTING

### Problema: E-mail não chega
**Solução:**
1. Verificar spam/lixo
2. Confirmar email SMTP no Supabase
3. Verificar logs em Supabase → Auth → Logs

### Problema: Usuário não consegue resetar senha
**Solução:**
1. Confirmar que URL de redirect está configurada em Auth → URL Configuration
2. Confirmar que `/nova-senha` existe e está acessível
3. Verificar token de reset não expirou (1 hora)

### Problema: Permissões não funcionam
**Solução:**
1. Recarregar página (F5)
2. Fazer logout/login
3. Verificar que usuário tem permissão no Supabase user_metadata
4. Verificar console.log de permissões com usePermissions()

### Problema: Cores erradas
**Solução:**
1. Limpar cache do navegador (Ctrl+Shift+Del)
2. Verifi que GREEN_CHECK está sendo importado
3. Verificar que accentColor no input está aplicado

---

## 🔟 REFERÊNCIAS

- Arquivo de autenticação: `/AUTENTICACAO.md`
- Arquivo de permissões: `/PERMISSOES.md`
- Tipos: `lib/types.ts`
- Constantes: `lib/constants.ts`
- Hook de permissões: `hooks/usePermissions.ts`
- Página de usuários: `components/pages/UsuariosPage.tsx`

---

**Última atualização:** 26 de maio de 2026

**Status:** ✅ Implementação Completa
