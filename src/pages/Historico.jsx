// src/pages/Historico.jsx
import React, { useState, useEffect } from 'react';
import { fetchHistorico } from '../services/api';
import Logo from "../assets/penteado.png";
import Lucao from "../assets/LucaoLogo.png";
// Reaproveita o CSS principal do app (RegistrarVenda.css)
import './RegistrarVenda.css';
// Estilos específicos do histórico (adicionais)
import './Historico.css';

const Historico = () => {
  const [vendas, setVendas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedVendaId, setExpandedVendaId] = useState(null);

  useEffect(() => {
    const getHistorico = async () => {
      try {
        setLoading(true);
        const data = await fetchHistorico();
        setVendas(data || []);
      } catch (err) {
        setError(err.message || 'Erro ao carregar histórico.');
      } finally {
        setLoading(false);
      }
    };
    getHistorico();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const options = {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    };
    return new Date(dateString).toLocaleString('pt-BR', options);
  };

  const toggleVendaDetails = (id) => {
    setExpandedVendaId(expandedVendaId === id ? null : id);
  };

  return (
    <div className="rv-container">
      {/* HEADER FIXO (mesma estrutura dos outros pages) */}
      <header className="rv-header" role="banner">
        
        <div className="rv-header-text">Barbearia Lucão</div>
        <div className="rv-header-logo">
          <img src={Logo} alt="Logo da Barbearia Lucão" />
        </div>
      </header>

      {/* CARD PRINCIPAL - ocupa todo o espaço abaixo do header */}
      <main className="rv-main-card" role="main">
        <div className="rv-top-visuals" aria-hidden="true">
          <span role="img" aria-label="barber pole">💈</span>
          <div className="rv-central-logo">
            <img src={Lucao} alt="Lucão" />
          </div>
          <span role="img" aria-label="barber pole">💈</span>
        </div>

        <h2>📜 Histórico de Vendas</h2>

        {loading && <p>Carregando histórico...</p>}
        {error && <p className="rv-message rv-error">{error}</p>}

        {!loading && !error && (
          vendas.length === 0 ? (
            <p>Nenhuma venda registrada ainda.</p>
          ) : (
            <ul className="rv-historico-list">
              {vendas.map(venda => (
                <li
                  key={venda.id}
                  className="rv-historico-item"
                  onClick={() => toggleVendaDetails(venda.id)}
                >
                  <div className="rv-historico-header">
                    <div className="rv-historico-meta">
                      <div className="rv-historico-client">
                        <strong>{venda.cliente_nome}</strong>
                      </div>
                      <div className="rv-historico-date">{formatDate(venda.data_venda)}</div>
                    </div>

                    <div className="rv-historico-total">
                      <strong>
                        {(Number(venda.valor_total) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </strong>
                    </div>
                  </div>

                  {expandedVendaId === venda.id && (
                    <div className="rv-historico-details">
                      <h4>Itens</h4>
                      <ul className="rv-historico-items-list">
                        {Array.isArray(venda.itens) && venda.itens.length > 0 ? (
                          venda.itens.map((item, idx) => (
                            <li key={idx} className="rv-historico-item-detail">
                              {item.nome} — {(Number(item.valor_cobrado) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </li>
                          ))
                        ) : (
                          <li className="rv-historico-item-detail">Nenhum item registrado</li>
                        )}
                      </ul>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )
        )}
      </main>
    </div>
  );
};

export default Historico;
