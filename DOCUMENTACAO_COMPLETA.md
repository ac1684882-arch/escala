# 📚 Documentação Completa - Sistema de Escala de Maqueiros

## 🏥 **Sobre o Projeto**

Sistema de gerenciamento de escalas de trabalho para maqueiros hospitalares da Prefeitura do Rio de Janeiro - Secretaria Municipal de Saúde.

---

## 🔐 **Credenciais de Acesso**

### **Supabase (Banco de Dados)**
- **Email**: ac1684882@gmail.com
- **URL**: https://supabase.com/dashboard
- **Project ID**: iwvtfyuxwfgknqurkvcf
- **Project URL**: https://iwvtfyuxwfgknqurkvcf.supabase.co
- **Região**: South America (São Paulo)

### **Firebase (Autenticação)**
- **Email**: rikardomartinssantos@gmail.com
- **URL**: https://console.firebase.google.com
- **Project ID**: escaladosfuncionarios
- **Auth Domain**: escaladosfuncionarios.firebaseapp.com

### **GitHub (Código e Deploy)**
- **Repositório**: https://github.com/ac1684882-arch/escala
- **Owner**: ac1684882-arch

---

## 🏗️ **Arquitetura do Sistema**

### **Visão Geral:**

```
┌─────────────────────────┐
│   Firebase Auth         │  ← Autenticação de usuários
│   (rikardomartinssantos │     Login/Logout, JWT tokens
│    @gmail.com)          │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│   Frontend (React)      │  ← Interface do usuário
│   Vite + TypeScript     │     Dashboards, Calendário
│   Tailwind CSS          │     Componentes interativos
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│   Supabase PostgreSQL   │  ← Banco de dados
│   (ac1684882@gmail.com) │     Usuários, Escalas
│   South America (SP)    │     Bloqueios, Configurações
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│   GitHub Actions        │  ← CI/CD + Keep-Alive
│   Deploy automático     │     Ping a cada 6 dias
│   GitHub Pages          │     Build e deploy
└─────────────────────────┘
```

---

## 🎯 **Frontend**

### **Stack Tecnológico:**

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| **React** | 19.0.1 | UI Framework |
| **TypeScript** | 5.8.2 | Type Safety |
| **Vite** | 6.2.3 | Build Tool |
| **Tailwind CSS** | 4.1.14 | Styling |
| **Motion** | 12.23.24 | Animações |
| **Lucide React** | 0.546.0 | Ícones |
| **Firebase** | 11.1.0 | Autenticação |
| **Supabase** | 2.48.2 | Database Client |

### **Estrutura de Pastas:**

```
src/
├── components/              # Componentes React
│   ├── CalendarView.tsx    # Calendário mensal completo
│   ├── LoginScreen.tsx     # Tela de login
│   ├── MaqueiroDashboard.tsx    # Dashboard do maqueiro
│   ├── NurseDashboard.tsx       # Dashboard do enfermeiro
│   ├── PrefeituraHeader.tsx     # Cabeçalho institucional
│   └── StretcherManagement.tsx  # CRUD de maqueiros
│
├── config/                  # Configurações
│   ├── firebase.ts         # Setup Firebase Auth
│   └── supabase.ts         # Setup Supabase Client
│
├── utils/                   # Utilitários
│   ├── storage.ts          # (Legacy - localStorage)
│   ├── firebaseStorage.ts  # (Legacy - Firestore)
│   └── supabaseStorage.ts  # ✅ Storage atual (Supabase)
│
├── types.ts                 # TypeScript interfaces
├── App.tsx                  # Componente principal
├── main.tsx                 # Entry point
├── index.css               # Estilos globais
└── vite-env.d.ts           # Tipos do Vite
```

### **Componentes Principais:**

#### **1. LoginScreen.tsx**
- Tela de login unificada
- Suporta login por usuário ou matrícula
- Validação de credenciais
- Detecção automática de perfil (Enfermeiro/Maqueiro)

#### **2. NurseDashboard.tsx**
- Dashboard do supervisor/enfermeiro
- **Funcionalidades:**
  - Visualizar métricas gerais
  - Calendário completo com todas as escalas
  - CRUD de maqueiros
  - Configurações de vagas e liberação de folgas
  - Bloqueio/desbloqueio de datas
  - Edição manual de escalas
  - Reset de escalas do mês

