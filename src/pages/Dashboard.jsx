// src/pages/Dashboard.jsx
import Logo from "../assets/penteado.png"
import Lucao from "../assets/LucaoLogo.png"
import React, { useState, useEffect } from 'react';
import { fetchSumario } from '../services/api';
import { FaCalendarDay, FaCalendarAlt, FaChartLine, FaMoneyBillWave } from 'react-icons/fa';
import './Dashboard.css';

const Dashboard = () => {
  const [sumario, setSumario] = useState({ faturamentoDia: 0, faturamentoMes: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const getSumario = async () => {
      try {
        setLoading(true);
        const data = await fetchSumario();
        setSumario(data);
        setError('');
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    getSumario();
  }, []);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

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
            <button 
              className="dashboard-retry-button"
              onClick={() => window.location.reload()}
            >
              Tentar Novamente
            </button>
          </div>
        </main>
      </div>
    );
  }

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
            {/* Card Faturamento do Dia */}
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
              <div className="dashboard-card-footer">
                <small>📅 Hoje</small>
              </div>
            </div>

            {/* Card Faturamento do Mês */}
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
                <small>📅 {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</small>
              </div>
            </div>

            {/* Card de Média Diária (calculada) */}
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

            {/* Card de Meta (exemplo) */}
            <div className="dashboard-card dashboard-card-goal">
              <div className="dashboard-card-header">
                <div className="dashboard-card-icon">
                  <FaMoneyBillWave />
                </div>
                <div className="dashboard-card-title">
                  <h4>Meta do Mês</h4>
                  <small>Objetivo mensal</small>
                </div>
              </div>
              <div className="dashboard-card-value">
                {formatCurrency(5000)} {/* Você pode tornar isso dinâmico */}
              </div>
              <div className="dashboard-card-progress">
                <div className="dashboard-progress-bar">
                  <div 
                    className="dashboard-progress-fill"
                    style={{ width: `${Math.min((sumario.faturamentoMes / 5000) * 100, 100)}%` }}
                  ></div>
                </div>
                <small>{Math.round((sumario.faturamentoMes / 5000) * 100)}% da meta</small>
              </div>
            </div>
          </div>

          {/* Seção de estatísticas rápidas */}
          <div className="dashboard-quick-stats">
            <h4>📈 Resumo Rápido</h4>
            <div className="dashboard-stats-row">
              <div className="dashboard-stat-item">
                <span className="dashboard-stat-label">Faturamento Hoje:</span>
                <span className="dashboard-stat-value">{formatCurrency(sumario.faturamentoDia)}</span>
              </div>
              <div className="dashboard-stat-item">
                <span className="dashboard-stat-label">Restante para Meta:</span>
                <span className="dashboard-stat-value">{formatCurrency(Math.max(5000 - sumario.faturamentoMes, 0))}</span>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;