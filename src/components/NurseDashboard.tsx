/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Users,
  Settings,
  Lock,
  Unlock,
  AlertTriangle,
  FileSpreadsheet,
  CheckCircle,
  HelpCircle,
  Trash2,
  CalendarCheck,
  PlusCircle,
  ShieldCheck,
  X,
} from 'lucide-react';
import { Usuario, Escala, Bloqueio, Configuracao, UserRole, StretcherType, UserShift } from '../types';
import CalendarView from './CalendarView';
import StretcherManagement from './StretcherManagement';
import { areFolgasUnlocked } from '../utils/supabaseStorage';

interface NurseDashboardProps {
  usuarios: Usuario[];
  escalas: Escala[];
  bloqueios: Bloqueio[];
  config: Configuracao;
  currentUser: Usuario;
  currentMonthStr: string;
  onMonthChange: (monthStr: string) => void;
  onAddUser: (user: Usuario) => void;
  onUpdateUser: (user: Usuario) => void;
  onUpdateConfig: (config: Configuracao) => void;
  onAddBloqueio: (b: Bloqueio) => void;
  onRemoveBloqueio: (id: string) => void;
  onUpdateEscalaManual: (userId: string, sabado: string | null, folga: string | null) => void;
  onResetEscalas: () => void;
}