#### **3. MaqueiroDashboard.tsx**
- Dashboard do maqueiro
- **Funcionalidades:**
  - Status da escala pessoal
  - Seleção de sábado de trabalho
  - Seleção de folga compensatória
  - Visualização do calendário geral
  - Regras automáticas para maqueiros fixos

#### **4. CalendarView.tsx**
- Componente de calendário reutilizável
- Grid mensal completo
- Filtros por turno (Manhã/Tarde)
- Busca por funcionário
- Indicadores visuais (vagas, bloqueios, folgas)
- Navegação entre meses

### **Fluxo de Dados:**

```
Usuário interage
       ↓
Componente React
       ↓
Event Handler (App.tsx)
       ↓
supabaseStorage.ts (função async)
       ↓
Supabase Client (API REST)
       ↓
PostgreSQL (Supabase)
       ↓
Retorna dados
       ↓
setState (React)
       ↓
Re-render (UI atualizada)
```

### **Autenticação:**

```
LoginScreen.tsx
       ↓
Verifica credenciais (supabaseStorage.getUsuarios)
       ↓
Se válido: setCurrentUser(usuario)
       ↓
App.tsx detecta role
       ↓
Renderiza dashboard apropriado:
  - role === 'enfermeiro' → NurseDashboard
  - role === 'maqueiro' → MaqueiroDashboard
```

---

## 🗄️ **Backend / Banco de Dados**

### **Supabase PostgreSQL**

**Conta**: ac1684882@gmail.com  
**Project**: iwvtfyuxwfgknqurkvcf  
**Região**: southamerica-east1 (São Paulo)

### **Schema do Banco:**

#### **Tabela: usuarios**

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| id | TEXT | PRIMARY KEY | ID único do usuário |
| nome | TEXT | NOT NULL | Nome completo |
| matricula | TEXT | UNIQUE, NOT NULL | Matrícula funcional |
| login | TEXT | UNIQUE, NOT NULL | Login para acesso |
| senha | TEXT | - | Senha (plaintext por enquanto) |
| role | TEXT | NOT NULL, CHECK | 'enfermeiro' ou 'maqueiro' |
| turno | TEXT | NOT NULL, CHECK | 'manha' ou 'tarde' |
| tipo | TEXT | NOT NULL, CHECK | 'normal' ou 'fixo_sabado' |
| ativo | BOOLEAN | DEFAULT true | Status ativo/inativo |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Data de criação |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Última atualização |

**Índices:**
- `idx_usuarios_login` (login)
- `idx_usuarios_matricula` (matricula)
- `idx_usuarios_role` (role)
- `idx_usuarios_ativo` (ativo)

**Dados iniciais:** 12 usuários (10 maqueiros + 2 enfermeiros)

---

#### **Tabela: escalas**

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| id | TEXT | PRIMARY KEY | ID único da escala |
| usuario_id | TEXT | FK usuarios(id), NOT NULL | Referência ao usuário |
| mes_ano | TEXT | NOT NULL | Formato: 'YYYY-MM' |
| sabado_trabalho | DATE | - | Data do sábado escolhido |
| folga_compensatoria | DATE | - | Data da folga escolhida |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Data de criação |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Última atualização |

**Constraints:**
- UNIQUE(usuario_id, mes_ano) - Um usuário só pode ter uma escala por mês

**Índices:**
- `idx_escalas_usuario_id` (usuario_id)
- `idx_escalas_mes_ano` (mes_ano)
- `idx_escalas_sabado` (sabado_trabalho)

---

#### **Tabela: bloqueios**

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| id | TEXT | PRIMARY KEY | ID único do bloqueio |
| data | DATE | UNIQUE, NOT NULL | Data bloqueada |
| justificativa | TEXT | NOT NULL | Motivo do bloqueio |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Data de criação |

**Índices:**
- `idx_bloqueios_data` (data)

**Uso:** Datas bloqueadas por enfermeiros (feriados, alta demanda, etc.)

---

