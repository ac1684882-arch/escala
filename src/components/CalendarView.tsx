/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Search, Filter, ShieldAlert, Calendar, HelpCircle, CheckCircle } from 'lucide-react';
import { Usuario, Escala, Bloqueio, Configuracao, UserRole, UserShift, StretcherType } from '../types';
import { getSaturdaysInMonth, getMondaysInMonth } from '../utils/supabaseStorage';

interface CalendarViewProps {
  currentMonthStr: string; // "YYYY-MM"
  onMonthChange: (monthStr: string) => void;
  usuarios: Usuario[];
  escalas: Escala[];
  bloqueios: Bloqueio[];
  config: Configuracao;
  currentUser: Usuario;
  // Callback when a day is clicked (used for choosing Saturday/Folga or nurse manual edit)
  onDayClick?: (dateStr: string, isSaturday: boolean, isWeekday: boolean) => void;
}

export default function CalendarView({
  currentMonthStr,
  onMonthChange,
  usuarios,
  escalas,
  bloqueios,
  config,
  currentUser,
  onDayClick,
}: CalendarViewProps) {
  const [selectedShift, setSelectedShift] = useState<string>('todos');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [year, month] = currentMonthStr.split('-').map(Number);
  // Month is 0-indexed in JS Dates
  const jsMonth = month - 1;

  // Header month name in PT-BR
  const monthNamesPt = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  const monthName = monthNamesPt[jsMonth];

  // Helper: number of days in this month
  const numDays = new Date(year, month, 0).getDate();
  // Helper: weekday of the first day of the month (0 = Sunday, ..., 6 = Saturday)
  const firstDayIndex = new Date(year, jsMonth, 1).getDay();

  // Navigation handlers
  const handlePrevMonth = () => {
    const prevDate = new Date(year, jsMonth - 1, 1);
    const m = String(prevDate.getMonth() + 1).padStart(2, '0');
    onMonthChange(`${prevDate.getFullYear()}-${m}`);
  };

  const handleNextMonth = () => {
    const nextDate = new Date(year, jsMonth + 1, 1);
    const m = String(nextDate.getMonth() + 1).padStart(2, '0');
    onMonthChange(`${nextDate.getFullYear()}-${m}`);
  };

  // Helper to determine what is happening on a specific day
  const getDayInfo = (dayNum: number) => {
    const dStr = `${year}-${String(month).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    const dateObj = new Date(year, jsMonth, dayNum);
    const dayOfWeek = dateObj.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
    
    const isSaturday = dayOfWeek === 6;
    const isSunday = dayOfWeek === 0;
    const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;

    // Check if blocked by Nurse
    const bloqueio = bloqueios.find((b) => b.data === dStr);

    // List of workers and off-duty people
    const dutyMorning: { name: string; type: string; matricula: string }[] = [];
    const dutyAfternoon: { name: string; type: string; matricula: string }[] = [];
    const offList: { name: string; reason: string; type: string }[] = [];

    // Filter users by active and search query (if any)
    const activeUsers = usuarios.filter((u) => u.ativo && u.role === UserRole.MAQUEIRO);

    activeUsers.forEach((u) => {
      // Find scale for this user in this month
      const esc = escalas.find((e) => e.usuarioId === u.id && e.mesAno === currentMonthStr);

      if (u.tipo === StretcherType.FIXO_SABADO) {
        // FIXED SATURDAY AFTERNOON MAQUEIROS
        if (isSaturday) {
          dutyAfternoon.push({ name: u.nome, type: 'Fixo Sábado', matricula: u.matricula });
        } else if (dayOfWeek === 1) { // Monday is fixed off
          offList.push({ name: u.nome, reason: 'Folga Fixa (Segunda)', type: 'fixa' });
        }
        // Do not add to regular weekdays because it clutters the view
      } else {
        // NORMAL MAQUEIROS
        if (isSaturday) {
          // Normal maqueiro works if they specifically chose this Saturday
          if (esc && esc.sabadoTrabalho === dStr) {
            if (u.turno === UserShift.MANHA) {
              dutyMorning.push({ name: u.nome, type: 'Plantão Sábado', matricula: u.matricula });
            } else {
              dutyAfternoon.push({ name: u.nome, type: 'Plantão Sábado', matricula: u.matricula });
            }
          }
        } else if (isWeekday) {
          // Weekday: only show if they chose this day as their folgaCompensatoria (off-day)
          if (esc && esc.folgaCompensatoria === dStr) {
            offList.push({ name: u.nome, reason: 'Folga Compensatória', type: 'compensatoria' });
          }
          // Do not add "Regular" shifts to weekday cells because it clutters the calendar
        }
      }
    });

    // Filtering duties based on shift filter & search query
    const matchesFilters = (item: { name: string; matricula: string }) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return item.name.toLowerCase().includes(query) || item.matricula.toLowerCase().includes(query);
      }
      return true;
    };

    const matchesOffFilters = (item: { name: string }) => {
      if (searchQuery) {
        return item.name.toLowerCase().includes(searchQuery.toLowerCase());
      }
      return true;
    };

    const filteredMorning = dutyMorning.filter(matchesFilters);
    const filteredAfternoon = dutyAfternoon.filter(matchesFilters);
    const filteredOff = offList.filter(matchesOffFilters);

    // Saturday Slots count (only for Normal stretchers choosing)
    const normalSaturdaysScale = escalas.filter((e) => e.mesAno === currentMonthStr && e.sabadoTrabalho === dStr);
    const slotsOccupied = normalSaturdaysScale.length;
    const slotsAvailable = isSaturday ? Math.max(0, config.vagasPorSabado - slotsOccupied) : 0;

    return {
      dStr,
      isSaturday,
      isSunday,
      isWeekday,
      bloqueio,
      morningWorkers: filteredMorning,
      afternoonWorkers: filteredAfternoon,
      offWorkers: filteredOff,
      slotsAvailable,
      slotsOccupied,
      totalSlots: config.vagasPorSabado,
    };
  };

  // Build grid data
  const gridCells = [];
  for (let i = 0; i < firstDayIndex; i++) {
    gridCells.push(null); // Blank days at start of month
  }
  for (let d = 1; d <= numDays; d++) {
    gridCells.push(getDayInfo(d));
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden" id="calendar-view" data-testid="calendar-view">
      {/* Calendar Header, Filters & Search bar */}
      <div className="bg-[#F8F9FA] p-4 sm:p-6 border-b border-gray-100 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Month Navigator */}
          <div className="flex items-center gap-3">
            <div className="bg-[#005C9E] p-2 rounded-lg text-white shadow-sm shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <button
                  onClick={handlePrevMonth}
                  data-testid="calendar-prev"
                  className="p-1 hover:bg-gray-200 rounded text-gray-600 transition"
                  title="Mês Anterior"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h3 className="font-sans font-black text-lg sm:text-xl text-[#003B66] min-w-[130px] text-center" data-testid="calendar-title">
                  {monthName} {year}
                </h3>
                <button
                  onClick={handleNextMonth}
                  data-testid="calendar-next"
                  className="p-1 hover:bg-gray-200 rounded text-gray-600 transition"
                  title="Próximo Mês"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
              <p className="text-[11px] text-gray-500 font-medium">
                Dica: Use as setas para planejar outros meses (Ex: Julho 2026 pre-semeado)
              </p>
            </div>
          </div>

          {/* Filters Row */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Shift Filter */}
            <div className="flex items-center bg-white border border-gray-300 rounded-lg px-2 py-1.5 text-xs font-semibold shadow-sm">
              <Filter className="w-3.5 h-3.5 text-gray-500 mr-1.5" />
              <span className="text-gray-500 mr-2">Turno:</span>
              <select
                className="bg-transparent border-0 font-bold text-gray-800 focus:ring-0 outline-none p-0 cursor-pointer"
                value={selectedShift}
                data-testid="shift-filter"
                onChange={(e) => setSelectedShift(e.target.value)}
              >
                <option value="todos">Todos os Turnos</option>
                <option value="manha">Manhã (07:00 - 16:00)</option>
                <option value="tarde">Tarde (11:00 - 20:00)</option>
              </select>
            </div>

            {/* Employee Search */}
            <div className="relative flex-1 sm:w-60 min-w-[200px]">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Buscar por funcionário..."
                data-testid="calendar-search"
                className="w-full pl-9 pr-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#005C9E] shadow-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Legend Box */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 text-xs font-medium text-gray-600 bg-white p-3 rounded-lg border border-gray-200 shadow-inner">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded bg-blue-100 border border-dashed border-blue-400 block shrink-0"></span>
            <span>Sábado Disponível</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded bg-blue-600 block shrink-0"></span>
            <span>Sábado Ocupado</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded bg-green-100 border border-green-300 text-green-800 block shrink-0 flex items-center justify-center font-bold text-[9px]">F</span>
            <span>Folga Escolhida</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded bg-emerald-700 block shrink-0"></span>
            <span>Folga Segunda (Fixa)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded bg-red-100 border border-red-200 text-red-600 block shrink-0 flex items-center justify-center font-bold text-[9px]">✘</span>
            <span>Data Bloqueada</span>
          </div>
        </div>
      </div>

      {/* Grid Table */}
      <div className="p-4 overflow-x-auto">
        <div className="min-w-[760px]">
          {/* Weekday Names Header */}
          <div className="grid grid-cols-7 gap-1.5 mb-2 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
            <div>Domingo</div>
            <div>Segunda</div>
            <div>Terça</div>
            <div>Quarta</div>
            <div>Quinta</div>
            <div>Sexta</div>
            <div>Sábado</div>
          </div>

          {/* Calendar Grid cells */}
          <div className="grid grid-cols-7 gap-2">
            {gridCells.map((dayInfo, index) => {
              if (dayInfo === null) {
                return <div key={`empty-${index}`} className="bg-gray-50 rounded-xl h-28 border border-gray-100/50"></div>;
              }

              const {
                dStr,
                isSaturday,
                isSunday,
                isWeekday,
                bloqueio,
                morningWorkers,
                afternoonWorkers,
                offWorkers,
                slotsAvailable,
                slotsOccupied,
                totalSlots,
              } = dayInfo;

              const dayNum = index - firstDayIndex + 1;

              // Compute classes based on status
              let bgClass = 'bg-white hover:bg-gray-50/50';
              let borderClass = 'border border-gray-200';
              let clickable = !!onDayClick;

              if (bloqueio) {
                bgClass = 'bg-red-50/75 stripe-bg';
                borderClass = 'border border-red-200';
              } else if (isSunday) {
                bgClass = 'bg-gray-50';
                borderClass = 'border border-gray-100';
              } else if (isSaturday) {
                if (slotsAvailable > 0) {
                  bgClass = 'bg-blue-50/50 hover:bg-blue-50/80';
                  borderClass = 'border-2 border-dashed border-blue-300';
                } else {
                  bgClass = 'bg-gray-50';
                  borderClass = 'border border-gray-200';
                }
              }

              return (
                <div
                  key={`day-${dayNum}`}
                  onClick={() => onDayClick && onDayClick(dStr, isSaturday, isWeekday)}
                  className={`${bgClass} ${borderClass} rounded-xl p-2.5 h-32 flex flex-col justify-between transition-all relative group ${clickable ? 'cursor-pointer hover:shadow-md' : ''}`}
                >
                  {/* Top line of cell */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-sm font-black w-6 h-6 flex items-center justify-center rounded-full ${
                        isSaturday
                          ? 'bg-[#005C9E]/10 text-[#005C9E]'
                          : isSunday
                            ? 'text-gray-400'
                            : 'text-gray-800'
                      }`}
                    >
                      {dayNum}
                    </span>

                    {/* Badge Indicator */}
                    {bloqueio ? (
                      <span className="text-[9px] bg-red-600 text-white font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-0.5">
                        <ShieldAlert className="w-2.5 h-2.5" />
                        Bloqueado
                      </span>
                    ) : isSaturday ? (
                      slotsAvailable > 0 ? (
                        <span className="text-[8px] bg-blue-100 text-[#005C9E] font-bold px-1.5 py-0.5 rounded border border-blue-300 uppercase">
                          {slotsAvailable} Vagas
                        </span>
                      ) : (
                        <span className="text-[8px] bg-gray-200 text-gray-500 font-bold px-1.5 py-0.5 rounded uppercase">
                          Esgotado
                        </span>
                      )
                    ) : null}
                  </div>

                  {/* Cell Content: Shifts and Offs */}
                  <div className="flex-1 mt-1.5 space-y-1 overflow-y-auto max-h-[72px] scrollbar-thin">
                    {/* Blocked Justification */}
                    {bloqueio && (
                      <div className="text-[10px] text-red-700 font-medium italic leading-snug bg-red-100/50 p-1 rounded border border-red-200/50">
                        {bloqueio.justificativa}
                      </div>
                    )}

                    {!bloqueio && (
                      <>
                        {/* Morning Shift (only if selectedShift is 'todos' or 'manha') */}
                        {(selectedShift === 'todos' || selectedShift === 'manha') &&
                          morningWorkers.map((w, idx) => (
                            <div
                              key={`m-${idx}`}
                              className="bg-blue-50 text-[#005C9E] text-[10px] font-bold px-1 py-0.5 rounded flex items-center justify-between border border-blue-100 shadow-sm"
                            >
                              <span className="truncate max-w-[80px]">{w.name}</span>
                              <span className="text-[8px] font-semibold text-blue-400 uppercase shrink-0">M</span>
                            </div>
                          ))}

                        {/* Afternoon Shift (only if selectedShift is 'todos' or 'tarde') */}
                        {(selectedShift === 'todos' || selectedShift === 'tarde') &&
                          afternoonWorkers.map((w, idx) => (
                            <div
                              key={`t-${idx}`}
                              className={`text-[10px] font-bold px-1 py-0.5 rounded flex items-center justify-between shadow-sm ${
                                w.type.includes('Fixo')
                                  ? 'bg-[#003B66] text-white border border-[#002744]'
                                  : 'bg-indigo-50 text-indigo-800 border border-indigo-100'
                              }`}
                            >
                              <span className="truncate max-w-[80px]">{w.name}</span>
                              <span className="text-[8px] font-semibold opacity-70 uppercase shrink-0">T</span>
                            </div>
                          ))}

                        {/* Off List (Folgas) */}
                        {offWorkers.map((o, idx) => (
                          <div
                            key={`o-${idx}`}
                            className={`text-[10px] font-bold px-1 py-0.5 rounded flex items-center gap-1 border ${
                              o.type === 'fixa'
                                ? 'bg-emerald-700 text-white border-emerald-800'
                                : 'bg-green-100 text-green-800 border-green-200'
                            }`}
                          >
                            <span className="shrink-0 font-extrabold text-[8px] bg-white/20 text-center rounded-full w-3.5 h-3.5 flex items-center justify-center">
                              F
                            </span>
                            <span className="truncate max-w-[80px]">{o.name}</span>
                          </div>
                        ))}
                      </>
                    )}

                    {/* Sunday default label */}
                    {isSunday && !bloqueio && (
                      <div className="text-[10px] text-gray-400 font-semibold text-center mt-2 uppercase tracking-wide">
                        Sem Expediente
                      </div>
                    )}
                  </div>

                  {/* Click to edit overlay for Supervisors, or Action Label for Maqueiro */}
                  {clickable && (
                    <div className="absolute inset-0 bg-[#005C9E]/5 opacity-0 group-hover:opacity-100 transition rounded-xl flex items-center justify-center">
                      <span className="bg-[#005C9E] text-white text-[10px] font-extrabold py-1 px-2 rounded uppercase tracking-wider shadow-md">
                        {currentUser.role === UserRole.ENFERMEIRO ? '✏️ Ajustar Escala' : '✓ Selecionar'}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
