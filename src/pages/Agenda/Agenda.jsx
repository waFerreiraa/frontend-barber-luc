import React, { useState, useEffect, useContext } from "react";
import {
  fetchAgendamentos,
  createAgendamento,
  updateAgendamento,
  deleteAgendamento,
  fetchTiposServicos,
  fetchClientes,
  createCliente,
  createVenda,
} from "../../services/api";
import { toast } from 'react-toastify';
import "./Agenda.css";
import AgendamentoModal from "../Agendamento/AgendamentoModal";
import Calendario from "./Calendario";
import Lucao from "../../assets/LucaoLogo.png";
import { ThemeContext } from "../../contexts/ThemeContext";
import { FaPlus, FaEdit, FaTrash, FaClock, FaUser } from "react-icons/fa";

// Gera uma chave "YYYY-MM-DD" a partir de uma data (no fuso local)
const getDateKey = (date) => {
  const ano = date.getFullYear();
  const mes = String(date.getMonth() + 1).padStart(2, "0");
  const dia = String(date.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
};

const Agenda = ({ usuario }) => {
  const { tema } = useContext(ThemeContext);
  const isSalao = tema === 'salao';

  // Estados para dados da API
  const [agendamentos, setAgendamentos] = useState([]);
  const [servicosCadastrados, setServicosCadastrados] = useState([]);
  const [clientesCadastrados, setClientesCadastrados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAgendamentoModal, setShowAgendamentoModal] = useState(false);

  // Estados para modal de venda do agendamento concluído
  const [showVendaModal, setShowVendaModal] = useState(false);
  const [agendamentoPendente, setAgendamentoPendente] = useState(null);
  const [valorVenda, setValorVenda] = useState("");
  const [formaPagamento, setFormaPagamento] = useState("");

  // Dia selecionado no calendário (começa em hoje)
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Estado para edição
  const [editingAgendamento, setEditingAgendamento] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [agendamentosData, servicosData, clientesData] = await Promise.all([
        fetchAgendamentos(),
        fetchTiposServicos(),
        fetchClientes(),
      ]);
      setAgendamentos(agendamentosData || []);
      setServicosCadastrados(servicosData || []);
      setClientesCadastrados(clientesData || []);
    } catch (err) {
      toast.error(err.message || "Erro ao carregar dados da agenda.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenNewAgendamentoModal = () => {
    setEditingAgendamento(null);
    setShowAgendamentoModal(true);
  };

  const handleOpenEditModal = (agendamento) => {
    setEditingAgendamento(agendamento);
    setShowAgendamentoModal(true);
  };

  const handleCloseModal = () => {
    setShowAgendamentoModal(false);
    setEditingAgendamento(null);
  };

  const handleSaveAgendamento = async (agendamentoId, agendamentoData) => {
    setLoading(true);
    try {
      // Se está mudando para "concluido" e o agendamento anterior não era concluido
      const estaFicandoConcluido = 
        agendamentoData.status === "concluido" &&
        editingAgendamento &&
        editingAgendamento.status !== "concluido";

      if (estaFicandoConcluido) {
        // Salva o agendamento primeiro
        await updateAgendamento(editingAgendamento.id, agendamentoData);
        
        // Buscar o valor total dos serviços
        // servico_nome vem como "Unha, Cabelo" -> precisa somar todos
        const agendamentoAtualizado = { ...editingAgendamento, ...agendamentoData };
        const nomesServicos = (agendamentoAtualizado.servico_nome || "")
          .split(",")
          .map((n) => n.trim())
          .filter((n) => n.length > 0);
        
        const valorTotal = nomesServicos.reduce((soma, nomeServico) => {
          const servicoEncontrado = servicosCadastrados.find(
            (s) => s.nome.toLowerCase() === nomeServico.toLowerCase()
          );
          return soma + (servicoEncontrado?.valor_padrao || 0);
        }, 0);
        
        // Abre o modal de venda com o valor total dos serviços
        setAgendamentoPendente(agendamentoAtualizado);
        setValorVenda(valorTotal.toString());
        setFormaPagamento("");
        setShowVendaModal(true);
        handleCloseModal();
        await loadData();
      } else {
        if (editingAgendamento) {
          await updateAgendamento(editingAgendamento.id, agendamentoData);
          toast.success("Agendamento atualizado com sucesso!");
        } else {
          await createAgendamento(agendamentoData);
          toast.success("Agendamento criado com sucesso!");
        }
        await loadData();
        handleCloseModal();
      }
    } catch (err) {
      toast.error(err.message || "Erro ao salvar agendamento.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir este agendamento?")) {
      return;
    }
    setLoading(true);
    try {
      await deleteAgendamento(id);
      toast.success("Agendamento excluído com sucesso!");
      await loadData();
    } catch (err) {
      toast.error(err.message || "Erro ao excluir agendamento.");
    } finally {
      setLoading(false);
    }
  };

  // Fechar modal de venda
  const handleCloseVendaModal = () => {
    setShowVendaModal(false);
    setAgendamentoPendente(null);
    setValorVenda("");
    setFormaPagamento("");
  };

  // Registrar venda do agendamento concluído
  const handleRegistrarVendaDoAgendamento = async () => {
    if (!valorVenda || !formaPagamento) {
      toast.warn("Preencha o valor e a forma de pagamento.");
      return;
    }

    if (!agendamentoPendente) return;

    try {
      setLoading(true);

      // Usa o cliente informado no agendamento. Se ele ainda não estiver
      // cadastrado, cria o cadastro automaticamente antes de registrar a venda.
      const nomeCliente = agendamentoPendente.cliente_nome?.trim();
      if (!nomeCliente) {
        throw new Error("O agendamento não possui nome de cliente.");
      }

      let cliente = clientesCadastrados.find(
        (item) => item.nome?.trim().toLowerCase() === nomeCliente.toLowerCase()
      );

      if (!cliente) {
        cliente = await createCliente({ nome: nomeCliente, telefone: "" });
        setClientesCadastrados((clientes) => [...clientes, cliente]);
      }

      const nomesServicos = (agendamentoPendente.servico_nome || "")
        .split(",")
        .map((nome) => nome.trim())
        .filter(Boolean);

      const itens = nomesServicos.map((nomeServico) => {
        const servico = servicosCadastrados.find(
          (item) => item.nome.toLowerCase() === nomeServico.toLowerCase()
        );

        if (!servico) {
          throw new Error(`Serviço "${nomeServico}" não encontrado.`);
        }

        return {
          servico_id: servico.id,
          valor_cobrado: Number(servico.valor_padrao),
        };
      });

      const vendaData = {
        cliente_id: cliente.id,
        valor_total: Number(valorVenda),
        itens,
        forma_pagamento: formaPagamento,
      };

      await createVenda(vendaData);
      toast.success("Venda registrada com sucesso!");
      handleCloseVendaModal();
      await loadData();
    } catch (err) {
      toast.error(err.message || "Erro ao registrar venda.");
    } finally {
      setLoading(false);
    }
  };

  // Pular o registro de venda (só marca como concluído)
  const handlePularRegistroVenda = () => {
    handleCloseVendaModal();
    toast.info("Agendamento marcado como concluído sem registrar venda.");
  };

  const formatDuracao = (duracaoEmMinutos) => {
    const minutos = Number(duracaoEmMinutos);
    if (!Number.isFinite(minutos) || minutos <= 0) return "";

    if (minutos < 60) return `${minutos} min`;

    const horas = Math.floor(minutos / 60);
    const minutosRestantes = String(minutos % 60).padStart(2, "0");
    return `${horas}:${minutosRestantes}h`;
  };

  // Mostra apenas a hora (HH:MM) do agendamento
  const formatHora = (isoString) => {
    return new Date(isoString).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "America/Sao_Paulo",
    });
  };

  // Título amigável do dia selecionado
  const formatDiaSelecionado = (date) => {
    return date.toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
    });
  };

  // Filtra os agendamentos do dia selecionado e ordena por horário
  const selectedKey = getDateKey(selectedDate);
  const agendamentosDoDia = agendamentos
    .filter((ag) => getDateKey(new Date(ag.data_hora_inicio)) === selectedKey)
    .sort(
      (a, b) =>
        new Date(a.data_hora_inicio) - new Date(b.data_hora_inicio),
    );

  // Cor de fundo do badge de status
  const statusClass = (status) => {
    switch (status) {
      case "confirmado":
        return "status-confirmado";
      case "cancelado":
        return "status-cancelado";
      case "concluido":
        return "status-concluido";
      default:
        return "status-agendado";
    }
  };

  return (
    <div className={`agenda-container ${isSalao ? "agenda-salao" : ""}`}>
      <main className="agenda-main-card">
        <div className="agenda-top">
          <div className="agenda-central-logo">
            <img src={usuario?.configuracoes?.logo_url || Lucao} alt="Logo" />
          </div>
          <button className="button agenda-novo-btn" onClick={handleOpenNewAgendamentoModal}>
            <FaPlus /> Novo Agendamento
          </button>
        </div>

        <div className="agenda-layout">
          {/* Coluna esquerda: calendário */}
          <div className="agenda-coluna-calendario">
            <Calendario
              agendamentos={agendamentos}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
            />
          </div>

          {/* Coluna direita: agendamentos do dia */}
          <div className="agenda-coluna-lista">
            <h3 className="agenda-dia-titulo">
              {formatDiaSelecionado(selectedDate)}
            </h3>

            {loading && <p className="agenda-info">Carregando...</p>}

            {!loading && agendamentosDoDia.length === 0 && (
              <p className="agenda-info">Nenhum agendamento neste dia.</p>
            )}

            {!loading && agendamentosDoDia.length > 0 && (
              <ul className="agenda-list">
                {agendamentosDoDia.map((agendamento) => (
                  <li key={agendamento.id} className="agenda-card">
                    <div className="agenda-card-hora">
                      <FaClock /> {formatHora(agendamento.data_hora_inicio)}
                      {isSalao && agendamento.data_hora_fim
                        ? ` às ${formatHora(agendamento.data_hora_fim)}`
                        : ""}
                    </div>
                    <div className="agenda-card-info">
                      <span className="agenda-card-cliente">
                        {agendamento.cliente_nome || "Cliente"}
                      </span>
                      <span className="agenda-card-servico">
                        {agendamento.servico_nome || "Serviço"}
                        {agendamento.servico_duracao_minutos
                          ? ` · ${formatDuracao(agendamento.servico_duracao_minutos)}`
                          : ""}
                      </span>
                      <span className="agenda-card-barbeiro">
                        <FaUser /> {agendamento.usuarios?.nome || "N/A"}
                      </span>
                      {agendamento.observacoes && (
                        <span className="agenda-card-obs">
                          {agendamento.observacoes}
                        </span>
                      )}
                    </div>
                    <div className="agenda-card-lateral">
                      <span
                        className={`agenda-status ${statusClass(agendamento.status)}`}
                      >
                        {agendamento.status}
                      </span>
                      <div className="agenda-card-actions">
                        <button
                          className="agenda-icon-btn editar"
                          onClick={() => handleOpenEditModal(agendamento)}
                          disabled={loading}
                          title="Editar"
                        >
                          <FaEdit />
                        </button>
                        <button
                          className="agenda-icon-btn excluir"
                          onClick={() => handleDelete(agendamento.id)}
                          disabled={loading}
                          title="Excluir"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </main>

      {showAgendamentoModal && (
        <AgendamentoModal
          agendamentoToEdit={editingAgendamento}
          servicosCadastrados={servicosCadastrados}
          isSalao={isSalao}
          onSave={handleSaveAgendamento}
          onCancel={handleCloseModal}
          loading={loading}
        />
      )}

      {/* Modal para registrar venda do agendamento concluído */}
      {showVendaModal && agendamentoPendente && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <h2>Registrar Venda - {agendamentoPendente.cliente_nome}</h2>
            <p className="modal-info">
              <strong>Serviço:</strong> {agendamentoPendente.servico_nome}
            </p>
            <p className="modal-info">
              <strong>Duração:</strong> {formatDuracao(agendamentoPendente.servico_duracao_minutos)}
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleRegistrarVendaDoAgendamento();
              }}
            >
              <div className="form-group">
                <label htmlFor="valorVenda">Valor da Venda:</label>
                <input
                  type="number"
                  id="valorVenda"
                  step="0.01"
                  value={valorVenda}
                  onChange={(e) => setValorVenda(e.target.value)}
                  placeholder="Ex: 50.00"
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="pagamentoVenda">Forma de Pagamento:</label>
                <select
                  id="pagamentoVenda"
                  value={formaPagamento}
                  onChange={(e) => setFormaPagamento(e.target.value)}
                  required
                  disabled={loading}
                >
                  <option value="">Selecione...</option>
                  <option value="Pix">Pix</option>
                  <option value="Dinheiro">Dinheiro</option>
                  <option value="Credito">Crédito</option>
                  <option value="Debito">Débito</option>
                </select>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="button modal-cancel-button"
                  onClick={handlePularRegistroVenda}
                  disabled={loading}
                >
                  Pular
                </button>
                <button
                  type="submit"
                  className="button"
                  disabled={loading}
                >
                  {loading ? "Registrando..." : "Registrar Venda"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Agenda;
