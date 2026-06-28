/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { UserPlus, Edit2, Check, X, Shield, Users, RefreshCw, Key, ToggleLeft, ToggleRight, BadgeAlert } from 'lucide-react';
import { Usuario, UserRole, UserShift, StretcherType } from '../types';

interface StretcherManagementProps {
  usuarios: Usuario[];
  onAddUser: (user: Usuario) => void;
  onUpdateUser: (user: Usuario) => void;
}

export default function StretcherManagement({
  usuarios,
  onAddUser,
  onUpdateUser,
}: StretcherManagementProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  // Form states
  const [nome, setNome] = useState('');
  const [matricula, setMatricula] = useState('');
  const [login, setLogin] = useState('');
  const [senha, setSenha] = useState('123');
  const [role, setRole] = useState<UserRole>(UserRole.MAQUEIRO);
  const [turno, setTurno] = useState<UserShift>(UserShift.MANHA);
  const [tipo, setTipo] = useState<StretcherType>(StretcherType.NORMAL);
  const [ativo, setAtivo] = useState(true);

  const [errorMsg, setErrorMsg] = useState('');

  const resetForm = () => {
    setNome('');
    setMatricula('');
    setLogin('');
    setSenha('123');
    setRole(UserRole.MAQUEIRO);
    setTurno(UserShift.MANHA);
    setTipo(StretcherType.NORMAL);
    setAtivo(true);
    setErrorMsg('');
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome || !matricula || !login || !senha) {
      setErrorMsg('Todos os campos marcados com * são obrigatórios.');
      return;
    }

    // Check duplicate matricula or login
    const isDuplicate = usuarios.some(
      (u) => u.matricula.toLowerCase() === matricula.toLowerCase() || u.login.toLowerCase() === login.toLowerCase()
    );

    if (isDuplicate) {
      setErrorMsg('Já existe um usuário cadastrado com esta Matrícula ou Login.');
      return;
    }

    const newUser: Usuario = {
      id: `u-${Date.now()}`,
      nome,
      matricula: matricula.toUpperCase(),
      login: login.toLowerCase(),
      senha,
      role,
      turno,
      tipo: role === UserRole.ENFERMEIRO ? StretcherType.NORMAL : tipo,
      ativo,
    };

    onAddUser(newUser);
    setIsAdding(false);
    resetForm();
  };

  const handleStartEdit = (user: Usuario) => {
    setEditingUserId(user.id);
    setNome(user.nome);
    setMatricula(user.matricula);
    setLogin(user.login);
    setSenha(user.senha || '123');
    setRole(user.role);
    setTurno(user.turno);
    setTipo(user.tipo);
    setAtivo(user.ativo);
    setErrorMsg('');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome || !matricula || !login || !senha) {
      setErrorMsg('Todos os campos são obrigatórios.');
      return;
    }

    // Check duplicates excluding the current user being edited
    const isDuplicate = usuarios.some(
      (u) =>
        u.id !== editingUserId &&
        (u.matricula.toLowerCase() === matricula.toLowerCase() || u.login.toLowerCase() === login.toLowerCase())
    );

    if (isDuplicate) {
      setErrorMsg('Já existe outro usuário cadastrado com esta Matrícula ou Login.');
      return;
    }

    const updatedUser: Usuario = {
      id: editingUserId!,
      nome,
      matricula: matricula.toUpperCase(),
      login: login.toLowerCase(),
      senha,
      role,
      turno,
      tipo: role === UserRole.ENFERMEIRO ? StretcherType.NORMAL : tipo,
      ativo,
    };

    onUpdateUser(updatedUser);
    setEditingUserId(null);
    resetForm();
  };

  const toggleUserStatus = (user: Usuario) => {
    const updated = { ...user, ativo: !user.ativo };
    onUpdateUser(updated);
  };

  return (
    <div className="space-y-6" id="stretcher-management-tab">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-[#005C9E]/10 p-2.5 rounded-xl text-[#005C9E]">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-sans font-black text-xl text-[#003B66]">Controle de Pessoal</h2>
            <p className="text-xs text-gray-500">
              Cadastre e gerencie a equipe de maqueiros e enfermeiros do hospital.
            </p>
          </div>
        </div>

        {!isAdding && !editingUserId && (
          <button
            onClick={() => {
              resetForm();
              setIsAdding(true);
            }}
            className="bg-[#005C9E] hover:bg-[#004D85] text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow transition flex items-center gap-2 cursor-pointer"
          >
            <UserPlus className="w-4 h-4 text-[#FFB300]" />
            Adicionar Profissional
          </button>
        )}
      </div>

      {/* Forms Section: Create or Edit */}
      {(isAdding || editingUserId) && (
        <div className="bg-white rounded-2xl border border-blue-100 shadow-lg p-5 sm:p-6 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
            <h3 className="font-sans font-bold text-base text-[#003B66]">
              {isAdding ? 'Cadastrar Novo Profissional' : 'Editar Dados de Profissional'}
            </h3>
            <button
              onClick={() => {
                setIsAdding(false);
                setEditingUserId(null);
                resetForm();
              }}
              className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {errorMsg && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-800 p-3 rounded text-xs font-semibold mb-4 flex items-center gap-2">
              <BadgeAlert className="w-4 h-4 shrink-0" />
              {errorMsg}
            </div>
          )}

          <form onSubmit={isAdding ? handleCreateSubmit : handleSaveEdit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Nome */}
            <div className="space-y-1">
              <label className="block text-[10px] font-black text-gray-700 uppercase tracking-wider">Nome Completo *</label>
              <input
                type="text"
                placeholder="Ex: João da Silva Santos"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#005C9E]"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
              />
            </div>

            {/* Matrícula */}
            <div className="space-y-1">
              <label className="block text-[10px] font-black text-gray-700 uppercase tracking-wider">Matrícula Funcional *</label>
              <input
                type="text"
                placeholder="Ex: MQ882"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#005C9E]"
                value={matricula}
                onChange={(e) => setMatricula(e.target.value)}
                required
              />
            </div>

            {/* Perfil */}
            <div className="space-y-1">
              <label className="block text-[10px] font-black text-gray-700 uppercase tracking-wider">Perfil / Cargo *</label>
              <select
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs font-bold text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#005C9E]"
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
              >
                <option value={UserRole.MAQUEIRO}>Maqueiro</option>
                <option value={UserRole.ENFERMEIRO}>Enfermeiro / Supervisor</option>
              </select>
            </div>

            {/* Only for Maqueiros: Tipo */}
            {role === UserRole.MAQUEIRO && (
              <div className="space-y-1">
                <label className="block text-[10px] font-black text-gray-700 uppercase tracking-wider">Tipo de Regime *</label>
                <select
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs font-bold text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#005C9E]"
                  value={tipo}
                  onChange={(e) => setTipo(e.target.value as StretcherType)}
                >
                  <option value={StretcherType.NORMAL}>Normal (Escolhe Sábado e Folga)</option>
                  <option value={StretcherType.FIXO_SABADO}>Fixo Sábado à Tarde (Segunda Folga Fixa)</option>
                </select>
              </div>
            )}

            {/* Turno */}
            <div className="space-y-1">
              <label className="block text-[10px] font-black text-gray-700 uppercase tracking-wider">Turno de Trabalho *</label>
              <select
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs font-bold text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#005C9E]"
                value={turno}
                onChange={(e) => setTurno(e.target.value as UserShift)}
              >
                <option value={UserShift.MANHA}>Manhã (07:00 às 16:00)</option>
                <option value={UserShift.TARDE}>Tarde (11:00 às 20:00)</option>
              </select>
            </div>

            {/* Login de Acesso */}
            <div className="space-y-1">
              <label className="block text-[10px] font-black text-gray-700 uppercase tracking-wider">Login de Usuário *</label>
              <input
                type="text"
                placeholder="Ex: joao.souza"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#005C9E]"
                value={login}
                onChange={(e) => setLogin(e.target.value.toLowerCase())}
                required
              />
            </div>

            {/* Senha */}
            <div className="space-y-1">
              <label className="block text-[10px] font-black text-gray-700 uppercase tracking-wider">Senha Provisória *</label>
              <input
                type="text"
                placeholder="Ex: 123"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#005C9E]"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
              />
            </div>

            {/* Ativo */}
            <div className="space-y-1">
              <label className="block text-[10px] font-black text-gray-700 uppercase tracking-wider">Status Inicial *</label>
              <select
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs font-bold text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#005C9E]"
                value={ativo ? 'sim' : 'nao'}
                onChange={(e) => setAtivo(e.target.value === 'sim')}
              >
                <option value="sim">Ativo (Pode acessar)</option>
                <option value="nao">Inativo (Bloqueado)</option>
              </select>
            </div>

            <div className="md:col-span-3 flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => {
                  setIsAdding(false);
                  setEditingUserId(null);
                  resetForm();
                }}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs py-2 px-4 rounded-lg transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="bg-[#2E7D32] hover:bg-[#1B5E20] text-white font-bold text-xs py-2 px-4 rounded-lg shadow transition cursor-pointer"
              >
                Salvar Cadastro
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Users List Grid */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="bg-gray-50/75 p-4 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-sans font-bold text-sm text-[#003B66]">Profissionais Cadastrados ({usuarios.length})</h3>
          <span className="text-[10px] font-black bg-blue-100 text-[#005C9E] px-2 py-0.5 rounded uppercase">
            Sem exigência de COREN para supervisores
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-gray-200 text-gray-500 font-bold text-[10px] uppercase bg-gray-50/50">
                <th className="p-4">Nome completo / Matrícula</th>
                <th className="p-4">Cargo / Regime</th>
                <th className="p-4">Turno</th>
                <th className="p-4">Credenciais</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs text-gray-700 font-medium">
              {usuarios.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50/50 transition">
                  <td className="p-4">
                    <div className="font-bold text-gray-900">{user.nome}</div>
                    <div className="text-[10px] text-gray-500">Matrícula: <span className="font-mono">{user.matricula}</span></div>
                  </td>
                  <td className="p-4">
                    {user.role === UserRole.ENFERMEIRO ? (
                      <span className="bg-red-50 text-red-700 border border-red-100 font-bold text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 w-max">
                        <Shield className="w-2.5 h-2.5" />
                        Supervisor
                      </span>
                    ) : (
                      <span className={`font-bold text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider border flex items-center gap-1 w-max ${
                        user.tipo === StretcherType.FIXO_SABADO
                          ? 'bg-amber-50 text-amber-800 border-amber-100'
                          : 'bg-blue-50 text-blue-800 border-blue-100'
                      }`}>
                        Maqueiro {user.tipo === StretcherType.FIXO_SABADO ? 'Fixo' : 'Normal'}
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="font-semibold text-gray-900">
                      {user.turno === UserShift.MANHA ? 'Manhã' : 'Tarde'}
                    </div>
                    <div className="text-[10px] text-gray-500">
                      {user.turno === UserShift.MANHA ? '07h às 16h' : '11h às 20h'}
                    </div>
                  </td>
                  <td className="p-4 font-mono text-[11px] text-gray-600">
                    <div>Login: <span className="font-bold text-gray-800">{user.login}</span></div>
                    <div>Senha: {user.senha}</div>
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => toggleUserStatus(user)}
                      className={`flex items-center gap-1 cursor-pointer hover:opacity-85 ${user.ativo ? 'text-[#2E7D32]' : 'text-gray-400'}`}
                      title={user.ativo ? 'Clique para desativar' : 'Clique para ativar'}
                    >
                      {user.ativo ? (
                        <>
                          <ToggleRight className="w-6 h-6 text-[#2E7D32]" />
                          <span className="font-bold text-[10px] uppercase">Ativo</span>
                        </>
                      ) : (
                        <>
                          <ToggleLeft className="w-6 h-6 text-gray-400" />
                          <span className="font-bold text-[10px] uppercase">Inativo</span>
                        </>
                      )}
                    </button>
                  </td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => handleStartEdit(user)}
                      className="bg-gray-100 hover:bg-[#005C9E]/10 text-gray-700 hover:text-[#005C9E] p-1.5 rounded transition cursor-pointer"
                      title="Editar Dados"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
