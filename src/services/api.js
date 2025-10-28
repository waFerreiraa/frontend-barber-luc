const BASE_URL = import.meta.env.VITE_BASE_URL;

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
  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error("Erro inesperado no servidor. Resposta inválida.");
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

export const excluirVendaCliente = async (vendaId) => {
  const response = await fetch(
    `${BASE_URL}/api/vendas/${vendaId}/excluir-cliente`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
    }
  );
  return handleResponse(response);
};

// --- LOGIN ---
export const loginUser = async (email, senha) => {
  const response = await fetch(`${BASE_URL}/api/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, senha }),
  });

  const data = await handleResponse(response);

  if (!data || !data.token) {
    throw new Error("Resposta inválida do servidor. Token ausente.");
  }

  const usuario = {
    id: data.id,
    nome: data.nome,
    tipo_usuario: data.tipo_usuario || data.tipo,
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

  const url = `${BASE_URL}/api/relatorio-ganhos?mes=${mes}&ano=${ano}`;
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Erro ao gerar PDF");
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
