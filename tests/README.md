# 🎭 Testes E2E com Playwright

## 📋 **Testes Implementados:**

### **1. Login (login.spec.ts)**
- ✅ Exibir tela de login
- ✅ Login como enfermeiro
- ✅ Login como maqueiro
- ✅ Rejeitar credenciais inválidas
- ✅ Fazer logout

### **2. Dashboard Enfermeiro (enfermeiro.spec.ts)**
- ✅ Exibir métricas do dashboard
- ✅ Exibir calendário
- ✅ Navegar entre abas
- ✅ Filtrar calendário por turno
- ✅ Buscar maqueiro
- ✅ Navegar entre meses
- ✅ Acessar configurações

### **3. Dashboard Maqueiro (maqueiro.spec.ts)**
- ✅ Exibir status da escala
- ✅ Exibir seletor de sábados
- ✅ Exibir calendário geral
- ✅ Mostrar folgas bloqueadas
- ✅ Exibir maqueiros fixos corretamente
- ✅ Navegar entre meses

---

## 🚀 **Como Executar:**

### **Executar todos os testes (headless):**
```bash
npm test
```

### **Executar com interface visual:**
```bash
npm run test:headed
```

### **Executar com UI Mode (recomendado para debug):**
```bash
npm run test:ui
```

### **Ver relatório após execução:**
```bash
npm run test:report
```

---

## 🎯 **Executar testes específicos:**

### **Apenas testes de login:**
```bash
npx playwright test login
```

### **Apenas testes de enfermeiro:**
```bash
npx playwright test enfermeiro
```

### **Apenas testes de maqueiro:**
```bash
npx playwright test maqueiro
```

---

## 🌐 **Executar em browsers específicos:**

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

### **Mobile Chrome:**
```bash
npx playwright test --project="Mobile Chrome"
```

---

## 📊 **Relatórios:**

Após executar os testes, um relatório HTML é gerado automaticamente.

Para visualizar:
```bash
npm run test:report
```

---

## 🐛 **Debug:**

### **Modo debug (passo a passo):**
```bash
npx playwright test --debug
```

### **Executar com Playwright Inspector:**
```bash
PWDEBUG=1 npx playwright test
```

---

## 📸 **Screenshots e Vídeos:**

- **Screenshots**: Capturados automaticamente em caso de falha
- **Vídeos**: Gravados automaticamente quando testes falham
- **Traces**: Salvos no primeiro retry

Localização: `test-results/`

---

## ⚙️ **Configuração:**

A configuração está em `playwright.config.ts`:

- **Timeout**: 30 segundos por teste
- **Retries**: 2 retries em CI, 0 localmente
- **Base URL**: http://localhost:3000
- **Servidor**: Inicia automaticamente (`npm run dev`)

---

## 📝 **Estrutura dos Testes:**

```
tests/
├── login.spec.ts         # Testes de autenticação
├── enfermeiro.spec.ts    # Testes do dashboard enfermeiro
├── maqueiro.spec.ts      # Testes do dashboard maqueiro
└── README.md            # Esta documentação
```

---

## ✅ **Cobertura de Testes:**

| Funcionalidade | Testado |
|----------------|---------|
| **Login** | ✅ |
| **Logout** | ✅ |
| **Dashboard Enfermeiro** | ✅ |
| **Dashboard Maqueiro** | ✅ |
| **Calendário** | ✅ |
| **Navegação** | ✅ |
| **Filtros** | ✅ |
| **Busca** | ✅ |
| **Maqueiros Fixos** | ✅ |

---

## 🔄 **CI/CD:**

Os testes podem ser integrados ao GitHub Actions:

```yaml
- name: Install Playwright
  run: npx playwright install --with-deps

- name: Run tests
  run: npm test
```

---

## 📚 **Recursos:**

- [Documentação Playwright](https://playwright.dev)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Test Generator](https://playwright.dev/docs/codegen)

---

**Testes criados e prontos para uso!** 🎉
