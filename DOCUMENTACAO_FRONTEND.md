# 🎨 Documentação Frontend - Sistema de Escala de Funcionários

## 📦 **Stack Tecnológico**

```json
{
  "framework": "React 19.0.1",
  "language": "TypeScript 5.8.2",
  "build": "Vite 6.2.3",
  "styling": "Tailwind CSS 4.1.14",
  "animation": "Motion 12.23.24",
  "icons": "Lucide React 0.546.0",
  "auth": "Firebase 11.1.0",
  "database": "Supabase JS 2.48.2"
}
```

---

## 🏗️ **Arquitetura**

### **Padrão de Arquitetura:** Component-Based Architecture

```
App.tsx (Container)
    │
    ├── PrefeituraHeader (Layout)
    │
    ├── LoginScreen (Auth)
    │
    ├── NurseDashboard (Feature)
    │   ├── CalendarView (Shared)
    │   └── StretcherManagement (Feature)
    │
    └── MaqueiroDashboard (Feature)
        └── CalendarView (Shared)
```

---

## 📁 **Estrutura de Diretórios**

```
src/
├── components/           # Componentes React
│   ├── CalendarView.tsx       # 📅 Calendário reutilizável
│   ├── LoginScreen.tsx        # 🔐 Tela de autenticação
│   ├── MaqueiroDashboard.tsx  # 👷 Dashboard maqueiro
│   ├── NurseDashboard.tsx     # 👩‍⚕️ Dashboard enfermeiro
│   ├── PrefeituraHeader.tsx   # 🏛️ Cabeçalho institucional
│   └── StretcherManagement.tsx # ⚙️ CRUD maqueiros
│
├── config/               # Configurações
│   ├── firebase.ts      # 🔥 Setup Firebase
│   └── supabase.ts      # 🗄️ Setup Supabase
│
├── utils/                # Utilitários
│   └── supabaseStorage.ts  # 💾 Camada de dados
│
├── types.ts              # 📝 TypeScript Interfaces
├── App.tsx               # 🎯 Componente raiz
├── main.tsx              # 🚀 Entry point
├── index.css             # 🎨 Estilos globais
└── vite-env.d.ts         # 📦 Tipos Vite
```

---

## 🧩 **Componentes**

### **1. App.tsx (Container Principal)**

**Responsabilidades:**
- Gerenciamento de estado global
- Roteamento condicional baseado em autenticação
- Orquestração de todos os componentes

**Estado:**
```typescript
const [currentUser, setCurrentUser] = useState<Usuario | null>(null)
const [usuarios, setUsuarios] = useState<Usuario[]>([])
const [escalas, setEscalas] = useState<Escala[]>([])
const [bloqueios, setBloqueios] = useState<Bloqueio[]>([])
const [config, setConfig] = useState<Configuracao>({...})
const [currentMonthStr, setCurrentMonthStr] = useState('2026-07')
```

**Handlers:**
- `handleLoginSuccess(user)`
- `handleLogout()`
- `handleAddUser(user)`
- `handleUpdateUser(user)`
- `handleChooseSaturday(date)`
- `handleChooseFolga(date)`
- `handleUpdateConfig(config)`
- `handleAddBloqueio(bloqueio)`
- `handleRemoveBloqueio(id)`
- `handleResetEscalas()`

**Renderização Condicional:**
```typescript
{!currentUser ? (
  <LoginScreen onLoginSuccess={handleLoginSuccess} />
) : currentUser.role === UserRole.ENFERMEIRO ? (
  <NurseDashboard {...props} />
) : (
  <MaqueiroDashboard {...props} />
)}
```

---

### **2. LoginScreen.tsx**

**Props:**
```typescript
interface LoginScreenProps {
  onLoginSuccess: (user: Usuario) => void;
  allUsers: Usuario[];
}
```

**Funcionalidades:**
- Input de login (usuário ou matrícula)
- Input de senha
- Validação de credenciais
- Opção de visualizar credenciais de teste
- Design institucional (Super Centro Carioca do Olho (CCO))

**Validação:**
```typescript
const user = allUsers.find(u => 
  (u.login === login || u.matricula === login) && 
  u.senha === password &&
  u.ativo
)
```

