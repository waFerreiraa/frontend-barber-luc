import React, { useState, useContext } from 'react';
import { toast } from 'react-toastify';
import Card from '../../components/Card';
import { alterarMinhaSenha, alterarMeuEmail } from '../../services/api.js'; 
import '../Gerenciar/Gerenciar.css'; // Reutilizando estilos do Gerenciar para consistência
import { FaEye, FaEyeSlash } from 'react-icons/fa';

import { ThemeContext } from "../../contexts/ThemeContext";

const Configuracoes = () => {
    const { tema } = useContext(ThemeContext);
    const isSalao = tema === 'salao';

    const [senhaForm, setSenhaForm] = useState({
        senha_antiga: '',
        nova_senha: '',
        confirmar_nova_senha: ''
    });
    const [emailForm, setEmailForm] = useState({
        novo_email: '',
        senha: ''
    });

    const [loadingSenha, setLoadingSenha] = useState(false);
    const [loadingEmail, setLoadingEmail] = useState(false);

    const [showSenhaAntiga, setShowSenhaAntiga] = useState(false);
    const [showNovaSenha, setShowNovaSenha] = useState(false);
    const [showConfirmarSenha, setShowConfirmarSenha] = useState(false);
    const [showSenhaEmail, setShowSenhaEmail] = useState(false);


    const handleSenhaChange = (e) => {
        const { name, value } = e.target;
        setSenhaForm(prev => ({ ...prev, [name]: value }));
    };

    const handleEmailChange = (e) => {
        const { name, value } = e.target;
        const newValue = name === 'novo_email' ? value.toLowerCase() : value;
        setEmailForm(prev => ({ ...prev, [name]: newValue }));
    };

    const handleAlterarSenha = async (e) => {
        e.preventDefault();
        if (senhaForm.nova_senha !== senhaForm.confirmar_nova_senha) {
            toast.error("As novas senhas não coincidem.");
            return;
        }
        if (senhaForm.nova_senha.length < 6) {
            toast.warn("A nova senha deve ter pelo menos 6 caracteres.");
            return;
        }

        setLoadingSenha(true);
        try {
            await alterarMinhaSenha({
                senha_antiga: senhaForm.senha_antiga,
                nova_senha: senhaForm.nova_senha
            });
            toast.success("Senha alterada com sucesso!");
            setSenhaForm({ senha_antiga: '', nova_senha: '', confirmar_nova_senha: '' });
        } catch (err) {
            toast.error(err.message || "Erro ao alterar a senha. Verifique sua senha antiga.");
        } finally {
            setLoadingSenha(false);
        }
    };

    const handleAlterarEmail = async (e) => {
        e.preventDefault();
        if (!emailForm.novo_email || !emailForm.senha) {
            toast.warn("Preencha o novo email e a senha atual.");
            return;
        }

        setLoadingEmail(true);
        try {
            await alterarMeuEmail({
                novo_email: emailForm.novo_email,
                senha: emailForm.senha
            });
            toast.success("Email alterado com sucesso! Você pode precisar fazer login novamente.");
            setEmailForm({ novo_email: '', senha: '' });
        } catch (err) {
            toast.error(err.message || "Erro ao alterar o email. Verifique sua senha.");
        } finally {
            setLoadingEmail(false);
        }
    };

    const content = (
        <>
            {isSalao ? <h2>Configurações da Conta</h2> : <h1>Configurações da Conta</h1>}

            <div className="grid-container">
                {/* Card para alteração de senha */}
                <Card className="gerenciar-card">
                    <h3>Alterar Senha</h3>
                    <form onSubmit={handleAlterarSenha}>
                        <div className="form-group">
                            <label>Senha Antiga</label>
                            <div style={{ position: 'relative' }}>
                                <input type={showSenhaAntiga ? "text" : "password"} name="senha_antiga" value={senhaForm.senha_antiga} onChange={handleSenhaChange} required style={{ width: '100%', paddingRight: '40px', boxSizing: 'border-box' }} />
                                <button type="button" onClick={() => setShowSenhaAntiga(!showSenhaAntiga)} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#bbb', display: 'flex', alignItems: 'center' }}>
                                    {showSenhaAntiga ? <FaEye size={18} /> : <FaEyeSlash size={18} />}
                                </button>
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Nova Senha</label>
                            <div style={{ position: 'relative' }}>
                                <input type={showNovaSenha ? "text" : "password"} name="nova_senha" value={senhaForm.nova_senha} onChange={handleSenhaChange} required style={{ width: '100%', paddingRight: '40px', boxSizing: 'border-box' }} />
                                <button type="button" onClick={() => setShowNovaSenha(!showNovaSenha)} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#bbb', display: 'flex', alignItems: 'center' }}>
                                    {showNovaSenha ? <FaEye size={18} /> : <FaEyeSlash size={18} />}
                                </button>
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Confirmar Nova Senha</label>
                            <div style={{ position: 'relative' }}>
                                <input type={showConfirmarSenha ? "text" : "password"} name="confirmar_nova_senha" value={senhaForm.confirmar_nova_senha} onChange={handleSenhaChange} required style={{ width: '100%', paddingRight: '40px', boxSizing: 'border-box' }} />
                                <button type="button" onClick={() => setShowConfirmarSenha(!showConfirmarSenha)} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#bbb', display: 'flex', alignItems: 'center' }}>
                                    {showConfirmarSenha ? <FaEye size={18} /> : <FaEyeSlash size={18} />}
                                </button>
                            </div>
                        </div>
                        <button type="submit" className="button" disabled={loadingSenha}>{loadingSenha ? 'Alterando...' : 'Alterar Senha'}</button>
                    </form>
                </Card>

                {/* Card para alteração de email */}
                <Card className="gerenciar-card">
                    <h3>Alterar Email</h3>
                    <form onSubmit={handleAlterarEmail}>
                        <div className="form-group"><label>Novo Email</label><input type="email" name="novo_email" value={emailForm.novo_email} onChange={handleEmailChange} required /></div>
                        <div className="form-group">
                            <label>Senha Atual (para confirmar)</label>
                            <div style={{ position: 'relative' }}>
                                <input type={showSenhaEmail ? "text" : "password"} name="senha" value={emailForm.senha} onChange={handleEmailChange} required style={{ width: '100%', paddingRight: '40px', boxSizing: 'border-box' }} />
                                <button type="button" onClick={() => setShowSenhaEmail(!showSenhaEmail)} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#bbb', display: 'flex', alignItems: 'center' }}>
                                    {showSenhaEmail ? <FaEye size={18} /> : <FaEyeSlash size={18} />}
                                </button>
                            </div>
                        </div>
                        <button type="submit" className="button" disabled={loadingEmail}>{loadingEmail ? 'Alterando...' : 'Alterar Email'}</button>
                    </form>
                </Card>
            </div>
        </>
    );

    return (
        <div className="gerenciar-container">
            {content}
        </div>
    );
};

export default Configuracoes;