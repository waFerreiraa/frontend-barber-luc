const BASE_URL = 'https://backend-barber-luc.onrender.com';

const handleResponse = async (response) => {
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ocorreu um erro na requisição.');
    }
    return response.json();
};

export const fetchSumario = async () => {
    const response = await fetch(`${BASE_URL}/api/sumario`);
    return handleResponse(response);
};

export const fetchClientes = async () => {
    const response = await fetch(`${BASE_URL}/api/clientes`);
    return handleResponse(response);
};

export const createCliente = async (cliente) => {
    const response = await fetch(`${BASE_URL}/api/clientes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cliente),
    });
    return handleResponse(response);
};

export const fetchTiposServicos = async () => {
    const response = await fetch(`${BASE_URL}/api/tipos_servicos`);
    return handleResponse(response);
};

export const createTipoServico = async (servico) => {
    const response = await fetch(`${BASE_URL}/api/tipos_servicos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(servico),
    });
    return handleResponse(response);
};

export const fetchHistorico = async () => {
    const response = await fetch(`${BASE_URL}/api/historico`);
    return handleResponse(response);
};

export const createVenda = async (venda) => {
    const response = await fetch(`${BASE_URL}/api/vendas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(venda),
    });
    return handleResponse(response);
};