#### **Tabela: configuracoes**

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| mes_ano | TEXT | PRIMARY KEY | Formato: 'YYYY-MM' |
| vagas_por_sabado | INTEGER | DEFAULT 2, CHECK >= 1 | Limite de maqueiros por sábado |
| folgas_liberadas_manualmente | BOOLEAN | DEFAULT false | Override para liberar folgas |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Data de criação |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Última atualização |

**Uso:** Configurações específicas por mês

---

### **Row Level Security (RLS):**

**Status atual:** ⚠️ Permissivo (desenvolvimento)

```sql
-- Todas as tabelas têm RLS habilitado
-- Políticas atuais: Leitura e escrita públicas

-- Para produção, implementar:
ALTER POLICY ... TO authenticated USING (auth.uid() = usuario_id);
```

**Recomendações para produção:**
1. Integrar Firebase Auth JWT com Supabase
2. Implementar RLS baseado em roles
3. Restringir escrita apenas para o próprio usuário
4. Permitir enfermeiros modificar qualquer escala

---

### **API / Camada de Storage:**

**Arquivo:** `src/utils/supabaseStorage.ts`

#### **Funções Principais:**

```typescript
// Inicialização
initializeStorage(): Promise<void>

// Usuários
getUsuarios(): Promise<Usuario[]>
addUsuario(user: Usuario): Promise<void>
updateUsuario(updatedUser: Usuario): Promise<void>

// Escalas
getEscalas(): Promise<Escala[]>
getEscalaForUser(userId: string, mesAno: string): Promise<Escala | null>
updateOrCreateEscala(userId, mesAno, sabado, folga): Promise<void>
saveEscalas(escalas: Escala[]): Promise<void>

// Bloqueios
getBloqueios(): Promise<Bloqueio[]>
addBloqueio(bloqueio: Bloqueio): Promise<void>
removeBloqueio(id: string): Promise<void>

// Configurações
getConfiguracoes(mesAno: string): Promise<Configuracao>
updateConfiguracao(config: Configuracao): Promise<void>

// Helpers
getSaturdaysInMonth(year, month): string[]
getMondaysInMonth(year, month): string[]
areFolgasUnlocked(mesAno): Promise<boolean>
```

---

## 🔄 **CI/CD e Deploy**

### **GitHub Actions:**

#### **1. Deploy Workflow** (`.github/workflows/deploy.yml`)

**Trigger:** Push na branch `main`

**Steps:**
1. Checkout do código
2. Setup Node.js 20
3. Install dependencies (`npm ci`)
4. Build com Vite (`npm run build`)
5. Upload para GitHub Pages
6. Deploy

**Secrets necessários:**
- VITE_FIREBASE_API_KEY
- VITE_FIREBASE_AUTH_DOMAIN
- VITE_FIREBASE_PROJECT_ID
- VITE_FIREBASE_STORAGE_BUCKET
- VITE_FIREBASE_MESSAGING_SENDER_ID
- VITE_FIREBASE_APP_ID
- VITE_FIREBASE_MEASUREMENT_ID
- SUPABASE_URL
- SUPABASE_ANON_KEY

**Deploy URL:** https://ac1684882-arch.github.io/escala/

---

#### **2. Keep-Alive Workflow** (`.github/workflows/keep-alive.yml`)

**Trigger:** Cron (a cada 6 dias às 00:00 UTC)

**Função:** Fazer ping no Supabase para evitar pausa do projeto (plano gratuito pausa após 7 dias de inatividade)

**Query executada:**
```bash
curl -X GET "$SUPABASE_URL/rest/v1/usuarios?select=count&limit=1" \
  -H "apikey: $SUPABASE_ANON_KEY"
```

**Secrets necessários:**
- SUPABASE_URL
- SUPABASE_ANON_KEY

---

## 💰 **Custos e Limites**

### **Firebase Authentication**

| Recurso | Limite Gratuito | Uso Atual | Status |
|---------|-----------------|-----------|--------|
| Usuários ativos | 50.000/mês | ~50 | ✅ |
| Verificações de email | Ilimitado | - | ✅ |
| Armazenamento | - | 0 MB | ✅ |

**Custo:** $0/mês ✅

---

### **Supabase (Plano Free)**

| Recurso | Limite Gratuito | Uso Atual | Status |
|---------|-----------------|-----------|--------|
| Database | 500 MB | ~1 MB | ✅ |
| API Requests | Ilimitado | ~500/mês | ✅ |
| Auth Users | 50.000 | 12 | ✅ |
| Storage | 1 GB | 0 MB | ✅ |
| Realtime | Habilitado | Não usado | ✅ |
| Edge Functions | 500.000 invocações | 0 | ✅ |
| **Inatividade** | Pausa após 7 dias | Keep-alive ativo | ✅ |

**Custo:** $0/mês ✅ (com keep-alive)

---

### **GitHub**

| Recurso | Limite Gratuito | Uso Atual | Status |
|---------|-----------------|-----------|--------|
| Actions | 2000 min/mês | ~10 min/mês | ✅ |
| Pages | 100 GB/mês | <1 GB/mês | ✅ |
| Storage | 500 MB | ~10 MB | ✅ |

**Custo:** $0/mês ✅

---

## 📊 **Estatísticas do Sistema**

### **Dados atuais:**

- **Usuários**: 12 (10 maqueiros + 2 enfermeiros)
- **Escalas**: 3 (Julho 2026)
- **Bloqueios**: 1
- **Configurações**: 1 (Julho 2026)

### **Tipos de Maqueiros:**

| Tipo | Quantidade | Turno | Características |
|------|------------|-------|-----------------|
| Normal Manhã | 5 | 07:00-16:00 | Escolhem 1 sábado/mês |
| Normal Tarde | 3 | 11:00-20:00 | Escolhem 1 sábado/mês |
| Fixo Sábado | 2 | 11:00-20:00 | Trabalham todo sábado à tarde, folga fixa toda segunda |

---

## 🔐 **Segurança**

### **Autenticação:**
- ✅ Firebase Auth (JWT tokens)
- ⚠️ Senhas em plaintext no banco (melhorar)
- ⚠️ Sem integração JWT Firebase ↔ Supabase ainda

### **Autorização:**
- ⚠️ RLS permissivo (público pode ler/escrever)
- ⚠️ Sem verificação de roles no backend

### **Recomendações:**
1. ✅ Implementar hash de senhas (bcrypt)
2. ✅ Integrar Firebase JWT com Supabase RLS
3. ✅ Implementar verificação de roles
4. ✅ HTTPS em produção (já tem via GitHub Pages)
5. ✅ Rate limiting no Supabase

---

## 📝 **Regras de Negócio**

### **Maqueiros Normais:**
1. Escolhem **1 sábado por mês** para trabalhar
2. Após escolher sábado, podem escolher **1 folga** em dia útil (seg-sex)
3. Folgas só liberadas quando **todos** escolheram seus sábados
4. Enfermeiro pode liberar folgas manualmente

### **Maqueiros Fixos:**
1. Trabalham **todos os sábados à tarde** automaticamente
2. Folga fixa **toda segunda-feira**
3. Não precisam escolher nada no sistema

### **Enfermeiros:**
1. Visualizam todas as escalas
2. Podem editar qualquer escala manualmente
3. Bloqueiam/desbloqueiam datas
4. Configuram vagas por sábado
5. Podem resetar escalas do mês

---

## 🧪 **Testes**

### **Playwright E2E:**

**Arquivo de configuração:** `playwright.config.ts`

**Testes implementados:**
- `tests/login.spec.ts` - Login/Logout
- `tests/enfermeiro.spec.ts` - Dashboard enfermeiro
- `tests/maqueiro.spec.ts` - Dashboard maqueiro

**Executar:**
```bash
npm test              # Headless
npm run test:ui       # UI Mode
npm run test:headed   # Com navegador
```

**Status:** ⚠️ 6 de 90 testes falharam (ver `ERROS_PLAYWRIGHT.md`)

---

## 📖 **Documentação Adicional**

| Arquivo | Descrição |
|---------|-----------|
| `README.md` | Visão geral do projeto |
| `SETUP_COMPLETO.md` | Setup passo a passo |
| `PROXIMOS_PASSOS.md` | Checklist de deploy |
| `TESTES_PLAYWRIGHT.md` | Guia dos testes E2E |
| `ERROS_PLAYWRIGHT.md` | Erros dos testes e soluções |
| `supabase/init.sql` | Schema do banco de dados |
| `tests/README.md` | Documentação detalhada dos testes |

