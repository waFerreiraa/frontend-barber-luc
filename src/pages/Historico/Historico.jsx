import React, { useState, useEffect, useMemo, useContext } from "react";
import { fetchHistorico, excluirVendaCliente } from "../../services/api";
import { toast } from 'react-toastify';
import { FaTrash, FaCreditCard, FaMoneyBillWave, FaQrcode } from 'react-icons/fa';
import Logo from "../../assets/penteado.png";
import Cabelo from "../../assets/mulher.png";
import Lucao from "../../assets/LucaoLogo.png";
import "../RegistrarVenda/RegistrarVenda.css";
import "./Historico.css";
import { ThemeContext } from "../../contexts/ThemeContext";

const Historico = ({ usuario }) => {
  const { tema } = useContext(ThemeContext);
  const isSalao = tema === 'salao';

  const [vendas, setVendas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedDate, setExpandedDate] = useState(null);
  const [vendaParaExcluir, setVendaParaExcluir] = useState(null); // venda selecionada para exclusão
  const [modalAberto, setModalAberto] = useState(false);
  const [filtroPeriodo, setFiltroPeriodo] = useState('mes'); // 'dia', 'semana', 'mes'

  useEffect(() => {
    const getHistorico = async () => {
      try {
        const data = await fetchHistorico();
        setVendas(data || []);
      } catch (err) {
        toast.error(err.message || "Erro ao carregar histórico.");
      } finally {
        setLoading(false);
      }
    };
    getHistorico();
  }, []);

  const toggleDateDetails = (date) => {
    setExpandedDate(expandedDate === date ? null : date);
  };

  const formatCurrency = (value) => {
    return Number(value).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const formatHora = (data) => {
    return new Date(data).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "America/Sao_Paulo",
    });
  };

  // Helper para ícone e texto do método de pagamento
  const getPaymentMethodInfo = (paymentMethod) => {
    if (!paymentMethod) return null;
    const method = paymentMethod.toLowerCase();
    if (method === 'pix') return { icon: <FaQrcode />, text: 'Pix' };
    if (method === 'dinheiro') return { icon: <FaMoneyBillWave />, text: 'Dinheiro' };
    if (method === 'credito') return { icon: <FaCreditCard />, text: 'Crédito' };
    if (method === 'debito') return { icon: <FaCreditCard />, text: 'Débito' };
    return { icon: null, text: paymentMethod };
  };


  // Função para abrir modal
  const abrirModalExclusao = (venda) => {
    setVendaParaExcluir(venda);
    setModalAberto(true);
  };

  // Confirma exclusão
  const confirmarExclusao = async () => {
    try {
      await excluirVendaCliente(vendaParaExcluir.id);
      setVendas(vendas.filter((v) => v.id !== vendaParaExcluir.id));
      toast.success("Venda excluída com sucesso!");
      setModalAberto(false);
      setVendaParaExcluir(null);
    } catch (err) {
      toast.error(err.message || "Erro ao excluir venda.");
    }
  };

  // Cancela exclusão
  const cancelarExclusao = () => {
    setModalAberto(false);
    setVendaParaExcluir(null);
  };

  // Filtra as vendas com base no período selecionado
  const vendasFiltradas = useMemo(() => {
    if (!vendas.length) return [];

    const hoje = new Date();
    const anoHoje = hoje.getFullYear();
    const mesHoje = hoje.getMonth();
    const diaHoje = hoje.getDate();

    switch (filtroPeriodo) {
      case 'dia': {
        return vendas.filter(venda => {
          const dataVenda = new Date(venda.data_venda);
          return dataVenda.getFullYear() === anoHoje &&
                 dataVenda.getMonth() === mesHoje &&
                 dataVenda.getDate() === diaHoje;
        });
      }
      case 'semana': {
        const primeiroDiaSemana = new Date(hoje);
        primeiroDiaSemana.setDate(hoje.getDate() - hoje.getDay()); // Domingo
        primeiroDiaSemana.setHours(0, 0, 0, 0);
        
        const ultimoDiaSemana = new Date(primeiroDiaSemana);
        ultimoDiaSemana.setDate(primeiroDiaSemana.getDate() + 7);
 
        return vendas.filter(venda => {
          const dataVenda = new Date(venda.data_venda);
          return dataVenda >= primeiroDiaSemana && dataVenda < ultimoDiaSemana;
        });
      }
      case 'mes': {
        return vendas.filter(venda => {
          const dataVenda = new Date(venda.data_venda);
          return dataVenda.getFullYear() === anoHoje &&
                 dataVenda.getMonth() === mesHoje;
        });
      }
      default:
        return vendas;
    }
  }, [vendas, filtroPeriodo]);

  // Agrupa as vendas filtradas por dia
  const vendasPorDia = vendasFiltradas.reduce((acc, venda) => {
    const dataStr = new Date(venda.data_venda).toLocaleDateString("pt-BR", {
      timeZone: "America/Sao_Paulo",
    });
    if (!acc[dataStr]) acc[dataStr] = [];
    acc[dataStr].push(venda);
    return acc;
  }, {});

  const headerLogo = isSalao ? Cabelo : Logo;

  return (
    <div className="rv-container"> {/* Mantém o container principal do RegistrarVenda */}
      <header className="rv-header" role="banner"> {/* Usa o header do RegistrarVenda */}
        <div className="rv-header-text"> {/* Usa o texto do header do RegistrarVenda */}
          {usuario?.configuracoes?.nome_exibicao || (isSalao ? "Salão de Beleza" : "Barbearia Lucão")}
        </div>
        <div className="rv-header-logo">
          <img src={headerLogo} alt="" aria-hidden="true" />
        </div>
      </header>

      <main className="rv-main-card" role="main"> {/* Usa o main card do RegistrarVenda */}
        <div className="rv-top-visuals" aria-hidden="true"> {/* Usa os visuais do topo do RegistrarVenda */}
          <div className="rv-central-logo"> {/* Usa o logo central do RegistrarVenda */}
            <img src={usuario?.configuracoes?.logo_url || Lucao} alt="" />
          </div>
        </div>

        <h2 style={{ textAlign: 'center' }}>Histórico de Vendas</h2>

        {loading && <p>Carregando histórico...</p>}

        <div className="historico-filtros">
          <button className={`historico-filtro-button ${filtroPeriodo === 'dia' ? 'active' : ''}`} onClick={() => setFiltroPeriodo('dia')}>Hoje</button>
          <button className={`historico-filtro-button ${filtroPeriodo === 'semana' ? 'active' : ''}`} onClick={() => setFiltroPeriodo('semana')}>Esta Semana</button>
          <button className={`historico-filtro-button ${filtroPeriodo === 'mes' ? 'active' : ''}`} onClick={() => setFiltroPeriodo('mes')}>Este Mês</button>
        </div>

        {!loading &&
          (Object.keys(vendasPorDia).length === 0 ? (
            <p className="historico-sem-vendas">Nenhuma venda registrada para o período selecionado.</p>
          ) : (
            <ul className="historico-list">
              {Object.entries(vendasPorDia).map(([data, vendasDoDia]) => {
                const vendasPorColaborador = vendasDoDia.reduce((acc, v) => {
                  const nomeColab = v.usuario_nome || "Colaborador";
                  if (!acc[nomeColab]) acc[nomeColab] = [];
                  acc[nomeColab].push(v);
                  return acc;
                }, {});

                const totalDoDia = vendasDoDia.reduce(
                  (sum, v) => sum + Number(v.valor_total || 0),
                  0
                );

                return (
                  <li
                    key={data}
                    className="historico-item"
                    onClick={() => toggleDateDetails(data)}
                  >
                    <div className="historico-header-item">
                      <div className="historico-meta">
                        <div className="historico-date">
                          <strong>{data}</strong>
                        </div>
                      </div>
                      <div className="historico-total">
                        <strong>{formatCurrency(totalDoDia)}</strong>
                      </div>
                    </div>

                    {expandedDate === data && (
                      <div className="historico-details">
                        <h4 className="historico-details-title">Vendas do Dia</h4>
                        <ul className="historico-items-list">
                          {Object.entries(vendasPorColaborador).map(
                            ([colab, vendasDoColab]) => {
                              const totalColab = vendasDoColab.reduce(
                                (sum, v) => sum + Number(v.valor_total || 0),
                                0
                              );
                              return (
                                <li
                                  key={colab}
                                  className="historico-item-detail"
                                >
                                  <strong>
                                    👤 {colab} — 💰 {formatCurrency(totalColab)}
                                  </strong>
                                  <ul>
                                    {vendasDoColab.map((venda) => {
                                      const paymentInfo = getPaymentMethodInfo(venda.forma_pagamento);
                                      return (
                                        <li key={venda.id} className="historico-venda-individual">
                                          <div className="historico-venda-linha-superior">
                                            <span className="historico-venda-horario">🕒 {formatHora(venda.data_venda)}</span>
                                            <span className="historico-venda-cliente-nome">{venda.cliente_nome || "Cliente não informado"}</span>
                                          </div>
                                          <div className="historico-venda-linha-inferior">
                                            <div className="historico-venda-detalhes-pagamento">
                                              {paymentInfo && (
                                                <span className="historico-venda-pagamento">
                                                  {paymentInfo.icon}
                                                  {paymentInfo.text}
                                                </span>
                                              )}
                                              <strong className="historico-venda-valor">{formatCurrency(venda.valor_total || 0)}</strong>
                                            </div>
                                            <button
                                              className="historico-delete-button"
                                              onClick={(e) => {
                                                e.stopPropagation(); // Previne que o card do dia feche
                                                abrirModalExclusao(venda);
                                              }}
                                            >
                                              <FaTrash />
                                            </button>
                                          </div>
                                        </li>
                                      );
                                    })}
                                  </ul>
                                </li>
                              );
                            }
                          )}
                        </ul>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          ))}

        {/* Modal de confirmação */}
        {modalAberto && (
          <div className="historico-modal-overlay">
            <div className="historico-modal">
              <p>Tem certeza que deseja excluir esta venda?</p>
              <div className="historico-modal-buttons">
                <button
                  className="historico-modal-confirm"
                  onClick={confirmarExclusao}
                >
                  Sim, excluir
                </button>
                <button className="historico-modal-cancel" onClick={cancelarExclusao}>
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Historico;