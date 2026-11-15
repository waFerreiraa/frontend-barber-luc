// src/pages/RegistrarVenda.jsx

import Logo from "../../assets/penteado.png";
import Cabelo from "../../assets/mulher.png";
import Lucao from "../../assets/LucaoLogo.png";
import React, { useState, useEffect, useContext, useMemo } from "react";
import {
  fetchClientes,
  createCliente,
  fetchTiposServicos,
  createVenda,
} from "../../services/api";
import { toast } from 'react-toastify';
import { useNavigate } from "react-router-dom";
import { FaPlus } from "react-icons/fa";
import "./RegistrarVenda.css";
import { ThemeContext } from "../../contexts/ThemeContext";

const FORMAS_PAGAMENTO = [
  { valor: "Pix", rotulo: "Pix" },
  { valor: "Dinheiro", rotulo: "Dinheiro" },
  { valor: "Credito", rotulo: "Crédito" },
  { valor: "Debito", rotulo: "Débito" },
];

const formatarReais = (valor) =>
  Number(valor || 0).toLocaleString("pt-br", { style: "currency", currency: "BRL" });

const RegistrarVenda = ({ usuario }) => {
  const navigate = useNavigate();
  const { tema } = useContext(ThemeContext);
  const isSalao = tema === 'salao';
  const emojiLateral = isSalao ? '💅' : '💈';

  const [clientes, setClientes] = useState([]);
  const [servicos, setServicos] = useState([]);
  const [nomeCliente, setNomeCliente] = useState("");
  const [itens, setItens] = useState([]);
  const [totalEmCentavos, setTotalEmCentavos] = useState(0);
  const [abaAtiva, setAbaAtiva] = useState("cortes");
  const [formaPagamento, setFormaPagamento] = useState(""); // Novo estado para a forma de pagamento
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    try {
      const [clientesData, servicosData] = await Promise.all([
        fetchClientes(),
        fetchTiposServicos(),
      ]);
      setClientes(clientesData);
      setServicos(servicosData);
    } catch (err) {
      toast.error(err.message);
    }
  };

  useEffect(() => {
    loadData();
  }, []); // Este useEffect carrega dados que não dependem de props, então o array vazio está correto.

  useEffect(() => {
    const novoTotal = itens.reduce(
      (acc, item) => acc + item.valor_em_centavos,
      0
    );
    setTotalEmCentavos(novoTotal);
  }, [itens]);

  // Quantas vezes cada serviço já foi adicionado (mostrado como "2×" no próprio serviço)
  const quantidadePorServico = useMemo(() => {
    const contagem = {};
    itens.forEach((item) => {
      contagem[item.servico_id] = (contagem[item.servico_id] || 0) + 1;
    });
    return contagem;
  }, [itens]);

  const handleAddServico = (servico) => {
    const valorEmReais = parseFloat(servico.valor_padrao);
    const valorEmCentavos = Math.round(valorEmReais * 100);

    setItens([
      ...itens,
      {
        servico_id: servico.id,
        nome: servico.nome,
        valor_em_centavos: valorEmCentavos,
      },
    ]);
  };

  const handleRemoveServico = (index) => {
    const novaLista = [...itens];
    novaLista.splice(index, 1);
    setItens(novaLista);
  };

  const getOrCreateCliente = async () => {
    const nomeLimpo = nomeCliente.trim();
    if (!nomeLimpo) throw new Error("O nome do cliente não pode estar vazio.");

    const clienteExistente = clientes.find(
      (c) => c.nome.toLowerCase() === nomeLimpo.toLowerCase()
    );
    if (clienteExistente) return clienteExistente;

    const novoCliente = await createCliente({ nome: nomeLimpo, telefone: "" });
    loadData();
    return novoCliente;
  };

  const handleSubmit = async () => {
    // Evita cliques múltiplos
    if (loading) return; // 👈 Bloqueia novas execuções

    setLoading(true);
    // Remove formaPagamento da validação obrigatória
    if (!nomeCliente || itens.length === 0) {
      toast.warn("Digite o nome do cliente e adicione pelo menos um serviço.");
      setLoading(false);
      return;
    }

    try {
      const cliente = await getOrCreateCliente();
      const valorTotalEmReais = totalEmCentavos / 100;

      const vendaData = {
        cliente_id: cliente.id,
        valor_total: valorTotalEmReais,
        itens: itens.map((item) => ({
          servico_id: item.servico_id,
          valor_cobrado: item.valor_em_centavos / 100,
        })),
        forma_pagamento: formaPagamento, // Incluindo a forma de pagamento
      };

      await createVenda(vendaData);

      toast.success(`Venda para "${cliente.nome}" registrada com sucesso!`);
      setNomeCliente("");
      setItens([]);
      setFormaPagamento(""); // Limpa a forma de pagamento após o sucesso
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Erro ao registrar a venda.");
    } finally {
      setLoading(false);
    }
  };

  const renderCortes = () => (
    <>
      <section className="rv-client-section">
        <h3>Cliente</h3>
        <input
          type="text"
          className="rv-client-input"
          value={nomeCliente}
          onChange={(e) => setNomeCliente(e.target.value)}
          placeholder="Nome do Cliente"
          list="rv-clientes-lista"
          autoComplete="off"
          enterKeyHint="next"
          required
        />
        <datalist id="rv-clientes-lista">
          {clientes.map((cliente) => (
            <option key={cliente.id} value={cliente.nome} />
          ))}
        </datalist>
      </section>

      <section className="rv-services-section">
        <h3>Corte Requisitado</h3>
        <div className="rv-services-list">
          {servicos.map((servico) => {
            const quantidade = quantidadePorServico[servico.id] || 0;
            return (
            <div
              key={servico.id}
              className="rv-service-item"
              role="button"
              tabIndex={0}
              onClick={() => handleAddServico(servico)} // Clicar no item adiciona o serviço
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleAddServico(servico);
                }
              }}
            >
              <span className="rv-service-name">
                {servico.nome}
                {quantidade > 0 && <span className="rv-service-qtd">{quantidade}×</span>}
              </span>
              <div className="rv-service-right">
                <span className="rv-service-price">
                  {parseFloat(servico.valor_padrao).toLocaleString("pt-br", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </span>
                <div className="rv-add-button">
                  <FaPlus />
                </div>
              </div>
            </div>
            );
          })}
        </div>
      </section>

      {/* Lista de serviços adicionados */}
      <section className="rv-itens-adicionados">
        <h3>Serviços Adicionados</h3>
        {itens.length === 0 && <p>Nenhum serviço adicionado.</p>}
        <ul className="rv-itens-lista">
          {itens.map((item, index) => (
            <li key={index} className="rv-item-adicionado">
              <div className="rv-item-details">
                <span className="rv-item-nome">{item.nome}</span>
                <span className="rv-item-valor">
                  {(item.valor_em_centavos / 100).toLocaleString("pt-br", { style: "currency", currency: "BRL" })}
                </span>
              </div>
              <button
                className="rv-remove-button"
                aria-label={`Remover ${item.nome}`}
                onClick={() => handleRemoveServico(index)}
              >
                &times;
              </button>
            </li>
          ))}
        </ul>
      </section>

      {/* Campo para a Forma de Pagamento */}
      <section className="rv-payment-method-section">
        <h3>Forma de Pagamento</h3>
        <div className="rv-pagamento-opcoes" role="group" aria-label="Forma de pagamento">
          {FORMAS_PAGAMENTO.map(({ valor, rotulo }) => (
            <button
              key={valor}
              type="button"
              className={`rv-pagamento-opcao ${formaPagamento === valor ? "active" : ""}`}
              aria-pressed={formaPagamento === valor}
              onClick={() => setFormaPagamento(formaPagamento === valor ? "" : valor)}
            >
              {rotulo}
            </button>
          ))}
        </div>
      </section>
      <div className="rv-finalizar-bar">
        <div className="rv-finalizar-resumo" aria-live="polite">
          <span>{itens.length} {itens.length === 1 ? "item" : "itens"}</span>
          <strong>{formatarReais(totalEmCentavos / 100)}</strong>
        </div>
        <button
          className="rv-submit-button"
          onClick={handleSubmit}
          disabled={loading || !nomeCliente || itens.length === 0} // Remove !formaPagamento do disabled
        >
          {loading ? <span className="spinner"></span> : "Finalizar venda"}
        </button>
      </div>
    </>
  );

  const headerLogo = isSalao ? Cabelo : Logo;

  return (
    <div className="rv-container">
      <header className="rv-header">
        <div className="rv-header-text">
          {usuario?.configuracoes?.nome_exibicao || (isSalao ? "Salão de Beleza" : "Barbearia Lucão")}
        </div>
        <div className="rv-header-logo">
          <img src={headerLogo} alt={isSalao ? "Logo fixa do salão" : "Logo fixa da barbearia"} />
        </div>
      </header>

      <main className="rv-main-card">

        {/* Navegação por abas */}
        <div className="rv-tabs">
          <div
            className={`rv-tab-item ${abaAtiva === "cortes" ? "active" : ""}`}
            onClick={() => setAbaAtiva("cortes")}
          >
            Cortes
          </div>
          <div
            className="rv-tab-item"
            onClick={() => navigate("/dashboard")}
          >
            Soma (
            {(totalEmCentavos / 100).toLocaleString("pt-br", {
              style: "currency",
              currency: "BRL",
            })}
            )
          </div>
        </div>

        {/* Conteúdo baseado na aba ativa */}
        {abaAtiva === "cortes" && renderCortes()}

      </main>
    </div>
  );
};

export default RegistrarVenda;