export default function NurseDashboard({
  usuarios,
  escalas,
  bloqueios,
  config,
  currentUser,
  currentMonthStr,
  onMonthChange,
  onAddUser,
  onUpdateUser,
  onUpdateConfig,
  onAddBloqueio,
  onRemoveBloqueio,
  onUpdateEscalaManual,
  onResetEscalas,
}: NurseDashboardProps) {
  const [activeTab, setActiveTab] = useState<'escala' | 'pessoal' | 'configs'>('escala');

  // Manual Edit Modal state
  const [selectedDateForEdit, setSelectedDateForEdit] = useState<string | null>(null);
  const [editReason, setEditReason] = useState('');
  const [selectedStretcherForManualEdit, setSelectedStretcherForManualEdit] = useState('');
  const [manualActionType, setManualActionType] = useState<'trabalho' | 'folga'>('trabalho');

  // Configuration form state
  const [blockDateInput, setBlockDateInput] = useState('');
  const [blockJustify, setBlockJustify] = useState('');

  // State for async folgas unlock check
  const [isFolgaUnlocked, setIsFolgaUnlocked] = React.useState(false);
  
  React.useEffect(() => {
    const checkFolgasUnlock = async () => {
      const unlocked = await areFolgasUnlocked(currentMonthStr);
      setIsFolgaUnlocked(unlocked);
    };
    checkFolgasUnlock();
  }, [currentMonthStr, escalas, config]);

  // Local calculations
  const normalMaqueiros = usuarios.filter((u) => u.role === UserRole.MAQUEIRO && u.tipo === StretcherType.NORMAL && u.ativo);
  const fixedMaqueiros = usuarios.filter((u) => u.role === UserRole.MAQUEIRO && u.tipo === StretcherType.FIXO_SABADO && u.ativo);
  
  const totalMaqueiros = normalMaqueiros.length + fixedMaqueiros.length;

  const scalesThisMonth = escalas.filter((e) => e.mesAno === currentMonthStr);
  const countSaturdaysChosen = scalesThisMonth.filter((e) => e.sabadoTrabalho !== null).length;
  const countFolgasChosen = scalesThisMonth.filter((e) => e.folgaCompensatoria !== null).length;

  const handleCalendarDayClick = (dateStr: string, isSaturday: boolean, isWeekday: boolean) => {
    setSelectedDateForEdit(dateStr);
    setSelectedStretcherForManualEdit(normalMaqueiros[0]?.id || '');
    setManualActionType(isSaturday ? 'trabalho' : 'folga');
    setEditReason('');
  };

  const handleApplyManualEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDateForEdit) return;

    // Check if we are blocking the date
    if (manualActionType === 'trabalho' && editReason) {
      // Create blocked date instead
      onAddBloqueio({
        id: `bloq-${Date.now()}`,
        data: selectedDateForEdit,
        justificativa: editReason,
      });
      setSelectedDateForEdit(null);
      return;
    }

    if (!selectedStretcherForManualEdit) return;

    // Find if stretcher already has scale for this month
    const currentScale = scalesThisMonth.find((esc) => esc.usuarioId === selectedStretcherForManualEdit);
    let updatedSabado = currentScale?.sabadoTrabalho || null;
    let updatedFolga = currentScale?.folgaCompensatoria || null;

    if (manualActionType === 'trabalho') {
      updatedSabado = selectedDateForEdit;
    } else {
      updatedFolga = selectedDateForEdit;
    }

    onUpdateEscalaManual(selectedStretcherForManualEdit, updatedSabado, updatedFolga);
    setSelectedDateForEdit(null);
  };

  const handleAddBloqueioForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!blockDateInput || !blockJustify) return;

    onAddBloqueio({
      id: `bloq-${Date.now()}`,
      data: blockDateInput,
      justificativa: blockJustify,
    });
    setBlockDateInput('');
    setBlockJustify('');
  };

  const toggleForceUnlockFolgas = () => {
    onUpdateConfig({
      ...config,
      folgasLiberadasManualmente: !config.folgasLiberadasManualmente,
    });
  };

  const handleVagasChange = (val: number) => {
    onUpdateConfig({
      ...config,
      vagasPorSabado: val,
    });
  };

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Funcionários */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4" data-testid="metric-maqueiros-ativos">
          <div className="bg-[#005C9E]/10 p-3 rounded-xl text-[#005C9E]">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-[#003B66]">{totalMaqueiros}</div>
            <div className="text-xs text-gray-500 font-semibold uppercase">Funcionários Ativos</div>
            <div className="text-[10px] text-gray-400 mt-0.5 font-medium">
              {normalMaqueiros.length} Normais • {fixedMaqueiros.length} Sáb. Fixo
            </div>
          </div>
        </div>

        {/* Sábados Escolhidos */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4" data-testid="metric-sabados-agendados">
          <div className="bg-blue-100 p-3 rounded-xl text-blue-800">
            <CalendarCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-[#003B66]">
              {countSaturdaysChosen} <span className="text-sm text-gray-400 font-medium">/ {normalMaqueiros.length}</span>
            </div>
            <div className="text-xs text-gray-500 font-semibold uppercase">Sábados Agendados</div>
            <div className="text-[10px] text-gray-400 mt-0.5 font-medium">
              Escolhas feitas pelos funcionários
            </div>
          </div>
        </div>

        {/* Folgas compensatórias escolhidas */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4" data-testid="metric-folgas-definidas">
          <div className="bg-green-100 p-3 rounded-xl text-[#2E7D32]">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-[#003B66]">
              {countFolgasChosen} <span className="text-sm text-gray-400 font-medium">/ {normalMaqueiros.length}</span>
            </div>
            <div className="text-xs text-gray-500 font-semibold uppercase">Folgas Definidas</div>
            <div className="text-[10px] text-gray-400 mt-0.5 font-medium">
              Agendadas em dias úteis
            </div>
          </div>
        </div>

        {/* Status das Folgas */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className={`p-3 rounded-xl ${isFolgaUnlocked ? 'bg-green-100 text-[#2E7D32]' : 'bg-amber-100 text-amber-700'}`}>
            {isFolgaUnlocked ? <Unlock className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
          </div>
          <div className="flex-1">
            <div className="text-sm font-extrabold text-[#003B66] flex items-center gap-1">
              {isFolgaUnlocked ? 'Folgas Liberadas' : 'Folgas Bloqueadas'}
            </div>
            <div className="text-xs text-gray-500 font-semibold uppercase">Escolha do Funcionário</div>
            <div className="text-[10px] text-gray-400 mt-0.5 font-medium leading-relaxed">
              {config.folgasLiberadasManualmente
                ? 'Admin liberou a escolha de folgas'
                : 'Admin ainda não liberou as folgas'}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Controller */}
      <div className="bg-white p-2 rounded-xl border border-gray-100 shadow-sm flex gap-2">
        <button
          onClick={() => setActiveTab('escala')}
          data-testid="tab-escala"
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            activeTab === 'escala'
              ? 'bg-[#005C9E] text-white shadow-sm'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <CalendarIcon className="w-4 h-4" />
          Visualizar Escala Geral
        </button>

        <button
          onClick={() => setActiveTab('pessoal')}
          data-testid="tab-pessoal"
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            activeTab === 'pessoal'
              ? 'bg-[#005C9E] text-white shadow-sm'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Users className="w-4 h-4" />
          Gerenciar Funcionários
        </button>

        <button
          onClick={() => setActiveTab('configs')}
          data-testid="tab-configs"
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            activeTab === 'configs'
              ? 'bg-[#005C9E] text-white shadow-sm'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Settings className="w-4 h-4" />
          Configurações e Bloqueios
        </button>
      </div>

      {/* Tab Render: Main Calendar Scale */}
      {activeTab === 'escala' && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <HelpCircle className="w-5 h-5 text-[#005C9E] shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-blue-900 uppercase">Dica de Gestor (Controle Total)</h4>
                <p className="text-xs text-blue-700 leading-relaxed">
                  Para fazer um ajuste manual ou bloqueio administrativo, basta clicar diretamente em qualquer data no calendário grande abaixo.
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                if (window.confirm('Tem certeza de que deseja resetar TODAS as escolhas de escala dos funcionários normais para este mês? Os profissionais terão de escolher novamente.')) {
                  onResetEscalas();
                }
              }}
              className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold text-xs py-2 px-3 rounded-lg transition flex items-center gap-2 cursor-pointer shadow-sm active:scale-95 shrink-0"
            >
              <Trash2 className="w-4 h-4" />
              Resetar Escala do Mês
            </button>
          </div>

          <CalendarView
            currentMonthStr={currentMonthStr}
            onMonthChange={onMonthChange}
            usuarios={usuarios}
            escalas={escalas}
            bloqueios={bloqueios}
            config={config}
            currentUser={currentUser}
            onDayClick={handleCalendarDayClick}
          />
        </div>
      )}

      {/* Tab Render: Person Management */}
      {activeTab === 'pessoal' && (
        <StretcherManagement
          usuarios={usuarios}
          onAddUser={onAddUser}
          onUpdateUser={onUpdateUser}
        />
      )}

      {/* Tab Render: Rules & Blocks */}
      {activeTab === 'configs' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Rules and Limits */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-100 shadow-sm space-y-5">
            <div className="flex items-center gap-2.5 border-b border-gray-100 pb-3">
              <Settings className="w-5 h-5 text-[#005C9E]" />
              <h3 className="font-sans font-bold text-sm text-[#003B66]">Regras Gerais da Escala</h3>
            </div>

            {/* Vagas por Sábado slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-bold text-gray-700">
                <span className="uppercase tracking-wide">Vagas de funcionários normais por Sábado</span>
                <span className="bg-[#005C9E]/10 text-[#005C9E] px-2.5 py-1 rounded-full text-xs font-black">
                  {config.vagasPorSabado} vagas por Sábado
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#005C9E]"
                value={config.vagasPorSabado}
                onChange={(e) => handleVagasChange(Number(e.target.value))}
              />
              <p className="text-[11px] text-gray-500 font-medium">
                Regula o limite de preenchimento por sábado. Ao atingir o limite, o sábado é bloqueado para os demais funcionários.
              </p>
            </div>

            {/* Force unlock */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wide">Liberação Manual de Folgas</h4>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    Depois que os funcionários escolherem os sábados pelo link enviado no WhatsApp, use este controle para liberar ou bloquear a escolha das folgas compensatórias.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={toggleForceUnlockFolgas}
                className={`w-full py-2 px-4 rounded-lg font-bold text-xs uppercase tracking-wide transition shadow-sm cursor-pointer flex items-center justify-center gap-2 ${
                  config.folgasLiberadasManualmente
                    ? 'bg-amber-600 hover:bg-amber-700 text-white'
                    : 'bg-[#005C9E] hover:bg-[#004D85] text-white'
                }`}
              >
                {config.folgasLiberadasManualmente ? (
                  <>
                    <Lock className="w-4 h-4 text-[#FFB300]" />
                    Bloquear Escolha de Folgas
                  </>
                ) : (
                  <>
                    <Unlock className="w-4 h-4 text-[#FFB300]" />
                    Liberar Escolha de Folgas
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Bloqueios de data */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-100 shadow-sm space-y-5">
            <div className="flex items-center gap-2.5 border-b border-gray-100 pb-3">
              <Lock className="w-5 h-5 text-red-600" />
              <h3 className="font-sans font-bold text-sm text-[#003B66]">Datas Bloqueadas para Folga</h3>
            </div>

            {/* Block date form */}
            <form onSubmit={handleAddBloqueioForm} className="space-y-3.5 bg-gray-50 p-4 rounded-xl border border-gray-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[10px] font-black text-gray-700 uppercase">Selecione a data</label>
                  <input
                    type="date"
                    className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-semibold focus:outline-none"
                    value={blockDateInput}
                    onChange={(e) => setBlockDateInput(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-black text-gray-700 uppercase">Justificativa do bloqueio</label>
                  <input
                    type="text"
                    placeholder="Ex: Feriado municipal - escala cheia"
                    className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-medium focus:outline-none"
                    value={blockJustify}
                    onChange={(e) => setBlockJustify(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-2 rounded-lg transition shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                Bloquear Data Selecionada
              </button>
            </form>

            {/* List of blocked dates */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wide">Bloqueios Atuais ({bloqueios.length})</h4>
              {bloqueios.length === 0 ? (
                <p className="text-xs text-gray-400 italic">Nenhuma data bloqueada atualmente.</p>
              ) : (
                <div className="divide-y divide-gray-100 max-h-[200px] overflow-y-auto pr-1">
                  {bloqueios.map((b) => {
                    const [y, m, d] = b.data.split('-');
                    const formattedDate = `${d}/${m}/${y}`;
                    return (
                      <div key={b.id} className="py-2.5 flex items-center justify-between text-xs font-medium gap-4">
                        <div>
                          <div className="font-bold text-gray-900">{formattedDate}</div>
                          <div className="text-[11px] text-gray-500">{b.justificativa}</div>
                        </div>
                        <button
                          onClick={() => onRemoveBloqueio(b.id)}
                          className="p-1 text-gray-400 hover:text-red-600 transition hover:bg-red-50 rounded cursor-pointer"
                          title="Remover Bloqueio"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Manual Scale Edit Modal / Dialog */}
      {selectedDateForEdit && (
        <div className="fixed inset-0 bg-slate-900/45 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 max-w-md w-full overflow-hidden animate-scaleUp">
            {/* Header */}
            <div className="bg-[#005C9E] text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#FFB300]" />
                <h3 className="font-sans font-black text-sm uppercase tracking-wider">
                  Controle do Supervisor
                </h3>
              </div>
              <button
                onClick={() => setSelectedDateForEdit(null)}
                className="text-white hover:text-blue-200 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleApplyManualEdit} className="p-6 space-y-4">
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 text-xs text-blue-900 font-medium">
                Você selecionou o dia <span className="font-black text-[#005C9E]">{selectedDateForEdit.split('-').reverse().join('/')}</span>.
                Como deseja alterar este dia na escala?
              </div>

              {/* Action Type */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black text-gray-700 uppercase">Ação administrativa</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setManualActionType('trabalho');
                      setEditReason('');
                    }}
                    className={`py-2 px-3 rounded-lg text-xs font-bold uppercase transition ${
                      manualActionType === 'trabalho' && !editReason
                        ? 'bg-[#005C9E] text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Escalar Trabalho
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setManualActionType('folga');
                      setEditReason('');
                    }}
                    className={`py-2 px-3 rounded-lg text-xs font-bold uppercase transition ${
                      manualActionType === 'folga' && !editReason
                        ? 'bg-[#2E7D32] text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Definir Folga
                  </button>
                </div>
              </div>

              {/* Toggle to Block Date option */}
              <div className="pt-2 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="chk-block-date"
                    className="rounded text-red-600 focus:ring-red-500 w-4 h-4 cursor-pointer"
                    checked={editReason !== ''}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setEditReason('Bloqueio Administrativo do Supervisor');
                      } else {
                        setEditReason('');
                      }
                    }}
                  />
                  <label htmlFor="chk-block-date" className="text-xs font-bold text-red-700 cursor-pointer uppercase">
                    Bloquear este dia totalmente para folgas
                  </label>
                </div>
              </div>

              {/* Conditionally render fields based on action */}
              {editReason ? (
                // Blocking the date fields
                <div className="space-y-1">
                  <label className="block text-[10px] font-black text-gray-700 uppercase">Motivo do bloqueio</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs font-medium focus:outline-none"
                    value={editReason}
                    onChange={(e) => setEditReason(e.target.value)}
                    placeholder="Ex: Feriado - demanda alta"
                    required
                  />
                </div>
              ) : (
                // Normal scale assignment
                <div className="space-y-4">
                  {/* Select Stretcher */}
                  <div className="space-y-1">
                    <label className="block text-[10px] font-black text-gray-700 uppercase">Selecionar funcionário normal</label>
                    <select
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs font-bold text-gray-800"
                      value={selectedStretcherForManualEdit}
                      onChange={(e) => setSelectedStretcherForManualEdit(e.target.value)}
                    >
                      {normalMaqueiros.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.nome} (Turno: {m.turno === UserShift.MANHA ? 'Manhã' : 'Tarde'})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Warn if choosing Saturday for Folga or Weekday for Work */}
                  {manualActionType === 'folga' && selectedDateForEdit && new Date(selectedDateForEdit).getDay() === 6 && (
                    <div className="bg-amber-50 text-amber-900 text-[11px] p-2 rounded border border-amber-200 flex gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <span>
                        Atenção: Você está programando uma folga compensatória em um Sábado. O padrão operacional é que folgas ocorram apenas em dias úteis.
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setSelectedDateForEdit(null)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs py-2 px-4 rounded-lg cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={`font-bold text-xs py-2 px-4 rounded-lg shadow cursor-pointer text-white ${
                    editReason ? 'bg-red-600 hover:bg-red-700' : 'bg-[#005C9E] hover:bg-[#004D85]'
                  }`}
                >
                  {editReason ? 'Bloquear Dia' : 'Aplicar Alteração'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
