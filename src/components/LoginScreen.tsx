/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ShieldCheck, UserCheck, Key, Lock, HelpCircle, Award, Stethoscope } from 'lucide-react';
import { Usuario, UserRole } from '../types';

interface LoginScreenProps {
  onLoginSuccess: (user: Usuario) => void;
  allUsers: Usuario[];
}

export default function LoginScreen({ onLoginSuccess, allUsers }: LoginScreenProps) {
  const [loginInput, setLoginInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginInput || !passwordInput) {
      setErrorMsg('Por favor, preencha todos os campos.');
      return;
    }

    const foundUser = allUsers.find(
      (u) =>
        (u.login.toLowerCase() === loginInput.toLowerCase() || u.matricula.toLowerCase() === loginInput.toLowerCase()) &&
        u.senha === passwordInput
    );

    if (foundUser) {
      if (!foundUser.ativo) {
        setErrorMsg('Este usuário está inativo no sistema. Contate a supervisão.');
        return;
      }
      setErrorMsg('');
      onLoginSuccess(foundUser);
    } else {
      setErrorMsg('Usuário ou senha incorretos. Tente novamente.');
    }
  };

  const handleQuickLogin = (user: Usuario) => {
    setLoginInput(user.login);
    setPasswordInput(user.senha || '123');
    setErrorMsg('');
    onLoginSuccess(user);
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center bg-gray-50 p-4 sm:p-6 md:p-8">
      {/* Central Login Card */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden transform transition duration-300 hover:shadow-2xl">
        {/* Banner Institucional */}
        <div className="bg-[#005C9E] text-white p-6 text-center relative">
          <div className="absolute top-3 right-3 opacity-15">
            <Stethoscope className="w-24 h-24" />
          </div>
          <div className="inline-flex items-center justify-center bg-white/10 p-3 rounded-full mb-3 backdrop-blur-sm">
            <ShieldCheck className="w-8 h-8 text-[#FFB300]" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight">Portal Escala-Fácil</h2>
          <p className="text-xs text-blue-100 mt-1 font-medium">
            Gestão Integrada de Plantões e Folgas Compensatórias
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleLoginSubmit} className="p-6 sm:p-8 space-y-5" id="form-login">
          {errorMsg && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-800 p-3 rounded text-xs font-semibold animate-shake">
              {errorMsg}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider" htmlFor="login">
              Login ou Matrícula
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <UserCheck className="w-4 h-4" />
              </span>
              <input
                id="login"
                type="text"
                placeholder="Ex: ana.paula ou MQ001"
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#005C9E] focus:border-transparent transition-all"
                value={loginInput}
                onChange={(e) => setLoginInput(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider" htmlFor="password">
              Senha de Acesso
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <Lock className="w-4 h-4" />
              </span>
              <input
                id="password"
                type="password"
                placeholder="••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#005C9E] focus:border-transparent transition-all"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-[#005C9E] hover:bg-[#004D85] text-white font-bold py-3 px-4 rounded-lg text-sm uppercase tracking-wider transition-all duration-150 shadow-md hover:shadow-lg active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
          >
            <Key className="w-4 h-4 text-[#FFB300]" />
            Entrar no Sistema
          </button>
        </form>

        {/* Footer info */}
        <div className="bg-gray-50 border-t border-gray-100 px-6 py-4 text-center">
          <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">
            Secretaria Municipal de Saúde do Rio de Janeiro
          </p>
        </div>
      </div>

      {/* Quick Access Credentials Cheatsheet for Demonstrations */}
      <div className="mt-8 w-full max-w-lg bg-blue-50/70 border border-blue-100 rounded-xl p-4 md:p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <HelpCircle className="w-5 h-5 text-[#005C9E]" />
          <h3 className="font-sans font-bold text-sm text-blue-900">
            Painel de Teste Rápido (Selecione um perfil para homologação)
          </h3>
        </div>
        <p className="text-xs text-blue-800 mb-4 leading-relaxed">
          Para facilitar a sua avaliação das regras de negócio e dashboards de ambos os perfis, clique em qualquer um dos botões abaixo para logar instantaneamente:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Admin choice */}
          <div className="bg-white p-3 rounded-lg border border-blue-200/50 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#005C9E] uppercase mb-1">
                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                Supervisor / Enfermeiro
              </div>
              <p className="text-[11px] text-gray-500 mb-2">
                Acesso total, cria maqueiros, configura as vagas de sábados, bloqueia datas e edita manual de plantões.
              </p>
            </div>
            <button
              onClick={() => {
                const enf = allUsers.find((u) => u.role === UserRole.ENFERMEIRO);
                if (enf) handleQuickLogin(enf);
              }}
              className="w-full bg-[#005C9E]/10 hover:bg-[#005C9E]/20 text-[#005C9E] font-bold text-xs py-1.5 px-3 rounded transition-all cursor-pointer"
            >
              Logar como Enfermeiro (Ana Paula)
            </button>
          </div>

          {/* Normal Stretcher bearer morning choice */}
          <div className="bg-white p-3 rounded-lg border border-blue-200/50 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#005C9E] uppercase mb-1">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                Maqueiro Normal (Manhã)
              </div>
              <p className="text-[11px] text-gray-500 mb-2">
                Seleciona 1 sábado do mês. Depois escolhe a folga compensatória em dia útil (após liberação das folgas).
              </p>
            </div>
            <button
              onClick={() => {
                const maq = allUsers.find((u) => u.role === UserRole.MAQUEIRO && u.matricula === 'MQ001');
                if (maq) handleQuickLogin(maq);
              }}
              className="w-full bg-green-50/80 hover:bg-green-100 text-[#2E7D32] border border-green-200/50 font-bold text-xs py-1.5 px-3 rounded transition-all cursor-pointer"
            >
              Logar como Maqueiro (João - MQ001)
            </button>
          </div>

          {/* Stretcher Tarde Fixo Saturday choice */}
          <div className="bg-white p-3 rounded-lg border border-blue-200/50 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#005C9E] uppercase mb-1">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                Maqueiro Fixo (Sábado Tarde)
              </div>
              <p className="text-[11px] text-gray-500 mb-2">
                Trabalha fixo todo sábado de tarde e folga toda segunda. Tem escala pré-preenchida no calendário.
              </p>
            </div>
            <button
              onClick={() => {
                const maq = allUsers.find((u) => u.matricula === 'MQ006');
                if (maq) handleQuickLogin(maq);
              }}
              className="w-full bg-amber-50/80 hover:bg-amber-100 text-amber-800 border border-amber-200/50 font-bold text-xs py-1.5 px-3 rounded transition-all cursor-pointer"
            >
              Logar como Fixo (Carlos - MQ006)
            </button>
          </div>

          {/* Normal Stretcher bearer afternoon choice */}
          <div className="bg-white p-3 rounded-lg border border-blue-200/50 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#005C9E] uppercase mb-1">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                Maqueiro Normal (Tarde)
              </div>
              <p className="text-[11px] text-gray-500 mb-2">
                Trabalha no turno da tarde (11h-20h), escolhe 1 sábado e folga em dia útil subsequente.
              </p>
            </div>
            <button
              onClick={() => {
                const maq = allUsers.find((u) => u.role === UserRole.MAQUEIRO && u.matricula === 'MQ008');
                if (maq) handleQuickLogin(maq);
              }}
              className="w-full bg-blue-50/80 hover:bg-blue-100 text-blue-800 border border-blue-200/50 font-bold text-xs py-1.5 px-3 rounded transition-all cursor-pointer"
            >
              Logar como Maqueiro (Bruno - MQ008)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
