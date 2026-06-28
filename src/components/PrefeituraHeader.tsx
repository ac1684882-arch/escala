/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { LogOut, User, ShieldAlert, Award } from 'lucide-react';
import { Usuario, UserRole, UserShift, StretcherType } from '../types';

interface PrefeituraHeaderProps {
  currentUser: Usuario | null;
  onLogout: () => void;
  allUsersForSwitching?: Usuario[];
  onSwitchUser?: (user: Usuario) => void;
}

export default function PrefeituraHeader({
  currentUser,
  onLogout,
  allUsersForSwitching = [],
  onSwitchUser,
}: PrefeituraHeaderProps) {
  return (
    <header className="bg-[#005C9E] text-white shadow-md border-b-4 border-[#003B66]">
      <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Institutional Branding */}
        <div className="flex items-center gap-3">
          {/* Detailed Rio de Janeiro Coat of Arms Stylized SVG */}
          <div className="w-12 h-12 bg-white rounded-full p-1.5 shadow-inner flex items-center justify-center shrink-0">
            <svg
              className="w-full h-full text-[#005C9E]"
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Shield Outline */}
              <path
                d="M50 85C70 75 75 50 75 30C75 25 50 20 50 20C50 20 25 25 25 30C25 50 30 75 50 85Z"
                fill="#E3F2FD"
                stroke="#005C9E"
                strokeWidth="4"
              />
              {/* Crossed Arrows */}
              <line x1="35" y1="35" x2="65" y2="65" stroke="#005C9E" strokeWidth="6" strokeLinecap="round" />
              <line x1="65" y1="35" x2="35" y2="65" stroke="#005C9E" strokeWidth="6" strokeLinecap="round" />
              <circle cx="50" cy="50" r="10" fill="#005C9E" />
              {/* Mural Crown on top */}
              <path
                d="M38 18 L43 13 L50 18 L57 13 L62 18 Z"
                fill="#FFB300"
                stroke="#005C9E"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              {/* Phrygian Cap inside */}
              <path d="M47 44 C47 44 50 38 54 44 C54 44 55 48 50 48" fill="#D32F2F" />
            </svg>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-sans font-extrabold text-lg sm:text-xl tracking-tight uppercase leading-tight">
                Prefeitura do Rio
              </h1>
              <span className="bg-[#FFB300] text-blue-950 font-bold text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wider shadow-sm">
                SMS
              </span>
            </div>
            <p className="text-xs text-blue-100 font-medium tracking-wide">
              Secretaria Municipal de Saúde • Escala Hospitalar
            </p>
          </div>
        </div>

        {/* User Status / Demostration Quick Switcher */}
        {currentUser && (
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
            {/* Quick Switch Dropdown for Easy Grading / Demo */}
            {allUsersForSwitching.length > 0 && onSwitchUser && (
              <div className="flex items-center bg-[#004D85] px-2.5 py-1 rounded-md text-xs border border-blue-400/30">
                <span className="text-blue-200 mr-2 font-semibold">Simular Usuário:</span>
                <select
                  className="bg-[#003B66] text-white border-0 text-xs focus:ring-1 focus:ring-[#FFB300] rounded px-1.5 py-0.5 outline-none font-medium"
                  value={currentUser.id}
                  onChange={(e) => {
                    const user = allUsersForSwitching.find((u) => u.id === e.target.value);
                    if (user) onSwitchUser(user);
                  }}
                >
                  <optgroup label="Supervisores / Enfermeiros">
                    {allUsersForSwitching
                      .filter((u) => u.role === UserRole.ENFERMEIRO)
                      .map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.nome} (ENF)
                        </option>
                      ))}
                  </optgroup>
                  <optgroup label="Maqueiros da Manhã (07h-16h)">
                    {allUsersForSwitching
                      .filter((u) => u.role === UserRole.MAQUEIRO && u.turno === UserShift.MANHA)
                      .map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.nome} {u.tipo === StretcherType.FIXO_SABADO ? '[FIXO]' : ''} ({u.matricula})
                        </option>
                      ))}
                  </optgroup>
                  <optgroup label="Maqueiros da Tarde (11h-20h)">
                    {allUsersForSwitching
                      .filter((u) => u.role === UserRole.MAQUEIRO && u.turno === UserShift.TARDE)
                      .map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.nome} {u.tipo === StretcherType.FIXO_SABADO ? '[FIXO]' : ''} ({u.matricula})
                        </option>
                      ))}
                  </optgroup>
                </select>
              </div>
            )}

            {/* Profile Info Badge */}
            <div className="flex items-center gap-2 bg-[#004D85] px-3 py-1.5 rounded-lg border border-blue-400/20 text-xs shadow-sm">
              <User className="w-4 h-4 text-[#FFB300]" />
              <div className="text-left">
                <div className="font-semibold text-white flex items-center gap-1.5">
                  {currentUser.nome}
                  {currentUser.role === UserRole.ENFERMEIRO ? (
                    <span className="bg-[#FFD54F] text-blue-950 font-bold text-[9px] px-1 py-0.1 rounded uppercase">
                      Supervisor
                    </span>
                  ) : (
                    <span className="bg-blue-100 text-[#005C9E] font-bold text-[9px] px-1 py-0.1 rounded uppercase">
                      Maqueiro {currentUser.tipo === StretcherType.FIXO_SABADO ? 'Fixo' : 'Normal'}
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-blue-200">
                  {currentUser.role === UserRole.ENFERMEIRO
                    ? `Controle de Escala • Matrícula: ${currentUser.matricula}`
                    : `Turno: ${currentUser.turno === UserShift.MANHA ? 'Manhã (07h-16h)' : 'Tarde (11h-20h)'} • Matrícula: ${currentUser.matricula}`}
                </div>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={onLogout}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold py-1.5 px-3 rounded-lg flex items-center gap-1.5 text-xs transition duration-150 shadow-sm hover:shadow active:scale-95"
              id="btn-logout"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sair
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
