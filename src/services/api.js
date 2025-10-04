const BASE_URL = 'https://backend-barber-luc.onrender.com';

// Pega token do localStorage
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

// services/api.js
export const excluirVendaCliente = async (vendaId) => {
  const response = await fetch(`${BASE_URL}/api/vendas/${vendaId}/excluir-cliente`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders()
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Erro ao excluir venda/cliente");
  }

  return response.json();
};




const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Ocorreu um erro na requisição.');
  }
  return response.json();
};

// SUMÁRIO
export const fetchSumario = async () => {
  const response = await fetch(`${BASE_URL}/api/sumario`, {
    headers: { ...getAuthHeaders() }
  });
  return handleResponse(response);
};

// CLIENTES
export const fetchClientes = async () => {
  const response = await fetch(`${BASE_URL}/api/clientes`, {
    headers: { ...getAuthHeaders() }
  });
  return handleResponse(response);
};

export const createCliente = async (cliente) => {
  const response = await fetch(`${BASE_URL}/api/clientes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(cliente),
  });
  return handleResponse(response);
};

// TIPOS DE SERVIÇOS
export const fetchTiposServicos = async () => {
  const response = await fetch(`${BASE_URL}/api/tipos_servicos`, {
    headers: { ...getAuthHeaders() }
  });
  return handleResponse(response);
};

export const createTipoServico = async (servico) => {
  const response = await fetch(`${BASE_URL}/api/tipos_servicos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(servico),
  });
  return handleResponse(response);
};

// HISTÓRICO
export const fetchHistorico = async () => {
  const response = await fetch(`${BASE_URL}/api/historico`, {
    headers: { ...getAuthHeaders() }
  });
  return handleResponse(response);
};

// VENDAS
export const createVenda = async (venda) => {
  const response = await fetch(`${BASE_URL}/api/vendas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(venda),
  });
  return handleResponse(response);
};

// LOGIN
export const loginUser = async (email, senha) => {
  const response = await fetch(`${BASE_URL}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, senha }),
  });
  const data = await handleResponse(response);
  // Salva token e dados do usuário
  localStorage.setItem('token', data.token);
  localStorage.setItem('user', JSON.stringify(data));
  return data;
};

// LOGOUT
export const logoutUser = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};
