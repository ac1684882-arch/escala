# 🏥 Sistema de Escala de Maqueiros - Prefeitura do Rio

Sistema completo de gerenciamento de escalas de trabalho para maqueiros hospitalares.

## 🎯 **Arquitetura**

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Autenticação**: Firebase Authentication (gratuito, sem cartão)
- **Banco de Dados**: Supabase PostgreSQL (gratuito)
- **Keep-Alive**: GitHub Actions (ping automático a cada 6 dias)
- **Deploy**: GitHub Pages (automático)

## 💰 **Custo Total: $0/mês**

- ✅ Firebase Auth: Gratuito (50.000 usuários/mês)
- ✅ Supabase: Gratuito (500 MB storage)
- ✅ GitHub Actions: Gratuito (2000 minutos/mês)
- ✅ GitHub Pages: Gratuito (hosting)

## 🚀 **Setup Rápido**

### **1. Configurar Supabase**

1. Execute o SQL do arquivo `supabase/init.sql` no Supabase SQL Editor
2. Verifique se as 4 tabelas foram criadas

### **2. Configurar GitHub Secrets**

Adicione os secrets em: `https://github.com/SEU-USER/escala/settings/secrets/actions`

Ver lista completa em: `SETUP_COMPLETO.md`

### **3. Rodar Localmente**

```bash
npm install
npm run dev
```

Acesse: http://localhost:3000

### **4. Deploy**

```bash
git push origin main
```

O deploy acontece automaticamente via GitHub Actions!

## 🧪 **Credenciais de Teste**

**Enfermeiro:**
- Login: `ana.paula` | Senha: `123`

**Maqueiro:**
- Login: `joao.silva` | Senha: `123`

## 📚 **Documentação**

- **[SETUP_COMPLETO.md](./SETUP_COMPLETO.md)** - Guia passo a passo completo
- **[supabase/init.sql](./supabase/init.sql)** - SQL para criar tabelas

## 🔄 **Keep-Alive Automático**

O GitHub Actions faz ping no Supabase a cada 6 dias para manter o projeto ativo (plano gratuito pausa após 7 dias de inatividade).

Ver workflow em: `.github/workflows/keep-alive.yml`

## ✨ **Funcionalidades**

### **Para Maqueiros:**
- ✅ Escolher sábado de trabalho
- ✅ Escolher folga compensatória
- ✅ Visualizar escala completa do hospital
- ✅ Regras automáticas (fixos de sábado)

### **Para Enfermeiros/Supervisores:**
- ✅ Gerenciar maqueiros (CRUD)
- ✅ Visualizar calendário completo
- ✅ Bloquear datas específicas
- ✅ Configurar vagas por sábado
- ✅ Editar escalas manualmente
- ✅ Liberar folgas antecipadamente
- ✅ Reset de escalas

## 🏗️ **Estrutura do Projeto**

```
.
├── .github/workflows/       # GitHub Actions (keep-alive, deploy)
├── src/
│   ├── components/         # Componentes React
│   ├── config/            # Firebase + Supabase config
│   ├── utils/             # Storage layer (Supabase)
│   └── types.ts           # TypeScript interfaces
├── supabase/
│   └── init.sql           # Schema do banco
└── SETUP_COMPLETO.md      # Guia de setup
```

## 🔐 **Segurança**

- Autenticação via Firebase (tokens JWT)
- Row Level Security (RLS) no Supabase
- Secrets no GitHub Actions
- HTTPS em produção (GitHub Pages)

## 📊 **Monitoramento**

- **Supabase**: https://supabase.com/dashboard
- **GitHub Actions**: https://github.com/SEU-USER/escala/actions
- **Site em Produção**: https://SEU-USER.github.io/escala/

## 🆘 **Suporte**

Em caso de problemas:

1. Verifique `SETUP_COMPLETO.md`
2. Veja os logs no GitHub Actions
3. Verifique o Supabase Dashboard

## 📝 **Licença**

Apache-2.0

---

**Desenvolvido para a Prefeitura do Rio de Janeiro - Secretaria Municipal de Saúde**
