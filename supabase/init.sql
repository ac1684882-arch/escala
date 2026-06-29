-- =====================================================
-- Sistema de Escala de Funcionarios - CCO
-- Supabase Database Schema
-- =====================================================

-- Tabela de Usuarios (Maqueiros e Enfermeiros)
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
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE escalas DROP CONSTRAINT IF EXISTS escalas_usuario_id_mes_ano_key;

-- Tabela de Bloqueios de Datas
CREATE TABLE IF NOT EXISTS bloqueios (
  id TEXT PRIMARY KEY,
  data DATE NOT NULL UNIQUE,
  justificativa TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Configuracoes Mensais
CREATE TABLE IF NOT EXISTS configuracoes (
  mes_ano TEXT PRIMARY KEY,
  vagas_por_sabado INTEGER DEFAULT 2 CHECK (vagas_por_sabado >= 1),
  folgas_liberadas_manualmente BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- Indices para Performance
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_usuarios_login ON usuarios(login);
CREATE INDEX IF NOT EXISTS idx_usuarios_matricula ON usuarios(matricula);
CREATE INDEX IF NOT EXISTS idx_usuarios_role ON usuarios(role);
CREATE INDEX IF NOT EXISTS idx_usuarios_ativo ON usuarios(ativo);

CREATE INDEX IF NOT EXISTS idx_escalas_usuario_id ON escalas(usuario_id);
CREATE INDEX IF NOT EXISTS idx_escalas_mes_ano ON escalas(mes_ano);
CREATE INDEX IF NOT EXISTS idx_escalas_sabado ON escalas(sabado_trabalho);
CREATE INDEX IF NOT EXISTS idx_escalas_usuario_mes_sabado ON escalas(usuario_id, mes_ano, sabado_trabalho);

CREATE INDEX IF NOT EXISTS idx_bloqueios_data ON bloqueios(data);

-- =====================================================
-- Row Level Security (RLS)
-- =====================================================

ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE escalas ENABLE ROW LEVEL SECURITY;
ALTER TABLE bloqueios ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracoes ENABLE ROW LEVEL SECURITY;

-- Politicas para USUARIOS
CREATE POLICY "Permitir leitura publica de usuarios"
  ON usuarios FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Permitir escrita em usuarios"
  ON usuarios FOR ALL
  TO public
  USING (true);

-- Politicas para ESCALAS
CREATE POLICY "Permitir leitura publica de escalas"
  ON escalas FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Permitir escrita em escalas"
  ON escalas FOR ALL
  TO public
  USING (true);

-- Politicas para BLOQUEIOS
CREATE POLICY "Permitir leitura publica de bloqueios"
  ON bloqueios FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Permitir escrita em bloqueios"
  ON bloqueios FOR ALL
  TO public
  USING (true);

-- Politicas para CONFIGURACOES
CREATE POLICY "Permitir leitura publica de configuracoes"
  ON configuracoes FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Permitir escrita em configuracoes"
  ON configuracoes FOR ALL
  TO public
  USING (true);

-- =====================================================
-- Sem dados ficticios
-- =====================================================

-- A conta admin compartilhada dos supervisores e criada pelo app e tambem
-- provisionada aqui para bancos inicializados manualmente.
-- Funcionarios criam cadastro com nome, e-mail e senha.
-- A configuracao mensal e criada sob demanda pelo app quando o mes e acessado.

-- Limpeza dos dados de demonstracao antigos, caso este SQL seja executado
-- em um banco que ja recebeu a carga inicial anterior.
DELETE FROM escalas WHERE id IN ('esc-1', 'esc-2', 'esc-3');
DELETE FROM escalas WHERE usuario_id IN (
  'u-1', 'u-2', 'u-3', 'u-4', 'u-5', 'u-6',
  'u-7', 'u-8', 'u-9', 'u-10', 'u-11', 'u-12'
);
DELETE FROM bloqueios WHERE id = 'bloq-1';
DELETE FROM usuarios WHERE id IN (
  'u-1', 'u-2', 'u-3', 'u-4', 'u-5', 'u-6',
  'u-7', 'u-8', 'u-9', 'u-10', 'u-11', 'u-12'
);

INSERT INTO usuarios (id, nome, matricula, login, senha, role, turno, tipo, ativo)
VALUES (
  'admin-supervisores',
  'Admin CCO',
  'ADMIN-SUPERVISORES',
  'admin@escala.local',
  'Admin@123',
  'enfermeiro',
  'manha',
  'normal',
  true
)
ON CONFLICT (id) DO UPDATE SET
  nome = EXCLUDED.nome,
  matricula = EXCLUDED.matricula,
  login = EXCLUDED.login,
  senha = EXCLUDED.senha,
  role = EXCLUDED.role,
  turno = EXCLUDED.turno,
  tipo = EXCLUDED.tipo,
  ativo = EXCLUDED.ativo;
