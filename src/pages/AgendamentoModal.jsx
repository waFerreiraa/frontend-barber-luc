import React, { useState, useEffect } from "react";
import "./AgendamentoModal.css"; // CSS para o modal

const AgendamentoModal = ({
  agendamentoToEdit,
  colaboradores,
  servicosCadastrados, // Lista de tipos_servicos
  onSave,
  onCancel,
  loading,
  error,
  success,
}) => {
  const [formClienteNome, setFormClienteNome] = useState("");
  const [formColaboradorId, setFormColaboradorId] = useState("");
  const [formServicoNome, setFormServicoNome] = useState("");
  const [formServicoDuracao, setFormServicoDuracao] = useState("");
  const [formDataHoraInicio, setFormDataHoraInicio] = useState("");
  const [formStatus, setFormStatus] = useState("agendado"); // Novo campo de status
  const [formObservacoes, setFormObservacoes] = useState("");

  const statusOptions = ["agendado", "confirmado", "cancelado", "concluido"];

  useEffect(() => {
    if (agendamentoToEdit) {
      setFormClienteNome(agendamentoToEdit.cliente_nome || "");
      setFormColaboradorId(agendamentoToEdit.usuarios?.id || "");
      setFormServicoNome(agendamentoToEdit.servico_nome || "");
      setFormServicoDuracao(agendamentoToEdit.servico_duracao_minutos || "");
      setFormDataHoraInicio(
        new Date(agendamentoToEdit.data_hora_inicio).toISOString().slice(0, 16),
      );
      setFormStatus(agendamentoToEdit.status || "agendado"); // Preenche o status
      setFormObservacoes(agendamentoToEdit.observacoes || "");
    } else {
      // Resetar formulário para novo agendamento
      setFormClienteNome("");
      setFormColaboradorId("");
      setFormServicoNome("");
      setFormServicoDuracao("");
      setFormDataHoraInicio("");
      setFormStatus("agendado");
      setFormObservacoes("");
    }
  }, [agendamentoToEdit]);

  const handleServicoChange = (e) => {
    const selectedServicoId = e.target.value;
    if (selectedServicoId) {
      const servico = servicosCadastrados.find(
        (s) => s.id === Number(selectedServicoId),
      );
      if (servico) {
        setFormServicoNome(servico.nome);
        setFormServicoDuracao(servico.duracao_minutos);
      }
    } else {
      setFormServicoNome("");
      setFormServicoDuracao("");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (
      !formClienteNome ||
      !formColaboradorId ||
      !formServicoNome ||
      !formServicoDuracao ||
      !formDataHoraInicio ||
      !formStatus
    ) {
      // O erro será exibido pelo componente pai (Agenda.jsx)
      return;
    }

    const agendamentoData = {
      cliente_nome: formClienteNome,
      usuario_id: formColaboradorId,
      servico_nome: formServicoNome,
      servico_duracao_minutos: Number(formServicoDuracao),
      data_hora_inicio: formDataHoraInicio,
      status: formStatus,
      observacoes: formObservacoes,
    };
    onSave(agendamentoToEdit?.id, agendamentoData);
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content agendamento-modal-content">
        <h2>{agendamentoToEdit ? "Editar Agendamento" : "Novo Agendamento"}</h2>
        {error && <p className="agenda-message agenda-error">{error}</p>}
        {success && <p className="agenda-message agenda-success">{success}</p>}

        <form onSubmit={handleSubmit} className="agenda-form">
          <div className="form-group">
            <label htmlFor="clienteNome">Nome do Cliente:</label>
            <input
              type="text"
              id="clienteNome"
              placeholder="Nome do Cliente"
              value={formClienteNome}
              onChange={(e) => setFormClienteNome(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="colaborador">Barbeiro:</label>
            <select
              id="colaborador"
              value={formColaboradorId}
              onChange={(e) => setFormColaboradorId(e.target.value)}
              required
              disabled={loading}
            >
              <option value="">Selecione um barbeiro</option>
              {colaboradores.map((colab) => (
                <option key={colab.id} value={colab.id}>
                  {colab.nome}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="servicoCadastrado">Serviço Cadastrado:</label>
            <select
              id="servicoCadastrado"
              onChange={handleServicoChange}
              value={
                servicosCadastrados.find((s) => s.nome === formServicoNome)
                  ?.id || ""
              } // Seleciona o ID do serviço se o nome corresponder
              disabled={loading}
            >
              <option value="">Selecione um serviço (opcional)</option>
              {servicosCadastrados.map((serv) => (
                <option key={serv.id} value={serv.id}>
                  {serv.nome} ({serv.duracao_minutos} min)
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="servicoNome">Nome do Serviço (manual):</label>
            <input
              type="text"
              id="servicoNome"
              placeholder="Ex: Corte de Cabelo"
              value={formServicoNome}
              onChange={(e) => setFormServicoNome(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="servicoDuracao">Duração do Serviço (minutos):</label>
            <input
              type="number"
              id="servicoDuracao"
              placeholder="Ex: 30, 60"
              value={formServicoDuracao}
              onChange={(e) => setFormServicoDuracao(e.target.value)}
              required
              min="1"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="dataHoraInicio">Data e Hora de Início:</label>
            <input
              type="datetime-local"
              id="dataHoraInicio"
              value={formDataHoraInicio}
              onChange={(e) => setFormDataHoraInicio(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="status">Status:</label>
            <select
              id="status"
              value={formStatus}
              onChange={(e) => setFormStatus(e.target.value)}
              required
              disabled={loading}
            >
              {statusOptions.map((statusOpt) => (
                <option key={statusOpt} value={statusOpt}>
                  {statusOpt.charAt(0).toUpperCase() + statusOpt.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="observacoes">Observações (opcional):</label>
            <textarea
              id="observacoes"
              value={formObservacoes}
              onChange={(e) => setFormObservacoes(e.target.value)}
              rows="3"
              disabled={loading}
            ></textarea>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="button modal-cancel-button"
              onClick={onCancel}
              disabled={loading}
            >
              Cancelar
            </button>
            <button type="submit" className="button" disabled={loading}>
              {loading ? "Salvando..." : agendamentoToEdit ? "Atualizar" : "Agendar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AgendamentoModal;