import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import './EditServicoModal.css'; // Importa o CSS para o modal

const EditServicoModal = ({ servico, onSave, onCancel, loading }) => {
    const [nome, setNome] = useState('');
    const [valorPadrao, setValorPadrao] = useState('');// Adicionar estado para duração

    useEffect(() => {
        if (servico) {
            setNome(servico.nome);
            // Formata o valor para exibir com duas casas decimais no input
            setValorPadrao(parseFloat(servico.valor_padrao).toFixed(2));
        }
    }, [servico]);

    const handleSave = (e) => {
        e.preventDefault(); // Previne o comportamento padrão do formulário
        // Validação básica antes de salvar
        if (!nome.trim()) {
            toast.warn('O nome do serviço não pode ser vazio.');
            return;
        }
        const valorNumerico = parseFloat(valorPadrao.replace(',', '.'));
        if (isNaN(valorNumerico) || valorNumerico <= 0) {
            toast.warn('O valor padrão deve ser um número positivo.');
            return;
        }
        onSave({
            id: servico.id,
            nome: nome,
            valor_padrao: valorNumerico
        });
    };

    if (!servico) return null; // Não renderiza se não houver serviço para editar
    return (
        <div className="modal-backdrop">
            {/* Envolve o conteúdo em um formulário e usa o evento onSubmit */}
            <form className="modal-content" onSubmit={handleSave}>
                <h2>Editar Serviço</h2>
                <div className="form-group">
                    <label htmlFor="editNomeServico">Nome do Serviço:</label>
                    <input
                        id="editNomeServico"
                        type="text"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                        disabled={loading}
                        required // Adiciona validação nativa do navegador
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="editValorServico">Valor Padrão:</label>
                    <input
                        id="editValorServico"
                        type="number"
                        step="0.01"
                        min="0.01" // Garante que o valor seja positivo
                        value={valorPadrao}
                        onChange={(e) => setValorPadrao(e.target.value)}
                        disabled={loading}
                        required
                    />
                </div>
                <div className="modal-actions">
                    {/* O type="button" previne que o botão de cancelar envie o formulário */}
                    <button
                        type="button"
                        className="button modal-cancel-button"
                        onClick={onCancel}
                        disabled={loading}
                    >
                        Cancelar
                    </button>
                    <button type="submit" className="button modal-save-button" disabled={loading}>
                        {loading ? 'Salvando...' : 'Salvar'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditServicoModal;