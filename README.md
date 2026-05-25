# SIGCOMP Gameleira

**Sistema Integrado de Gestão de Compras**  
Prefeitura Municipal de Gameleira — PE

---

## 🚀 Como rodar localmente

```bash
npm install
npm run dev
```

Acesse: http://localhost:3000

**Login padrão:**
- Email: `admin@gameleira.pe.gov.br`
- Senha: `admin123`

---

## 📁 Estrutura do projeto

```
sigcomp-gameleira/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Layout raiz (metadados, CSS global)
│   └── page.tsx            # Página principal → <App />
│
├── components/
│   ├── App.tsx             # ✅ Componente raiz (estado global, navegação)
│   ├── Sidebar.tsx         # ✅ Menu lateral
│   ├── Header.tsx          # ✅ Barra superior
│   ├── ui/                 # Componentes reutilizáveis
│   │   ├── Modal.tsx       # ✅ Modal com portal
│   │   ├── Toast.tsx       # ✅ Notificações
│   │   ├── DropZone.tsx    # ✅ Upload de arquivos
│   │   ├── StatusBadge.tsx # ✅ Badge de status
│   │   ├── PriorityBadge.tsx
│   │   └── SecretariaAvatar.tsx
│   ├── forms/              # Formulários de cadastro
│   │   ├── OficioForm.tsx
│   │   ├── ProcessoForm.tsx
│   │   ├── PesquisaForm.tsx
│   │   └── UsuarioForm.tsx
│   ├── modals/             # Modais de detalhe
│   │   ├── OficioDetail.tsx
│   │   ├── ProcessoDetail.tsx (inclui Contrato)
│   │   └── PesquisaDetail.tsx
│   └── pages/              # Páginas do sistema
│       ├── LoginPage.tsx   # ✅ Implementado
│       ├── Dashboard.tsx
│       ├── OficiosPage.tsx
│       ├── ProcessosPage.tsx
│       ├── PesquisasPage.tsx
│       ├── SecretariasPage.tsx
│       ├── AlertasPage.tsx
│       ├── RelatoriosPage.tsx
│       ├── UsuariosPage.tsx
│       └── LogsPage.tsx
│
├── hooks/
│   ├── useStore.ts         # ✅ Estado global (oficios, processos, etc.)
│   ├── useMob.ts           # ✅ Detecta mobile
│   └── useClock.ts         # ✅ Relógio em tempo real
│
├── lib/
│   ├── constants.ts        # ✅ SECS, STO, PRI, SPL, SPQ, MOD, cores
│   ├── types.ts            # ✅ TypeScript types (Oficio, Processo, etc.)
│   └── initialData.ts      # ✅ Dados de exemplo
│
├── utils/
│   ├── formatters.ts       # ✅ fD, fR, fKB, fmtM, td, isOv, isSn
│   └── helpers.ts          # ✅ uid, gS, gT, readFileAsDataUrl, openFile
│
└── styles/
    └── globals.css         # ✅ CSS vars (cores do tema), animações
```

---

## 🎨 Paleta de cores

| Cor | Hex | Uso |
|-----|-----|-----|
| Verde principal | `#1a5c38` | Botões, sidebar, badges concluído |
| Verde médio | `#2d8f5e` | Hover, gradientes |
| Dourado | `#c9a227` | Pendentes, alertas, Em Andamento |
| Azul marinho | `#1a3a6e` | Processos, análise, contratos |
| Vermelho | `#dc2626` | Urgente, excluir, cancelado |

---

## 🔧 Como modificar pelo Claude Code (terminal)

```bash
# Alterar nomes das secretarias:
code lib/constants.ts

# Alterar dados iniciais de exemplo:
code lib/initialData.ts

# Alterar cores do sistema:
code styles/globals.css
code lib/constants.ts  # variáveis GOLD, NAVY, G

# Implementar uma página completa:
code components/pages/OficiosPage.tsx

# Rodar após alterações:
npm run dev
```

---

## 🗄️ Integração com Supabase (próximo passo)

1. Crie projeto em [supabase.com](https://supabase.com)
2. Copie as credenciais para `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   ```
3. O hook `useStore.ts` é o ponto de integração — substitua o `useState` por chamadas ao Supabase

---

## 📋 Referência: versão HTML funcional

O arquivo `sigcomp-gameleira.html` na raiz do projeto é a versão 100% funcional
usada como referência. Todas as páginas Next.js devem ser implementadas baseadas nele.

---

**Versão:** 1.0.0 — Maio/2026  
**Desenvolvido para:** Prefeitura Municipal de Gameleira — PE
