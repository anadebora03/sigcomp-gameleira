# Sistema de Permissões Granulares - SIGCOMP

## Visão Geral

O SIGCOMP implementa um sistema de permissões granulares baseado em módulos. Cada usuário possui um conjunto de permissões que controla o que ele pode visualizar e fazer no sistema.

## Estrutura de Permissões

As permissões são organizadas por módulo e ação:

- `oficios.ver` — Ver ofícios
- `oficios.criar` — Criar ofício
- `oficios.editar` — Editar ofício
- `oficios.excluir` — Excluir ofício
- `oficios.anexar` — Anexar documentos
- `oficios.status` — Alterar status
- `oficios.baixa` — Dar baixa/concluir
- Similar para: `processos.*`, `pesquisas.*`, `documentos.*`, `secretarias.*`, `relatorios.*`, `usuarios.*`, `sistema.*`

## Perfis Pré-Definidos

O sistema vem com 5 perfis modelos:

1. **Administrador** — Todas as permissões
2. **Diretor de Compras** — Quase todas, exceto configurações críticas
3. **Setor de Compras** — Ofícios, processos, documentos e relatórios
4. **Secretaria** — Criar e acompanhar suas próprias solicitações
5. **Visualizador** — Apenas visualizar

## Armazenamento

As permissões são armazenadas em `raw_user_meta_data` dos usuários Supabase:

```json
{
  "permissoes": {
    "oficios.ver": true,
    "oficios.criar": true,
    "oficios.editar": false,
    ...
  }
}
```

## Como Usar

### 1. No Frontend - Verificar Permissões

```typescript
import { usePermissions } from '@/hooks/usePermissions'

function MeuComponente() {
  const { tem, temTodas, temAlguma } = usePermissions()

  // Verificar uma permissão
  if (tem('oficios.criar')) {
    // Mostrar botão de criar
  }

  // Verificar múltiplas (AND)
  if (temTodas(['oficios.editar', 'oficios.status'])) {
    // Ambas necessárias
  }

  // Verificar múltiplas (OR)
  if (temAlguma(['usuarios.editar', 'usuarios.criar'])) {
    // Uma ou outra
  }
}
```

### 2. Proteger Componentes

```typescript
import { ProtectedElement, ProtectedButton } from '@/components/ProtectedElement'

// Esconder elemento sem permissão
<ProtectedElement require="oficios.criar">
  <button>Criar Ofício</button>
</ProtectedElement>

// Desabilitar botão sem permissão
<ProtectedButton require="oficios.excluir">
  Excluir
</ProtectedButton>

// Múltiplas permissões (AND)
<ProtectedElement require={['oficios.editar', 'oficios.status']}>
  <button>Editar e Alterar Status</button>
</ProtectedElement>

// Múltiplas permissões (OR)
<ProtectedElement require={['usuarios.criar', 'usuarios.editar']} match="any">
  <button>Gerenciar Usuários</button>
</ProtectedElement>
```

### 3. No Menu Sidebar

Itens do menu são automaticamente filtrados baseado em permissões:

```typescript
const NAV = [
  {id:'oficios', l:'Ofícios', icon:'file', permissao: 'oficios.ver'},
  {id:'usuarios', l:'Usuários', icon:'users', permissao: 'usuarios.ver'},
  // ...
]
```

Apenas usuários com a permissão relevante verão o item no menu.

### 4. Gerenciar Permissões - Tela de Usuários

Na página de Usuários, há uma seção "Permissões do Usuário" que permite:

1. **Selecionar um Modelo de Perfil** — Preenche automaticamente as permissões sugeridas
2. **Editar Manualmente** — Marcar/desmarcar permissões específicas
3. **Salvar** — As permissões são salvas no banco de dados

## Exemplo de Implementação

### Botão com Permissão

```typescript
import { usePermissions } from '@/hooks/usePermissions'

export function BotaoCriarOficio() {
  const { tem } = usePermissions()
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    if (!tem('oficios.criar')) {
      alert('Você não tem permissão para criar ofícios')
      return
    }
    setLoading(true)
    // ... criar ofício
  }

  return (
    <button
      onClick={handleClick}
      disabled={!tem('oficios.criar') || loading}
      style={{ opacity: !tem('oficios.criar') ? 0.5 : 1 }}
    >
      {loading ? 'Criando...' : 'Criar Ofício'}
    </button>
  )
}
```

### Menu Protegido

```typescript
import { usePermissions } from '@/hooks/usePermissions'

export function MenuSecoes() {
  const { tem } = usePermissions()

  return (
    <nav>
      {tem('oficios.ver') && <a href="/oficios">Ofícios</a>}
      {tem('processos.ver') && <a href="/processos">Processos</a>}
      {tem('pesquisas.ver') && <a href="/pesquisas">Pesquisas</a>}
      {tem('usuarios.ver') && <a href="/usuarios">Usuários</a>}
      {tem('sistema.logs') && <a href="/logs">Logs</a>}
    </nav>
  )
}
```

## Proteção no Backend

Para proteger ações no backend/RLS do Supabase:

```sql
-- Exemplo: Apenas admin ou usuário com permissão pode ver ofícios
CREATE POLICY "Ver ofícios com permissão" ON public.oficios
  FOR SELECT TO authenticated USING (
    (SELECT raw_user_meta_data->'permissoes'->>'oficios.ver' FROM auth.users WHERE id = auth.uid()) = 'true'
    OR (SELECT raw_user_meta_data->>'perfil' FROM auth.users WHERE id = auth.uid()) = 'administrador'
  );
```

## Checklist de Implementação

- [x] Tipos e interfaces de permissões
- [x] Constantes com módulos e permissões
- [x] Perfis pré-definidos
- [x] Hook `usePermissions` para verificar permissões
- [x] Componentes `ProtectedElement` e `ProtectedButton`
- [x] Seletor de Permissões na tela de usuários
- [x] Filtro de menu no Sidebar baseado em permissões
- [ ] Proteção RLS no backend (use supabase-permissoes.sql)
- [ ] Validar permissões em endpoints do backend
- [ ] Aplicar em todas as páginas principais

## Próximos Passos

1. Execute `supabase-permissoes.sql` no Supabase para criar a função de auditoria
2. Teste a interface de permissões na tela de usuários
3. Aplique `ProtectedElement` nos botões críticos
4. Teste o filtro do menu com diferentes usuários
5. Configure RLS no backend conforme necessário
