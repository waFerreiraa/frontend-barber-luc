import React, { useState, useEffect, useCallback, useContext } from 'react';
import { ThemeContext } from "../../contexts/ThemeContext";
import {
    fetchTiposServicos,
    createTipoServico,
    updateTipoServico, // Importar nova função
    deleteTipoServico, // Importar nova função
    createInitialUserAndCompany,
    createCollaborator,
} from '../../services/api';
import Logo from "../../assets/penteado.png";
import Lucao from "../../assets/LucaoLogo.png";
import EditServicoModal from './EditServicoModal'; // Importar o novo modal
import DeleteConfirmationModal from './DeleteConfirmationModal'; // Importar o novo modal
import Card from '../../components/Card';
import { toast } from 'react-toastify';
import { FaEdit, FaTrash, FaEye, FaEyeSlash } from 'react-icons/fa'; // Importar ícones
import './Gerenciar.css';

const Gerenciar = ({ usuario }) => {
    const { tema } = useContext(ThemeContext);
    const isSalao = tema === 'salao';
    const [servicos, setServicos] = useState([]);
    const [nomeServico, setNomeServico] = useState('');
    const [valorServico, setValorServico] = useState('');

    // Estados para criação de usuário (apenas para 'dono')
    const [novoUsuario, setNovoUsuario] = useState({
        empresa_nome: '', // ✅ MUDANÇA: Nome da nova empresa
        nome: '',
        email: '',
        senha: '',
        layout_tipo: 'barbearia',
    });
    // Estado para criação de colaborador (admin/dono)
    const [novoColaborador, setNovoColaborador] = useState({
        nome: '',
        email: '',
        senha: '',
        tipo_usuario: 'colaborador',
    });

    const [isAdmin, setIsAdmin] = useState(false); // Estado para verificar se é admin
    const [loading, setLoading] = useState(false); // Estado de loading para operações
    const [showEditModal, setShowEditModal] = useState(false); // Estado para controlar a visibilidade do modal
    const [showDeleteModal, setShowDeleteModal] = useState(false); // Estado para controlar a visibilidade do modal de exclusão
    const [currentServicoToEdit, setCurrentServicoToEdit] = useState(null); // Estado para o serviço sendo editado
    const [servicoToDelete, setServicoToDelete] = useState(null); // Estado para o serviço a ser excluído
    const [visibleForm, setVisibleForm] = useState(null); // 'company', 'collaborator', 'service'
    const [showPassword, setShowPassword] = useState(false);

    const loadData = useCallback(async () => {
        try {
            const servicosData = await fetchTiposServicos();
            setServicos(servicosData);
        } catch (err) {
            toast.error(err.message);
        }
    }, []);

    useEffect(() => {
        if (usuario && (usuario.tipo_usuario === "admin" || usuario.tipo_usuario === "dono")) {
            setIsAdmin(true);
        } else {
            setIsAdmin(false);
        }

        loadData();
    }, [usuario, loadData]);

    const handleAddServico = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await createTipoServico({ nome: nomeServico, valor_padrao: valorServico });
            toast.success('Serviço adicionado!');
            setNomeServico(''); setValorServico('');
            setVisibleForm(null); // Fecha o formulário
            loadData(); // Recarrega a lista
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Handler para o formulário de novo usuário
    const handleNewUserChange = (e) => {
        const { name, value } = e.target;
        const newValue = name === 'email' ? value.toLowerCase() : value;
        setNovoUsuario(prev => ({ ...prev, [name]: newValue }));
    };
    
    // Handler para criar o usuário
    const handleCreateUser = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // ✅ MUDANÇA: Chama a nova função da API
            await createInitialUserAndCompany(novoUsuario);
            toast.success(`Empresa "${novoUsuario.empresa_nome}" e admin "${novoUsuario.nome}" criados com sucesso!`);
            setNovoUsuario({ empresa_nome: '', nome: '', email: '', senha: '' });
            setVisibleForm(null); // Fecha o formulário
        } catch (err) {
            toast.error(err.message || 'Erro ao criar usuário.');
        } finally {
            setLoading(false);
        }
    };

    // Handler para o formulário de novo colaborador
    const handleNewCollaboratorChange = (e) => {
        const { name, value } = e.target;
        const newValue = name === 'email' ? value.toLowerCase() : value;
        setNovoColaborador(prev => ({ ...prev, [name]: newValue }));
    };

    // Handler para criar o colaborador
    const handleCreateCollaborator = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await createCollaborator(novoColaborador);
            toast.success(`Colaborador "${novoColaborador.nome}" criado com sucesso!`);
            setNovoColaborador({ nome: '', email: '', senha: '', tipo_usuario: 'colaborador' });
            setVisibleForm(null); // Fecha o formulário
        } catch (err) {
            toast.error(err.message || 'Erro ao criar colaborador.');
        } finally {
            setLoading(false);
        }
    };

    // Função para abrir o modal de edição
    const handleOpenEditModal = (servico) => {
        if (!isAdmin) {
            toast.error("Você não tem permissão para editar serviços.");
            return;
        }
        setCurrentServicoToEdit(servico);
        setShowEditModal(true);
    };

    // Função para salvar as edições (chamada pelo modal)
    const handleSaveEditedServico = async (servicoData) => { // Aceita um objeto servicoData
        try {
            setLoading(true);
            await updateTipoServico(servicoData.id, servicoData); // Passa o objeto completo
            toast.success("Serviço atualizado com sucesso!");
            loadData(); // Recarrega a lista de serviços
        } catch (err) {
            toast.error(err.message || "Erro ao atualizar serviço.");
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
            toast.error("Você não tem permissão para excluir serviços.");
            return;
        }
        setServicoToDelete(servico);
        setShowDeleteModal(true);
    };

    // Função para confirmar a exclusão (chamada pelo modal)
    const handleConfirmDelete = async () => {
        if (!servicoToDelete) return; // Garante que há um serviço selecionado

        try {
            setLoading(true);
            await deleteTipoServico(servicoToDelete.id);
            toast.success("Serviço excluído com sucesso!");
            loadData(); // Recarrega a lista de serviços
        } catch (err) {
            toast.error(err.message || "Erro ao excluir serviço.");
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

    const content = (
        <>
            {isSalao ? <h2>Gerenciar Cadastros</h2> : <h1>Gerenciar Cadastros</h1>}
            
            {/* Botões de Ação para abrir os formulários */}
            <div className="gerenciar-action-buttons">
                {usuario?.tipo_usuario === 'dono' && (
                    <button className="button" onClick={() => setVisibleForm(visibleForm === 'company' ? null : 'company')}>
                        {visibleForm === 'company' ? 'Fechar Formulário' : '+ Nova Empresa'}
                    </button>
                )}
                {isAdmin && (
                    <button className="button" onClick={() => setVisibleForm(visibleForm === 'collaborator' ? null : 'collaborator')}>
                        {visibleForm === 'collaborator' ? 'Fechar Formulário' : '+ Novo Colaborador'}
                    </button>
                )}
                {isAdmin && (
                    <button className="button" onClick={() => setVisibleForm(visibleForm === 'service' ? null : 'service')}>
                        {visibleForm === 'service' ? 'Fechar Formulário' : '+ Novo Serviço'}
                    </button>
                )}
            </div>
            
            <div className="grid-container">
                {/* Formulário de criação de usuário (apenas para 'dono') */}
                {visibleForm === 'company' && usuario?.tipo_usuario === 'dono' && (
                    <Card className="gerenciar-card">
                        <h3>Criar Nova Empresa e Admin</h3>
                        <form onSubmit={handleCreateUser}>
                            <div className="form-group">
                                <label>Nome da Nova Empresa</label>
                                <input type="text" name="empresa_nome" value={novoUsuario.empresa_nome} onChange={handleNewUserChange} required />
                            </div>
                            <div className="form-group">
                                <label>Nome do Admin</label>
                                <input type="text" name="nome" value={novoUsuario.nome} onChange={handleNewUserChange} required />
                            </div>
                            <div className="form-group">
                                <label>Email</label>
                                <input type="email" name="email" value={novoUsuario.email} onChange={handleNewUserChange} required />
                            </div>
                            <div className="form-group">
                                <label>Senha</label>
                                <div style={{ position: 'relative' }}>
                                    <input 
                                        type={showPassword ? "text" : "password"} 
                                        name="senha" 
                                        value={novoUsuario.senha} 
                                        onChange={handleNewUserChange} 
                                        required 
                                        style={{ width: '100%', paddingRight: '40px', boxSizing: 'border-box' }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#bbb', display: 'flex', alignItems: 'center' }}
                                    >
                                        {showPassword ? <FaEye size={18} /> : <FaEyeSlash size={18} />}
                                    </button>
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Tipo de Empresa</label>
                                <select name="layout_tipo" value={novoUsuario.layout_tipo} onChange={handleNewUserChange} required>
                                    <option value="barbearia">Barbearia</option>
                                    <option value="salao">Salão</option>
                                </select>
                            </div>
                            <button type="submit" className="button" disabled={loading}>
                                {loading ? 'Criando...' : 'Criar Empresa e Admin'}
                            </button>
                        </form>
                    </Card>
                )}

                {/* Formulário de criação de colaborador (para 'admin' e 'dono') */}
                {visibleForm === 'collaborator' && isAdmin && (
                    <Card className="gerenciar-card">
                        <h3>Adicionar Novo Colaborador</h3>
                        <form onSubmit={handleCreateCollaborator}>
                            <div className="form-group">
                                <label>Nome do Colaborador</label>
                                <input type="text" name="nome" value={novoColaborador.nome} onChange={handleNewCollaboratorChange} required />
                            </div>
                            <div className="form-group">
                                <label>Email</label>
                                <input type="email" name="email" value={novoColaborador.email} onChange={handleNewCollaboratorChange} required />
                            </div>
                            <div className="form-group">
                                <label>Senha</label>
                                <div style={{ position: 'relative' }}>
                                    <input 
                                        type={showPassword ? "text" : "password"} 
                                        name="senha" 
                                        value={novoColaborador.senha} 
                                        onChange={handleNewCollaboratorChange} 
                                        required 
                                        style={{ width: '100%', paddingRight: '40px', boxSizing: 'border-box' }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#bbb', display: 'flex', alignItems: 'center' }}
                                    >
                                        {showPassword ? <FaEye size={18} /> : <FaEyeSlash size={18} />}
                                    </button>
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Tipo de Usuário</label>
                                <select name="tipo_usuario" value={novoColaborador.tipo_usuario} onChange={handleNewCollaboratorChange} required>
                                    <option value="colaborador">Colaborador</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <button type="submit" className="button" disabled={loading}>
                                {loading ? 'Criando...' : 'Criar Colaborador'}
                            </button>
                        </form>
                    </Card>
                )}

                {/* Card de Serviços, visível para admin e dono */}
                {visibleForm === 'service' && isAdmin && (
                    <Card className="gerenciar-card">
                        <h3>Adicionar Novo Serviço</h3>
                        <form onSubmit={handleAddServico}>
                            <div className="form-group">
                                <label>Nome do Serviço</label>
                                <input type="text" value={nomeServico} onChange={e => setNomeServico(e.target.value)} required disabled={loading} />
                            </div>
                            <div className="form-group">
                                <label>Valor Padrão (ex: 25.00)</label>
                                <input type="number" step="0.01" value={valorServico} onChange={e => setValorServico(e.target.value)} required disabled={loading} />
                            </div>
                            <button type="submit" className="button" disabled={loading}>{loading ? 'Adicionando...' : 'Adicionar Serviço'}</button>
                        </form>
                    </Card>
                )}

                {/* Lista de serviços visível para todos, mas com ações apenas para admin/dono */}
                <Card className="gerenciar-card">
                <h4>Serviços Cadastrados</h4>
                <ul className="gerenciar-servicos-list">
                    {servicos.map(servico => (
                        <li key={servico.id} className="gerenciar-servico-item">
                            <div className="gerenciar-servico-details">
                                <span className="gerenciar-servico-name">{servico.nome}</span>
                                <span className="gerenciar-servico-price">{parseFloat(servico.valor_padrao).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                            </div>
                            {isAdmin && (
                                <div className="gerenciar-servico-actions">
                                    <button
                                        className="gerenciar-action-button gerenciar-edit-button"
                                        onClick={() => handleOpenEditModal(servico)}
                                    >
                                        <FaEdit />
                                    </button>
                                    <button
                                        className="gerenciar-action-button gerenciar-delete-button"
                                        onClick={() => handleOpenDeleteModal(servico)} // Abre o modal de exclusão
                                    >
                                        <FaTrash />
                                    </button>
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            </Card>
            </div>
        </>
    );

    return (
        <div className="gerenciar-container">
            {content}

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
    );
};

export default Gerenciar;