---

### **3. NurseDashboard.tsx**

**Props:**
```typescript
interface NurseDashboardProps {
  usuarios: Usuario[];
  escalas: Escala[];
  bloqueios: Bloqueio[];
  config: Configuracao;
  currentUser: Usuario;
  currentMonthStr: string;
  onMonthChange: (monthStr: string) => void;
  onAddUser: (user: Usuario) => void;
  onUpdateUser: (user: Usuario) => void;
  onUpdateConfig: (config: Configuracao) => void;
  onAddBloqueio: (bloqueio: Bloqueio) => void;
  onRemoveBloqueio: (id: string) => void;
  onUpdateEscalaManual: (userId, sabado, folga) => void;
  onResetEscalas: () => void;
}
```

**Abas:**
1. **Escala** - Visualização do calendário geral
2. **Pessoal** - Gerenciamento de maqueiros
3. **Configurações** - Regras e bloqueios

**Métricas Exibidas:**
- Total de maqueiros ativos
- Sábados agendados
- Folgas definidas
- Status de liberação de folgas

**Funcionalidades:**
- ✅ CRUD completo de maqueiros
- ✅ Edição manual de escalas (clique no calendário)
- ✅ Bloqueio/desbloqueio de datas
- ✅ Configuração de vagas por sábado
- ✅ Liberação manual de folgas
- ✅ Reset de escalas do mês
- ✅ Filtros por turno
- ✅ Busca por funcionário

---

### **4. MaqueiroDashboard.tsx**

**Props:**
```typescript
interface MaqueiroDashboardProps {
  currentUser: Usuario;
  currentMonthStr: string;
  onMonthChange: (monthStr: string) => void;
  usuarios: Usuario[];
  escalas: Escala[];
  bloqueios: Bloqueio[];
  config: Configuracao;
  onChooseSaturday: (sabadoDate: string) => void;
  onChooseFolga: (folgaDate: string) => void;
  onClearEscala: () => void;
}
```

**Layout:**
1. **Status Cards** (3 cards)
   - Passo 1: Sábado de Plantão
   - Passo 2: Folga Compensatória
   - Sua Escala Operacional

2. **Seletores** (2 painéis)
   - Escolher Sábado (lista de sábados com vagas)
   - Escolher Folga (lista de dias úteis)

3. **Calendário Geral** (read-only)
   - Visualização de todas as escalas

**Regras de Exibição:**

**Maqueiros Normais:**
```typescript
if (chosenSaturday === null) {
  // Mostrar seletores de sábado (habilitado)
  // Mostrar seletores de folga (bloqueado)
} else if (!isFolgasUnlocked) {
  // Mostrar sábado selecionado
  // Mostrar folga bloqueada (aguardando liberação)
} else {
  // Mostrar sábado selecionado
  // Mostrar seletores de folga (habilitado)
}
```

**Maqueiros Fixos:**
```typescript
// Mostrar apenas aviso:
// "Escala Fixa Programada"
// "Todo sábado à tarde + Folga toda segunda"
```

---

### **5. CalendarView.tsx**

**Props:**
```typescript
interface CalendarViewProps {
  currentMonthStr: string;
  onMonthChange: (monthStr: string) => void;
  usuarios: Usuario[];
  escalas: Escala[];
  bloqueios: Bloqueio[];
  config: Configuracao;
  currentUser: Usuario;
  onDayClick?: (dateStr, isSaturday, isWeekday) => void;
}
```

**Funcionalidades:**
- Grid de calendário mensal
- Navegação entre meses (← →)
- Filtro por turno (Manhã/Tarde/Todos)
- Busca por funcionário
- Indicadores visuais:
  - 🔵 Sábado disponível (vagas livres)
  - 🔵 Sábado ocupado (sem vagas)
  - 🟢 Folga compensatória
  - 🟢 Folga fixa (segundas)
  - 🔴 Data bloqueada
  - ⚪ Domingo (sem expediente)

**Cálculo de Vagas:**
```typescript
const slotsOccupied = escalas.filter(e => 
  e.mesAno === currentMonth && 
  e.sabadoTrabalho === date
).length

const slotsAvailable = Math.max(0, 
  config.vagasPorSabado - slotsOccupied
)
```

