-- =====================================================
-- Sistema de Escala de Maqueiros - Prefeitura do Rio
-- Supabase Database Schema
-- =====================================================

-- Tabela de Usuários (Maqueiros e Enfermeiros)
CREATE TABLE IF NOT EXISTS usuarios (
  id TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  matricula TEXT UNIQUE NOT NULL,
  login TEXT UNIQUE NOT NULL,
  senha TEXT,
  role TEXT NOT NULL CHECK (role IN ('enfermeiro', 'maqueiro')),
  turno TEXT NOT NULL CHECK (turno IN ('manha', 'tarde')),
  tipo TEXT NOT NULL CHECK (tipo IN ('normal', 'fixo_sabado')),
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Escalas
CREATE TABLE IF NOT EXISTS escalas (
  id TEXT PRIMARY KEY,
  usuario_id TEXT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  mes_ano TEXT NOT NULL,
  sabado_trabalho DATE,
  folga_compensatoria DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(usuario_id, mes_ano)
);

-- Tabela de Bloqueios de Datas
CREATE TABLE IF NOT EXISTS bloqueios (
  id TEXT PRIMARY KEY,
  data DATE NOT NULL UNIQUE,
  justificativa TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Configurações Mensais
CREATE TABLE IF NOT EXISTS configuracoes (
  mes_ano TEXT PRIMARY KEY,
  vagas_por_sabado INTEGER DEFAULT 2 CHECK (vagas_por_sabado >= 1),
  folgas_liberadas_manualmente BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- Índices para Performance
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_usuarios_login ON usuarios(login);
CREATE INDEX IF NOT EXISTS idx_usuarios_matricula ON usuarios(matricula);
CREATE INDEX IF NOT EXISTS idx_usuarios_role ON usuarios(role);
CREATE INDEX IF NOT EXISTS idx_usuarios_ativo ON usuarios(ativo);

CREATE INDEX IF NOT EXISTS idx_escalas_usuario_id ON escalas(usuario_id);
CREATE INDEX IF NOT EXISTS idx_escalas_mes_ano ON escalas(mes_ano);
CREATE INDEX IF NOT EXISTS idx_escalas_sabado ON escalas(sabado_trabalho);

CREATE INDEX IF NOT EXISTS idx_bloqueios_data ON bloqueios(data);

-- =====================================================
-- Row Level Security (RLS)
-- =====================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE escalas ENABLE ROW LEVEL SECURITY;
ALTER TABLE bloqueios ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracoes ENABLE ROW LEVEL SECURITY;

-- Políticas para USUARIOS
-- Todos podem ler (necessário para login)
CREATE POLICY "Permitir leitura pública de usuarios"
  ON usuarios FOR SELECT
  TO public
  USING (true);

-- Qualquer um pode criar/atualizar (temporário - melhorar depois com auth)
CREATE POLICY "Permitir escrita em usuarios"
  ON usuarios FOR ALL
  TO public
  USING (true);

-- Políticas para ESCALAS
CREATE POLICY "Permitir leitura pública de escalas"
  ON escalas FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Permitir escrita em escalas"
  ON escalas FOR ALL
  TO public
  USING (true);

-- Políticas para BLOQUEIOS
CREATE POLICY "Permitir leitura pública de bloqueios"
  ON bloqueios FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Permitir escrita em bloqueios"
  ON bloqueios FOR ALL
  TO public
  USING (true);

-- Políticas para CONFIGURACOES
CREATE POLICY "Permitir leitura pública de configuracoes"
  ON configuracoes FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Permitir escrita em configuracoes"
  ON configuracoes FOR ALL
  TO public
  USING (true);

-- =====================================================
-- Dados Seed (Iniciais)
-- =====================================================

-- Inserir usuários de exemplo
INSERT INTO usuarios (id, nome, matricula, login, senha, role, turno, tipo, ativo) VALUES
-- Maqueiros da Manhã (Normal)
('u-1', 'João Silva', 'MQ001', 'joao.silva', '123', 'maqueiro', 'manha', 'normal', true),
('u-2', 'Pedro Santos', 'MQ002', 'pedro.santos', '123', 'maqueiro', 'manha', 'normal', true),
('u-3', 'Ricardo Oliveira', 'MQ003', 'ricardo.oliveira', '123', 'maqueiro', 'manha', 'normal', true),
('u-4', 'Lucas Costa', 'MQ004', 'lucas.costa', '123', 'maqueiro', 'manha', 'normal', true),
('u-5', 'André Souza', 'MQ005', 'andre.souza', '123', 'maqueiro', 'manha', 'normal', true),

-- Maqueiros da Tarde (2 fixos, 3 normais)
('u-6', 'Carlos Souza', 'MQ006', 'carlos.souza', '123', 'maqueiro', 'tarde', 'fixo_sabado', true),
('u-7', 'Marcos Lima', 'MQ007', 'marcos.lima', '123', 'maqueiro', 'tarde', 'fixo_sabado', true),
('u-8', 'Bruno Rocha', 'MQ008', 'bruno.rocha', '123', 'maqueiro', 'tarde', 'normal', true),
('u-9', 'Thiago Alves', 'MQ009', 'thiago.alves', '123', 'maqueiro', 'tarde', 'normal', true),
('u-10', 'Rodrigo Ferreira', 'MQ010', 'rodrigo.ferreira', '123', 'maqueiro', 'tarde', 'normal', true),

-- Enfermeiros/Supervisores
('u-11', 'Ana Paula (Enfermeira)', 'ENF001', 'ana.paula', '123', 'enfermeiro', 'manha', 'normal', true),
('u-12', 'Dr. Renato (Supervisor)', 'ENF002', 'renato.silva', '123', 'enfermeiro', 'tarde', 'normal', true);

-- Inserir escalas de exemplo (Julho 2026)
INSERT INTO escalas (id, usuario_id, mes_ano, sabado_trabalho, folga_compensatoria) VALUES
('esc-1', 'u-1', '2026-07', '2026-07-04', NULL),
('esc-2', 'u-2', '2026-07', '2026-07-11', NULL),
('esc-3', 'u-8', '2026-07', '2026-07-04', NULL);

-- Inserir bloqueio de exemplo
INSERT INTO bloqueios (id, data, justificativa) VALUES
('bloq-1', '2026-07-09', 'Feriado de Alta Demanda Hospitalar - Plantão Reforçado');

-- Inserir configuração padrão para Julho 2026
INSERT INTO configuracoes (mes_ano, vagas_por_sabado, folgas_liberadas_manualmente) VALUES
('2026-07', 2, false);
