import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import './EditServicoModal.css';

const EditServicoModal = ({ servico, isSalao, onSave, onCancel, loading }) => {
    const [nome, setNome] = useState('');
    const [valorPadrao, setValorPadrao] = useState('');
    const [duracaoMinutos, setDuracaoMinutos] = useState('');

    useEffect(() => {
        if (servico) {
            setNome(servico.nome);
            setValorPadrao(parseFloat(servico.valor_padrao).toFixed(2));
            setDuracaoMinutos(servico.duracao_minutos || '');
        }
    }, [servico]);

    const handleSave = (e) => {
        e.preventDefault();
        if (!nome.trim()) {
            toast.warn('O nome do serviço não pode ser vazio.');
            return;
        }

        const valorNumerico = parseFloat(valorPadrao.replace(',', '.'));
        if (isNaN(valorNumerico) || valorNumerico <= 0) {
            toast.warn('O valor padrão deve ser um número positivo.');
            return;
        }

        const duracaoNumerica = Number(duracaoMinutos);
        if (isSalao && (!Number.isInteger(duracaoNumerica) || duracaoNumerica <= 0)) {
            toast.warn('Informe a duração do serviço em minutos.');
            return;
        }

        onSave({
            id: servico.id,
            nome,
            valor_padrao: valorNumerico,
            ...(isSalao && { duracao_minutos: duracaoNumerica })
        });
    };

    if (!servico) return null;

    return (
        <div className="modal-backdrop">
            <form className="modal-content" onSubmit={handleSave}>
                <h2>Editar Serviço</h2>
                <div className="form-group">
                    <label htmlFor="editNomeServico">Nome do Serviço:</label>
                    <input id="editNomeServico" type="text" value={nome} onChange={(e) => setNome(e.target.value)} disabled={loading} required />
                </div>
                <div className="form-group">
                    <label htmlFor="editValorServico">Valor Padrão:</label>
                    <input id="editValorServico" type="number" step="0.01" min="0.01" value={valorPadrao} onChange={(e) => setValorPadrao(e.target.value)} disabled={loading} required />
                </div>
                {isSalao && (
                    <div className="form-group">
                        <label htmlFor="editDuracaoServico">Duração (minutos):</label>
                        <input id="editDuracaoServico" type="number" min="1" step="1" value={duracaoMinutos} onChange={(e) => setDuracaoMinutos(e.target.value)} disabled={loading} required />
                    </div>
                )}
                <div className="modal-actions">
                    <button type="button" className="button modal-cancel-button" onClick={onCancel} disabled={loading}>Cancelar</button>
                    <button type="submit" className="button modal-save-button" disabled={loading}>{loading ? 'Salvando...' : 'Salvar'}</button>
                </div>
            </form>
        </div>
    );
};

export default EditServicoModal;