**Click Handler:**
```typescript
onDayClick={(dateStr, isSaturday, isWeekday) => {
  if (isNurse) {
    // Abrir modal de edição manual
  } else if (isSaturday) {
    // Escolher sábado (se for maqueiro)
  } else if (isWeekday) {
    // Escolher folga (se liberado)
  }
}}
```

---

### **6. StretcherManagement.tsx**

**Props:**
```typescript
interface StretcherManagementProps {
  usuarios: Usuario[];
  onAddUser: (user: Usuario) => void;
  onUpdateUser: (user: Usuario) => void;
}
```

**Funcionalidades:**
- Listagem de todos os maqueiros
- Adicionar novo maqueiro
- Editar maqueiro existente
- Ativar/desativar maqueiro
- Separação visual por turno

**Formulário:**
```typescript
interface FormData {
  nome: string;
  matricula: string;
  login: string;
  senha: string;
  turno: 'manha' | 'tarde';
  tipo: 'normal' | 'fixo_sabado';
}
```

---

### **7. PrefeituraHeader.tsx**

**Props:**
```typescript
interface PrefeituraHeaderProps {
  currentUser: Usuario | null;
  onLogout: () => void;
  allUsersForSwitching: Usuario[];
  onSwitchUser: (user: Usuario) => void;
}
```

**Elementos:**
- Logo da Super Centro Carioca do Olho (CCO) (SVG)
- Título institucional
- Nome do usuário logado
- Badge de role (Enfermeiro/Maqueiro)
- Botão de logout
- Switcher de usuário (desenvolvimento)

---

## 🎨 **Design System**

### **Cores (Super Centro Carioca do Olho (CCO)):**

```css
/* Azul Rio (Principal) */
--azul-rio: #005C9E;
--azul-rio-escuro: #003B66;
--azul-rio-claro: #E3F2FD;

/* Verde Rio (Sucesso) */
--verde-rio: #2E7D32;
--verde-rio-escuro: #1B5E20;

/* Vermelho (Alerta) */
--vermelho: #C62828;

/* Amarelo (Aviso) */
--amarelo: #FFB300;

/* Cinzas */
--cinza-50: #F8F9FA;
--cinza-100: #F1F3F4;
--cinza-200: #E8EAED;
--cinza-500: #9AA0A6;
--cinza-800: #3C4043;
```

### **Tipografia:**

```css
/* Font Family */
font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;

/* Tamanhos */
text-xs: 0.75rem;    /* 12px */
text-sm: 0.875rem;   /* 14px */
text-base: 1rem;     /* 16px */
text-lg: 1.125rem;   /* 18px */
text-xl: 1.25rem;    /* 20px */
text-2xl: 1.5rem;    /* 24px */

/* Pesos */
font-medium: 500;
font-semibold: 600;
font-bold: 700;
font-extrabold: 800;
font-black: 900;
```

### **Espaçamentos:**

```css
/* Padding/Margin */
p-2: 0.5rem;   /* 8px */
p-3: 0.75rem;  /* 12px */
p-4: 1rem;     /* 16px */
p-5: 1.25rem;  /* 20px */
p-6: 1.5rem;   /* 24px */
```

### **Componentes:**

**Card:**
```tsx
<div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
  {children}
</div>
```

**Button Primary:**
```tsx
<button className="bg-[#005C9E] hover:bg-[#004D85] text-white font-bold py-2 px-4 rounded-lg transition shadow-sm">
  Texto
</button>
```

**Button Danger:**
```tsx
<button className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition">
  Texto
</button>
```

**Input:**
```tsx
<input className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#005C9E]" />
```

---

## 🔄 **Fluxo de Dados**

### **Padrão de Comunicação:**

```
Componente (UI Event)
    ↓
Handler no App.tsx
    ↓
Async function em supabaseStorage.ts
    ↓
Supabase Client (HTTP Request)
    ↓
PostgreSQL (Database)
    ↓
Response Data
    ↓
setState em App.tsx
    ↓
Props para componente
    ↓
Re-render (UI atualizada)
```

### **Exemplo Completo:**

