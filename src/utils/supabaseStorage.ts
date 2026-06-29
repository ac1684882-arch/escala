/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Supabase Storage Layer
 * Database operations for the Escala de Maqueiros system
 */

import { supabase } from '../config/supabase';
import {
  Usuario,
  Escala,
  Bloqueio,
  Configuracao,
} from '../types';

const DEMO_USER_IDS = Array.from({ length: 12 }, (_, index) => `u-${index + 1}`);
const DEMO_SCALE_IDS = ['esc-1', 'esc-2', 'esc-3'];
const DEMO_BLOCK_IDS = ['bloq-1'];

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

// Initialize storage (not needed for Supabase as tables are created via SQL)
export async function initializeStorage() {
  console.log('✅ Supabase conectado com sucesso!');
  
  // Verify connection by checking if tables exist
  const { error } = await supabase
    .from('usuarios')
    .select('count')
    .limit(1);
  
  if (error) {
    console.error('⚠️ Erro ao conectar com Supabase:', error.message);
    console.log('💡 Execute o SQL em supabase/init.sql no Supabase Dashboard');
  } else {
    await removeDemoData();
    console.log('✅ Tabelas do banco de dados verificadas!');
  }
}

async function removeDemoData(): Promise<void> {
  try {
    await supabase.from('escalas').delete().in('id', DEMO_SCALE_IDS);
    await supabase.from('escalas').delete().in('usuario_id', DEMO_USER_IDS);
    await supabase.from('bloqueios').delete().in('id', DEMO_BLOCK_IDS);
    await supabase.from('usuarios').delete().in('id', DEMO_USER_IDS);
  } catch (error) {
    console.error('Erro ao remover dados ficticios:', error);
  }
}

// User CRUD
export async function getUsuarios(): Promise<Usuario[]> {
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .order('nome');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    return [];
  }
}

export async function addUsuario(user: Usuario): Promise<void> {
  try {
    const userToInsert = {
      ...user,
      login: user.login.trim().toLowerCase(),
    };

    const { error } = await supabase
      .from('usuarios')
      .insert([userToInsert]);

    if (error) throw error;
  } catch (error) {
    console.error('Erro ao adicionar usuário:', error);
    throw error;
  }
}

export async function updateUsuario(updatedUser: Usuario): Promise<void> {
  try {
    const { error } = await supabase
      .from('usuarios')
      .update({
        nome: updatedUser.nome,
        matricula: updatedUser.matricula,
        login: updatedUser.login.trim().toLowerCase(),
        senha: updatedUser.senha,
        role: updatedUser.role,
        turno: updatedUser.turno,
        tipo: updatedUser.tipo,
        ativo: updatedUser.ativo,
        updated_at: new Date().toISOString(),
      })
      .eq('id', updatedUser.id);

    if (error) throw error;
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    throw error;
  }
}

// Scale CRUD
export async function getEscalas(): Promise<Escala[]> {
  try {
    const { data, error } = await supabase
      .from('escalas')
      .select('*')
      .order('mes_ano', { ascending: false });

    if (error) throw error;
    
    return (data || []).map((row: any) => ({
      id: row.id,
      usuarioId: row.usuario_id,
      mesAno: row.mes_ano,
      sabadoTrabalho: row.sabado_trabalho,
      folgaCompensatoria: row.folga_compensatoria,
    }));
  } catch (error) {
    console.error('Erro ao buscar escalas:', error);
    return [];
  }
}

export async function saveEscalas(escalas: Escala[]): Promise<void> {
  try {
    // Delete all existing escalas
    await supabase.from('escalas').delete().neq('id', '');
    
    // Insert new escalas
    if (escalas.length > 0) {
      const dataToInsert = escalas.map((e) => ({
        id: e.id,
        usuario_id: e.usuarioId,
        mes_ano: e.mesAno,
        sabado_trabalho: e.sabadoTrabalho,
        folga_compensatoria: e.folgaCompensatoria,
      }));

      const { error } = await supabase
        .from('escalas')
        .insert(dataToInsert);

      if (error) throw error;
    }
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
    const { data, error } = await supabase
      .from('escalas')
      .select('*')
      .eq('usuario_id', userId)
      .eq('mes_ano', mesAno)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // No rows found
      throw error;
    }

    if (!data) return null;

    return {
      id: data.id,
      usuarioId: data.usuario_id,
      mesAno: data.mes_ano,
      sabadoTrabalho: data.sabado_trabalho,
      folgaCompensatoria: data.folga_compensatoria,
    };
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
    const existing = await getEscalaForUser(userId, mesAno);

    if (existing) {
      // Update
      const { error } = await supabase
        .from('escalas')
        .update({
          sabado_trabalho: sabado,
          folga_compensatoria: folga,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id);

      if (error) throw error;
    } else {
      // Create
      const newEscala = {
        id: `esc-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        usuario_id: userId,
        mes_ano: mesAno,
        sabado_trabalho: sabado,
        folga_compensatoria: folga,
      };

      const { error } = await supabase
        .from('escalas')
        .insert([newEscala]);

      if (error) throw error;
    }
  } catch (error) {
    console.error('Erro ao atualizar/criar escala:', error);
    throw error;
  }
}

// Bloqueios CRUD
export async function getBloqueios(): Promise<Bloqueio[]> {
  try {
    const { data, error } = await supabase
      .from('bloqueios')
      .select('*')
      .order('data');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erro ao buscar bloqueios:', error);
    return [];
  }
}

export async function addBloqueio(bloqueio: Bloqueio): Promise<void> {
  try {
    const { error } = await supabase
      .from('bloqueios')
      .insert([bloqueio]);

    if (error) throw error;
  } catch (error) {
    console.error('Erro ao adicionar bloqueio:', error);
    throw error;
  }
}

export async function removeBloqueio(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('bloqueios')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Erro ao remover bloqueio:', error);
    throw error;
  }
}

// Configs CRUD
export async function getConfiguracoes(mesAno: string): Promise<Configuracao> {
  try {
    const { data, error } = await supabase
      .from('configuracoes')
      .select('*')
      .eq('mes_ano', mesAno)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No config found, create default
        const newConf: Configuracao = {
          mesAno,
          vagasPorSabado: 2,
          folgasLiberadasManualmente: false,
        };

        await supabase.from('configuracoes').insert([{
          mes_ano: mesAno,
          vagas_por_sabado: 2,
          folgas_liberadas_manualmente: false,
        }]);

        return newConf;
      }
      throw error;
    }

    return {
      mesAno: data.mes_ano,
      vagasPorSabado: data.vagas_por_sabado,
      folgasLiberadasManualmente: data.folgas_liberadas_manualmente,
    };
  } catch (error) {
    console.error('Erro ao buscar configurações:', error);
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
    const { error } = await supabase
      .from('configuracoes')
      .upsert({
        mes_ano: updatedConfig.mesAno,
        vagas_por_sabado: updatedConfig.vagasPorSabado,
        folgas_liberadas_manualmente: updatedConfig.folgasLiberadasManualmente,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'mes_ano',
      });

    if (error) throw error;
  } catch (error) {
    console.error('Erro ao atualizar configuração:', error);
    throw error;
  }
}

// Logic helpers
export async function areFolgasUnlocked(mesAno: string): Promise<boolean> {
  try {
    const config = await getConfiguracoes(mesAno);
    return config.folgasLiberadasManualmente;
  } catch (error) {
    console.error('Erro ao verificar desbloqueio de folgas:', error);
    return false;
  }
}
