import React, { useState, useEffect } from 'react';
import { fetchHistorico } from '../services/api';
import Logo from "../assets/penteado.png";
import Lucao from "../assets/LucaoLogo.png";
import './RegistrarVenda.css';
import './Historico.css';

const Historico = ({ token, usuario }) => {
  const [vendas, setVendas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedDate, setExpandedDate] = useState(null);

  useEffect(() => {
    const getHistorico = async () => {
      try {
        setLoading(true);
        const data = await fetchHistorico(token); 
        setVendas(data || []);
      } catch (err) {
        setError(err.message || 'Erro ao carregar histórico.');
      } finally {
        setLoading(false);
      }
    };
    getHistorico();
  }, [token]);

  // Agrupa vendas por dia
  const vendasPorDia = vendas.reduce((acc, venda) => {
    const dataStr = new Date(venda.data_venda).toLocaleDateString('pt-BR', {timeZone: 'America/Sao_paulo'});
    if (!acc[dataStr]) acc[dataStr] = [];
    acc[dataStr].push(venda);
    return acc;
  }, {});

  const toggleDateDetails = (date) => {
    setExpandedDate(expandedDate === date ? null : date);
  };

  const formatCurrency = (value) => {
    return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div className="rv-container">
      <header className="rv-header" role="banner">
        <div className="rv-header-text">Barbearia Lucão</div>
        <div className="rv-header-logo">
          <img src={Logo} alt="Logo da Barbearia Lucão" />
        </div>
      </header>

      <main className="rv-main-card" role="main">
        <div className="rv-top-visuals" aria-hidden="true">
          <span role="img" aria-label="barber pole">💈</span>
          <div className="rv-central-logo">
            <img src={Lucao} alt="Lucão" />
          </div>
          <span role="img" aria-label="barber pole">💈</span>
        </div>

        <h2>📜 Histórico de Vendas - Ganhos por Dia</h2>

        {loading && <p>Carregando histórico...</p>}
        {error && <p className="rv-message rv-error">{error}</p>}

        {!loading && !error && (
          Object.keys(vendasPorDia).length === 0 ? (
            <p>Nenhuma venda registrada ainda.</p>
          ) : (
            <ul className="rv-historico-list">
              {Object.entries(vendasPorDia).map(([data, vendasDoDia]) => {
                
                // Agrupa vendas do dia por colaborador (quem vendeu)
                const vendasPorColaborador = vendasDoDia.reduce((acc, v) => {
                  const nomeColab = v.usuario_nome || 'Colaborador';
                  if (!acc[nomeColab]) acc[nomeColab] = [];
                  acc[nomeColab].push(v);
                  return acc;
                }, {});

                // Total do dia
                const totalDoDia = vendasDoDia.reduce((sum, v) => sum + Number(v.valor_total || 0), 0);

                return (
                  <li key={data} className="rv-historico-item" onClick={() => toggleDateDetails(data)}>
                    <div className="rv-historico-header">
                      <div className="rv-historico-meta">
                        <div className="rv-historico-date">
                          <strong>{data}</strong>
                        </div>
                      </div>
                      <div className="rv-historico-total">
                        <strong>{formatCurrency(totalDoDia)}</strong>
                      </div>
                    </div>

                    {expandedDate === data && (
                      <div className="rv-historico-details">
                        <h4>Vendas do Dia por Colaborador</h4>
                        <ul className="rv-historico-items-list">
                          {Object.entries(vendasPorColaborador).map(([colab, vendasDoColab]) => {
                            const totalColab = vendasDoColab.reduce((sum, v) => sum + Number(v.valor_total || 0), 0);
                            return (
                              <li key={colab} className="rv-historico-item-detail">
                                <strong>👤 {colab} — 💰 {formatCurrency(totalColab)}</strong>
                                <ul>
                                  {vendasDoColab.map((venda) => (
                                    <li key={venda.id}>
                                      🧑‍🤝‍🧑 {venda.cliente_nome || 'Cliente não informado'} — 💈 {formatCurrency(venda.valor_total || 0)} — 📦 {venda.venda_itens?.length || 0} itens
                                    </li>
                                  ))}
                                </ul>
                              </li>
                            )
                          })}
                        </ul>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )
        )}
      </main>
    </div>
  );
};

export default Historico;
