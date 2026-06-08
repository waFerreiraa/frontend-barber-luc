
import React, { useState } from "react";
import { loginUser } from "../../services/api";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import "./Login.css";
import { Link } from "react-router-dom";

const Login = ({ onLogin }) => {
  const [form, setForm] = useState({ email: "", senha: "" });
  const [errors, setErrors] = useState({ email: "", senha: "", geral: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newValue = name === "email" ? value.toLowerCase() : value;
    setForm({ ...form, [name]: newValue });
    setErrors({ ...errors, [name]: "", geral: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({ email: "", senha: "", geral: "" });

    if (!form.email || !form.senha) {
      setErrors({
        email: !form.email ? "Email é obrigatório" : "",
        senha: !form.senha ? "Senha é obrigatória" : "",
      });
      return;
    }

    setLoading(true);
    try {
      const usuario = await loginUser(form.email, form.senha);
      onLogin(usuario);
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        geral:
          err.status === 401
            ? "⚠️ Email ou senha incorretos."
            : "⚠️ Erro ao tentar fazer login. Verifique suas credenciais.",
      }));
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
              type={showPassword ? "text" : "password"}
              name="senha"
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
              {showPassword ? <FaEye /> : <FaEyeSlash />}
            </button>
          </div>
          {errors.senha && <p className="error-message">{errors.senha}</p>}
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Entrando..." : "Entrar"}
        </button>

        {errors.geral && <p className="error-message">{errors.geral}</p>}

        <div className="login-footer-links">
          <Link to="/esqueci-senha">Esqueci minha senha</Link>
        </div>
      </form>
    </div>
  );
};

export default Login;
