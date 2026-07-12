import React, { useState, useEffect, useContext } from "react";
import {
  fetchAgendamentos,
  createAgendamento,
  updateAgendamento,
  deleteAgendamento,
  fetchTiposServicos,
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
  const [loading, setLoading] = useState(true);
  const [showAgendamentoModal, setShowAgendamentoModal] = useState(false);

  // Dia selecionado no calendário (começa em hoje)
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Estado para edição
  const [editingAgendamento, setEditingAgendamento] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [agendamentosData, servicosData] = await Promise.all([
        fetchAgendamentos(),
        fetchTiposServicos(),
      ]);
      setAgendamentos(agendamentosData || []);
      setServicosCadastrados(servicosData || []);
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
      if (editingAgendamento) {
        await updateAgendamento(editingAgendamento.id, agendamentoData);
        toast.success("Agendamento atualizado com sucesso!");
      } else {
        await createAgendamento(agendamentoData);
        toast.success("Agendamento criado com sucesso!");
      }
      await loadData();
      handleCloseModal();
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
                    </div>
                    <div className="agenda-card-info">
                      <span className="agenda-card-cliente">
                        {agendamento.cliente_nome || "Cliente"}
                      </span>
                      <span className="agenda-card-servico">
                        {agendamento.servico_nome || "Serviço"}
                        {agendamento.servico_duracao_minutos
                          ? ` · ${agendamento.servico_duracao_minutos} min`
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
          onSave={handleSaveAgendamento}
          onCancel={handleCloseModal}
          loading={loading}
        />
      )}
    </div>
  );
};

export default Agenda;
