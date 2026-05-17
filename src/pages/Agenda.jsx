import React, { useState, useEffect } from "react";
import {
  fetchAgendamentos,
  createAgendamento,
  updateAgendamento,
  deleteAgendamento, // Mantém deleteAgendamento
  fetchTiposServicos, // Adicionado para buscar serviços
  fetchColaboradores,
} from "../services/api";
import "./Agenda.css"; // Vamos criar este CSS
import Logo from "../assets/penteado.png"; // Reutilizando seus assets
import AgendamentoModal from "./AgendamentoModal"; // Importado para o topo
import Lucao from "../assets/LucaoLogo.png";

const Agenda = ({ usuario }) => {
  // Estados para dados da API
  const [agendamentos, setAgendamentos] = useState([]);
  const [colaboradores, setColaboradores] = useState([]);
  const [servicosCadastrados, setServicosCadastrados] = useState([]); // Novo estado para serviços
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showAgendamentoModal, setShowAgendamentoModal] = useState(false); // Estado para controlar o modal

  // Estado para edição
  const [editingAgendamento, setEditingAgendamento] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [agendamentosData, colaboradoresData, servicosData] = await Promise.all([
        fetchAgendamentos(),
        fetchColaboradores(),
        fetchTiposServicos(), // Busca os tipos de serviço
      ]);
      setAgendamentos(agendamentosData || []);
      setServicosCadastrados(servicosData || []); // Define os serviços
      setColaboradores(colaboradoresData || []);
    } catch (err) {
      setError(err.message || "Erro ao carregar dados da agenda.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);
  
  // Função para abrir o modal de novo agendamento
  const handleOpenNewAgendamentoModal = () => {
    setEditingAgendamento(null); // Garante que é um novo agendamento
    resetForm(); // Limpa os campos do formulário
    setShowAgendamentoModal(true);
    setError(""); // Limpa mensagens de erro anteriores
    setSuccess(""); // Limpa mensagens de sucesso anteriores
  };

  // Função para abrir o modal de edição
  const handleOpenEditModal = (agendamento) => {
    setEditingAgendamento(agendamento);
    setShowAgendamentoModal(true);
    setError("");
    setSuccess("");
  };

  // Função para fechar o modal
  const handleCloseModal = () => {
    setShowAgendamentoModal(false);
    setEditingAgendamento(null);
    setError("");
    setSuccess("");
  };

  // Função para salvar agendamento (usada pelo modal)
  // O modal passa o ID do agendamento como primeiro argumento se for edição
  const handleSaveAgendamento = async (agendamentoId, agendamentoData) => {
    setLoading(true); // Ativa loading global
    setError("");
    setSuccess("");

    try {
      if (editingAgendamento) {
        await updateAgendamento(editingAgendamento.id, agendamentoData);
        setSuccess("Agendamento atualizado com sucesso!");
      } else {
        await createAgendamento(agendamentoData);
        setSuccess("Agendamento criado com sucesso!");
      }
      await loadData(); // Recarrega os agendamentos após salvar
      handleCloseModal(); // Fecha o modal após sucesso
    } catch (err) {
      setError(err.message || "Erro ao salvar agendamento.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir este agendamento?")) {
      return;
    }
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      await deleteAgendamento(id);
      setSuccess("Agendamento excluído com sucesso!");
      await loadData();
    } catch (err) {
      setError(err.message || "Erro ao excluir agendamento.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    // Este resetForm agora é redundante se o modal gerencia seus próprios estados
    // e o componente pai apenas passa agendamentoToEdit.
  };

  const formatDateTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString("pt-BR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "America/Sao_Paulo",
    });
  };

  return (
    <div className="agenda-container">
      <header className="agenda-header">
        <div className="agenda-header-text">Barbearia Lucão</div>
        <div className="agenda-header-logo">
          <img src={Logo} alt="Logo da Barbearia Lucão" />
        </div>
      </header>

      <main className="agenda-main-card">
        <div className="agenda-top-visuals">
          <span role="img" aria-label="barber pole">
            💈
          </span>
          <div className="agenda-central-logo">
            <img src={Lucao} alt="Lucão" />
          </div>
          <span role="img" aria-label="barber pole">
            💈
          </span>
        </div>

        <div className="agenda-header-controls">
          <h2>Agenda de Horários</h2>
          <button className="button" onClick={handleOpenNewAgendamentoModal}>
            Novo Agendamento
          </button>
        </div>

        {error && <p className="agenda-message agenda-error">{error}</p>}
        {success && <p className="agenda-message agenda-success">{success}</p>}

        <h3>Próximos Agendamentos</h3>
        {loading && <p>Carregando agendamentos...</p>}
        {!loading && agendamentos.length === 0 && (
          <p>Nenhum agendamento encontrado.</p>
        )}
        {!loading && agendamentos.length > 0 && (
          <ul className="agenda-list">
            {agendamentos.map((agendamento) => (
              <li key={agendamento.id} className="agenda-item">
                <div className="agenda-item-details">
                  <strong>Cliente:</strong> {agendamento.cliente_nome || "N/A"}
                  <br />
                  <strong>Barbeiro:</strong> {agendamento.usuarios?.nome || "N/A"}
                  <br />
                  <strong>Serviço:</strong> {agendamento.servico_nome || "N/A"} (
                  {agendamento.servico_duracao_minutos || 0} min)
                  <br />
                  <strong>Início:</strong> {formatDateTime(agendamento.data_hora_inicio)}
                  <br />
                  <strong>Fim:</strong> {formatDateTime(agendamento.data_hora_fim)}
                  <br />
                  <strong>Status:</strong> {agendamento.status}
                  {agendamento.observacoes && (
                    <>
                      <br />
                      <strong>Obs:</strong> {agendamento.observacoes}
                    </>
                  )}
                </div>
                <div className="agenda-item-actions">
                  <button
                    className="button agenda-edit-button"
                    onClick={() => handleOpenEditModal(agendamento)}
                    disabled={loading}
                  >
                    Editar
                  </button>
                  <button
                    className="button agenda-delete-button"
                    onClick={() => handleDelete(agendamento.id)}
                    disabled={loading}
                  >
                    Excluir
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>

      {showAgendamentoModal && (
        <AgendamentoModal
          agendamentoToEdit={editingAgendamento}
          colaboradores={colaboradores}
          servicosCadastrados={servicosCadastrados} // Passar os serviços cadastrados
          onSave={handleSaveAgendamento}
          onCancel={handleCloseModal}
          loading={loading}
          error={error} // Passa o erro para o modal
          success={success} // Passa o sucesso para o modal
        />
      )}
    </div>
  );
};
export default Agenda;