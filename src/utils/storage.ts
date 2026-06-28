/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Usuario, Escala, Bloqueio, Configuracao, UserRole, UserShift, StretcherType } from '../types';

const USERS_KEY = 'escala_maqueiros_usuarios';
const ESCALAS_KEY = 'escala_maqueiros_escalas';
const BLOQUEIOS_KEY = 'escala_maqueiros_bloqueios';
const CONFIGS_KEY = 'escala_maqueiros_configs';

// Helper to get all Saturdays of a given month/year
export function getSaturdaysInMonth(year: number, month: number): string[] {
  const dates: string[] = [];
  const date = new Date(year, month, 1);
  while (date.getMonth() === month) {
    if (date.getDay() === 6) { // 6 = Saturday
      const d = new Date(date);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      dates.push(`${yyyy}-${mm}-${dd}`);
    }
    date.setDate(date.getDate() + 1);
  }
  return dates;
}

// Helper to get all Mondays of a given month/year
export function getMondaysInMonth(year: number, month: number): string[] {
  const dates: string[] = [];
  const date = new Date(year, month, 1);
  while (date.getMonth() === month) {
    if (date.getDay() === 1) { // 1 = Monday
      const d = new Date(date);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      dates.push(`${yyyy}-${mm}-${dd}`);
    }
    date.setDate(date.getDate() + 1);
  }
  return dates;
}

// Initial mock data
const INITIAL_USERS: Usuario[] = [
  // 5 Maqueiros da Manhã (Normal)
  {
    id: 'u-1',
    nome: 'João Silva',
    matricula: 'MQ001',
    login: 'joao.silva',
    senha: '123',
    role: UserRole.MAQUEIRO,
    turno: UserShift.MANHA,
    tipo: StretcherType.NORMAL,
    ativo: true,
  },
  {
    id: 'u-2',
    nome: 'Pedro Santos',
    matricula: 'MQ002',
    login: 'pedro.santos',
    senha: '123',
    role: UserRole.MAQUEIRO,
    turno: UserShift.MANHA,
    tipo: StretcherType.NORMAL,
    ativo: true,
  },
  {
    id: 'u-3',
    nome: 'Ricardo Oliveira',
    matricula: 'MQ003',
    login: 'ricardo.oliveira',
    senha: '123',
    role: UserRole.MAQUEIRO,
    turno: UserShift.MANHA,
    tipo: StretcherType.NORMAL,
    ativo: true,
  },
  {
    id: 'u-4',
    nome: 'Lucas Costa',
    matricula: 'MQ004',
    login: 'lucas.costa',
    senha: '123',
    role: UserRole.MAQUEIRO,
    turno: UserShift.MANHA,
    tipo: StretcherType.NORMAL,
    ativo: true,
  },
  {
    id: 'u-5',
    nome: 'André Souza',
    matricula: 'MQ005',
    login: 'andre.souza',
    senha: '123',
    role: UserRole.MAQUEIRO,
    turno: UserShift.MANHA,
    tipo: StretcherType.NORMAL,
    ativo: true,
  },

  // 5 Maqueiros da Tarde (3 normais, 2 fixos sábado à tarde)
  {
    id: 'u-6',
    nome: 'Carlos Souza',
    matricula: 'MQ006',
    login: 'carlos.souza',
    senha: '123',
    role: UserRole.MAQUEIRO,
    turno: UserShift.TARDE,
    tipo: StretcherType.FIXO_SABADO,
    ativo: true,
  },
  {
    id: 'u-7',
    nome: 'Marcos Lima',
    matricula: 'MQ007',
    login: 'marcos.lima',
    senha: '123',
    role: UserRole.MAQUEIRO,
    turno: UserShift.TARDE,
    tipo: StretcherType.FIXO_SABADO,
    ativo: true,
  },
  {
    id: 'u-8',
    nome: 'Bruno Rocha',
    matricula: 'MQ008',
    login: 'bruno.rocha',
    senha: '123',
    role: UserRole.MAQUEIRO,
    turno: UserShift.TARDE,
    tipo: StretcherType.NORMAL,
    ativo: true,
  },
  {
    id: 'u-9',
    nome: 'Thiago Alves',
    matricula: 'MQ009',
    login: 'thiago.alves',
    senha: '123',
    role: UserRole.MAQUEIRO,
    turno: UserShift.TARDE,
    tipo: StretcherType.NORMAL,
    ativo: true,
  },
  {
    id: 'u-10',
    nome: 'Rodrigo Ferreira',
    matricula: 'MQ010',
    login: 'rodrigo.ferreira',
    senha: '123',
    role: UserRole.MAQUEIRO,
    turno: UserShift.TARDE,
    tipo: StretcherType.NORMAL,
    ativo: true,
  },

  // 2 Enfermeiros supervisores (Cadastro sem COREN exigido)
  {
    id: 'u-11',
    nome: 'Ana Paula (Enfermeira)',
    matricula: 'ENF001',
    login: 'ana.paula',
    senha: '123',
    role: UserRole.ENFERMEIRO,
    turno: UserShift.MANHA,
    tipo: StretcherType.NORMAL,
    ativo: true,
  },
  {
    id: 'u-12',
    nome: 'Dr. Renato (Supervisor)',
    matricula: 'ENF002',
    login: 'renato.silva',
    senha: '123',
    role: UserRole.ENFERMEIRO,
    turno: UserShift.TARDE,
    tipo: StretcherType.NORMAL,
    ativo: true,
  },
];