```typescript
// 1. Usuário clica no botão "Escolher Sábado"
<button onClick={() => handleSelectSaturday('2026-07-04')}>

// 2. Handler no MaqueiroDashboard
const handleSelectSaturday = (date) => {
  onChooseSaturday(date);
}

// 3. Handler no App.tsx
const handleChooseSaturday = async (sabadoDate: string) => {
  if (!currentUser) return;
  try {
    // 4. Chama função de storage
    await updateOrCreateEscala(
      currentUser.id, 
      currentMonthStr, 
      sabadoDate, 
      null
    );
    
    // 5. Busca dados atualizados
    const updatedEscalas = await getEscalas();
    
    // 6. Atualiza estado
    setEscalas(updatedEscalas);
  } catch (error) {
    console.error('Erro ao escolher sábado:', error);
  }
};

// 7. React re-renderiza componentes com novos dados
```

---

## 🔐 **Autenticação**

### **Fluxo de Login:**

```typescript
// 1. LoginScreen.tsx
const handleLogin = () => {
  const user = allUsers.find(u => 
    (u.login === login || u.matricula === login) &&
    u.senha === password &&
    u.ativo
  );
  
  if (user) {
    onLoginSuccess(user);
  }
}

// 2. App.tsx
const handleLoginSuccess = (user: Usuario) => {
  setCurrentUser(user);
}

// 3. App.tsx (render)
{currentUser && (
  currentUser.role === UserRole.ENFERMEIRO ? (
    <NurseDashboard currentUser={currentUser} />
  ) : (
    <MaqueiroDashboard currentUser={currentUser} />
  )
)}
```

### **Proteção de Rotas:**

```typescript
// Sem biblioteca de rotas, proteção via renderização condicional
{!currentUser ? (
  <LoginScreen />  // Não autenticado
) : (
  <Dashboard />    // Autenticado
)}
```

---

## 📱 **Responsividade**

### **Breakpoints (Tailwind):**

```css
sm: 640px   /* Tablet */
md: 768px   /* Desktop pequeno */
lg: 1024px  /* Desktop */
xl: 1280px  /* Desktop grande */
```

### **Estratégia Mobile-First:**

```tsx
// Mobile (default)
<div className="grid grid-cols-1 gap-4">

// Tablet+
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">

// Desktop+
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
```

---

## ⚡ **Performance**

### **Otimizações Implementadas:**

1. **Code Splitting** (Vite automático)
2. **Lazy Loading** de componentes
3. **Memoização** com React.memo() onde necessário
4. **Debounce** em inputs de busca
5. **Virtual Scrolling** não implementado (não necessário)

### **Bundle Size:**

```
dist/assets/
├── index-[hash].js    ~150 KB (gzip)
├── index-[hash].css   ~15 KB (gzip)
└── vendor-[hash].js   ~300 KB (gzip) - React, Firebase, Supabase
```

---

## 🐛 **Debug e Logging**

### **Console Logs:**

```typescript
// supabaseStorage.ts
console.log('✅ Supabase conectado com sucesso!');
console.error('❌ Erro ao conectar com Supabase:', error);
```

### **Ferramentas:**

- **React DevTools** - Inspecionar componentes
- **Network Tab** - Ver requisições Supabase
- **Console** - Logs de erro
- **Supabase Dashboard** - Monitorar queries

---

## 📦 **Build e Deploy**

### **Desenvolvimento:**
```bash
npm run dev     # Vite dev server (HMR)
# http://localhost:3000
```

### **Produção:**
```bash
npm run build   # Gera pasta dist/
npm run preview # Preview do build
```

### **Variáveis de Ambiente:**

```env
# .env.local
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

---

## 🔮 **Melhorias Futuras**

### **UX:**
- [ ] Loading states
- [ ] Toast notifications
- [ ] Skeleton loaders
- [ ] Confirmação visual de ações
- [ ] Undo/Redo

### **Performance:**
- [ ] React Query para cache
- [ ] Optimistic updates
- [ ] Service Worker (PWA)
- [ ] Image optimization

### **Acessibilidade:**
- [ ] ARIA labels completos
- [ ] Keyboard navigation
- [ ] Screen reader support
- [ ] Focus management

---

**Última atualização:** 28/02/2026  
**Versão:** 1.0.0
