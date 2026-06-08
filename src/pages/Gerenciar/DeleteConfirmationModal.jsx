import React from 'react';
import './DeleteConfirmationModal.css'; // Importa o CSS para o modal

const DeleteConfirmationModal = ({ servicoNome, onConfirm, onCancel, loading }) => {
    return (
        <div className="modal-backdrop">
            <div className="modal-content delete-modal-content">
                <h2>Confirmar Exclusão</h2>
                <p>Tem certeza que deseja excluir o serviço <strong>"{servicoNome}"</strong>?</p>
                <p className="warning-text">Esta ação é irreversível.</p>
                <div className="modal-actions">
                    <button
                        className="button modal-cancel-button"
                        onClick={onCancel}
                        disabled={loading}
                    >
                        Cancelar
                    </button>
                    <button
                        className="button modal-delete-button"
                        onClick={onConfirm}
                        disabled={loading}
                    >
                        {loading ? 'Excluindo...' : 'Excluir'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmationModal;