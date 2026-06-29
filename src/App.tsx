/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Usuario,
  Escala,
  Bloqueio,
  Configuracao,
  UserRole,
} from './types';
import {
  initializeStorage,
  getUsuarios,
  getEscalas,
  getBloqueios,
  getConfiguracoes,
  addUsuario,
  updateUsuario,
  updateConfiguracao,
  addBloqueio,
  removeBloqueio,
  updateOrCreateEscala,
  saveEscalas,
} from './utils/supabaseStorage';
import PrefeituraHeader from './components/PrefeituraHeader';
import LoginScreen from './components/LoginScreen';
import NurseDashboard from './components/NurseDashboard';
import MaqueiroDashboard from './components/MaqueiroDashboard';

export default function App() {
  const [currentUser, setCurrentUser] = useState<Usuario | null>(null);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [escalas, setEscalas] = useState<Escala[]>([]);
  const [bloqueios, setBloqueios] = useState<Bloqueio[]>([]);
  const [isInitialDataLoading, setIsInitialDataLoading] = useState(true);
  const [currentMonthStr, setCurrentMonthStr] = useState<string>('2026-07'); // Default to pre-seeded July 2026
  const [config, setConfig] = useState<Configuracao>({
    mesAno: '2026-07',
    vagasPorSabado: 2,
    folgasLiberadasManualmente: false,
  });

  // Load and initialize data
  useEffect(() => {
    const initData = async () => {
      try {
        await initializeStorage();
        await loadAllData('2026-07');
      } catch (error) {
        console.error('Erro ao inicializar dados:', error);
      } finally {
        setIsInitialDataLoading(false);
      }
    };
    initData();
  }, []);

  const loadAllData = async (monthStr: string) => {
    try {
      const users = await getUsuarios();
      const esc = await getEscalas();
      const bloq = await getBloqueios();
      const conf = await getConfiguracoes(monthStr);

      setUsuarios(users);
      setEscalas(esc);
      setBloqueios(bloq);
      setConfig(conf);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  const handleMonthChange = (monthStr: string) => {
    setCurrentMonthStr(monthStr);
    loadAllData(monthStr);
  };

  const handleLoginSuccess = (user: Usuario) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  // Add a new user
  const handleAddUser = async (user: Usuario) => {
    try {
      await addUsuario(user);
      const updatedUsers = await getUsuarios();
      setUsuarios(updatedUsers);
    } catch (error) {
      console.error('Erro ao adicionar usuário:', error);
    }
  };

  const handleRegisterUser = async (user: Usuario) => {
    await addUsuario(user);
    const updatedUsers = await getUsuarios();
    setUsuarios(updatedUsers);
  };

  // Update a user (e.g., editing, toggling active status)
  const handleUpdateUser = async (user: Usuario) => {
    try {
      await updateUsuario(user);
      const updatedUsers = await getUsuarios();
      setUsuarios(updatedUsers);

      // If the active user was updated, synchronize current user state
      if (currentUser && currentUser.id === user.id) {
        setCurrentUser(user);
      }
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
    }
  };

  // Update configurations
  const handleUpdateConfig = async (updatedConfig: Configuracao) => {
    try {
      await updateConfiguracao(updatedConfig);
      setConfig(updatedConfig);
    } catch (error) {
      console.error('Erro ao atualizar configuração:', error);
    }
  };

  // Add a blocked date
  const handleAddBloqueio = async (b: Bloqueio) => {
    try {
      await addBloqueio(b);
      const bloqueios = await getBloqueios();
      setBloqueios(bloqueios);
    } catch (error) {
      console.error('Erro ao adicionar bloqueio:', error);
    }
  };

  // Remove a blocked date
  const handleRemoveBloqueio = async (id: string) => {
    try {
      await removeBloqueio(id);
      const bloqueios = await getBloqueios();
      setBloqueios(bloqueios);
    } catch (error) {
      console.error('Erro ao remover bloqueio:', error);
    }
  };

  // Stretcher workflow: choose a Saturday
  const handleChooseSaturday = async (sabadoDate: string) => {
    if (!currentUser) return;
    try {
      await updateOrCreateEscala(currentUser.id, currentMonthStr, sabadoDate, null);
      const updatedEscalas = await getEscalas();
      setEscalas(updatedEscalas);
    } catch (error) {
      console.error('Erro ao escolher sábado:', error);
    }
  };

  // Stretcher workflow: choose an off-day
  const handleChooseFolga = async (folgaDate: string) => {
    if (!currentUser) return;
    try {
      // Keep current saturday, change folga
      const currentScale = escalas.find((e) => e.usuarioId === currentUser.id && e.mesAno === currentMonthStr);
      const sat = currentScale?.sabadoTrabalho || null;
      await updateOrCreateEscala(currentUser.id, currentMonthStr, sat, folgaDate);
      const updatedEscalas = await getEscalas();
      setEscalas(updatedEscalas);
    } catch (error) {
      console.error('Erro ao escolher folga:', error);
    }
  };

  // Stretcher workflow: clear/reset choices
  const handleClearEscala = async () => {
    if (!currentUser) return;
    try {
      await updateOrCreateEscala(currentUser.id, currentMonthStr, null, null);
      const updatedEscalas = await getEscalas();
      setEscalas(updatedEscalas);
    } catch (error) {
      console.error('Erro ao limpar escala:', error);
    }
  };

  // Nurse manual escala override
  const handleUpdateEscalaManual = async (userId: string, sabado: string | null, folga: string | null) => {
    try {
      await updateOrCreateEscala(userId, currentMonthStr, sabado, folga);
      const updatedEscalas = await getEscalas();
      setEscalas(updatedEscalas);
    } catch (error) {
      console.error('Erro ao atualizar escala manual:', error);
    }
  };

  // Nurse reset scales for current month
  const handleResetEscalas = async () => {
    try {
      const allEscalas = await getEscalas();
      const remainingScales = allEscalas.filter((e) => e.mesAno !== currentMonthStr);
      await saveEscalas(remainingScales);
      setEscalas(remainingScales);
    } catch (error) {
      console.error('Erro ao resetar escalas:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-800">
      {/* Institutional Top Header */}
      <PrefeituraHeader
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      <main className="flex-grow">
        {isInitialDataLoading ? (
          <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4" data-testid="app-loading">
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm px-6 py-5 text-center">
              <div className="text-sm font-bold text-[#003B66]">Carregando dados do sistema...</div>
              <div className="text-xs text-gray-500 mt-1">Aguarde enquanto conectamos ao banco de dados.</div>
            </div>
          </div>
        ) : !currentUser ? (
          /* Login Screen */
          <LoginScreen onLoginSuccess={handleLoginSuccess} onRegisterUser={handleRegisterUser} allUsers={usuarios} />
        ) : currentUser.role === UserRole.ENFERMEIRO ? (
          /* Supervisor/Nurse Dashboard */
          <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8" data-testid="nurse-dashboard">
            <NurseDashboard
              usuarios={usuarios}
              escalas={escalas}
              bloqueios={bloqueios}
              config={config}
              currentUser={currentUser}
              currentMonthStr={currentMonthStr}
              onMonthChange={handleMonthChange}
              onAddUser={handleAddUser}
              onUpdateUser={handleUpdateUser}
              onUpdateConfig={handleUpdateConfig}
              onAddBloqueio={handleAddBloqueio}
              onRemoveBloqueio={handleRemoveBloqueio}
              onUpdateEscalaManual={handleUpdateEscalaManual}
              onResetEscalas={handleResetEscalas}
            />
          </div>
        ) : (
          /* Stretcher Dashboard */
          <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8" data-testid="maqueiro-dashboard">
            <MaqueiroDashboard
              currentUser={currentUser}
              currentMonthStr={currentMonthStr}
              onMonthChange={handleMonthChange}
              usuarios={usuarios}
              escalas={escalas}
              bloqueios={bloqueios}
              config={config}
              onChooseSaturday={handleChooseSaturday}
              onChooseFolga={handleChooseFolga}
              onClearEscala={handleClearEscala}
            />
          </div>
        )}
      </main>

      {/* Shared Footer */}
      <footer className="bg-white border-t border-gray-200 py-4 text-center text-xs text-gray-400 font-semibold uppercase tracking-wider">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          Prefeitura do Rio de Janeiro • Secretaria Municipal de Saúde • SMS-Rio
        </div>
      </footer>
    </div>
  );
}
