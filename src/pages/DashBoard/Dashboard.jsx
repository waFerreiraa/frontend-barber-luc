import Logo from "../../assets/penteado.png";
import Cabelo from "../../assets/mulher.png";
import Lucao from "../../assets/LucaoLogo.png";
import React, { useState, useEffect, useContext } from "react";
import { FaCalendarDay, FaCalendarAlt, FaChartLine } from "react-icons/fa";
import "./Dashboard.css";
import { fetchHistorico, gerarRelatorioGanhos } from "../../services/api";
import { ThemeContext } from "../../contexts/ThemeContext";

const Dashboard = ({ token, usuario }) => {
  const { tema } = useContext(ThemeContext);
  const [sumario, setSumario] = useState({
    faturamentoDia: 0,
    faturamentoMes: 0,
  });
  const [vendasColaboradores, setVendasColaboradores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mesSelecionado, setMesSelecionado] = useState(
    new Date().getMonth() + 1
  );
  const [anoSelecionado, setAnoSelecionado] = useState(
    new Date().getFullYear()
  );

  const formatCurrency = (value) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);

  const headerTitle = usuario?.configuracoes?.nome_exibicao || (tema === "salao" ? "Salão Lucão" : "Barbearia Lucão");

 useEffect(() => {
  const getDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      const dataHistorico = await fetchHistorico(token);

      const minhasVendas = dataHistorico.filter(
        (v) => v.usuario_id === usuario.id
      );

      const hoje = new Date();
      const mes = hoje.getMonth();
      const ano = hoje.getFullYear();

      // 🔹 filtra apenas vendas do mês e ano atuais dos colaboradores
      const colaboradorVendas = dataHistorico.filter((v) => {
        const dataVenda = new Date(v.data_venda);
        return (
          v.usuario_id !== usuario.id &&
          dataVenda.getMonth() === mes &&
          dataVenda.getFullYear() === ano
        );
      });

      const faturamentoDia = minhasVendas
        .filter(
          (v) => new Date(v.data_venda).toDateString() === hoje.toDateString()
        )
        .reduce((acc, v) => acc + Number(v.valor_total || 0), 0);

      const faturamentoMes = minhasVendas
        .filter((v) => {
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


  const renderCards = () => (
    <div className="dashboard-cards-grid">
      <div className="dashboard-card dashboard-card-day">
        <div className="dashboard-card-header">
          <div className="dashboard-card-icon">
            <FaCalendarDay />
          </div>
          <div className="dashboard-card-title">
            <h4>Faturamento do Dia</h4>
            <small>Vendas de hoje</small>
          </div>
        </div>
        <div className="dashboard-card-value">
          {formatCurrency(sumario.faturamentoDia)}
        </div>
      </div>

      <div className="dashboard-card dashboard-card-month">
        <div className="dashboard-card-header">
          <div className="dashboard-card-icon">
            <FaCalendarAlt />
          </div>
          <div className="dashboard-card-title">
            <h4>Faturamento do Mês</h4>
            <small>Total mensal</small>
          </div>
        </div>
        <div className="dashboard-card-value">
          {formatCurrency(sumario.faturamentoMes)}
        </div>
        <div className="dashboard-card-footer">
          <small>
            📅{" "}
            {new Date().toLocaleDateString("pt-BR", {
              month: "long",
              year: "numeric",
            })}
          </small>
        </div>
      </div>

      <div className="dashboard-card dashboard-card-average">
        <div className="dashboard-card-header">
          <div className="dashboard-card-icon">
            <FaChartLine />
          </div>
          <div className="dashboard-card-title">
            <h4>Média Diária</h4>
            <small>Baseada no mês</small>
          </div>
        </div>
        <div className="dashboard-card-value">
          {formatCurrency(sumario.faturamentoMes / new Date().getDate())}
        </div>
        <div className="dashboard-card-footer">
          <small>📈 Estimativa</small>
        </div>
      </div>
    </div>
  );

  const renderColaboradores = () => {
    if (usuario.tipo_usuario !== "admin" || vendasColaboradores.length === 0)
      return null;

    const colaboradores = Object.entries(
      vendasColaboradores.reduce((acc, v) => {
        const nome = v.usuario_nome || "Colaborador";
        if (!acc[nome]) acc[nome] = [];
        acc[nome].push(v);
        return acc;
      }, {})
    );

    return (
      <div className="dashboard-collaborators">
        <h4>💼 Faturamento por Colaborador</h4>
        <div className="dashboard-collaborators-grid">
          {colaboradores.map(([nomeColaborador, vendas]) => {
            const total = vendas.reduce(
              (acc, v) => acc + Number(v.valor_total || 0),
              0
            );
            return (
              <div
                key={nomeColaborador}
                className="dashboard-collaborator-card"
              >
                <div className="dashboard-card-header">
                  <div className="dashboard-card-icon">👤</div>
                  <div className="dashboard-card-title">
                    <h4>{nomeColaborador}</h4>
                    <small>Total de vendas</small>
                  </div>
                </div>
                <div className="dashboard-card-value">{formatCurrency(total)}</div>
                <div className="dashboard-card-footer">
                  <small>📊 Base do histórico</small>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderPDF = () => (
    <div className="dashboard-pdf-container">
      <label>
        Mês:
        <select
          value={mesSelecionado}
          onChange={(e) => setMesSelecionado(Number(e.target.value))}
        >
          {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </label>

      <label>
        Ano:
        <select
          value={anoSelecionado}
          onChange={(e) => setAnoSelecionado(Number(e.target.value))}
        >
          {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(
            (a) => (
              <option key={a} value={a}>
                {a}
              </option>
            )
          )}
        </select>
      </label>

      <button
        className="dashboard-pdf-button"
        onClick={() =>
          gerarRelatorioGanhos(mesSelecionado, anoSelecionado).catch((err) =>
            alert(err.message)
          )
        }
      >
        📄 Baixar Relatório (PDF)
      </button>
    </div>
  );

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="dashboard-header-text">{headerTitle}</div>
        <div className="dashboard-header-logo">
          <img
            src={tema === "salao" ? Cabelo : Logo}
            alt={tema === "salao" ? "Logo fixa do Salão Lucão" : "Logo fixa da Barbearia Lucão"}
          />
        </div>
      </header>

      <main className="dashboard-main-card">
        <div className="dashboard-top-visuals">
          <div className="dashboard-central-logo">
            <img
              src={usuario?.configuracoes?.logo_url || Lucao}
              alt={usuario?.configuracoes?.logo_url ? `Logo de ${usuario?.configuracoes?.nome_exibicao || "empresa"}` : "Lucao Logo"}
            />
          </div>
        </div>

        <section className="dashboard-content">
          <h3>Resumo Financeiro</h3>
          {loading ? (
            <div className="dashboard-loading">
              <div className="dashboard-loading-spinner"></div>
              <p>Carregando...</p>
            </div>
          ) : error ? (
            <div className="dashboard-error">
              <h3>{error}</h3>
            </div>
          ) : (
            <>
              {renderCards()}
              {renderColaboradores()}
              {renderPDF()}
            </>
          )}
        </section>
      </main>
    </div>
  );
};

export default Dashboard;