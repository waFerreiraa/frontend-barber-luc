import React, { useState, useEffect } from "react";
import "./AgendamentoModal.css"; // CSS para o modal

const AgendamentoModal = ({
  agendamentoToEdit,
  servicosCadastrados, // Lista de tipos_servicos
  onSave,
  onCancel,
  loading,
  error,
  success,
}) => {
  const [formClienteNome, setFormClienteNome] = useState("");
  const [servicosSelecionados, setServicosSelecionados] = useState([]); // Lista de serviços do agendamento
  const [servicoSelecionadoId, setServicoSelecionadoId] = useState(""); // Valor atual do dropdown
  const [formServicoDuracao, setFormServicoDuracao] = useState("");
  const [formDataHoraInicio, setFormDataHoraInicio] = useState("");
  const [formStatus, setFormStatus] = useState("agendado"); // Novo campo de status
  const [formObservacoes, setFormObservacoes] = useState("");

  const statusOptions = ["agendado", "confirmado", "cancelado", "concluido"];

  useEffect(() => {
    if (agendamentoToEdit) {
      setFormClienteNome(agendamentoToEdit.cliente_nome || "");
      // servico_nome vem como "Unha, Cabelo" -> transforma em lista
      const nomes = (agendamentoToEdit.servico_nome || "")
        .split(",")
        .map((n) => n.trim())
        .filter((n) => n.length > 0);
      setServicosSelecionados(nomes);
      setFormServicoDuracao(agendamentoToEdit.servico_duracao_minutos || "");
      setFormDataHoraInicio(
        new Date(agendamentoToEdit.data_hora_inicio).toISOString().slice(0, 16),
      );
      setFormStatus(agendamentoToEdit.status || "agendado"); // Preenche o status
      setFormObservacoes(agendamentoToEdit.observacoes || "");
    } else {
      // Resetar formulário para novo agendamento
      setFormClienteNome("");
      setServicosSelecionados([]);
      setFormServicoDuracao("");
      setFormDataHoraInicio("");
      setFormStatus("agendado");
      setFormObservacoes("");
    }
    setServicoSelecionadoId("");
  }, [agendamentoToEdit]);

  // Adiciona o serviço selecionado no dropdown à lista
  const handleAddServico = () => {
    if (!servicoSelecionadoId) return;
    const servico = servicosCadastrados.find(
      (s) => s.id === Number(servicoSelecionadoId),
    );
    if (!servico) return;

    // Evita duplicados
    if (servicosSelecionados.includes(servico.nome)) {
      setServicoSelecionadoId("");
      return;
    }

    setServicosSelecionados([...servicosSelecionados, servico.nome]);
    setServicoSelecionadoId(""); // Reseta o dropdown
  };

  // Remove um serviço da lista pelo índice
  const handleRemoveServico = (index) => {
    const novaLista = [...servicosSelecionados];
    novaLista.splice(index, 1);
    setServicosSelecionados(novaLista);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (
      !formClienteNome ||
      servicosSelecionados.length === 0 ||
      !formServicoDuracao ||
      !formDataHoraInicio ||
      !formStatus
    ) {
      // O erro será exibido pelo componente pai (Agenda.jsx)
      return;
    }

    const agendamentoData = {
      cliente_nome: formClienteNome,
      servico_nome: servicosSelecionados.join(", "), // Junta os serviços: "Unha, Cabelo"
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
            <label htmlFor="servicoCadastrado">Serviços:</label>
            <div className="agenda-servico-add">
              <select
                id="servicoCadastrado"
                value={servicoSelecionadoId}
                onChange={(e) => setServicoSelecionadoId(e.target.value)}
                disabled={loading}
              >
                <option value="">Selecione um serviço</option>
                {servicosCadastrados.map((serv) => (
                  <option key={serv.id} value={serv.id}>
                    {serv.nome}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="button"
                onClick={handleAddServico}
                disabled={loading || !servicoSelecionadoId}
              >
                Adicionar
              </button>
            </div>
          </div>

          {/* Lista de serviços adicionados */}
          <div className="form-group">
            <label>Serviços selecionados:</label>
            {servicosSelecionados.length === 0 ? (
              <p className="agenda-servicos-vazio">Nenhum serviço adicionado.</p>
            ) : (
              <ul className="agenda-servicos-lista">
                {servicosSelecionados.map((nome, index) => (
                  <li key={index} className="agenda-servico-item">
                    <span>{nome}</span>
                    <button
                      type="button"
                      className="agenda-servico-remove"
                      onClick={() => handleRemoveServico(index)}
                      disabled={loading}
                    >
                      &times;
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="servicoDuracao">Duração total (minutos):</label>
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
