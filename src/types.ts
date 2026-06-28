/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum UserRole {
  ENFERMEIRO = 'enfermeiro',
  MAQUEIRO = 'maqueiro',
}

export enum UserShift {
  MANHA = 'manha', // 07:00 às 16:00
  TARDE = 'tarde', // 11:00 às 20:00
}

export enum StretcherType {
  NORMAL = 'normal',
  FIXO_SABADO = 'fixo_sabado', // Trabalha todo sábado à tarde, folga toda segunda
}

export interface Usuario {
  id: string;
  nome: string;
  matricula: string;
  login: string;
  senha?: string;
  role: UserRole;
  turno: UserShift;
  tipo: StretcherType;
  ativo: boolean;
}

export interface Escala {
  id: string;
  usuarioId: string;
  mesAno: string; // Ex: "2026-07"
  sabadoTrabalho: string | null; // Data ISO (YYYY-MM-DD) do sábado escolhido
  folgaCompensatoria: string | null; // Data ISO (YYYY-MM-DD) da folga escolhida
}

export interface Bloqueio {
  id: string;
  data: string; // YYYY-MM-DD
  justificativa: string;
}

export interface Configuracao {
  mesAno: string;
  vagasPorSabado: number; // Quantas vagas por sábado para maqueiros normais
  folgasLiberadasManualmente: boolean; // Override para liberar folgas antes de todos escolherem o sábado
}
