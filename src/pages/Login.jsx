import React, { useState } from 'react';
import { loginUser } from '../services/api';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import './Login.css';

const Login = ({ onLogin }) => {
  const [form, setForm] = useState({ email: '', senha: '' });
  const [errors, setErrors] = useState({ email: '', senha: '', geral: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '', geral: '' }); // limpa erro ao digitar
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({ email: '', senha: '', geral: '' });

    let hasError = false;

    if (!form.email) {
      setErrors((prev) => ({ ...prev, email: 'Email é obrigatório' }));
      hasError = true;
    }
    if (!form.senha) {
      setErrors((prev) => ({ ...prev, senha: 'Senha é obrigatória' }));
      hasError = true;
    }
    if (hasError) return;

    setLoading(true);
    try {
      const userData = await loginUser(form.email, form.senha);
      onLogin(userData);
    } catch (err) {
      if (err.response?.status === 401) {
        setErrors((prev) => ({
          ...prev,
          geral: '⚠️ Email ou senha estão incorretos'
        }));
      } else {
        setErrors((prev) => ({
          ...prev,
          geral: 'Erro ao tentar fazer login. Verique Email e .'
        }));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Entrar</h2>

        <div className="input-group">
          <FaEnvelope className="input-icon" />
          <input
            type="email"
            name="email"
            id="email"
            placeholder="Digite seu email"
            value={form.email}
            onChange={handleChange}
            autoComplete="username"
            required
          />
          {errors.email && <p className="error-message">{errors.email}</p>}
        </div>

        <div className="input-group">
          <div className="password-wrapper">
            <FaLock className="input-icon" />
            <input
              type={showPassword ? 'text' : 'password'}
              name="senha"
              id="senha"
              placeholder="Digite sua senha"
              value={form.senha}
              onChange={handleChange}
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEye /> : <FaEyeSlash/>}
            </button>
          </div>
          {errors.senha && <p className="error-message">{errors.senha}</p>}
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Entrando...' : 'Entrar'}
        </button>

        {errors.geral && <p className="error-message">{errors.geral}</p>}
      </form>
    </div>
  );
};

export default Login;
