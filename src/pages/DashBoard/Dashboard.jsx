import React, { useState, useEffect, useContext } from "react";
import { toast } from "react-toastify";
import { FaCalendarDay, FaCalendarAlt, FaHandHoldingUsd } from "react-icons/fa";
import Logo from "../../assets/penteado.png";
import Cabelo from "../../assets/mulher.png";
import { ThemeContext } from "../../contexts/ThemeContext";
import "./Dashboard.css";
import { fetchSumario, fetchHistorico, gerarRelatorioGanhos } from "../../services/api";
import { filtrarPorPeriodo } from "../../utils/periodo";
import { somarDivisao } from "../../utils/comissao";

const formatCurrency = (value) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    Number(value) || 0
  );

const NOMES_MESES = Array.from({ length: 12 }, (_, i) => {
  const nome = new Date(2000, i, 1).toLocaleDateString("pt-BR", { month: "long" });
  return nome.charAt(0).toUpperCase() + nome.slice(1);
});

const Dashboard = ({ token, usuario }) => {
  const { tema } = useContext(ThemeContext);
  const [sumario, setSumario] = useState({ faturamentoDia: 0, faturamentoMes: 0 });
  // Ganho do próprio colaborador (parte dele em cada venda); null = sem porcentagem definida
  const [ganho, setGanho] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mesSelecionado, setMesSelecionado] = useState(new Date().getMonth() + 1);
  const [anoSelecionado, setAnoSelecionado] = useState(new Date().getFullYear());
  const [gerandoPdf, setGerandoPdf] = useState(false);

  useEffect(() => {
    const getDashboardData = async () => {
      try {
        setLoading(true);
        setError("");

        const dataSumario = await fetchSumario();
        setSumario({
          faturamentoDia: dataSumario.faturamento_dia,
          faturamentoMes: dataSumario.faturamento_mes,
        });

        // O colaborador vê quanto ficou para ele; o histórico dele traz só as vendas dele.
        if (usuario.tipo_usuario === "colaborador") {
          const vendas = (await fetchHistorico()) || [];
          const dia = somarDivisao(filtrarPorPeriodo(vendas, "dia"));
          const mes = somarDivisao(filtrarPorPeriodo(vendas, "mes"));
          const percentual = vendas.find(
            (v) => v.percentual_comissao !== null && v.percentual_comissao !== undefined
          )?.percentual_comissao;
          setGanho(
            percentual === undefined
              ? null
              : { dia: dia.colaborador, mes: mes.colaborador, percentual: Number(percentual) }
          );
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    getDashboardData();
  }, [token, usuario]);

  const baixarRelatorio = async () => {
    setGerandoPdf(true);
    try {
      await gerarRelatorioGanhos(mesSelecionado, anoSelecionado);
    } catch (err) {
      toast.error(err.message || "Não foi possível gerar o relatório.");
    } finally {
      setGerandoPdf(false);
    }
  };

  const hoje = new Date();
  const dataTexto = hoje.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  const dataPorExtenso = dataTexto.charAt(0).toUpperCase() + dataTexto.slice(1);
  const mediaDiaria = sumario.faturamentoMes / hoje.getDate();
  const nomeEmpresa =
    usuario?.configuracoes?.nome_exibicao || (tema === "salao" ? "Salão" : "Barbearia");

  return (
    <div className="resumo">
      <header className="resumo-topo">
        <div className="resumo-titulo">
          <h1>{nomeEmpresa}</h1>
          <p>Resumo · {dataPorExtenso}</p>
        </div>
        <img
          className="resumo-logo"
          src={usuario?.configuracoes?.logo_url || (tema === "salao" ? Cabelo : Logo)}
          alt=""
        />
      </header>

      {loading ? (
        <div className="resumo-grade" role="status" aria-label="Carregando">
          <div className="resumo-card resumo-esqueleto" />
          <div className="resumo-card resumo-esqueleto" />
        </div>
      ) : error ? (
        <p className="resumo-erro" role="alert">{error}</p>
      ) : (
        <>
          {ganho && (
            <section className="resumo-grade" aria-label="Seu ganho">
              <article className="resumo-card resumo-card-destaque">
                <div className="resumo-card-topo">
                  <span className="resumo-icone"><FaHandHoldingUsd aria-hidden="true" /></span>
                  <h2>Seu ganho hoje</h2>
                </div>
                <p className="resumo-valor">{formatCurrency(ganho.dia)}</p>
                <p className="resumo-nota">{ganho.percentual}% de cada venda sua</p>
              </article>
              <article className="resumo-card resumo-card-destaque">
                <div className="resumo-card-topo">
                  <span className="resumo-icone"><FaHandHoldingUsd aria-hidden="true" /></span>
                  <h2>Seu ganho no mês</h2>
                </div>
                <p className="resumo-valor">{formatCurrency(ganho.mes)}</p>
                <p className="resumo-nota">{ganho.percentual}% de cada venda sua</p>
              </article>
            </section>
          )}

          <section className="resumo-grade" aria-label="Faturamento">
            <article className="resumo-card">
              <div className="resumo-card-topo">
                <span className="resumo-icone"><FaCalendarDay aria-hidden="true" /></span>
                <h2>{ganho ? "Vendido hoje" : "Faturamento do dia"}</h2>
              </div>
              <p className="resumo-valor">{formatCurrency(sumario.faturamentoDia)}</p>
            </article>
            <article className="resumo-card">
              <div className="resumo-card-topo">
                <span className="resumo-icone"><FaCalendarAlt aria-hidden="true" /></span>
                <h2>{ganho ? "Vendido no mês" : "Faturamento do mês"}</h2>
              </div>
              <p className="resumo-valor">{formatCurrency(sumario.faturamentoMes)}</p>
              <p className="resumo-nota">Média de {formatCurrency(mediaDiaria)} por dia</p>
            </article>
          </section>

          <section className="resumo-card resumo-relatorio-card" aria-label="Relatório">
            <h2>Relatório mensal</h2>
            <div className="resumo-relatorio">
              <label>
                <span>Mês</span>
                <select
                  value={mesSelecionado}
                  onChange={(e) => setMesSelecionado(Number(e.target.value))}
                >
                  {NOMES_MESES.map((nome, i) => (
                    <option key={nome} value={i + 1}>{nome}</option>
                  ))}
                </select>
              </label>
              <label>
                <span>Ano</span>
                <select
                  value={anoSelecionado}
                  onChange={(e) => setAnoSelecionado(Number(e.target.value))}
                >
                  {Array.from({ length: 5 }, (_, i) => hoje.getFullYear() - i).map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                className="resumo-baixar"
                onClick={baixarRelatorio}
                disabled={gerandoPdf}
              >
                {gerandoPdf ? "Gerando..." : "Baixar PDF"}
              </button>
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default Dashboard;
