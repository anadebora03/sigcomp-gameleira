# 🔐 Autenticação — SIGCOMP Gameleira

## Como configurar o login real com Supabase

---

### Passo 1 — Variáveis de ambiente

Crie o arquivo `.env.local` na raiz do projeto:

```
NEXT_PUBLIC_SUPABASE_URL=https://nfiwfbhutedzlaozynlh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

### Passo 2 — Instalar dependência nova

```bash
npm install @supabase/ssr
```

---

### Passo 3 — Criar usuário administrador

**Opção A (mais fácil): Dashboard do Supabase**

1. Acesse: supabase.com → seu projeto
2. Clique em **Authentication** → **Users**
3. Clique em **Add user**
4. Preencha:
   - Email: `admin@gameleira.pe.gov.br`
   - Password: `Admin@2025!` (ou outra senha forte)
   - ✅ Marque "Auto Confirm User"
5. Clique em **Create User**

**Opção B: SQL Editor**

Abra `supabase-setup.sql` e execute no SQL Editor do Supabase.

---

### Passo 4 — Configurar Email de recuperação

1. No Supabase → **Authentication** → **Email Templates**
2. Personalize o template "Reset Password" com o nome da prefeitura

---

### Passo 5 — Configurar URL de redirecionamento

1. No Supabase → **Authentication** → **URL Configuration**
2. Em **Site URL**: `http://localhost:3000` (desenvolvimento)
3. Em **Redirect URLs**: adicione `http://localhost:3000/nova-senha`
4. Para produção, adicione também a URL do Netlify

---

### Fluxo de autenticação

```
/ (protegida)
├── Não logado → redireciona para /login
│
/login
├── Login correto → redireciona para /
├── "Esqueci minha senha" → /recuperar-senha
│
/recuperar-senha
├── Email válido → envia link → exibe confirmação
│
/nova-senha (acessada pelo link do email)
├── Define nova senha → redireciona para /
```

---

### Cadastrar novos usuários da equipe

1. Supabase → **Authentication** → **Users** → **Add User**
2. Preencha email e senha provisória
3. Marque "Auto Confirm User"
4. No primeiro acesso, o usuário troca a senha em `/nova-senha`

---

### Senhas recomendadas

- Mínimo 8 caracteres
- Pelo menos 1 maiúscula, 1 número
- Exemplo: `Gameleira@2025`
