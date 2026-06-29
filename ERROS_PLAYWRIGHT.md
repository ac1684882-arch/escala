# 🐛 Erros dos Testes Playwright

## 📊 **Resumo da Execução:**

## Status apos correcao

- Seletores atualizados para usar `data-testid` e roles estaveis.
- Fluxo de login protegido contra tentativa antes da carga inicial dos usuarios.
- Suite validada com `npm test`: 80 testes passaram em Chromium, Firefox, WebKit, Mobile Chrome e Mobile Safari.

- **Total de testes**: 90 testes
- **Executados**: 8 testes
- **Falharam**: 6 testes
- **Status**: ❌ Testes falharam

---

## ❌ **Erro 1: Strict Mode Violation**

**Teste:** `[chromium] › tests\login.spec.ts:8:3 › Sistema de Login › deve exibir tela de login`

**Erro:**
```
Error: expect(locator).toBeVisible() failed
Locator: locator('text=Prefeitura do Rio')
Expected: visible
Error: strict mode violation: locator('text=Prefeitura do Rio') resolved to 2 elements:
    1) <h1>Prefeitura do Rio</h1>
    2) <div>Prefeitura do Rio de Janeiro • Secretaria Municipal de Saúde • SMS-Rio</div>
```

**Causa:** O seletor `text=Prefeitura do Rio` encontrou 2 elementos na página (header e footer).

**Solução:**
- Usar seletor mais específico
- Usar `getByRole('heading', { name: 'Prefeitura do Rio' })` 
- Ou usar `.first()` para pegar o primeiro elemento

---

## ⏱️ **Erro 2-6: Timeout (30 segundos)**

**Testes afetados:**
1. `[chromium] › tests\enfermeiro.spec.ts › deve exibir métricas do dashboard`
2. `[chromium] › tests\login.spec.ts › deve fazer login como enfermeiro`
3. `[chromium] › tests\enfermeiro.spec.ts › deve exibir calendário`
4. `[chromium] › tests\login.spec.ts › deve fazer login como maqueiro`
5. `[chromium] › tests\enfermeiro.spec.ts › deve navegar entre abas`
6. `[chromium] › tests\enfermeiro.spec.ts › deve filtrar calendário por turno`

**Erro:**
```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('button:has-text("Acessar Sistema")')
```

**Causa:** 
1. O botão "Acessar Sistema" não está sendo encontrado
2. Possíveis razões:
   - Texto do botão é diferente
   - Botão ainda não carregou
   - Supabase não conectou
   - Dados não carregaram

**Solução:**
- Verificar o texto exato do botão no componente `LoginScreen.tsx`
- Aumentar timeout para 60 segundos
- Usar seletor mais genérico: `button[type="submit"]`
- Adicionar `waitForLoadState('networkidle')` antes de interagir

---

## 🔍 **Análise dos Problemas:**

### **Problema Principal: Seletores Inconsistentes**

Os testes estão usando seletores baseados em texto que podem:
1. Não existir exatamente como escrito
2. Existir em múltiplos lugares
3. Estar em português mas o teste espera em inglês

### **Seletores Problemáticos:**

| Seletor Usado | Problema |
|---------------|----------|
| `text=Prefeitura do Rio` | 2 elementos com esse texto |
| `button:has-text("Acessar Sistema")` | Texto pode ser diferente |
| `text=Sistema de Escala de Maqueiros` | Pode não existir exatamente assim |
| `input[type="text"]` | Pode ser `type="email"` ou outro |

---

## ✅ **Soluções Recomendadas:**

### **1. Usar Data-TestId (MELHOR):**

```typescript
// No componente:
<button data-testid="login-button">Acessar Sistema</button>

// No teste:
await page.getByTestId('login-button').click();
```

### **2. Usar Role-based Selectors:**

```typescript
// Melhor que text selectors
await page.getByRole('button', { name: /acess/i }).click();
await page.getByRole('heading', { name: 'Prefeitura do Rio' }).first();
```

### **3. Aumentar Timeouts:**

```typescript
// No playwright.config.ts
timeout: 60 * 1000,  // 60 segundos ao invés de 30

// Ou por teste:
await expect(element).toBeVisible({ timeout: 15000 });
```

### **4. Aguardar Carregamento:**

```typescript
await page.waitForLoadState('networkidle');
await page.waitForTimeout(2000); // Aguardar dados do Supabase
```

---

## 📝 **Próximas Ações:**

### **Opção 1: Adicionar data-testid aos componentes**

Modificar componentes principais:

```tsx
// LoginScreen.tsx
<input data-testid="login-input" type="text" />
<input data-testid="password-input" type="password" />
<button data-testid="login-button">Acessar Sistema</button>

// NurseDashboard.tsx
<div data-testid="nurse-dashboard">...</div>

// MaqueiroDashboard.tsx
<div data-testid="stretcher-dashboard">...</div>
```

### **Opção 2: Usar seletores mais robustos (MAIS RÁPIDO)**

Atualizar arquivos de teste:

```typescript
// Ao invés de:
await page.locator('button:has-text("Acessar Sistema")').click();

// Usar:
await page.locator('button[type="submit"]').click();
// ou
await page.getByRole('button', { name: /acess/i }).click();
```

### **Opção 3: Usar Page Objects (MELHOR para manutenção)**

Criar classes que encapsulam as interações:

```typescript
// pages/LoginPage.ts
export class LoginPage {
  async login(username: string, password: string) {
    await this.page.locator('input').first().fill(username);
    await this.page.locator('input[type="password"]').fill(password);
    await this.page.locator('button').first().click();
  }
}
```

---

## 🎯 **Recomendação Final:**

Para corrigir os testes **AGORA**, fazer:

1. ✅ **Atualizar seletores** nos testes para serem mais genéricos
2. ✅ **Aumentar timeout** para 60 segundos
3. ✅ **Adicionar waits** para aguardar dados do Supabase
4. ✅ **Usar `.first()`** quando houver múltiplos elementos

Para o **FUTURO** (melhor prática):

1. ⭐ **Adicionar data-testid** em todos os componentes interativos
2. ⭐ **Criar Page Objects** para encapsular lógica de interação
3. ⭐ **Usar fixtures** para compartilhar estado entre testes

---

## 📂 **Arquivos com Problemas:**

```
tests/
├── login.spec.ts         ❌ 3 testes falharam
├── enfermeiro.spec.ts    ❌ 3 testes falharam
└── maqueiro.spec.ts      ⏸️ Não executou (timeout nos anteriores)
```

---

## 🛠️ **Como Executar Novamente:**

```bash
# Executar todos
npm test

# Executar com UI (recomendado para debug)
npm run test:ui

# Executar apenas login
npx playwright test login

# Ver relatório
npm run test:report
```

---

## 📸 **Evidências:**

Screenshots e vídeos salvos em:
```
test-results/
├── login-Sistema-de-Login-deve-exibir-tela-de-login-chromium/
│   ├── test-failed-1.png
│   └── video.webm
├── enfermeiro-Dashboard-do-Enfermeiro-deve-exibir-métricas-chromium/
│   ├── test-failed-1.png
│   └── video.webm
└── ...
```

---

## 🔗 **Referências:**

- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Locators Guide](https://playwright.dev/docs/locators)
- [Test ID](https://playwright.dev/docs/locators#locate-by-test-id)

---

**Status:** ⚠️ Testes precisam de ajustes nos seletores

**Prioridade:** 🔴 Alta (para garantir qualidade do código)

**Tempo estimado de correção:** 1-2 horas
