# Guia de Setup de Usuários

## Como Criar um Usuário Admin via Supabase Dashboard

### Método 1: Via Dashboard Supabase (Recomendado)

1. Acesse [supabase.com](https://supabase.com) → seu projeto
2. Vá em **Authentication** → **Users**
3. Clique em **Add User**
4. Preencha:
   - **Email**: seu-email@gameleira.pe.gov.br
   - **Password**: senha forte (mín 8 caracteres)
   - ✅ **Auto Confirm User**: marque esta opção
5. Clique em **Create User**
6. **IMPORTANTE**: Após criar, edite o usuário e adicione user metadata:
   - Clique no usuário criado
   - Vá em **User Metadata**
   - Adicione JSON:
   ```json
   {
     "nome": "Seu Nome",
     "cargo": "Administrador",
     "perfil": "administrador"
   }
   ```
   - Clique em **Save**

### Método 2: Via SQL Editor (Alternativo)

1. Vá em **SQL Editor** → **New Query**
2. Cole o SQL abaixo, alterando email e nome:

```sql
-- Criar usuário admin
INSERT INTO auth.users (
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  role,
  aud,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'seu-email@gameleira.pe.gov.br',
  crypt('SuaSenha123!', gen_salt('bf')),
  now(),
  'authenticated',
  'authenticated',
  '{"provider":"email","providers":["email"]}',
  '{"nome":"Seu Nome","cargo":"Administrador","perfil":"administrador"}',
  now(),
  now()
) ON CONFLICT (email) DO NOTHING;
```

3. Execute

## Criar Usuários de Outros Perfis

Use a mesma lógica, mas mude:
- `"perfil": "diretor_compras"` para Diretor
- `"perfil": "setor_compras"` para Setor de Compras
- `"perfil": "secretaria"` para Secretaria
- `"perfil": "visualizador"` para Visualizador

## Verificar Permissões do Usuário Logado

### Debug no Console

1. Abra o DevTools (F12)
2. Vá em **Console**
3. Cole:

```javascript
// Verificar user metadata
const authUser = JSON.parse(localStorage.getItem('sb-nfiwfbhutedzlaozynlh-auth-token') || '{}')
console.log('User Data:', authUser?.user?.user_metadata)

// Ou via hook (se tiver acesso ao componente)
const { perfil, permissoes } = usePermissions()
console.log('Perfil:', perfil)
console.log('Permissões:', permissoes)
```

## Visualizar User Metadata no Supabase

1. Vá em **Authentication** → **Users**
2. Clique no usuário
3. Role até encontrar a seção **User Metadata**
4. Nela aparecerá o JSON com nome, cargo, perfil

## Atualizar User Metadata Existente

1. No Supabase Dashboard, vá em **Users**
2. Clique no usuário
3. Clique em **User Metadata** (botão no topo direito)
4. Edite o JSON
5. Clique **Save**

## Atualizar via SQL

```sql
-- Atualizar perfil de um usuário
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{perfil}',
  '"administrador"'
)
WHERE email = 'email@gameleira.pe.gov.br';
```

## Troubleshooting

### Problema: Usuário não vê Usuários e Logs

**Possível causa:** Perfil não está definido em user_metadata

**Solução:**
1. Vá em Supabase → Authentication → Users
2. Clique no usuário
3. Edite User Metadata
4. Adicione `"perfil": "administrador"`
5. Salve e relogue o usuário

### Problema: Permissões não atualizam após salvar

**Solução:** Faça logout e login novamente, ou recarregue a página (F5)

### Problema: Erro ao editar User Metadata

**Solução:** Certifique-se que é um JSON válido. Não deixe aspas faltando.

## Estrutura Correta de User Metadata

```json
{
  "nome": "João Silva",
  "cargo": "Administrador do Sistema",
  "perfil": "administrador",
  "status": "ativo"
}
```

## Perfis Disponíveis

| Perfil | Acesso |
|--------|--------|
| `administrador` | Total - todas as funcionalidades |
| `diretor_compras` | Total - todas as funcionalidades |
| `setor_compras` | Compras, Pesquisas, Relatórios |
| `secretaria` | Ofícios, Pesquisas, Documentos |
| `visualizador` | Apenas visualização |

## Verificação Rápida

Após criar um usuário:

1. Faça login
2. Se vir **Usuários** e **Logs** no menu → ✅ Admin/Diretor configurado
3. Se vir **Ofícios**, **Processos** → ✅ Setor de Compras/Secretaria configurado
4. Se vir apenas **Dashboard**, **Alertas** → ✅ Visualizador configurado

## Próximas Ações

1. [x] Criar usuário admin com perfil correto
2. [x] Fazer login
3. [x] Verificar se Usuários e Logs aparecem
4. [x] Criar outros usuários com perfis diferentes
5. [x] Testar cada perfil para verificar permissões

---

**Nota:** Sempre que alterar `user_metadata`, o usuário precisa fazer logout e login novamente para que as mudanças sejam refletidas.
