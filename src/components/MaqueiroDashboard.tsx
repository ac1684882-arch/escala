/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  CheckCircle,
  Clock,
  Lock,
  Unlock,
  AlertCircle,
  HelpCircle,
  CalendarDays,
  UserCheck,
} from 'lucide-react';
import { Usuario, Escala, Bloqueio, Configuracao, UserRole, UserShift, StretcherType } from '../types';
import CalendarView from './CalendarView';
import { getSaturdaysInMonth, areFolgasUnlocked } from '../utils/supabaseStorage';

interface MaqueiroDashboardProps {
  currentUser: Usuario;
  currentMonthStr: string;
  onMonthChange: (monthStr: string) => void;
  usuarios: Usuario[];
  escalas: Escala[];
  bloqueios: Bloqueio[];
  config: Configuracao;
  onChooseSaturday: (sabadoDate: string) => void;
  onChooseFolga: (folgaDate: string) => void;
  onClearEscala: () => void;
}

export default function MaqueiroDashboard({
  currentUser,
  currentMonthStr,
  onMonthChange,
  usuarios,
  escalas,
  bloqueios,
  config,
  onChooseSaturday,
  onChooseFolga,
  onClearEscala,
}: MaqueiroDashboardProps) {
  const [year, month] = currentMonthStr.split('-').map(Number);
  const monthNamesPt = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  const monthName = monthNamesPt[month - 1];

  // Get user's current scale
  const userScale = escalas.find((e) => e.usuarioId === currentUser.id && e.mesAno === currentMonthStr);
  const chosenSaturday = userScale?.sabadoTrabalho || null;
  const chosenFolga = userScale?.folgaCompensatoria || null;

  const isFixo = currentUser.tipo === StretcherType.FIXO_SABADO;
  
  // State for async folgas unlock check
  const [isFolgasUnlocked, setIsFolgasUnlocked] = React.useState(false);
  
  React.useEffect(() => {
    const checkFolgasUnlock = async () => {
      const unlocked = await areFolgasUnlocked(currentMonthStr);
      setIsFolgasUnlocked(unlocked);
    };
    checkFolgasUnlock();
  }, [currentMonthStr, escalas, config]);
  
  const countSaturdaysChosen = escalas.filter((e) => e.mesAno === currentMonthStr && e.sabadoTrabalho !== null).length;

  // Calculate Saturdays in month
  const saturdays = getSaturdaysInMonth(year, month - 1);

  // Find remaining slots for each Saturday
  const getSaturdaySlots = (satDate: string) => {
    const counts = escalas.filter((e) => e.mesAno === currentMonthStr && e.sabadoTrabalho === satDate).length;
    const available = Math.max(0, config.vagasPorSabado - counts);
    return {
      available,
      occupied: counts,
      isEsgotado: available <= 0,
    };
  };

  // Helper to check if a date is blocked by nurse
  const isDateBlockedByNurse = (dateStr: string) => {
    return bloqueios.some((b) => b.data === dateStr);
  };

  // Build weekday choice list (Monday-Friday) for folga selection
  const getWeekdaysInMonth = () => {
    const dates: { dateStr: string; dayNum: number; dayOfWeekName: string; isBlocked: boolean; blockReason?: string }[] = [];
    const date = new Date(year, month - 1, 1);
    const weekdayNames = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];

    while (date.getMonth() === month - 1) {
      const dayOfWeek = date.getDay();
      if (dayOfWeek >= 1 && dayOfWeek <= 5) { // Monday to Friday
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        const dateStr = `${yyyy}-${mm}-${dd}`;

        const bloq = bloqueios.find((b) => b.data === dateStr);

        dates.push({
          dateStr,
          dayNum: date.getDate(),
          dayOfWeekName: weekdayNames[dayOfWeek],
          isBlocked: !!bloq,
          blockReason: bloq?.justificativa,
        });
      }
      date.setDate(date.getDate() + 1);
    }
    return dates;
  };

  const weekdays = getWeekdaysInMonth();

  const handleSelectSaturday = (satDate: string) => {
    if (isFixo) return;
    const slots = getSaturdaySlots(satDate);
    if (slots.isEsgotado && chosenSaturday !== satDate) {
      alert('Este sábado já atingiu o limite de vagas disponíveis.');
      return;
    }
    onChooseSaturday(satDate);
  };

  const handleSelectFolga = (folgaDate: string) => {
    if (isFixo) return;
    if (!chosenSaturday) {
      alert('Você precisa escolher um Sábado de trabalho antes de escolher a folga.');
      return;
    }
    if (!isFolgasUnlocked) {
      alert('A escolha de folgas ainda não foi liberada pelo supervisor.');
      return;
    }
    if (isDateBlockedByNurse(folgaDate)) {
      alert('Esta data foi bloqueada para folgas pelo supervisor.');
      return;
    }
    onChooseFolga(folgaDate);
  };

  return (
    <div className="space-y-6">
      {/* Alert status top panel */}
      {isFixo ? (
        <div className="bg-emerald-50 border-l-4 border-emerald-600 p-5 rounded-2xl shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-emerald-800 font-extrabold text-sm uppercase">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            Escala Fixa Programada (Regime Especial)
          </div>
          <p className="text-xs text-emerald-700 leading-relaxed">
            Como você é maqueiro de regime <strong>Fixo de Sábado à Tarde</strong>, sua escala é automática:
          </p>
          <ul className="text-xs text-emerald-900 font-bold list-disc pl-5 space-y-1">
            <li>Você trabalha todo Sábado das 11:00 às 20:00 (Turno Tarde).</li>
            <li>Sua folga fixa é toda Segunda-feira (já provisionada no calendário geral).</li>
          </ul>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Status block 1: Saturday */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between" data-testid="status-sabado">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">Passo 1</span>
              <h4 className="font-sans font-bold text-sm text-[#003B66] mt-0.5">Sábado de Plantão</h4>
              <p className="text-xs text-gray-500 mt-1">Selecione o sábado em que irá trabalhar.</p>
            </div>
            <div className="mt-4">
              {chosenSaturday ? (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-center justify-between text-xs font-bold text-blue-900">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4.5 h-4.5 text-blue-600 shrink-0" />
                    <span>Selecionado: {chosenSaturday.split('-').reverse().join('/')}</span>
                  </div>
                </div>
              ) : (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center gap-2 text-xs font-bold text-amber-800">
                  <Clock className="w-4.5 h-4.5 text-amber-600 shrink-0" />
                  <span>Selecione um Sábado abaixo</span>
                </div>
              )}
            </div>
          </div>

          {/* Status block 2: Folga Status */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between" data-testid="status-folga">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">Passo 2</span>
              <h4 className="font-sans font-bold text-sm text-[#003B66] mt-0.5">Folga Compensatória</h4>
              <p className="text-xs text-gray-500 mt-1">Escolha uma folga em dia útil (Segunda a Sexta).</p>
            </div>
            <div className="mt-4">
              {!chosenSaturday ? (
                <div className="bg-gray-100 border border-gray-200 rounded-xl p-3 flex items-center gap-2 text-xs font-bold text-gray-500">
                  <Lock className="w-4.5 h-4.5 shrink-0" />
                  <span>Escolha o Sábado primeiro</span>
                </div>
              ) : !isFolgasUnlocked ? (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center gap-2 text-xs font-bold text-amber-800">
                  <Lock className="w-4.5 h-4.5 text-amber-600 shrink-0" />
                  <span className="flex-1 leading-snug">Bloqueado. Aguarde liberação da supervisão.</span>
                </div>
              ) : chosenFolga ? (
                <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center justify-between text-xs font-bold text-green-900">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4.5 h-4.5 text-green-600 shrink-0" />
                    <span>Folga: {chosenFolga.split('-').reverse().join('/')}</span>
                  </div>
                </div>
              ) : (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-center gap-2 text-xs font-bold text-[#005C9E]">
                  <Unlock className="w-4.5 h-4.5 text-[#005C9E] shrink-0" />
                  <span>Escolha sua folga abaixo!</span>
                </div>
              )}
            </div>
          </div>

          {/* Action box / Resumo */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between" data-testid="status-escala">
            <div>
              <h4 className="font-sans font-bold text-sm text-[#003B66]">Sua Escala Operacional</h4>
              <p className="text-xs text-gray-500 mt-1">Status geral da sua escala em {monthName}/{year}.</p>
            </div>
            <div className="mt-4 space-y-2">
              {chosenSaturday && chosenFolga ? (
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-xs font-semibold text-emerald-800 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold uppercase text-[10px] text-[#2E7D32]">
                    <CheckCircle className="w-4 h-4" />
                    Escala Concluída
                  </div>
                  <p>Sábado: {chosenSaturday.split('-').reverse().join('/')}</p>
                  <p>Folga: {chosenFolga.split('-').reverse().join('/')}</p>
                  <button
                    onClick={() => {
                      if (window.confirm('Deseja limpar suas escolhas e reiniciar o processo?')) {
                        onClearEscala();
                      }
                    }}
                    className="text-red-600 hover:text-red-700 underline text-[10px] font-bold block pt-1 cursor-pointer"
                  >
                    Alterar Escolhas
                  </button>
                </div>
              ) : chosenSaturday ? (
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs font-semibold text-[#005C9E] space-y-1">
                  <p>Sábado de plantão agendado.</p>
                  <p className="text-[11px] text-gray-500 leading-snug">
                    {!isFolgasUnlocked
                      ? 'As folgas compensatórias serão liberadas quando todos os maqueiros selecionarem seus sábados.'
                      : 'Selecione agora a sua folga compensatória nos botões de dias úteis.'}
                  </p>
                  <button
                    onClick={onClearEscala}
                    className="text-gray-500 hover:text-red-600 underline text-[10px] block pt-1 cursor-pointer"
                  >
                    Mudar Sábado
                  </button>
                </div>
              ) : (
                <div className="text-xs text-gray-400 italic text-center py-3 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  Nenhum plantão selecionado ainda para {monthName}.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Choose panels (Only for non-fixed normal stretchers) */}
      {!isFixo && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Step 1 Selector: Saturdays list */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4" data-testid="sabado-selector">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
              <CalendarDays className="w-5 h-5 text-[#005C9E]" />
              <h3 className="font-sans font-bold text-sm text-[#003B66]">
                1. Escolher Sábado de Trabalho ({monthName} {year})
              </h3>
            </div>

            <p className="text-xs text-gray-500 leading-relaxed">
              Cada maqueiro normal escolhe exatamente 1 sábado do mês para plantão presencial. Após a escolha, as vagas correspondentes são deduzidas.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {saturdays.map((satDate) => {
                const slots = getSaturdaySlots(satDate);
                const isSelected = chosenSaturday === satDate;
                const [y, m, d] = satDate.split('-');
                const formatted = `${d}/${m}/${y}`;

                return (
                  <button
                    key={satDate}
                    onClick={() => handleSelectSaturday(satDate)}
                    disabled={slots.isEsgotado && !isSelected}
                    className={`p-4 rounded-xl text-left border transition cursor-pointer flex flex-col justify-between h-28 relative ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-700 shadow-md ring-2 ring-blue-300'
                        : slots.isEsgotado
                          ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                          : 'bg-blue-50/50 hover:bg-blue-50 text-[#005C9E] border-blue-200'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-bold text-sm">{formatted}</span>
                      {isSelected && <span className="bg-[#FFB300] text-blue-950 font-bold text-[8px] px-1.5 py-0.5 rounded uppercase">Meu Sábado</span>}
                    </div>

                    <div className="mt-2 text-xs font-semibold">
                      {slots.isEsgotado ? (
                        <span className="text-gray-400">✘ Sábado Ocupado / Esgotado</span>
                      ) : (
                        <span>
                          {slots.available} {slots.available === 1 ? 'vaga livre' : 'vagas livres'}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2 Selector: Weekdays off list */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4" data-testid="folga-selector">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
              <UserCheck className="w-5 h-5 text-[#2E7D32]" />
              <h3 className="font-sans font-bold text-sm text-[#003B66]">
                2. Escolher Folga Compensatória (Dias Úteis)
              </h3>
            </div>

            <p className="text-xs text-gray-500 leading-relaxed">
              Disponível somente em dias úteis (Segunda a Sexta). Datas marcadas como bloqueadas pelo supervisor hospitalar não podem ser selecionadas.
            </p>

            {!chosenSaturday ? (
              <div className="bg-gray-50 p-6 rounded-xl text-center border border-dashed border-gray-200 text-xs font-medium text-gray-400">
                Escolha o seu Sábado de trabalho à esquerda para habilitar o painel de folgas.
              </div>
            ) : !isFolgasUnlocked ? (
              <div className="bg-amber-50/70 p-6 rounded-xl border border-amber-100 text-xs text-amber-900 leading-relaxed space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-amber-800 uppercase text-[10px]">
                  <Lock className="w-4 h-4 text-amber-600" />
                  Painel de folgas bloqueado
                </div>
                <p>
                  As folgas compensatórias só serão liberadas para escolha após todos os maqueiros normais preencherem os sábados de plantão.
                </p>
                <div className="bg-white/80 p-2 rounded text-[11px] text-gray-600 font-semibold border border-amber-200/50">
                  Status de Sábados: {countSaturdaysChosen} de {usuarios.filter(u => u.role === UserRole.MAQUEIRO && u.tipo === StretcherType.NORMAL && u.ativo).length} preenchidos.
                </div>
              </div>
            ) : (
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {weekdays.map((wd) => {
                  const isSelected = chosenFolga === wd.dateStr;
                  const [y, m, d] = wd.dateStr.split('-');
                  const formatted = `${d}/${m}/${y}`;

                  return (
                    <button
                      key={wd.dateStr}
                      disabled={wd.isBlocked}
                      onClick={() => handleSelectFolga(wd.dateStr)}
                      className={`w-full p-2.5 rounded-lg border text-left text-xs font-bold flex items-center justify-between transition cursor-pointer ${
                        isSelected
                          ? 'bg-[#2E7D32] text-white border-[#1B5E20]'
                          : wd.isBlocked
                            ? 'bg-red-50 text-red-400 border-red-100 cursor-not-allowed'
                            : 'bg-green-50/50 hover:bg-green-50 text-green-900 border-green-200'
                      }`}
                    >
                      <div>
                        <span>{formatted} ({wd.dayOfWeekName})</span>
                        {wd.isBlocked && (
                          <span className="block text-[10px] text-red-500 font-medium font-sans">
                            Bloqueado: {wd.blockReason}
                          </span>
                        )}
                      </div>
                      {isSelected ? (
                        <span className="bg-white/20 text-white text-[9px] font-black px-1.5 py-0.5 rounded uppercase">Selecionada</span>
                      ) : wd.isBlocked ? (
                        <span className="text-red-500 font-extrabold text-[9px] uppercase">✘ Bloqueado</span>
                      ) : (
                        <span className="text-green-600 font-extrabold text-[9px] uppercase">✓ Escolher</span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Read-only Global Calendar so they can see everyone's scale */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-[#005C9E]" />
          <h3 className="font-sans font-black text-sm text-[#003B66] uppercase tracking-wide">
            Visualizar Escala Geral do Hospital
          </h3>
        </div>
        <p className="text-xs text-gray-500 leading-relaxed">
          Veja a distribuição de todos os maqueiros por turno e confira folgas compensatórias já agendadas no mês.
        </p>

        <CalendarView
          currentMonthStr={currentMonthStr}
          onMonthChange={onMonthChange}
          usuarios={usuarios}
          escalas={escalas}
          bloqueios={bloqueios}
          config={config}
          currentUser={currentUser}
        />
      </div>
    </div>
  );
}
