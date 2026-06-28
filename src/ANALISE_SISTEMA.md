# Análise de Sistemas - Sistema de Escala de Maqueiros (Pref. Rio)

Este documento descreve a especificação técnica e de negócios para o sistema de escala de maqueiros, concebido para substituir o controle manual em planilhas de Excel. O sistema segue a identidade visual e os padrões de operação da Prefeitura do Rio de Janeiro.

---

## 1. Estrutura de Telas

O sistema foi estruturado de forma modular e focada na usabilidade, garantindo que profissionais de saúde e apoio tenham uma experiência limpa e direta:

1. **Tela de Login Única**:
   - Entrada unificada por Login (ou Matrícula) e Senha.
   - Detecção automática de perfil (Enfermeiro ou Maqueiro).
   - Opção para visualizar credenciais de demonstração (facilitando testes imediatos).

2. **Dashboard do Enfermeiro (Supervisor)**:
   - **Painel Geral (Métricas)**: Total de maqueiros ativos, sábados preenchidos, folgas pendentes e status da liberação de folgas do mês.
   - **Calendário Geral de Escalas (Grande)**: Visualização bento-grid mensal com filtros por Turno (Manhã/Tarde), Mês/Ano, e Busca por Funcionário.
   - **Gestão de Maqueiros (CRUD)**: Listagem de profissionais, adição de novos maqueiros, edição de dados (turno, tipo de contrato, status ativo/inativo).
   - **Gestão de Enfermeiros**: Cadastro simplificado de supervisores de escala.
   - **Controles Administrativos**: 
     - Bloqueio e liberação manual de datas específicas do calendário.
     - Botão de liberação antecipada das folgas (ignora a trava padrão de "esperar todos os sábados").
     - Edição manual direta das escalas (o enfermeiro clica em qualquer dia e pode definir ou alterar o Sábado/Folga de qualquer profissional).
     - Reset completo da escala do mês.

3. **Dashboard do Maqueiro**:
   - **Resumo de Status**: Box explicativo sobre a situação atual do maqueiro (Ex: "Aguardando escolha de sábado", "Sábado escolhido, aguardando liberação das folgas", "Escala Completa!").
   - **Visualizador de Escolhas Pessoais**: Exibição clara do sábado selecionado e da folga compensatória.
   - **Calendário Grande**: O calendário mostra apenas os sábados elegíveis para trabalho e os dias úteis válidos para folga.
   - **Fluxo Guiado de Escala**:
     - *Passo 1: Seleção de Sábado*: O maqueiro visualiza os sábados com vagas disponíveis. Ao clicar, o sábado é reservado.
     - *Passo 2: Seleção de Folga*: Quando liberado pelo sistema (ou pelo enfermeiro), o maqueiro escolhe uma folga compensatória em dia útil (segunda a sexta).

---

## 2. Fluxo de Funcionamento

O ciclo de vida da escala mensal segue o seguinte fluxo de trabalho:

```
[Início do Mês]
       │
       ▼
[Enfermeiro define bloqueios e vagas no Calendário]
       │
       ▼
[Maqueiros Normais fazem Login]
       │
       ▼
[Escolha do Sábado de Trabalho (Sábados restantes são bloqueados ao esgotar vagas)]
       │
       ▼
[Todos os maqueiros escolheram seus Sábados? ou Enfermeiro liberou manualmente?]
       │
       ├─► NÃO: Escolha de folgas continua bloqueada para maqueiros normais
       │
       └─► SIM: O sistema libera a escolha de Folga Compensatória
             │
             ▼
      [Maqueiros escolhem Folga Compensatória em dia útil (Segunda a Sexta)]
             │
             ▼
[Enfermeiro visualiza escala consolidada e faz ajustes manuais se necessário]
             │
             ▼
[Fim do Fluxo - Escala Pronta e impressa/exportada]
```

---

## 3. Banco de Dados Necessário (Modelo Relacional / Firestore)

A modelagem de dados foi abstraída para uma estrutura relacional flexível, persistida localmente no cliente através de `localStorage` para garantir portabilidade completa no ambiente de testes.

### Tabela: `usuarios` (Maqueiros e Enfermeiros)
| Campo | Tipo | Descrição |
| :--- | :--- | :--- |
| `id` | UUID / String | Identificador único do usuário |
| `nome` | String | Nome completo do funcionário |
| `matricula` | String | Matrícula funcional (identificação única) |
| `login` | String | Nome de usuário para acesso |
| `senha` | String | Senha de acesso |
| `role` | Enum | `'enfermeiro'` ou `'maqueiro'` |
| `turno` | Enum | `'manha'` (07:00-16:00) ou `'tarde'` (11:00-20:00) |
| `tipo` | Enum | `'normal'` ou `'fixo_sabado'` (Sábado à tarde + Folga Segunda) |
| `ativo` | Boolean | Status do funcionário no sistema |

### Tabela: `escalas` (Registros de Trabalho e Folgas)
| Campo | Tipo | Descrição |
| :--- | :--- | :--- |
| `id` | UUID / String | Identificador único da escala |
| `usuarioId` | String (FK) | ID do maqueiro |
| `mesAno` | String | Chave de referência temporal (Ex: `"2026-07"`) |
| `sabadoTrabalho` | String (Date ISO) | Data do sábado escolhido para trabalhar |
| `folgaCompensatoria` | String (Date ISO) | Data da folga compensatória em dia útil escolhida |

### Tabela: `bloqueios` (Datas Bloqueadas pelo Enfermeiro)
| Campo | Tipo | Descrição |
| :--- | :--- | :--- |
| `id` | UUID / String | Identificador único do bloqueio |
| `data` | String (Date ISO) | Data bloqueada para qualquer escala de folga/trabalho |
| `justificativa` | String | Motivo do bloqueio administrativo |

### Tabela: `configuracoes` (Regras Globais do Mês)
| Campo | Tipo | Descrição |
| :--- | :--- | :--- |
| `mesAno` | String | Chave de referência temporal (Ex: `"2026-07"`) |
| `vagasPorSabado` | Number | Quantidade de maqueiros normais permitidos por sábado (Default: 1 por turno ou 2 geral) |
| `folgasLiberadasManualmente` | Boolean | Override do supervisor para liberar folgas antes de todos escolherem o sábado |

---

## 4. Regras de Negócio

Para garantir a operação harmônica da escala, o sistema implementa de forma rígida as seguintes validações e regras:

1. **Regra Especial dos Maqueiros Fixos**:
   - Os funcionários configurados como `tipo: 'fixo_sabado'` (trabalham aos sábados à tarde) têm sua escala preenchida automaticamente pelo sistema.
   - Em todo sábado do mês, o sistema insere o plantão deles no turno da tarde.
   - Em toda segunda-feira do mês, o sistema marca automaticamente como **Folga Fixa**.
   - Esses maqueiros não precisam e não podem escolher sábados ou outras folgas pelo portal do maqueiro.

2. **Vagas por Sábado**:
   - Cada sábado do mês comporta um limite de escolhas de maqueiros normais (gerenciado pelo parâmetro `vagasPorSabado`).
   - Quando um sábado atinge esse limite, ele é classificado como **Bloqueado/Ocupado** para os outros maqueiros.

3. **Dependência Temporal de Escolha**:
   - Um maqueiro normal não pode escolher sua folga compensatória sem antes ter definido o seu sábado de trabalho.

4. **Restrição de Dias Úteis para Folga**:
   - A folga compensatória para maqueiros normais só pode ser agendada de segunda a sexta-feira. Sábados e domingos são desabilitados na interface de folgas.

5. **Bloqueios Administrativos**:
   - Se o enfermeiro bloquear um dia (ex: um dia de alta demanda hospitalar ou feriado), nenhum maqueiro poderá escolher essa data para folga.

---

## 5. Permissões por Perfil (Matriz de Acesso)

