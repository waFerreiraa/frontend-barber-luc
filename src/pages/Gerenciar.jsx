import React, { useState, useEffect } from 'react';
import { fetchClientes, createCliente, fetchTiposServicos, createTipoServico } from '../services/api';
import Card from '../components/Card';
import './Gerenciar.css';

const Gerenciar = () => {
    const [clientes, setClientes] = useState([]);
    const [servicos, setServicos] = useState([]);
    
    const [nomeCliente, setNomeCliente] = useState('');
    const [telefoneCliente, setTelefoneCliente] = useState('');

    const [nomeServico, setNomeServico] = useState('');
    const [valorServico, setValorServico] = useState('');
    
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const loadData = async () => {
        try {
            const clientesData = await fetchClientes();
            const servicosData = await fetchTiposServicos();
            setClientes(clientesData);
            setServicos(servicosData);
        } catch (err) {
            setError(err.message);
        }
    };
    
    useEffect(() => { loadData(); }, []);

    const handleAddCliente = async (e) => {
        e.preventDefault();
        try {
            await createCliente({ nome: nomeCliente, telefone: telefoneCliente });
            setSuccess('Cliente adicionado!');
            setNomeCliente(''); setTelefoneCliente('');
            loadData();
        } catch(err) { setError(err.message); }
    };

    const handleAddServico = async (e) => {
        e.preventDefault();
        try {
            await createTipoServico({ nome: nomeServico, valor_padrao: valorServico });
            setSuccess('Serviço adicionado!');
            setNomeServico(''); setValorServico('');
            loadData();
        } catch(err) { setError(err.message); }
    };

    return (
        <div className="gerenciar-container">
            <h1>Gerenciar Cadastros</h1>
            {error && <p className="gerenciar-error">{error}</p>}
            {success && <p className="gerenciar-success">{success}</p>}

            <div className="grid-container">
                <Card className="gerenciar-card">
                    <h3>Adicionar Novo Serviço</h3>
                    <form onSubmit={handleAddServico}>
                        <div className="form-group">
                            <label>Nome do Serviço</label>
                            <input type="text" value={nomeServico} onChange={e => setNomeServico(e.target.value)} required />
                        </div>
                        <div className="form-group">
                            <label>Valor Padrão (ex: 25.00)</label>
                            <input type="number" step="0.01" value={valorServico} onChange={e => setValorServico(e.target.value)} required />
                        </div>
                        <button type="submit" className="button">Adicionar Serviço</button>
                    </form>

                    <h4>Serviços Cadastrados</h4>
                    <ul>
                        {servicos.map(s => (
                            <li key={s.id}>{s.nome} - R$ {parseFloat(s.valor_padrao).toFixed(2)}</li>
                        ))}
                    </ul>
                </Card>

             
            </div>
        </div>
    );
};

export default Gerenciar;
