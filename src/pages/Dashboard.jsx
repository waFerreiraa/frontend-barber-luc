// src/pages/Dashboard.jsx
import Logo from "../assets/penteado.png";
import Lucao from "../assets/LucaoLogo.png";
import React, { useState, useEffect } from "react";
import { FaCalendarDay, FaCalendarAlt, FaChartLine } from "react-icons/fa";
import "./Dashboard.css";
import { fetchHistorico } from "../services/api";

const Dashboard = ({ token, usuario }) => {
  const [sumario, setSumario] = useState({ faturamentoDia: 0, faturamentoMes: 0 });
  const [vendasColaboradores, setVendasColaboradores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
  };

  useEffect(() => {
    const getDashboardData = async () => {
      try {
        setLoading(true);
        setError("");

        // Busca histórico de vendas
        const dataHistorico = await fetchHistorico(token);

        // Separar vendas do usuário atual e dos colaboradores
        const minhasVendas = dataHistorico.filter(v => v.usuario_id === usuario.id);
        const colaboradorVendas = dataHistorico.filter(v => v.usuario_id !== usuario.id);

        // Calcula sumário apenas do usuário logado
        const hoje = new Date();
        const faturamentoDia = minhasVendas
          .filter(v => new Date(v.data_venda).toDateString() === hoje.toDateString())
          .reduce((acc, v) => acc + Number(v.valor_total || 0), 0);

        const mes = hoje.getMonth();
        const ano = hoje.getFullYear();
        const faturamentoMes = minhasVendas
          .filter(v => {
            const data = new Date(v.data_venda);
            return data.getMonth() === mes && data.getFullYear() === ano;
          })
          .reduce((acc, v) => acc + Number(v.valor_total || 0), 0);

        setSumario({ faturamentoDia, faturamentoMes });
        setVendasColaboradores(colaboradorVendas);

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    getDashboardData();
  }, [token, usuario]);

  // Loading
  if (loading) {
    return (
      <div className="dashboard-container">
        <header className="dashboard-header">
          <div className="dashboard-header-text">Barbearia Lucão</div>
          <div className="dashboard-header-logo"><img src={Logo} alt="Logo da Barbearia Lucão" /></div>
        </header>
        <main className="dashboard-main-card">
          <div className="dashboard-top-visuals">
            <span role="img" aria-label="barber pole">💈</span>
            <div className="dashboard-central-logo"><img src={Lucao} alt="" /></div>
            <span role="img" aria-label="barber pole">💈</span>
          </div>
          <div className="dashboard-loading">
            <div className="dashboard-loading-spinner"></div>
            <p>Carregando dados...</p>
          </div>
        </main>
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className="dashboard-container">
        <header className="dashboard-header">
          <div className="dashboard-header-text">Barbearia Lucão</div>
          <div className="dashboard-header-logo"><img src={Logo} alt="Logo da Barbearia Lucão" /></div>
        </header>
        <main className="dashboard-main-card">
          <div className="dashboard-top-visuals">
            <span role="img" aria-label="barber pole">💈</span>
            <div className="dashboard-central-logo"><img src={Lucao} alt="" /></div>
            <span role="img" aria-label="barber pole">💈</span>
          </div>
          <div className="dashboard-error">
            <h3>⚠️ Erro ao carregar dados</h3>
            <p>{error}</p>
            <button className="dashboard-retry-button" onClick={() => window.location.reload()}>Tentar Novamente</button>
          </div>
        </main>
      </div>
    );
  }

  // Dashboard
  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="dashboard-header-text">Barbearia Lucão</div>
        <div className="dashboard-header-logo"><img src={Logo} alt="Logo da Barbearia Lucão" /></div>
      </header>

      <main className="dashboard-main-card">
        <div className="dashboard-top-visuals">
          <span role="img" aria-label="barber pole">💈</span>
          <div className="dashboard-central-logo"><img src={Lucao} alt="" /></div>
          <span role="img" aria-label="barber pole">💈</span>
        </div>

        <section className="dashboard-content">
          <h3>📊 Dashboard - Resumo Financeiro</h3>

          <div className="dashboard-cards-grid">
            {/* Faturamento do Dia */}
            <div className="dashboard-card dashboard-card-day">
              <div className="dashboard-card-header">
                <div className="dashboard-card-icon"><FaCalendarDay /></div>
                <div className="dashboard-card-title"><h4>Faturamento do Dia</h4><small>Vendas de hoje</small></div>
              </div>
              <div className="dashboard-card-value">{formatCurrency(sumario.faturamentoDia)}</div>
              <div className="dashboard-card-footer"><small>📅 Hoje</small></div>
            </div>

            {/* Faturamento do Mês */}
            <div className="dashboard-card dashboard-card-month">
              <div className="dashboard-card-header">
                <div className="dashboard-card-icon"><FaCalendarAlt /></div>
                <div className="dashboard-card-title"><h4>Faturamento do Mês</h4><small>Total mensal</small></div>
              </div>
              <div className="dashboard-card-value">{formatCurrency(sumario.faturamentoMes)}</div>
              <div className="dashboard-card-footer">
                <small>📅 {new Date().toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}</small>
              </div>
            </div>

            {/* Média diária */}
            <div className="dashboard-card dashboard-card-average">
              <div className="dashboard-card-header">
                <div className="dashboard-card-icon"><FaChartLine /></div>
                <div className="dashboard-card-title"><h4>Média Diária</h4><small>Baseada no mês</small></div>
              </div>
              <div className="dashboard-card-value">{formatCurrency(sumario.faturamentoMes / new Date().getDate())}</div>
              <div className="dashboard-card-footer"><small>📈 Estimativa</small></div>
            </div>
          </div>

          {/* Faturamento por Colaborador (apenas admin) */}
          {usuario.tipo_usuario === "admin" && vendasColaboradores.length > 0 && (
            <div className="dashboard-collaborators">
              <h4>💼 Faturamento por Colaborador</h4>
              {Object.entries(
                vendasColaboradores.reduce((acc, v) => {
                  const nome = v.usuario_nome || "Colaborador";
                  if (!acc[nome]) acc[nome] = [];
                  acc[nome].push(v);
                  return acc;
                }, {})
              ).map(([nomeColaborador, vendas = []]) => (
                <div key={nomeColaborador} className="dashboard-collaborator-group">
                  <strong>{nomeColaborador}</strong>
                  {(vendas || []).map((venda) => (
                    <div key={venda.id} className="dashboard-collaborator-item">
                      {new Date(venda.data_venda).toLocaleDateString("pt-BR")} -{" "}
                      {Number(venda.valor_total || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} -{" "}
                      {(venda.itens?.length || 0)} itens
                    </div>
                  ))}
                  <div className="dashboard-collaborator-total">
                    Total faturado:{" "}
                    {formatCurrency(
                      (vendas || []).reduce((acc, v) => acc + Number(v.valor_total || 0), 0)
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

        </section>
      </main>
    </div>
  );
};

export default Dashboard;