| Funcionalidade | Enfermeiro / Supervisor | Maqueiro Normal | Maqueiro Fixo |
| :--- | :---: | :---: | :---: |
| Fazer Login | Sim | Sim | Sim (Visualização apenas) |
| Ver Calendário Geral | Sim (Completo) | Sim (Apenas leitura) | Sim (Apenas leitura) |
| Adicionar/Editar Maqueiros | Sim | Não | Não |
| Cadastrar Enfermeiros | Sim | Não | Não |
| Escolher Próprio Sábado | Sim (Manual) | Sim | Não (Automático) |
| Escolher Própria Folga | Sim (Manual) | Sim (Após liberação) | Não (Automático na Segunda) |
| Editar Escala Alheia | Sim (Total) | Não | Não |
| Forçar Liberação de Folgas | Sim | Não | Não |
| Bloquear/Liberar Datas | Sim | Não | Não |
| Resetar Escala do Mês | Sim | Não | Não |

---

## 6. Sugestão de Layout e Identidade Visual

O sistema adota o padrão estético oficial da **Prefeitura do Rio de Janeiro**:

- **Cores Principais**:
  - `Azul Rio` (`#005C9E`): Utilizado no cabeçalho institucional, botões de ação principal, e destaques.
  - `Azul Suave` (`#E3F2FD`): Fundo para cards de resumo e marcação de sábados disponíveis.
  - `Verde Rio` (`#2E7D32`): Indica datas confirmadas, escalas preenchidas e folgas escolhidas.
  - `Vermelho/Laranja Administrativo` (`#C62828`): Usado para datas bloqueadas e alertas.
  - `Branco Puro` (`#FFFFFF`) e `Cinza de Contraste` (`#F8F9FA`): Fundos principais das tabelas e do calendário grande para máxima legibilidade.

- **Logotipo da Prefeitura**:
  - Um brasão estilizado e moderno da Prefeitura do Rio de Janeiro é renderizado em SVG de alta fidelidade no topo esquerdo do cabeçalho, acompanhado das inscrições oficiais: *"Prefeitura do Rio - Secretaria Municipal de Saúde"*.

- **Calendário Grande**:
  - Um grid robusto com transições suaves via `motion`, onde cada célula exibe o número do dia, os maqueiros escalados naquele dia (divididos por turno), e as folgas agendadas.

---

## 7. Plano de Desenvolvimento por Etapas

1. **Fase 1: Preparação do Ambiente**:
   - Definição dos tipos TypeScript (`src/types.ts`).
   - Escrita deste documento de análise (`src/ANALISE_SISTEMA.md`).

2. **Fase 2: Motor de Persistência e Dados Iniciais**:
   - Desenvolvimento do gerenciador de dados locais com `localStorage` em `src/utils/storage.ts`.
   - Carga inicial (seed) automática com 5 maqueiros da manhã (normais), 5 maqueiros da tarde (3 normais e 2 fixos de sábado), e 1 enfermeiro supervisor.

3. **Fase 3: Componentes de UI Institucionais**:
   - Criação do cabeçalho da Prefeitura do Rio com brasão SVG.
   - Formulário de login responsivo com seletor rápido para homologação e testes imediatos.

4. **Fase 4: Calendário Central Inteligente**:
   - Implementação de um calendário mensal robusto que calcula automaticamente dias da semana, identifica sábados, domingos e dias úteis, e suporta navegação por mês e ano.

5. **Fase 5: Portal do Maqueiro (Escolha Assistida)**:
   - Interface de passo a passo explicando as regras ("Selecione o sábado", depois "Aguarde liberação", depois "Selecione a folga útil").
   - Validações em tempo real para impedir escolhas duplicadas ou inválidas.

6. **Fase 6: Portal Administrativo do Enfermeiro**:
   - Abas para alternar entre "Escala de Plantão", "Gestão de Maqueiros", "Cadastrar Supervisor" e "Configurações".
   - Funcionalidade de clique no calendário para edição direta de plantões e folgas.
   - Ferramentas de reset e controle de bloqueio de datas.

7. **Fase 7: Consolidação e Build**:
   - Execução do linter e compilação do projeto para garantir zero bugs e conformidade total com o ambiente de execução.
