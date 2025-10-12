// src/pages/RegistrarVenda.jsx

import Logo from "../assets/penteado.png";
import Lucao from "../assets/LucaoLogo.png";
import React, { useState, useEffect } from "react";
import {
  fetchClientes,
  createCliente,
  fetchTiposServicos,
  createVenda,
} from "../services/api";
import { GiBeard, GiScissors, GiRazor, GiHairStrands } from "react-icons/gi";
import { FaPlus, FaHistory } from "react-icons/fa";
import "./RegistrarVenda.css";

const RegistrarVenda = ({ setCurrentPage }) => {
  const [clientes, setClientes] = useState([]);
  const [servicos, setServicos] = useState([]);
  const [nomeCliente, setNomeCliente] = useState("");
  const [itens, setItens] = useState([]);
  const [totalEmCentavos, setTotalEmCentavos] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [abaAtiva, setAbaAtiva] = useState("cortes");
  const [loading, setLoading] = useState(false);

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

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const novoTotal = itens.reduce(
      (acc, item) => acc + item.valor_em_centavos,
      0
    );
    setTotalEmCentavos(novoTotal);
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

    setError("");
    setSuccess("");
    setLoading(true);

    if (!nomeCliente || itens.length === 0) {
      setError("Digite o nome do cliente e adicione pelo menos um serviço.");
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
      };

      await createVenda(vendaData);

      setSuccess(`Venda para "${cliente.nome}" registrada com sucesso!`);
      setNomeCliente("");
      setItens([]);
      console.log("venda finalizada ✅");
    } catch (err) {
      console.error(err);
      setError(err.message || "Erro ao registrar a venda.");
    } finally {
      setLoading(false);
    }
  };

  const getServiceIcon = (serviceName) => {
    const name = serviceName.toLowerCase();
    if (name.includes("barba") && name.includes("corte")) return <GiRazor />;
    if (name.includes("barba")) return <GiBeard />;
    if (name.includes("corte")) return <GiScissors />;
    return <GiHairStrands />;
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
          required
        />
      </section>

      <section className="rv-services-section">
        <h3>Corte Requisitado</h3>
        <div className="rv-services-list">
          {servicos.map((servico) => (
            <div
              key={servico.id}
              className="rv-service-item"
              onClick={() => handleAddServico(servico)}
            >
              <div className="rv-service-left">
                <div className="rv-service-icon">
                  {getServiceIcon(servico.nome)}
                </div>
                <span className="rv-service-name">{servico.nome}</span>
              </div>
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
          ))}
        </div>
      </section>

      {/* Lista de serviços adicionados */}
      <section className="rv-itens-adicionados">
        <h3>Serviços Adicionados</h3>
        {itens.length === 0 && <p>Nenhum serviço adicionado.</p>}
        <ul>
          {itens.map((item, index) => (
            <li key={index} className="rv-item-adicionado">
              {item.nome} -{" "}
              {(item.valor_em_centavos / 100).toLocaleString("pt-br", {
                style: "currency",
                currency: "BRL",
              })}
              <button
                className="rv-remove-button"
                onClick={() => handleRemoveServico(index)}
              >
                ❌
              </button>
            </li>
          ))}
        </ul>
      </section>

      <button
        className="rv-submit-button"
        onClick={handleSubmit}
        disabled={loading || !nomeCliente || itens.length === 0} // 👈 Impede clique repetido
      >
        {loading ? <span className="spinner"></span> : "Finalizar venda"}
      </button>
    </>
  );

  return (
    <div className="rv-container">
      <header className="rv-header">
        <div className="rv-header-text">Barbearia Lucão</div>
        <div className="rv-header-logo">
          <img src={Logo} alt="Logo da Barbearia Lucão" />
        </div>
      </header>

      <main className="rv-main-card">
        <div className="rv-top-visuals">
          <span role="img" aria-label="barber pole">
            💈
          </span>
          <div className="rv-central-logo">
            <img src={Lucao} alt="" />
          </div>
          <span role="img" aria-label="barber pole">
            💈
          </span>
        </div>

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
            onClick={() => setCurrentPage("dashboard")}
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

        {error && (
          <p style={{ color: "red", marginTop: "1rem", textAlign: "center" }}>
            {error}
          </p>
        )}
        {success && (
          <p style={{ color: "green", marginTop: "1rem", textAlign: "center" }}>
            {success}
          </p>
        )}
      </main>
    </div>
  );
};

export default RegistrarVenda;