const INITIAL_CONFIGS: Configuracao[] = [
  {
    mesAno: '2026-07',
    vagasPorSabado: 2, // 2 vagas gerais para maqueiros normais
    folgasLiberadasManualmente: false,
  },
];

// Let's seed a few scales to make the initial experience feel rich and alive
// We can pre-select Saturdays for a couple of stretchers in July 2026
// July 2026 Saturdays: 04, 11, 18, 25
const INITIAL_ESCALAS: Escala[] = [
  {
    id: 'esc-1',
    usuarioId: 'u-1', // João Silva
    mesAno: '2026-07',
    sabadoTrabalho: '2026-07-04',
    folgaCompensatoria: null, // Still waiting for other normal stretchers
  },
  {
    id: 'esc-2',
    usuarioId: 'u-2', // Pedro Santos
    mesAno: '2026-07',
    sabadoTrabalho: '2026-07-11',
    folgaCompensatoria: null,
  },
  {
    id: 'esc-3',
    usuarioId: 'u-8', // Bruno Rocha
    mesAno: '2026-07',
    sabadoTrabalho: '2026-07-04',
    folgaCompensatoria: null,
  },
];

const INITIAL_BLOQUEIOS: Bloqueio[] = [
  {
    id: 'bloq-1',
    data: '2026-07-09', // Exemplo: Bloqueio no feriado de 9 de julho
    justificativa: 'Feriado de Alta Demanda Hospitalar - Plantão Reforçado',
  }
];

export function initializeStorage() {
  if (!localStorage.getItem(USERS_KEY)) {
    localStorage.setItem(USERS_KEY, JSON.stringify(INITIAL_USERS));
  }
  if (!localStorage.getItem(ESCALAS_KEY)) {
    localStorage.setItem(ESCALAS_KEY, JSON.stringify(INITIAL_ESCALAS));
  }
  if (!localStorage.getItem(BLOQUEIOS_KEY)) {
    localStorage.setItem(BLOQUEIOS_KEY, JSON.stringify(INITIAL_BLOQUEIOS));
  }
  if (!localStorage.getItem(CONFIGS_KEY)) {
    localStorage.setItem(CONFIGS_KEY, JSON.stringify(INITIAL_CONFIGS));
  }
}

