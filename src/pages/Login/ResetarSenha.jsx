import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { resetarSenha } from '../../services/api';
import { FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import './Login.css';
import { useParams, useNavigate, Link } from 'react-router-dom';

const ResetarSenha = () => {
    const { token } = useParams(); // Pega o token da URL
    const navigate = useNavigate(); // Hook para navegação
    const [form, setForm] = useState({ nova_senha: '', confirmar_senha: '' });
    const [loading, setLoading] = useState(false);
    const [showNovaSenha, setShowNovaSenha] = useState(false);
    const [showConfirmarSenha, setShowConfirmarSenha] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.nova_senha.length < 6) {
            toast.warn("A senha deve ter pelo menos 6 caracteres.");
            return;
        }
        if (form.nova_senha !== form.confirmar_senha) {
            toast.error("As senhas não coincidem.");
            return;
        }

        setLoading(true);
        try {
            await resetarSenha(token, form.nova_senha);
            toast.success("Senha redefinida com sucesso! Você já pode fazer login.");
            navigate('/login'); // Redireciona para a tela de login
        } catch (err) {
            toast.error(err.message || "Erro ao redefinir a senha. O token pode ser inválido ou ter expirado.");
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="login-container">
                <div className="login-form">
                    <h2>Token Inválido</h2>
                    <p>O link de redefinição de senha parece estar quebrado. Por favor, solicite um novo.</p>
                    <div className="login-footer-links">
                        <Link to="/login">Voltar para o Login</Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="login-container">
            <form className="login-form" onSubmit={handleSubmit}>
                <h2>Criar Nova Senha</h2>

                <div className="input-group">
                    <div className="password-wrapper">
                        <FaLock className="input-icon" />
                        <input type={showNovaSenha ? "text" : "password"} name="nova_senha" placeholder="Digite a nova senha" value={form.nova_senha} onChange={handleChange} required />
                        <button
                            type="button"
                            className="toggle-password"
                            onClick={() => setShowNovaSenha(!showNovaSenha)}
                        >
                            {showNovaSenha ? <FaEye /> : <FaEyeSlash />}
                        </button>
                    </div>
                </div>

                <div className="input-group">
                    <div className="password-wrapper">
                        <FaLock className="input-icon" />
                        <input type={showConfirmarSenha ? "text" : "password"} name="confirmar_senha" placeholder="Confirme a nova senha" value={form.confirmar_senha} onChange={handleChange} required />
                        <button
                            type="button"
                            className="toggle-password"
                            onClick={() => setShowConfirmarSenha(!showConfirmarSenha)}
                        >
                            {showConfirmarSenha ? <FaEye /> : <FaEyeSlash />}
                        </button>
                    </div>
                </div>

                <button type="submit" disabled={loading}>{loading ? 'Salvando...' : 'Salvar Nova Senha'}</button>
            </form>
        </div>
    );
};

export default ResetarSenha;