import React, { useState, useEffect } from 'react';
import {
    fetchClientes,
    createCliente,
    fetchTiposServicos,
    createTipoServico,
    updateTipoServico, // Importar nova função
    deleteTipoServico, // Importar nova função
} from '../services/api';
import EditServicoModal from '../pages/EditServicoModal'; // Importar o novo modal
import DeleteConfirmationModal from '../pages/DeleteConfirmationModal'; // Importar o novo modal
import Card from '../components/Card';
import { FaEdit, FaTrash } from 'react-icons/fa'; // Importar ícones
import './Gerenciar.css';

const Gerenciar = () => {
    const [clientes, setClientes] = useState([]);
    const [servicos, setServicos] = useState([]);

    const [nomeCliente, setNomeCliente] = useState('');
    const [telefoneCliente, setTelefoneCliente] = useState('');

    const [nomeServico, setNomeServico] = useState('');
    const [valorServico, setValorServico] = useState('');

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isAdmin, setIsAdmin] = useState(false); // Estado para verificar se é admin
    const [loading, setLoading] = useState(false); // Estado de loading para operações
    const [showEditModal, setShowEditModal] = useState(false); // Estado para controlar a visibilidade do modal
    const [showDeleteModal, setShowDeleteModal] = useState(false); // Estado para controlar a visibilidade do modal de exclusão
    const [currentServicoToEdit, setCurrentServicoToEdit] = useState(null); // Estado para o serviço sendo editado
    const [servicoToDelete, setServicoToDelete] = useState(null); // Estado para o serviço a ser excluído

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
        const user = JSON.parse(localStorage.getItem("user"));
        if (user && user.tipo_usuario === "admin") {
            setIsAdmin(true);
        }
        loadData();
    }, []);

    const handleAddCliente = async (e) => {
        e.preventDefault();
        try {
            await createCliente({ nome: nomeCliente, telefone: telefoneCliente });
            setSuccess('Cliente adicionado!');
            setNomeCliente(''); setTelefoneCliente('');
            loadData();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleAddServico = async (e) => {
        e.preventDefault();
        try {
            await createTipoServico({ nome: nomeServico, valor_padrao: valorServico });
            setSuccess('Serviço adicionado!');
            setNomeServico(''); setValorServico('');
            loadData(); // Recarrega a lista de serviços
        } catch (err) {
            setError(err.message);
        }
    };

    // Função para abrir o modal de edição
    const handleOpenEditModal = (servico) => {
        if (!isAdmin) {
            setError("Você não tem permissão para editar serviços.");
            return;
        }
        setError("");
        setSuccess("");
        setCurrentServicoToEdit(servico);
        setShowEditModal(true);
    };

    // Função para salvar as edições do modal
    const handleSaveEditedServico = async (servicoId, novoNome, novoValor) => {
        setError("");
        setSuccess("");

        try {
            setLoading(true);
            await updateTipoServico(servicoId, {
                nome: novoNome,
                valor_padrao: novoValor,
            });
            setSuccess("Serviço atualizado com sucesso!");
            loadData(); // Recarrega a lista de serviços
        } catch (err) {
            setError(err.message || "Erro ao atualizar serviço.");
            console.error("Erro ao atualizar serviço:", err);
        } finally {
            setLoading(false);
            setShowEditModal(false); // Fecha o modal
            setCurrentServicoToEdit(null); // Limpa o serviço em edição
        }
    };

    // Função para cancelar a edição do modal
    const handleCancelEdit = () => {
        setShowEditModal(false);
        setCurrentServicoToEdit(null);
    };

    // Função para abrir o modal de confirmação de exclusão
    const handleOpenDeleteModal = (servico) => {
        if (!isAdmin) {
            setError("Você não tem permissão para excluir serviços.");
            return;
        }
        setError("");
        setSuccess("");
        setServicoToDelete(servico);
        setShowDeleteModal(true);
    };

    // Função para confirmar a exclusão (chamada pelo modal)
    const handleConfirmDelete = async () => {
        if (!servicoToDelete) return; // Garante que há um serviço selecionado

        setError("");
        setSuccess("");

        try {
            setLoading(true);
            await deleteTipoServico(servicoToDelete.id);
            setSuccess("Serviço excluído com sucesso!");
            loadData(); // Recarrega a lista de serviços
        } catch (err) {
            setError(err.message || "Erro ao excluir serviço.");
            console.error("Erro ao excluir serviço:", err);
        } finally {
            setLoading(false);
            setShowDeleteModal(false); // Fecha o modal
            setServicoToDelete(null); // Limpa o serviço em exclusão
        }
    };

    // Função para cancelar a exclusão (chamada pelo modal)
    const handleCancelDelete = () => {
        setShowDeleteModal(false);
        setServicoToDelete(null);
    };

    const handleDeleteServico = async (servicoId, servicoNome) => {
        // Esta função agora apenas abre o modal de confirmação
        // A lógica de exclusão foi movida para handleConfirmDelete
        handleOpenDeleteModal({ id: servicoId, nome: servicoNome });
    };

    return (
        <div className="gerenciar-container">
            <h1>Gerenciar Cadastros</h1>
            {error && <p className="gerenciar-error">{error}</p>}
            {success && <p className="gerenciar-success">{success}</p>}

            <div className="grid-container">
                <Card className="gerenciar-card">
                    <h3>Adicionar Novo Serviço</h3>
                    <form onSubmit={handleAddServico}>
                        <div className="form-group">
                            <label>Nome do Serviço</label>
                            <input type="text" value={nomeServico} onChange={e => setNomeServico(e.target.value)} required />
                        </div>
                        <div className="form-group">
                            <label>Valor Padrão (ex: 25.00)</label>
                            <input type="number" step="0.01" value={valorServico} onChange={e => setValorServico(e.target.value)} required />
                        </div>
                        <button type="submit" className="button">Adicionar Serviço</button>
                    </form>

                    <h4>Serviços Cadastrados</h4>
                    <ul className="gerenciar-servicos-list">
                        {servicos.map(servico => (
                            <li key={servico.id} className="gerenciar-servico-item">
                                <span>{servico.nome} - R$ {parseFloat(servico.valor_padrao).toFixed(2)}</span>
                                {isAdmin && (
                                    <div className="gerenciar-servico-actions">
                                        <button
                                            className="gerenciar-action-button gerenciar-edit-button"
                                            onClick={() => handleOpenEditModal(servico)}
                                            disabled={loading}
                                        >
                                            <FaEdit />
                                        </button>
                                        <button
                                            className="gerenciar-action-button gerenciar-delete-button"
                                            onClick={() => handleOpenDeleteModal(servico)} // Abre o modal de exclusão
                                            disabled={loading}
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                </Card>

                {/* Renderiza o modal de edição se showEditModal for true e houver um serviço para editar */}
                {showEditModal && currentServicoToEdit && (
                    <EditServicoModal
                        servico={currentServicoToEdit}
                        onSave={handleSaveEditedServico}
                        onCancel={handleCancelEdit}
                        loading={loading}
                    />
                )}

                {/* Renderiza o modal de confirmação de exclusão se showDeleteModal for true */}
                {showDeleteModal && servicoToDelete && (
                    <DeleteConfirmationModal
                        servicoNome={servicoToDelete.nome}
                        onConfirm={handleConfirmDelete}
                        onCancel={handleCancelDelete}
                        loading={loading}
                    />
                )}
            </div>
        </div>
    );
};

export default Gerenciar;
