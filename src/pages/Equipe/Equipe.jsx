import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { FaUserTie, FaCheck } from "react-icons/fa";
import { fetchEquipe, fetchHistorico, atualizarComissaoColaborador } from "../../services/api";
import { PERIODOS, filtrarPorPeriodo, descreverIntervalo } from "../../utils/periodo";
import { dividirValor, formatarMoeda, temPercentual } from "../../utils/comissao";
import "./Equipe.css";

const PERIODOS_EQUIPE = PERIODOS.filter((p) => p.id !== "dia");

const iniciais = (nome) =>
  (nome || "?")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0].toUpperCase())
    .join("");

const MembroCard = ({ membro, vendas, onSalvar }) => {
  const [percentual, setPercentual] = useState(
    temPercentual(membro.percentual_comissao) ? String(Number(membro.percentual_comissao)) : ""
  );
  const [salvando, setSalvando] = useState(false);

  const percentualSalvo = temPercentual(membro.percentual_comissao)
    ? String(Number(membro.percentual_comissao))
    : "";
  const alterado = percentual !== percentualSalvo;

  const faturado = vendas.reduce((soma, v) => soma + Number(v.valor_total || 0), 0);
  const divisao = dividirValor(faturado, membro.percentual_comissao);

  const salvar = async (evento) => {
    evento.preventDefault();
    const valor = percentual === "" ? null : Number(percentual.replace(",", "."));
    if (valor !== null && (Number.isNaN(valor) || valor < 0 || valor > 100)) {
      toast.error("A porcentagem deve estar entre 0 e 100.");
      return;
    }
    setSalvando(true);
    try {
      await onSalvar(membro.id, valor);
      toast.success(`Porcentagem de ${membro.nome} atualizada.`);
    } catch (err) {
      toast.error(err.message || "Erro ao salvar a porcentagem.");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <li className="equipe-card">
      <div className="equipe-card-topo">
        <span className="equipe-avatar" aria-hidden="true">{iniciais(membro.nome)}</span>
        <div className="equipe-identidade">
          <strong>{membro.nome}</strong>
          <span className="equipe-email">{membro.email}</span>
        </div>
      </div>

      <dl className="equipe-numeros">
        <div>
          <dt>Vendas</dt>
          <dd>{vendas.length}</dd>
        </div>
        <div>
          <dt>Faturado</dt>
          <dd>{formatarMoeda(faturado)}</dd>
        </div>
        <div>
          <dt>Colaborador</dt>
          <dd>{divisao.configurado ? formatarMoeda(divisao.colaborador) : "—"}</dd>
        </div>
        <div>
          <dt>Empresa</dt>
          <dd>{divisao.configurado ? formatarMoeda(divisao.dono) : "—"}</dd>
        </div>
      </dl>

      <form className="equipe-comissao" onSubmit={salvar}>
        <label htmlFor={`comissao-${membro.id}`}>Porcentagem do colaborador</label>
        <div className="equipe-comissao-campo">
          <div className="equipe-input-wrapper">
            <input
              id={`comissao-${membro.id}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="100"
              step="0.01"
              placeholder="Não definida"
              value={percentual}
              onChange={(e) => setPercentual(e.target.value)}
            />
            <span aria-hidden="true">%</span>
          </div>
          <button type="submit" className="button equipe-salvar" disabled={!alterado || salvando}>
            {salvando ? "Salvando..." : <><FaCheck aria-hidden="true" /> Salvar</>}
          </button>
        </div>
      </form>
    </li>
  );
};

const Equipe = () => {
  const [equipe, setEquipe] = useState([]);
  const [vendas, setVendas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [periodo, setPeriodo] = useState("semana");

  useEffect(() => {
    const carregar = async () => {
      try {
        const [dadosEquipe, dadosVendas] = await Promise.all([fetchEquipe(), fetchHistorico()]);
        // O admin é o dono do negócio: a equipe lista só quem trabalha para ele.
        setEquipe((dadosEquipe || []).filter((m) => m.tipo_usuario === "colaborador"));
        setVendas(dadosVendas || []);
      } catch (err) {
        toast.error(err.message || "Erro ao carregar a equipe.");
      } finally {
        setLoading(false);
      }
    };
    carregar();
  }, []);

  const vendasDoPeriodo = useMemo(() => filtrarPorPeriodo(vendas, periodo), [vendas, periodo]);

  const vendasPorMembro = useMemo(() => {
    const mapa = new Map();
    vendasDoPeriodo.forEach((venda) => {
      const lista = mapa.get(venda.usuario_id) || [];
      lista.push(venda);
      mapa.set(venda.usuario_id, lista);
    });
    return mapa;
  }, [vendasDoPeriodo]);

  const totais = useMemo(() => {
    return equipe.reduce(
      (acc, membro) => {
        const faturado = (vendasPorMembro.get(membro.id) || []).reduce(
          (soma, v) => soma + Number(v.valor_total || 0),
          0
        );
        const divisao = dividirValor(faturado, membro.percentual_comissao);
        acc.faturado += faturado;
        acc.repasse += divisao.colaborador;
        return acc;
      },
      { faturado: 0, repasse: 0 }
    );
  }, [equipe, vendasPorMembro]);

  const salvarPercentual = async (id, valor) => {
    const atualizado = await atualizarComissaoColaborador(id, valor);
    setEquipe((lista) =>
      lista.map((m) => (m.id === id ? { ...m, percentual_comissao: atualizado.percentual_comissao } : m))
    );
    // As vendas trazem o percentual atual do vendedor; mantém a tela consistente.
    setVendas((lista) =>
      lista.map((v) => (v.usuario_id === id ? { ...v, percentual_comissao: atualizado.percentual_comissao } : v))
    );
  };

  return (
    <div className="equipe-container">
      <header className="equipe-cabecalho">
        <h1><FaUserTie aria-hidden="true" /> Minha equipe</h1>
        <p>
          {equipe.length} {equipe.length === 1 ? "pessoa" : "pessoas"} · {descreverIntervalo(periodo)}
        </p>
      </header>

      <div className="equipe-periodos" role="group" aria-label="Período">
        {PERIODOS_EQUIPE.map((p) => (
          <button
            key={p.id}
            type="button"
            className={`equipe-periodo ${periodo === p.id ? "active" : ""}`}
            aria-pressed={periodo === p.id}
            onClick={() => setPeriodo(p.id)}
          >
            {p.rotulo}
          </button>
        ))}
      </div>

      {loading && <p className="equipe-aviso">Carregando equipe...</p>}

      {!loading && equipe.length === 0 && (
        <div className="equipe-vazio">
          <strong>Nenhum colaborador cadastrado ainda.</strong>
          <p>Cadastre o primeiro em Gerenciar para acompanhar vendas e porcentagem aqui.</p>
          <Link to="/gerenciar" className="button">Cadastrar colaborador</Link>
        </div>
      )}

      {!loading && equipe.length > 0 && (
        <>
          <section className="equipe-totais" aria-label="Totais do período">
            <div>
              <span>Faturado pela equipe</span>
              <strong>{formatarMoeda(totais.faturado)}</strong>
            </div>
            <div>
              <span>A repassar aos colaboradores</span>
              <strong>{formatarMoeda(totais.repasse)}</strong>
            </div>
          </section>

          <ul className="equipe-lista">
            {equipe.map((membro) => (
              <MembroCard
                key={membro.id}
                membro={membro}
                vendas={vendasPorMembro.get(membro.id) || []}
                onSalvar={salvarPercentual}
              />
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default Equipe;
