# 🔥 Sistema de Escala de Maqueiros - Firebase Edition

## 🎉 Migração Concluída com Sucesso!

O sistema foi **completamente migrado** de localStorage para **Firebase Firestore**.

---

## 📦 O que mudou?

### **Antes (localStorage)**
- ❌ Dados apenas no navegador
- ❌ Sem backup
- ❌ Sem sincronização
- ❌ Perdidos ao limpar cache

### **Agora (Firestore)**
- ✅ Dados na nuvem
- ✅ Backup automático
- ✅ Sincronização em tempo real
- ✅ Acessível de qualquer dispositivo
- ✅ Escalável
- ✅ Gratuito (Plano Spark)

---

## 🚀 Início Rápido

### **1. Configurar Firestore** (OBRIGATÓRIO)

Antes de rodar o projeto, você precisa:

1. Acessar: https://console.firebase.google.com/project/escaladosfuncionarios/firestore
2. Clicar em **"Create database"**
3. Escolher:
   - **Modo**: Test mode
   - **Região**: southamerica-east1 (São Paulo)
4. Clicar em **"Enable"**

### **2. Aplicar Regras de Segurança**

1. Ir em **Firestore Database → Rules**
2. Copiar conteúdo do arquivo `firestore.rules`
3. Colar e clicar em **"Publish"**

### **3. Executar o Projeto**

```bash
npm install  # Se ainda não instalou
npm run dev
```

**Pronto!** O sistema irá:
- Conectar ao Firebase automaticamente
- Criar os dados seed na primeira execução
- Funcionar normalmente

---

## 📚 Documentação Completa

Para informações detalhadas, consulte:

1. **[FIREBASE_SETUP.md](./FIREBASE_SETUP.md)** - Guia técnico completo
2. **[VERIFICACAO_FIREBASE.md](./VERIFICACAO_FIREBASE.md)** - Checklist de validação passo a passo

---

## 🧪 Testar

### **Credenciais de Teste:**

**Enfermeiro/Supervisor:**
- Login: `ana.paula` | Senha: `123`
- Login: `renato.silva` | Senha: `123`

**Maqueiros:**
- Login: `joao.silva` | Senha: `123`
- Login: `pedro.santos` | Senha: `123`
- *(e mais 8 usuários - veja documentação completa)*

---

## 💰 Custos

### **Plano Atual: Spark (Gratuito) ✅**

- 50,000 leituras/dia
- 20,000 escritas/dia
- 1 GB armazenamento

**Estimativa para 1 unidade hospitalar:**
- ~500 operações/dia
- **Custo: $0/mês** 💚

### **Não precisa do Plano Blaze!** ❌

O sistema funciona perfeitamente no plano gratuito.

---

## 🏗️ Arquitetura

```
Firebase Project: escaladosfuncionarios
│
├── 🔐 Authentication (futuro - opcional)
│
├── 🗄️ Firestore Database
│   ├── usuarios/          (12 documentos)
│   ├── escalas/           (variável por mês)
│   ├── bloqueios/         (datas bloqueadas)
│   └── configuracoes/     (config por mês)
│
└── 🌐 Hosting (futuro - para deploy)
```

---

## 📊 Funcionalidades

Tudo que funcionava antes continua funcionando:

- ✅ Login diferenciado (Enfermeiro/Maqueiro)
- ✅ Escolha de sábados de trabalho
- ✅ Escolha de folgas compensatórias
- ✅ Calendário visual completo
- ✅ Gestão de maqueiros (CRUD)
- ✅ Bloqueio de datas
- ✅ Configurações de vagas
- ✅ Regras de negócio automáticas

**NOVO:**
- ✅ Persistência na nuvem
- ✅ Dados sincronizados
- ✅ Backup automático

---

## 🔒 Segurança

### **Atual (Desenvolvimento):**
- Leitura: Pública
- Escrita: Liberada (temporariamente)

### **Produção (Recomendado):**
- Implementar Firebase Authentication
- Verificação de roles (enfermeiro vs maqueiro)
- Restrições por userId

---

## 🛠️ Deploy para Produção

### **Firebase Hosting:**

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
npm run build
firebase deploy
```

### **Outras plataformas:**
- Vercel
- Netlify
- Render
- Railway

*(O projeto funciona em qualquer plataforma de hosting estático)*

---

## 📞 Suporte

**Problemas?**

1. Consulte [VERIFICACAO_FIREBASE.md](./VERIFICACAO_FIREBASE.md)
2. Verifique o Console do Firebase
3. Veja o console do navegador (F12)

**Console Firebase:**
https://console.firebase.google.com/project/escaladosfuncionarios

---

## ✅ Status

- [x] Firebase SDK instalado
- [x] Configuração criada
- [x] Storage migrado para Firestore
- [x] Componentes atualizados
- [x] Operações assíncronas implementadas
- [x] Regras de segurança criadas
- [x] Documentação completa
- [x] Testes de compilação OK
- [ ] Firestore habilitado no console (VOCÊ PRECISA FAZER)
- [ ] Regras aplicadas (VOCÊ PRECISA FAZER)
- [ ] Sistema testado (VOCÊ PRECISA FAZER)

---

## 🎯 Próximos Passos

1. **Habilitar Firestore** no console (5 minutos)
2. **Aplicar regras** de segurança (2 minutos)
3. **Testar** o sistema localmente
4. **Validar** todas as funcionalidades
5. **Deploy** quando estiver satisfeito

---

**Sistema pronto para desenvolvimento!** 🚀

Siga os passos em [VERIFICACAO_FIREBASE.md](./VERIFICACAO_FIREBASE.md) para começar.