// User CRUD
export function getUsuarios(): Usuario[] {
  initializeStorage();
  const data = localStorage.getItem(USERS_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveUsuarios(users: Usuario[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function addUsuario(user: Usuario) {
  const users = getUsuarios();
  users.push(user);
  saveUsuarios(users);
}

export function updateUsuario(updatedUser: Usuario) {
  const users = getUsuarios();
  const index = users.findIndex((u) => u.id === updatedUser.id);
  if (index !== -1) {
    users[index] = updatedUser;
    saveUsuarios(users);
  }
}

// Scale CRUD
export function getEscalas(): Escala[] {
  initializeStorage();
  const data = localStorage.getItem(ESCALAS_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveEscalas(escalas: Escala[]) {
  localStorage.setItem(ESCALAS_KEY, JSON.stringify(escalas));
}

export function getEscalaForUser(userId: string, mesAno: string): Escala | null {
  const escalas = getEscalas();
  const esc = escalas.find((e) => e.usuarioId === userId && e.mesAno === mesAno);
  return esc || null;
}

export function updateOrCreateEscala(userId: string, mesAno: string, sabado: string | null, folga: string | null) {
  const escalas = getEscalas();
  const index = escalas.findIndex((e) => e.usuarioId === userId && e.mesAno === mesAno);
  if (index !== -1) {
    escalas[index].sabadoTrabalho = sabado;
    escalas[index].folgaCompensatoria = folga;
  } else {
    escalas.push({
      id: `esc-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      usuarioId: userId,
      mesAno,
      sabadoTrabalho: sabado,
      folgaCompensatoria: folga,
    });
  }
  saveEscalas(escalas);
}

// Bloqueios CRUD
export function getBloqueios(): Bloqueio[] {
  initializeStorage();
  const data = localStorage.getItem(BLOQUEIOS_KEY);
  return data ? JSON.parse(data) : [];
}

export function addBloqueio(bloqueio: Bloqueio) {
  const bloqueios = getBloqueios();
  bloqueios.push(bloqueio);
  localStorage.setItem(BLOQUEIOS_KEY, JSON.stringify(bloqueios));
}

export function removeBloqueio(id: string) {
  const bloqueios = getBloqueios();
  const filtered = bloqueios.filter((b) => b.id !== id);
  localStorage.setItem(BLOQUEIOS_KEY, JSON.stringify(filtered));
}

// Configs CRUD
export function getConfiguracoes(mesAno: string): Configuracao {
  initializeStorage();
  const data = localStorage.getItem(CONFIGS_KEY);
  const configs: Configuracao[] = data ? JSON.parse(data) : [];
  const conf = configs.find((c) => c.mesAno === mesAno);
  if (conf) return conf;

  // Create default if not found
  const newConf: Configuracao = {
    mesAno,
    vagasPorSabado: 2,
    folgasLiberadasManualmente: false,
  };
  configs.push(newConf);
  localStorage.setItem(CONFIGS_KEY, JSON.stringify(configs));
  return newConf;
}

export function updateConfiguracao(updatedConfig: Configuracao) {
  const data = localStorage.getItem(CONFIGS_KEY);
  let configs: Configuracao[] = data ? JSON.parse(data) : [];
  const index = configs.findIndex((c) => c.mesAno === updatedConfig.mesAno);
  if (index !== -1) {
    configs[index] = updatedConfig;
  } else {
    configs.push(updatedConfig);
  }
  localStorage.setItem(CONFIGS_KEY, JSON.stringify(configs));
}

// Logic helpers
export function areFolgasUnlocked(mesAno: string): boolean {
  // Config override first
  const config = getConfiguracoes(mesAno);
  if (config.folgasLiberadasManualmente) {
    return true;
  }

  // Otherwise, unlock ONLY when ALL active, normal maqueiros have chosen a Saturday
  const allUsers = getUsuarios();
  const normalMaqueiros = allUsers.filter(
    (u) => u.role === UserRole.MAQUEIRO && u.tipo === StretcherType.NORMAL && u.ativo
  );

  const escalas = getEscalas().filter((e) => e.mesAno === mesAno);

  // Check if each normal active maqueiro has a sabadoTrabalho in the current month/year
  return normalMaqueiros.every((m) => {
    const esc = escalas.find((e) => e.usuarioId === m.id);
    return esc && esc.sabadoTrabalho !== null;
  });
}
