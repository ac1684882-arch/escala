# 🔥 Configuração Firebase - Sistema de Escala de Maqueiros

## ✅ Migração Concluída!

O sistema foi migrado com sucesso de `localStorage` para **Firebase Firestore**.

---

## 📋 O que foi feito:

### 1. **Instalação do Firebase SDK**
```bash
npm install firebase
```

### 2. **Arquivos Criados/Modificados:**

- ✅ `src/config/firebase.ts` - Configuração do Firebase
- ✅ `src/utils/firebaseStorage.ts` - Camada de persistência com Firestore (substitui `storage.ts`)
- ✅ `.env.local` - Variáveis de ambiente (não commitado)
- ✅ `firestore.rules` - Regras de segurança do Firestore
- ✅ Atualizado: `App.tsx`, `MaqueiroDashboard.tsx`, `NurseDashboard.tsx`, `CalendarView.tsx`

### 3. **Funcionalidades Implementadas:**

- ✅ Persistência em nuvem com Firestore
- ✅ Seed automático de dados iniciais
- ✅ Operações CRUD assíncronas
- ✅ Queries otimizadas com índices
- ✅ Batch operations para performance

---

## 🚀 Próximos Passos (IMPORTANTE):

### **Passo 1: Configurar Firestore no Console**

1. Acesse: https://console.firebase.google.com/project/escaladosfuncionarios
2. Vá em **Firestore Database**
3. Clique em **Create Database**
4. Escolha:
   - **Modo de Início**: `Test mode` (por enquanto)
   - **Região**: `southamerica-east1` (São Paulo - mais próximo do Rio)
5. Clique em **Enable**

### **Passo 2: Aplicar Regras de Segurança**

Após criar o Firestore, aplique as regras:

1. No Console Firebase, vá em **Firestore Database → Rules**
2. Copie o conteúdo do arquivo `firestore.rules` deste projeto
3. Cole na área de regras
4. Clique em **Publish**

**⚠️ IMPORTANTE**: As regras atuais estão em modo permissivo para desenvolvimento.

---

## 🔐 Regras de Segurança Atuais

```javascript
// Modo DESENVOLVIMENTO (atual)
- Todos podem LER todas as coleções
- Usuários autenticados podem ESCREVER

// Para PRODUÇÃO (recomendado):
- Implementar Firebase Authentication
- Adicionar verificação de roles (enfermeiro vs maqueiro)
- Restrições por userId
```

---

## 🧪 Testar o Sistema

### **Executar localmente:**

```bash
npm run dev
```

O sistema irá:
1. ✅ Conectar ao Firebase automaticamente
2. ✅ Verificar se há dados no Firestore
3. ✅ Se vazio, carregar dados seed automaticamente (12 usuários + escalas exemplo)
4. ✅ Funcionar normalmente com todos os recursos

### **Credenciais de Teste:**

**Enfermeiro/Supervisor:**
- Login: `ana.paula` | Senha: `123`
- Login: `renato.silva` | Senha: `123`

**Maqueiros Normais (Manhã):**
- Login: `joao.silva` | Senha: `123`
- Login: `pedro.santos` | Senha: `123`
- Login: `ricardo.oliveira` | Senha: `123`
- Login: `lucas.costa` | Senha: `123`
- Login: `andre.souza` | Senha: `123`

**Maqueiros Tarde (Normais):**
- Login: `bruno.rocha` | Senha: `123`
- Login: `thiago.alves` | Senha: `123`
- Login: `rodrigo.ferreira` | Senha: `123`

**Maqueiros Fixos Sábado (Tarde):**
- Login: `carlos.souza` | Senha: `123`
- Login: `marcos.lima` | Senha: `123`

---

## 📊 Estrutura do Firestore

### **Coleções:**

```
firestore/
├── usuarios/          (Maqueiros e Enfermeiros)
│   ├── u-1
│   ├── u-2
│   └── ...
│
├── escalas/           (Escolhas de sábados e folgas)
│   ├── esc-1
│   ├── esc-2
│   └── ...
│
├── bloqueios/         (Datas bloqueadas)
│   └── bloq-1
│
└── configuracoes/     (Configurações por mês)
    └── 2026-07
```

---

## 💰 Custos Firebase (Plano Spark - Gratuito)

### **Limites Gratuitos:**
- ✅ 50,000 leituras/dia
- ✅ 20,000 escritas/dia
- ✅ 1 GB armazenamento
- ✅ 10 GB transferência/mês

### **Estimativa de Uso (1 unidade hospitalar):**
- ~50 usuários ativos
- ~500 operações/dia (leituras + escritas)
- **Custo: $0/mês** (bem dentro do plano gratuito)

### **Quando precisar do Plano Blaze:**
- ❌ **NÃO PRECISA** para este uso
- Só seria necessário para:
  - Múltiplas unidades hospitalares (>100.000 operações/dia)
  - Cloud Functions (processamento no servidor)
  - SMS Authentication

---

## 🔄 Diferenças da Versão Anterior

### **localStorage (Antes) vs Firestore (Agora):**

| Recurso | localStorage | Firestore |
|---------|-------------|-----------|
| Persistência | Só no navegador | Nuvem (global) |
| Sincronização | ❌ Não | ✅ Sim |
| Backup | ❌ Não | ✅ Automático |
| Multi-dispositivo | ❌ Não | ✅ Sim |
| Escalável | ❌ Não | ✅ Sim |
| Segurança | ⚠️ Local apenas | ✅ Regras cloud |

---

## 🛠️ Deploy para Produção

### **Opção 1: Firebase Hosting (Recomendado)**

```bash
# Instalar Firebase CLI
npm install -g firebase-tools

# Login no Firebase
firebase login

# Inicializar hosting
firebase init hosting

# Build do projeto
npm run build

# Deploy
firebase deploy --only hosting
```

### **Opção 2: Vercel/Netlify**

O projeto também funciona em qualquer plataforma de hosting estático:

```bash
npm run build
# Upload da pasta dist/
```

---

## 🔒 Segurança Adicional (Produção)

### **Recomendações:**

1. **Implementar Firebase Authentication:**
   ```typescript
   // Substituir login manual por:
   import { signInWithEmailAndPassword } from 'firebase/auth';
   ```

2. **Atualizar Regras Firestore:**
   ```javascript
   // Verificar role do usuário
   function isEnfermeiro() {
     return get(/databases/$(database)/documents/usuarios/$(request.auth.uid)).data.role == 'enfermeiro';
   }
   ```

3. **Adicionar validação de dados:**
   - Schema validation nas regras
   - Timestamps automáticos
   - Auditoria de mudanças

---

## 📞 Suporte

Em caso de problemas:

1. Verificar Console do Firebase: https://console.firebase.google.com/
2. Verificar console do navegador (F12)
3. Verificar logs no terminal onde `npm run dev` está rodando

---

## ✅ Checklist de Validação

Antes de considerar pronto:

- [ ] Firestore Database criado no console
- [ ] Regras de segurança aplicadas
- [ ] Sistema rodando localmente (`npm run dev`)
- [ ] Login funcionando
- [ ] Dados seed carregados automaticamente
- [ ] Operações CRUD funcionando (criar/editar/deletar escalas)
- [ ] Calendário sincronizando em tempo real

---

**Sistema pronto para desenvolvimento e testes!** 🎉

Para produção, siga os passos de segurança adicional.
