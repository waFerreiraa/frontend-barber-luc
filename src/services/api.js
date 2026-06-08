// src/services/api.js
const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:10000";

// --- LOGOUT GLOBAL AUTOMÁTICO ---
let globalLogout = null;

// Permite registrar a função de logout do App.jsx
export const registerLogoutHandler = (fn) => {
  globalLogout = fn;
};

// Pega token do localStorage
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// --- HANDLE RESPONSE CENTRALIZADO ---
const handleResponse = async (response) => {
  const contentType = response.headers.get("content-type") || "";

  // Se for PDF, retorna blob
  if (contentType.includes("application/pdf")) {
    if (!response.ok) {
      throw new Error("Erro ao gerar PDF");
    }
    return response.blob();
  }

  let data = null;
  try {
    data = await response.json();
  } catch {
    // Se não for JSON e deu erro
    if (!response.ok) {
      throw new Error("Erro inesperado no servidor. Resposta inválida.");
    }
    // se não for JSON mas ok (ex: 204 No Content), retorna null
    return null;
  }

  if (!response.ok) {
    // Se 401, chama logout global
    if (response.status === 401 && globalLogout) {
      globalLogout();
    }

    const message =
      data?.error || data?.message || "Ocorreu um erro na requisição.";
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  return data;
};

// --- SUMÁRIO ---
export const fetchSumario = async () => {
  const response = await fetch(`${BASE_URL}/api/sumario`, {
    headers: { ...getAuthHeaders() },
  });
  return handleResponse(response);
};

// --- CLIENTES ---
export const fetchClientes = async () => {
  const response = await fetch(`${BASE_URL}/api/clientes`, {
    headers: { ...getAuthHeaders() },
  });
  return handleResponse(response);
};

export const createCliente = async (cliente) => {
  const response = await fetch(`${BASE_URL}/api/clientes`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify(cliente),
  });
  return handleResponse(response);
};

// --- TIPOS DE SERVIÇOS ---
export const fetchTiposServicos = async () => {
  const response = await fetch(`${BASE_URL}/api/tipos_servicos`, {
    headers: { ...getAuthHeaders() },
  });
  return handleResponse(response);
};

export const createTipoServico = async (servico) => {
  const response = await fetch(`${BASE_URL}/api/tipos_servicos`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify(servico),
  });
  return handleResponse(response);
};

// --- HISTÓRICO ---
export const fetchHistorico = async () => {
  const response = await fetch(`${BASE_URL}/api/historico`, {
    headers: { ...getAuthHeaders() },
  });
  return handleResponse(response);
};

// --- VENDAS ---
export const createVenda = async (venda) => {
  const response = await fetch(`${BASE_URL}/api/vendas`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify(venda),
  });
  return handleResponse(response);
};

// NOVO: Atualizar Tipo de Serviço
export const updateTipoServico = async (id, servicoData) => {
  const response = await fetch(`${BASE_URL}/api/tipos_servicos/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify(servicoData),
  });
  return handleResponse(response);
};

// NOVO: Excluir Tipo de Serviço
export const deleteTipoServico = async (id) => {
  const response = await fetch(`${BASE_URL}/api/tipos_servicos/${id}`, {
    method: "DELETE",
    headers: { ...getAuthHeaders() },
  });
  return handleResponse(response);
};

/**
 * Excluir venda (rota RESTful recomendada)
 * DELETE /api/vendas/:id
 *
 * Retorna:
 *  - null se backend responder 204 No Content
 *  - { message: '...' } ou similar se backend retornar JSON
 */
export const excluirVendaCliente = async (vendaId) => {
  const response = await fetch(`${BASE_URL}/api/vendas/${vendaId}`, {
    method: "DELETE",
    headers: {
      ...getAuthHeaders(),
    },
  });
  return handleResponse(response);
};

/**
 * Compatibilidade temporária: se você preferir não alterar o backend agora,
 * chame a rota antiga "/api/vendas/:id/excluir-cliente".
 * (use só enquanto não atualizar o server)
 */
export const excluirVendaClienteLegacy = async (vendaId) => {
  const response = await fetch(
    `${BASE_URL}/api/vendas/${vendaId}/excluir-cliente`,
    {
      method: "DELETE",
      headers: { ...getAuthHeaders() },
    },
  );
  return handleResponse(response);
};

// --- AGENDAMENTOS ---
export const fetchAgendamentos = async (filters = {}) => {
  const query = new URLSearchParams(filters).toString();
  const response = await fetch(`${BASE_URL}/api/agendamentos?${query}`, {
    headers: { ...getAuthHeaders() },
  });
  return handleResponse(response);
};

export const createAgendamento = async (agendamentoData) => {
  const response = await fetch(`${BASE_URL}/api/agendamentos`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify(agendamentoData),
  });
  return handleResponse(response);
};

export const updateAgendamento = async (id, agendamentoData) => {
  const response = await fetch(`${BASE_URL}/api/agendamentos/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify(agendamentoData),
  });
  return handleResponse(response);
};

export const deleteAgendamento = async (id) => {
  const response = await fetch(`${BASE_URL}/api/agendamentos/${id}`, {
    method: "DELETE",
    headers: { ...getAuthHeaders() },
  });
  return handleResponse(response);
};

// --- COLABORADORES (BARBEIROS) ---
export const fetchColaboradores = async () => {
  const response = await fetch(`${BASE_URL}/api/auth/colaboradores`, { headers: { ...getAuthHeaders() } });
  return handleResponse(response);
};

// --- LOGIN ---
export const loginUser = async (email, senha) => {
  const response = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, senha }),
  });

  const data = await handleResponse(response);

  if (!data?.token) {
    throw new Error("Resposta inválida do servidor. Token ausente.");
  }

  const usuario = {
    id: data.id,
    nome: data.nome,
    tipo_usuario: data.tipo_usuario,
    empresa_id: data.empresa_id, // ✅ útil pro front (UI/debug)
    configuracoes: data.configuracoes || {}, // ✅ Salva as configurações
    token: data.token,
  };

  localStorage.setItem("token", usuario.token);
  localStorage.setItem("user", JSON.stringify(usuario));

  return usuario;
};

// --- RELATÓRIO EM PDF ---
export const gerarRelatorioGanhos = async (mes, ano) => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Usuário não autenticado");

  const url = `${BASE_URL}/api/relatorio/ganhos?mes=${mes}&ano=${ano}`;

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    let msg = "Erro ao gerar PDF";
    try {
      const errorData = await response.json();
      msg = errorData?.error || msg;
    } catch (error) {
      console.warn('Não foi possível ler o erro JSON do PDF', error);
    }
    throw new Error(msg);
  }

  const blob = await response.blob();
  const link = document.createElement("a");
  link.href = window.URL.createObjectURL(blob);
  link.download = `Relatorio_Ganhos_${mes}_${ano}.pdf`;
  link.click();
};

// --- LOGOUT ---
export const logoutUser = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

// --- ADMIN CONFIG ---
export const fetchEmpresasParaAdmin = async () => {
  const response = await fetch(`${BASE_URL}/api/admin/empresas-config`, {
    headers: { ...getAuthHeaders() },
  });
  return handleResponse(response);
};

export const saveEmpresaConfig = async (configData) => {
  const response = await fetch(`${BASE_URL}/api/admin/empresas-config`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(configData),
  });
  return handleResponse(response);
};

export const createUserByOwner = async (userData) => {
  const response = await fetch(`${BASE_URL}/api/admin/usuarios`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(userData),
  });
  return handleResponse(response);
};

// --- REGISTRO INICIAL (EMPRESA + ADMIN) ---
export const createInitialUserAndCompany = async (registrationData) => {
  // registrationData deve conter: empresa_nome, nome, email, senha, layout_tipo
  const response = await fetch(`${BASE_URL}/api/registro`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }, // Endpoint público, sem token
    body: JSON.stringify(registrationData),
  });
  return handleResponse(response);
};

export const createCollaborator = async (userData) => {
  const response = await fetch(`${BASE_URL}/api/auth/usuarios`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(userData),
  });
  return handleResponse(response);
};

export const uploadEmpresaLogo = async (empresaId, logoFile) => {
  const formData = new FormData();
  formData.append('logo', logoFile);

  const response = await fetch(`${BASE_URL}/api/admin/empresas-config/${empresaId}/logo`, {
    method: 'POST',
    headers: { ...getAuthHeaders() }, // O browser define o Content-Type para FormData
    body: formData,
  });
  return handleResponse(response);
};

// ✅ NOVO: Função para alterar a senha do usuário logado
export const alterarMinhaSenha = async (senhaData) => {
  const response = await fetch(`${BASE_URL}/api/auth/alterar-senha`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(senhaData),
  });
  return handleResponse(response);
};

// ✅ NOVO: Função para alterar o email do usuário logado
export const alterarMeuEmail = async (emailData) => {
  const response = await fetch(`${BASE_URL}/api/auth/alterar-email`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(emailData),
  });
  return handleResponse(response);
};

// ✅ NOVO: Função para solicitar redefinição de senha
export const solicitarResetSenha = async (email) => {
  const response = await fetch(`${BASE_URL}/api/auth/esqueci-senha`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  return handleResponse(response);
};

// ✅ NOVO: Função para redefinir a senha com o token
export const resetarSenha = async (token, nova_senha) => {
  const response = await fetch(`${BASE_URL}/api/auth/resetar-senha`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, nova_senha }),
  });
  return handleResponse(response);
};
