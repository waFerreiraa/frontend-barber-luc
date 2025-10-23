import React, { useState } from "react";
import { loginUser } from "../services/api";
import {
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash
} from "react-icons/fa";
import "./Login.css";

const Login = ({ onLogin }) => {
  const [form, setForm] = useState({ email: "", senha: "" });
  const [errors, setErrors] = useState({ email: "", senha: "", geral: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Atualiza campos e limpa mensagens de erro ao digitar
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "", geral: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({ email: "", senha: "", geral: "" });

    // Validação simples
    if (!form.email || !form.senha) {
      setErrors({
        email: !form.email ? "Email é obrigatório" : "",
        senha: !form.senha ? "Senha é obrigatória" : "",
      });
      return;
    }

    setLoading(true);
    try {
      // Faz login via API
      const userData = await loginUser(form.email, form.senha);

      if (!userData || !userData.token) {
        throw new Error("Resposta inválida do servidor");
      }

      // Armazena token e dados do usuário
      localStorage.setItem("token", userData.token);
      const usuario = {
        id: userData.id,
        nome: userData.nome,
        tipo_usuario: userData.tipo_usuario || userData.tipo,
      };
      localStorage.setItem("user", JSON.stringify(usuario));

      // Atualiza o estado global do App
      onLogin(usuario);

    } catch (err) {
      if (err.response?.status === 401) {
        setErrors((prev) => ({
          ...prev,
          geral: "⚠️ Email ou senha incorretos.",
        }));
      } else {
        setErrors((prev) => ({
          ...prev,
          geral: "⚠️ Erro ao tentar fazer login. Verifique suas credenciais.",
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
              type={showPassword ? "text" : "password"}
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
              {showPassword ? <FaEye /> : <FaEyeSlash />}
            </button>
          </div>
          {errors.senha && <p className="error-message">{errors.senha}</p>}
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Entrando..." : "Entrar"}
        </button>

        {errors.geral && <p className="error-message">{errors.geral}</p>}
      </form>
    </div>
  );
};

export default Login;
