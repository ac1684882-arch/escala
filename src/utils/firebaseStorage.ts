/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Firebase Firestore Storage Layer
 * Replaces localStorage with cloud-based persistent storage
 */

import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import {
  Usuario,
  Escala,
  Bloqueio,
  Configuracao,
  UserRole,
  UserShift,
  StretcherType,
} from '../types';

// Collection names
const USERS_COLLECTION = 'usuarios';
const ESCALAS_COLLECTION = 'escalas';
const BLOQUEIOS_COLLECTION = 'bloqueios';
const CONFIGS_COLLECTION = 'configuracoes';

// Helper to get all Saturdays of a given month/year
export function getSaturdaysInMonth(year: number, month: number): string[] {
  const dates: string[] = [];
  const date = new Date(year, month, 1);
  while (date.getMonth() === month) {
    if (date.getDay() === 6) {
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
    if (date.getDay() === 1) {
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
  // 5 Maqueiros da Tarde (3 normais, 2 fixos sábado)
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
  // 2 Enfermeiros supervisores
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
    vagasPorSabado: 2,
    folgasLiberadasManualmente: false,
  },
];

const INITIAL_ESCALAS: Escala[] = [
  {
    id: 'esc-1',
    usuarioId: 'u-1',
    mesAno: '2026-07',
    sabadoTrabalho: '2026-07-04',
    folgaCompensatoria: null,
  },
  {
    id: 'esc-2',
    usuarioId: 'u-2',
    mesAno: '2026-07',
    sabadoTrabalho: '2026-07-11',
    folgaCompensatoria: null,
  },
  {
    id: 'esc-3',
    usuarioId: 'u-8',
    mesAno: '2026-07',
    sabadoTrabalho: '2026-07-04',
    folgaCompensatoria: null,
  },
];

const INITIAL_BLOQUEIOS: Bloqueio[] = [
  {
    id: 'bloq-1',
    data: '2026-07-09',
    justificativa: 'Feriado de Alta Demanda Hospitalar - Plantão Reforçado',
  },
];

// Initialize Firestore with seed data (only runs once)
export async function initializeStorage() {
  try {
    // Check if data already exists
    const usersSnapshot = await getDocs(collection(db, USERS_COLLECTION));
    
    if (usersSnapshot.empty) {
      console.log('🌱 Inicializando banco de dados com dados seed...');
      
      const batch = writeBatch(db);

      // Add users
      INITIAL_USERS.forEach((user) => {
        const userRef = doc(db, USERS_COLLECTION, user.id);
        batch.set(userRef, user);
      });

      // Add configs
      INITIAL_CONFIGS.forEach((config) => {
        const configRef = doc(db, CONFIGS_COLLECTION, config.mesAno);
        batch.set(configRef, config);
      });

      // Add escalas
      INITIAL_ESCALAS.forEach((escala) => {
        const escalaRef = doc(db, ESCALAS_COLLECTION, escala.id);
        batch.set(escalaRef, escala);
      });

      // Add bloqueios
      INITIAL_BLOQUEIOS.forEach((bloqueio) => {
        const bloqueioRef = doc(db, BLOQUEIOS_COLLECTION, bloqueio.id);
        batch.set(bloqueioRef, bloqueio);
      });

      await batch.commit();
      console.log('✅ Dados iniciais carregados com sucesso!');
    }
  } catch (error) {
    console.error('❌ Erro ao inicializar storage:', error);
    throw error;
  }
}

// User CRUD
export async function getUsuarios(): Promise<Usuario[]> {
  try {
    const querySnapshot = await getDocs(collection(db, USERS_COLLECTION));
    return querySnapshot.docs.map((doc) => doc.data() as Usuario);
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    return [];
  }
}

export async function addUsuario(user: Usuario): Promise<void> {
  try {
    await setDoc(doc(db, USERS_COLLECTION, user.id), user);
  } catch (error) {
    console.error('Erro ao adicionar usuário:', error);
    throw error;
  }
}

export async function updateUsuario(updatedUser: Usuario): Promise<void> {
  try {
    await updateDoc(doc(db, USERS_COLLECTION, updatedUser.id), {
      ...updatedUser,
    });
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    throw error;
  }
}

// Scale CRUD
export async function getEscalas(): Promise<Escala[]> {
  try {
    const querySnapshot = await getDocs(collection(db, ESCALAS_COLLECTION));
    return querySnapshot.docs.map((doc) => doc.data() as Escala);
  } catch (error) {
    console.error('Erro ao buscar escalas:', error);
    return [];
  }
}

export async function saveEscalas(escalas: Escala[]): Promise<void> {
  try {
    const batch = writeBatch(db);
    
    // First, get all existing escalas to delete
    const existingSnapshot = await getDocs(collection(db, ESCALAS_COLLECTION));
    existingSnapshot.docs.forEach((document) => {
      batch.delete(document.ref);
    });

    // Then add the new escalas
    escalas.forEach((escala) => {
      const escalaRef = doc(db, ESCALAS_COLLECTION, escala.id);
      batch.set(escalaRef, escala);
    });

    await batch.commit();
  } catch (error) {
    console.error('Erro ao salvar escalas:', error);
    throw error;
  }
}

export async function getEscalaForUser(
  userId: string,
  mesAno: string
): Promise<Escala | null> {
  try {
    const q = query(
      collection(db, ESCALAS_COLLECTION),
      where('usuarioId', '==', userId),
      where('mesAno', '==', mesAno)
    );
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) return null;
    return querySnapshot.docs[0].data() as Escala;
  } catch (error) {
    console.error('Erro ao buscar escala do usuário:', error);
    return null;
  }
}

export async function updateOrCreateEscala(
  userId: string,
  mesAno: string,
  sabado: string | null,
  folga: string | null
): Promise<void> {
  try {
    // Find existing escala
    const q = query(
      collection(db, ESCALAS_COLLECTION),
      where('usuarioId', '==', userId),
      where('mesAno', '==', mesAno)
    );
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      // Update existing
      const escalaDoc = querySnapshot.docs[0];
      await updateDoc(escalaDoc.ref, {
        sabadoTrabalho: sabado,
        folgaCompensatoria: folga,
      });
    } else {
      // Create new
      const newEscala: Escala = {
        id: `esc-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        usuarioId: userId,
        mesAno,
        sabadoTrabalho: sabado,
        folgaCompensatoria: folga,
      };
      await setDoc(doc(db, ESCALAS_COLLECTION, newEscala.id), newEscala);
    }
  } catch (error) {
    console.error('Erro ao atualizar/criar escala:', error);
    throw error;
  }
}

// Bloqueios CRUD
export async function getBloqueios(): Promise<Bloqueio[]> {
  try {
    const querySnapshot = await getDocs(collection(db, BLOQUEIOS_COLLECTION));
    return querySnapshot.docs.map((doc) => doc.data() as Bloqueio);
  } catch (error) {
    console.error('Erro ao buscar bloqueios:', error);
    return [];
  }
}

export async function addBloqueio(bloqueio: Bloqueio): Promise<void> {
  try {
    await setDoc(doc(db, BLOQUEIOS_COLLECTION, bloqueio.id), bloqueio);
  } catch (error) {
    console.error('Erro ao adicionar bloqueio:', error);
    throw error;
  }
}

export async function removeBloqueio(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, BLOQUEIOS_COLLECTION, id));
  } catch (error) {
    console.error('Erro ao remover bloqueio:', error);
    throw error;
  }
}

// Configs CRUD
export async function getConfiguracoes(mesAno: string): Promise<Configuracao> {
  try {
    const docRef = doc(db, CONFIGS_COLLECTION, mesAno);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as Configuracao;
    }

    // Create default if not found
    const newConf: Configuracao = {
      mesAno,
      vagasPorSabado: 2,
      folgasLiberadasManualmente: false,
    };
    await setDoc(docRef, newConf);
    return newConf;
  } catch (error) {
    console.error('Erro ao buscar configurações:', error);
    // Return default on error
    return {
      mesAno,
      vagasPorSabado: 2,
      folgasLiberadasManualmente: false,
    };
  }
}

export async function updateConfiguracao(
  updatedConfig: Configuracao
): Promise<void> {
  try {
    await setDoc(
      doc(db, CONFIGS_COLLECTION, updatedConfig.mesAno),
      updatedConfig
    );
  } catch (error) {
    console.error('Erro ao atualizar configuração:', error);
    throw error;
  }
}

// Logic helpers
export async function areFolgasUnlocked(mesAno: string): Promise<boolean> {
  try {
    // Config override first
    const config = await getConfiguracoes(mesAno);
    if (config.folgasLiberadasManualmente) {
      return true;
    }

    // Otherwise, unlock ONLY when ALL active, normal maqueiros have chosen a Saturday
    const allUsers = await getUsuarios();
    const normalMaqueiros = allUsers.filter(
      (u) =>
        u.role === UserRole.MAQUEIRO &&
        u.tipo === StretcherType.NORMAL &&
        u.ativo
    );

    const escalas = await getEscalas();
    const escalasThisMonth = escalas.filter((e) => e.mesAno === mesAno);

    // Check if each normal active maqueiro has a sabadoTrabalho
    return normalMaqueiros.every((m) => {
      const esc = escalasThisMonth.find((e) => e.usuarioId === m.id);
      return esc && esc.sabadoTrabalho !== null;
    });
  } catch (error) {
    console.error('Erro ao verificar desbloqueio de folgas:', error);
    return false;
  }
}