---

## 🚀 **Comandos Úteis**

### **Desenvolvimento:**
```bash
npm install           # Instalar dependências
npm run dev          # Servidor dev (localhost:3000)
npm run build        # Build para produção
npm run preview      # Preview do build
npm run lint         # Verificar erros TypeScript
```

### **Testes:**
```bash
npm test             # Executar testes Playwright
npm run test:ui      # UI Mode (recomendado)
npm run test:report  # Ver relatório HTML
```

### **Deploy:**
```bash
git add .
git commit -m "Mensagem"
git push origin main  # Deploy automático via GitHub Actions
```

---

## 🔗 **Links Importantes**

### **Produção:**
- **Site:** https://ac1684882-arch.github.io/escala/
- **GitHub:** https://github.com/ac1684882-arch/escala

### **Desenvolvimento:**
- **Supabase Dashboard:** https://supabase.com/dashboard/project/iwvtfyuxwfgknqurkvcf
- **Firebase Console:** https://console.firebase.google.com/project/escaladosfuncionarios
- **GitHub Actions:** https://github.com/ac1684882-arch/escala/actions

### **Monitoramento:**
- **Keep-Alive:** https://github.com/ac1684882-arch/escala/actions/workflows/keep-alive.yml
- **Deploy:** https://github.com/ac1684882-arch/escala/actions/workflows/deploy.yml

---

## 👥 **Credenciais de Teste**

### **Enfermeiros:**
- Login: `ana.paula` / Senha: `123`
- Login: `renato.silva` / Senha: `123`

### **Maqueiros Normais (Manhã):**
- Login: `joao.silva` / Senha: `123`
- Login: `pedro.santos` / Senha: `123`
- Login: `ricardo.oliveira` / Senha: `123`
- Login: `lucas.costa` / Senha: `123`
- Login: `andre.souza` / Senha: `123`

### **Maqueiros Normais (Tarde):**
- Login: `bruno.rocha` / Senha: `123`
- Login: `thiago.alves` / Senha: `123`
- Login: `rodrigo.ferreira` / Senha: `123`

### **Maqueiros Fixos (Sábado):**
- Login: `carlos.souza` / Senha: `123`
- Login: `marcos.lima` / Senha: `123`

---

## 📞 **Suporte**

### **Problemas Comuns:**

1. **"Tela branca no GitHub Pages"**
   - Usar Firebase Hosting ao invés
   - Ou ajustar base URL no Vite config

2. **"Supabase pausou"**
   - Executar keep-alive manualmente
   - Verificar GitHub Actions

3. **"Dados não aparecem"**
   - Verificar conexão Supabase
   - Verificar RLS policies
   - Ver console do navegador (F12)

4. **"Testes falhando"**
   - Ver `ERROS_PLAYWRIGHT.md`
   - Usar `npm run test:ui` para debug

---

## 📅 **Changelog**

### **v1.0.0** (28/02/2026)
- ✅ Migração de localStorage para Supabase
- ✅ Integração Firebase Auth
- ✅ GitHub Actions (Deploy + Keep-Alive)
- ✅ Testes Playwright E2E
- ✅ Documentação completa

---

## 🎯 **Próximos Passos (Roadmap)**

### **Curto Prazo:**
- [ ] Corrigir testes Playwright
- [ ] Implementar hash de senhas
- [ ] Integrar Firebase JWT com Supabase RLS
- [ ] Deploy no Firebase Hosting

### **Médio Prazo:**
- [ ] Adicionar notificações push
- [ ] Implementar dashboard de métricas
- [ ] Exportação de escalas (PDF/Excel)
- [ ] Histórico de mudanças

### **Longo Prazo:**
- [ ] App mobile (React Native)
- [ ] Inteligência Artificial para sugestões de escala
- [ ] Integração com sistemas da Prefeitura
- [ ] Multi-tenant (múltiplas unidades)

---

**Documentação criada em:** 28/02/2026  
**Última atualização:** 28/02/2026  
**Versão:** 1.0.0  
**Autor:** Sistema de Escala - Prefeitura do Rio
