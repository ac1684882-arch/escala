# ⚡ Instruções Rápidas - 5 Minutos

## 🎯 O que fazer AGORA:

### **Passo 1: Habilitar Firestore** (2 minutos)

1. Abra: https://console.firebase.google.com/project/escaladosfuncionarios/firestore

2. Você verá esta tela:
   ```
   Cloud Firestore
   [ Get started ] ou [ Create database ]
   ```

3. **Clique no botão azul**

4. Aparecerá um modal. Escolha:
   - 🔘 **Start in test mode** (primeiro radio button)
   - Clique em **Next**

5. Escolha a região:
   - 🌎 **southamerica-east1 (São Paulo)**
   - Clique em **Enable**

6. Aguarde ~30 segundos

7. ✅ Pronto! Firestore está ativo

---

### **Passo 2: Aplicar Regras** (1 minuto)

Ainda na tela do Firestore:

1. Clique na aba **Rules** (ao lado de "Data")

2. Você verá um editor de código

3. **Apague tudo** e cole isto:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    
    function isSignedIn() {
      return request.auth != null;
    }
    
    match /usuarios/{userId} {
      allow read: if true;
      allow write: if isSignedIn();
    }
    
    match /escalas/{escalaId} {
      allow read: if true;
      allow create, update: if isSignedIn();
      allow delete: if isSignedIn();
    }
    
    match /bloqueios/{bloqueioId} {
      allow read: if true;
      allow write: if isSignedIn();
    }
    
    match /configuracoes/{configId} {
      allow read: if true;
      allow write: if isSignedIn();
    }
  }
}
```

4. Clique em **Publish** (botão azul no canto superior direito)

5. ✅ Pronto! Regras aplicadas

---

### **Passo 3: Rodar o Sistema** (2 minutos)

No terminal, no diretório do projeto:

```bash
npm run dev
```

**O que vai acontecer:**

1. Servidor Vite inicia
2. Abre http://localhost:3000 automaticamente
3. Sistema conecta ao Firebase
4. Na primeira vez, carrega dados automaticamente
5. Você vê a tela de login!

---

### **Passo 4: Testar** (1 minuto)

1. **Login**:
   - Usuário: `ana.paula`
   - Senha: `123`

2. **Clique em "Acessar Sistema"**

3. ✅ Você verá o Dashboard do Enfermeiro com:
   - 10 Maqueiros Ativos
   - Calendário de Julho/2026
   - 3 sábados já preenchidos (dados de exemplo)

---

### **Passo 5: Validar no Console Firebase**

1. Volte para: https://console.firebase.google.com/project/escaladosfuncionarios/firestore/data

2. Você deve ver **4 coleções**:
   - 📁 usuarios (12 docs)
   - 📁 escalas (3 docs)
   - 📁 bloqueios (1 doc)
   - 📁 configuracoes (1 doc)

3. ✅ **SUCESSO!** Seu sistema está funcionando na nuvem!

---

## 🎉 Pronto!

Seu sistema está:
- ✅ Rodando localmente
- ✅ Conectado ao Firebase
- ✅ Salvando dados na nuvem
- ✅ Com backup automático
- ✅ Gratuito (Plano Spark)

---

## 🧪 Próximos Testes

Teste estas funcionalidades:

1. **Criar maqueiro**:
   - Dashboard Enfermeiro → Aba "Gerenciar Maqueiros"
   - Clique em "+ Adicionar Maqueiro"

2. **Escolher sábado** (como maqueiro):
   - Logout → Login como: `joao.silva` / `123`
   - Clique em um sábado disponível

3. **Bloquear data**:
   - Login como enfermeiro
   - Aba "Configurações e Bloqueios"
   - Adicione um bloqueio

4. **Ver no Firebase**:
   - Após cada ação, veja os dados atualizando em:
   - https://console.firebase.google.com/project/escaladosfuncionarios/firestore/data

---

## ❓ Problemas?

### **Erro: "Missing or insufficient permissions"**
→ Volte ao Passo 2 e reaplique as regras

### **Dados não aparecem**
→ Veja o console do navegador (F12) para mensagens de erro

### **Firestore não inicia**
→ Aguarde 1-2 minutos - pode demorar para provisionar

---

## 📚 Mais Informações

- **Guia Técnico Completo**: [FIREBASE_SETUP.md](./FIREBASE_SETUP.md)
- **Checklist Detalhada**: [VERIFICACAO_FIREBASE.md](./VERIFICACAO_FIREBASE.md)
- **README Principal**: [README_FIREBASE.md](./README_FIREBASE.md)

---

**Tudo funcionou? Parabéns! 🎉**

Seu sistema de escalas agora está na nuvem e pronto para uso real!
