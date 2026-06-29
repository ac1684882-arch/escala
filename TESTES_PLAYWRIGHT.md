# 🎭 Guia Rápido - Testes Playwright

## ✅ **Testes Implementados!**

Criamos uma suite completa de testes E2E cobrindo:
- ✅ Login (enfermeiro e maqueiro)
- ✅ Dashboard do enfermeiro
- ✅ Dashboard do maqueiro
- ✅ Navegação e filtros
- ✅ Calendário
- ✅ Funcionalidades principais

---

## 🚀 **Como Executar:**

### **1. Executar TODOS os testes (modo visual - recomendado):**
```bash
npm run test:ui
```

Isso abre uma interface interativa onde você pode:
- Ver os testes rodando em tempo real
- Debug passo a passo
- Ver screenshots e vídeos
- Executar testes individuais

### **2. Executar testes em modo headless (mais rápido):**
```bash
npm test
```

### **3. Executar com navegador visível:**
```bash
npm run test:headed
```

### **4. Ver relatório após execução:**
```bash
npm run test:report
```

---

## 🎯 **Executar Testes Específicos:**

### **Apenas login:**
```bash
npx playwright test login
```

### **Apenas enfermeiro:**
```bash
npx playwright test enfermeiro
```

### **Apenas maqueiro:**
```bash
npx playwright test maqueiro
```

---

## 🌐 **Executar em Navegadores Específicos:**

### **Apenas Chrome:**
```bash
npx playwright test --project=chromium
```

### **Apenas Firefox:**
```bash
npx playwright test --project=firefox
```

### **Apenas Safari:**
```bash
npx playwright test --project=webkit
```

---

## 📱 **Mobile:**

```bash
npx playwright test --project="Mobile Chrome"
npx playwright test --project="Mobile Safari"
```

---

## 🐛 **Debug:**

### **Modo debug passo a passo:**
```bash
npx playwright test --debug
```

### **UI Mode (MELHOR opção):**
```bash
npm run test:ui
```

---

## 📊 **Cobertura:**

| Funcionalidade | Status |
|----------------|--------|
| Login/Logout | ✅ |
| Dashboard Enfermeiro | ✅ |
| Dashboard Maqueiro | ✅ |
| Calendário | ✅ |
| Filtros | ✅ |
| Navegação | ✅ |
| Maqueiros Fixos | ✅ |

---

## ⚠️ **Problemas Comuns:**

### **"Timeout exceeded":**
- O servidor dev precisa estar rodando
- Aumentar timeout em `playwright.config.ts`

### **"Element not found":**
- Seletores podem ter mudado
- Use UI Mode para debug

### **"Port already in use":**
- Feche outros servidores na porta 3000
- Ou mude a porta em `playwright.config.ts`

---

## 📂 **Estrutura:**

```
tests/
├── login.spec.ts         # Testes de autenticação
├── enfermeiro.spec.ts    # Dashboard enfermeiro
├── maqueiro.spec.ts      # Dashboard maqueiro
└── README.md            # Documentação detalhada
```

---

## 🎬 **Screenshots e Vídeos:**

Salvos automaticamente em `test-results/` quando testes falham.

---

## 🔄 **CI/CD:**

Para adicionar ao GitHub Actions, veja o arquivo `.github/workflows/test.yml` (a criar).

---

**Para mais detalhes, veja:** `tests/README.md`

**Comece com:** `npm run test:ui` 🎭
