import React, { useState, useEffect } from 'react';
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
            alert('O nome do serviço não pode ser vazio.');
            return;
        }
        const valorNumerico = parseFloat(valorPadrao.replace(',', '.'));
        if (isNaN(valorNumerico) || valorNumerico <= 0) {
            alert('O valor padrão deve ser um número positivo.');
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
            <div className="modal-content">
                <h2>Editar Serviço</h2> {/* Adicionado o form para o handleSubmit */}
                <div className="form-group">
                    <label htmlFor="editNomeServico">Nome do Serviço:</label>
                    <input
                        id="editNomeServico"
                        type="text"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                        disabled={loading}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="editValorServico">Valor Padrão:</label>
                    <input
                        id="editValorServico"
                        type="number"
                        step="0.01"
                        value={valorPadrao}
                        onChange={(e) => setValorPadrao(e.target.value)}
                        disabled={loading}
                    />
                </div>
            
                <div className="modal-actions">
                    <button
                        className="button modal-cancel-button"
                        onClick={onCancel}
                        disabled={loading}
                    >
                        Cancelar
                    </button>
                    <button
                        className="button modal-save-button"
                        onClick={handleSave} // Alterado para usar o handleSubmit do form
                        disabled={loading}
                    >
                        {loading ? 'Salvando...' : 'Salvar'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditServicoModal;