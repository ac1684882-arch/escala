/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Key, Lock, Mail, ShieldCheck, Stethoscope, UserCheck, UserPlus } from 'lucide-react';
import { Usuario, UserRole, UserShift, StretcherType } from '../types';
import { SHARED_ADMIN_EMAIL, SHARED_ADMIN_PASSWORD } from '../utils/supabaseStorage';

interface LoginScreenProps {
  onLoginSuccess: (user: Usuario) => void;
  onRegisterUser: (user: Usuario) => Promise<void>;
  allUsers: Usuario[];
}

type AuthMode = 'login' | 'register';

const normalizeEmail = (email: string) => email.trim().toLowerCase();

export default function LoginScreen({ onLoginSuccess, onRegisterUser, allUsers }: LoginScreenProps) {
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [loginInput, setLoginInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerShift, setRegisterShift] = useState<UserShift>(UserShift.MANHA);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedLogin = normalizeEmail(loginInput);

    if (!normalizedLogin || !passwordInput) {
      setErrorMsg('Informe e-mail e senha para entrar.');
      return;
    }

    if (normalizedLogin === SHARED_ADMIN_EMAIL && passwordInput === SHARED_ADMIN_PASSWORD) {
      setErrorMsg('');
      onLoginSuccess({
        id: 'admin-virtual-cco',
        nome: 'Admin CCO',
        matricula: 'ADMIN-CCO',
        login: SHARED_ADMIN_EMAIL,
        senha: SHARED_ADMIN_PASSWORD,
        role: UserRole.ENFERMEIRO,
        turno: UserShift.MANHA,
        tipo: StretcherType.NORMAL,
        ativo: true,
      });
      return;
    }

    const foundUser = allUsers.find(
      (user) =>
        (normalizeEmail(user.login) === normalizedLogin || normalizeEmail(user.matricula) === normalizedLogin) &&
        user.senha === passwordInput
    );

    if (!foundUser) {
      setErrorMsg('E-mail ou senha incorretos.');
      return;
    }

    if (!foundUser.ativo) {
      setErrorMsg('Este cadastro está inativo. Procure o administrador da escala.');
      return;
    }

    setErrorMsg('');
    onLoginSuccess(foundUser);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedEmail = normalizeEmail(registerEmail);

    if (!registerName.trim() || !normalizedEmail || !registerPassword) {
      setErrorMsg('Preencha nome, e-mail e senha.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setErrorMsg('Informe um e-mail válido.');
      return;
    }

    if (registerPassword.length < 6) {
      setErrorMsg('A senha precisa ter pelo menos 6 caracteres.');
      return;
    }

    const emailAlreadyExists = allUsers.some((user) => normalizeEmail(user.login) === normalizedEmail);
    if (emailAlreadyExists) {
      setErrorMsg('Já existe um cadastro com este e-mail.');
      return;
    }

    const timestamp = Date.now();
    const newUser: Usuario = {
      id: `func-${timestamp}`,
      nome: registerName.trim(),
      matricula: `FUNC-${timestamp}`,
      login: normalizedEmail,
      senha: registerPassword,
      role: UserRole.MAQUEIRO,
      turno: registerShift,
      tipo: StretcherType.NORMAL,
      ativo: true,
    };

    try {
      setIsSubmitting(true);
      setErrorMsg('');
      await onRegisterUser(newUser);
      onLoginSuccess(newUser);
    } catch (error) {
      console.error('Erro ao criar cadastro:', error);
      setErrorMsg('Não foi possível criar o cadastro agora. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const showLogin = authMode === 'login';

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center bg-gray-50 p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-[#005C9E] text-white p-6 text-center relative">
          <div className="absolute top-3 right-3 opacity-15">
            <Stethoscope className="w-24 h-24" />
          </div>
          <div className="inline-flex items-center justify-center bg-white/10 p-3 rounded-full mb-3 backdrop-blur-sm">
            <ShieldCheck className="w-8 h-8 text-[#FFB300]" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight">Escala de Funcionários</h2>
          <p className="text-xs text-blue-100 mt-1 font-medium">
            Acesso por e-mail para funcionários e administração da escala
          </p>
        </div>

        <div className="grid grid-cols-2 bg-gray-50 border-b border-gray-100 p-2 gap-2">
          <button
            type="button"
            onClick={() => {
              setAuthMode('login');
              setErrorMsg('');
            }}
            className={`py-2 rounded-lg text-xs font-bold uppercase transition ${
              showLogin ? 'bg-[#005C9E] text-white shadow-sm' : 'text-gray-600 hover:bg-white'
            }`}
          >
            Entrar
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode('register');
              setErrorMsg('');
            }}
            className={`py-2 rounded-lg text-xs font-bold uppercase transition ${
              !showLogin ? 'bg-[#005C9E] text-white shadow-sm' : 'text-gray-600 hover:bg-white'
            }`}
          >
            Criar Cadastro
          </button>
        </div>

        {showLogin ? (
          <form onSubmit={handleLoginSubmit} className="p-6 sm:p-8 space-y-5" id="form-login" data-testid="login-form">
            {errorMsg && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-800 p-3 rounded text-xs font-semibold">
                {errorMsg}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider" htmlFor="login">
                E-mail
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  id="login"
                  type="email"
                  data-testid="login-input"
                  placeholder="seu.email@hospital.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#005C9E] focus:border-transparent transition-all"
                  value={loginInput}
                  onChange={(e) => setLoginInput(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider" htmlFor="password">
                Senha
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  id="password"
                  type="password"
                  data-testid="password-input"
                  placeholder="Sua senha"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#005C9E] focus:border-transparent transition-all"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              data-testid="login-button"
              className="w-full bg-[#005C9E] hover:bg-[#004D85] text-white font-bold py-3 px-4 rounded-lg text-sm uppercase tracking-wider transition-all duration-150 shadow-md hover:shadow-lg active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
            >
              <Key className="w-4 h-4 text-[#FFB300]" />
              Entrar no Sistema
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegisterSubmit} className="p-6 sm:p-8 space-y-5" data-testid="register-form">
            {errorMsg && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-800 p-3 rounded text-xs font-semibold">
                {errorMsg}
              </div>
            )}

            <div className="bg-blue-50 border border-blue-100 text-blue-900 p-3 rounded-lg text-xs leading-relaxed">
              Funcionário: crie seu cadastro com nome, e-mail, senha e turno atual. O administrador poderá ajustar o regime depois.
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider" htmlFor="register-name">
                Nome completo
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <UserCheck className="w-4 h-4" />
                </span>
                <input
                  id="register-name"
                  type="text"
                  data-testid="register-name"
                  placeholder="Nome do funcionário"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#005C9E] focus:border-transparent transition-all"
                  value={registerName}
                  onChange={(e) => setRegisterName(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider" htmlFor="register-email">
                E-mail
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  id="register-email"
                  type="email"
                  data-testid="register-email"
                  placeholder="seu.email@hospital.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#005C9E] focus:border-transparent transition-all"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider" htmlFor="register-password">
                Senha
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  id="register-password"
                  type="password"
                  data-testid="register-password"
                  placeholder="Mínimo de 6 caracteres"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#005C9E] focus:border-transparent transition-all"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider" htmlFor="register-shift">
                Horário / turno atual
              </label>
              <select
                id="register-shift"
                data-testid="register-shift"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-900 font-semibold focus:outline-none focus:ring-2 focus:ring-[#005C9E] focus:border-transparent transition-all"
                value={registerShift}
                onChange={(e) => setRegisterShift(e.target.value as UserShift)}
              >
                <option value={UserShift.MANHA}>Manhã - 07h às 16h</option>
                <option value={UserShift.TARDE}>Tarde - 11h às 20h</option>
              </select>
            </div>

            <button
              type="submit"
              data-testid="register-button"
              disabled={isSubmitting}
              className="w-full bg-[#005C9E] hover:bg-[#004D85] disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg text-sm uppercase tracking-wider transition-all duration-150 shadow-md hover:shadow-lg active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
            >
              <UserPlus className="w-4 h-4 text-[#FFB300]" />
              Criar Cadastro
            </button>
          </form>
        )}

        <div className="bg-gray-50 border-t border-gray-100 px-6 py-4 text-center">
          <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">
            SUPER CENTRO CARIOCA DO OLHO (CCO)
          </p>
        </div>
      </div>
    </div>
  );
}
