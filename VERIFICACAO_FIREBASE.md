# ✅ Checklist de Verificação - Firebase

Use este documento para verificar se a migração foi bem-sucedida.

---

## 🔍 Passo a Passo de Validação

### **1. Verificar Firestore Database no Console**

1. Acesse: https://console.firebase.google.com/project/escaladosfuncionarios/firestore
2. Você deve ver uma tela pedindo para **"Create database"**
3. **Clique em "Create database"**
4. Configurações:
   - **Start mode**: Selecione `Test mode` (temporariamente)
   - **Cloud Firestore location**: Selecione `southamerica-east1 (São Paulo)`
5. Clique em **Enable**
6. Aguarde alguns segundos até o Firestore ser provisionado

---

### **2. Aplicar Regras de Segurança**

Depois que o Firestore estiver ativo:

1. No menu lateral, clique em **Firestore Database**
2. Clique na aba **Rules** (ao lado de "Data")
3. Você verá algo assim:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if
          request.time < timestamp.date(2025, 1, 30);
    }
  }
}
```

4. **Substitua tudo** pelo conteúdo do arquivo `firestore.rules` do projeto:

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

5. Clique em **Publish**

---

### **3. Testar o Sistema Localmente**

Abra o terminal no diretório do projeto:

```bash
npm run dev
```

**O que deve acontecer:**

1. ✅ O servidor Vite inicia normalmente
2. ✅ Abre automaticamente no navegador: http://localhost:3000
3. ✅ Você vê a tela de login da Prefeitura do Rio
4. ✅ No console do navegador (F12), você verá:
   ```
   🌱 Inicializando banco de dados com dados seed...
   ✅ Dados iniciais carregados com sucesso!
   ```

---

### **4. Validar Dados no Firestore Console**

1. Volte para: https://console.firebase.google.com/project/escaladosfuncionarios/firestore/data
2. Você deve ver **4 coleções criadas automaticamente**:
   - 📁 `usuarios` (12 documentos)
   - 📁 `escalas` (3 documentos)
   - 📁 `bloqueios` (1 documento)
   - 📁 `configuracoes` (1 documento)

3. Clique em `usuarios` para expandir
4. Você deve ver os 12 usuários:
   - `u-1` (João Silva)
   - `u-2` (Pedro Santos)
   - ...
   - `u-11` (Ana Paula - Enfermeira)
   - `u-12` (Dr. Renato - Supervisor)

---

### **5. Testar Funcionalidades**

#### **A) Login**

1. Na tela de login, use:
   - **Login**: `ana.paula`
   - **Senha**: `123`
2. Clique em **Acessar Sistema**
3. ✅ Deve entrar no Dashboard do Enfermeiro

#### **B) Visualizar Calendário**

1. No Dashboard do Enfermeiro
2. ✅ Deve ver o calendário de Julho/2026
3. ✅ Deve ver métricas no topo:
   - 10 Maqueiros Ativos
   - 3/8 Sábados Agendados
   - 0/8 Folgas Definidas
   - Folgas Bloqueadas

#### **C) Criar Nova Escala (Maqueiro)**

1. Faça logout (canto superior direito)
2. Entre como maqueiro:
   - **Login**: `ricardo.oliveira`
   - **Senha**: `123`
3. Clique em um sábado disponível (ex: 18/07/2026)
4. ✅ Deve marcar o sábado escolhido
5. ✅ No console do Firebase, veja a coleção `escalas` - deve aparecer um novo documento

#### **D) Verificar Sincronização**

1. Abra duas abas do navegador lado a lado
2. Na aba 1: Faça login como enfermeiro (`ana.paula`)
3. Na aba 2: Faça login como maqueiro (`joao.silva`)
4. Na aba 2 (maqueiro): Escolha um sábado
5. ✅ Recarregue a aba 1 (enfermeiro) - deve ver a mudança refletida no calendário

---

## 🎯 Status de Validação

Marque conforme for testando:

- [ ] Firestore Database criado
- [ ] Regras de segurança aplicadas
- [ ] Sistema rodando localmente
- [ ] Dados seed carregados automaticamente
- [ ] Login funcionando (enfermeiro)
- [ ] Login funcionando (maqueiro)
- [ ] Calendário renderizando
- [ ] Escolha de sábado funcionando
- [ ] Dados salvos no Firestore Console
- [ ] Sincronização entre componentes

---

## ⚠️ Problemas Comuns

### **Erro: "Missing or insufficient permissions"**

**Solução**: As regras de segurança não foram aplicadas corretamente.
- Volte ao Console → Firestore → Rules
- Verifique se as regras foram publicadas
- Tente novamente

### **Erro: "Firebase: Error (auth/operation-not-allowed)"**

**Solução**: Authentication não está configurado (mas não é necessário por enquanto).
- Ignore este erro se estiver aparecendo
- O sistema funciona sem autenticação por enquanto

### **Console mostra: "Erro ao buscar usuários"**

**Solução**: Firestore não está habilitado.
- Volte ao Passo 1 desta checklist
- Certifique-se de ter clicado em "Create database"

### **Página em branco após login**

**Solução**: 
1. Abra o Console do navegador (F12)
2. Veja a aba "Console" para mensagens de erro
3. Veja a aba "Network" para ver se as requisições estão sendo feitas

---

## 📊 Visualizar Logs

### **No Navegador (Chrome/Edge):**
1. Pressione `F12`
2. Vá na aba **Console**
3. Você deve ver mensagens como:
   ```
   🌱 Inicializando banco de dados com dados seed...
   ✅ Dados iniciais carregados com sucesso!
   ```

### **No Console do Firebase:**
1. Acesse: https://console.firebase.google.com/project/escaladosfuncionarios
2. Menu lateral → **Usage and billing**
3. Veja métricas de uso em tempo real

---

## ✅ Sistema Validado!

Se todos os itens acima funcionaram, o sistema está **pronto para uso**! 🎉

**Próximos passos recomendados:**

1. Testar todas as funcionalidades:
   - Cadastro de maqueiros
   - Bloqueio de datas
   - Edição manual de escalas
   - Reset de escalas
   - Configurações de vagas

2. Compartilhar com usuários de teste

3. Coletar feedback

4. Quando estiver satisfeito, seguir para deploy em produção (ver `FIREBASE_SETUP.md`)

---

**Dúvidas?** Verifique o arquivo `FIREBASE_SETUP.md` para mais informações técnicas.
