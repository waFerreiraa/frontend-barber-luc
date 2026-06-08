import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { solicitarResetSenha } from '../../services/api';
import { FaEnvelope } from 'react-icons/fa';
import './Login.css'; // Reutilizando o CSS do Login
import { Link } from 'react-router-dom';

const EsqueciSenha = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email) {
            toast.warn("Por favor, insira seu email.");
            return;
        }
        setLoading(true);
        try {
            const data = await solicitarResetSenha(email);
            toast.info(data.message);
            // Não redireciona, apenas mostra a mensagem para o usuário checar o email.
        } catch (err) {
            toast.error(err.message || "Ocorreu um erro ao solicitar a redefinição.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <form className="login-form" onSubmit={handleSubmit}>
                <h2>Recuperar Senha</h2>
                <p className="form-description">Digite seu email para receber o link de redefinição.</p>

                <div className="input-group">
                    <FaEnvelope className="input-icon" />
                    <input
                        type="email"
                        placeholder="Digite seu email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                <button type="submit" disabled={loading}>{loading ? 'Enviando...' : 'Enviar Link'}</button>

                <div className="login-footer-links">
                    <Link to="/login">Voltar para o Login</Link>
                </div>
            </form>
        </div>
    );
};

export default EsqueciSenha;