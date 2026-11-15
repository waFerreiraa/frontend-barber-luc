import React, { useState, useEffect, useContext, useCallback, lazy, Suspense } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { ThemeContext } from "./contexts/ThemeContext";
import Navigation from "./components/Navigation/Navigation";
const Dashboard = lazy(() => import("./pages/DashBoard/Dashboard.jsx"));
const RegistrarVenda = lazy(() => import("./pages/RegistrarVenda/RegistrarVenda.jsx"));
const Historico = lazy(() => import("./pages/Historico/Historico.jsx"));
const Gerenciar = lazy(() => import("./pages/Gerenciar/Gerenciar.jsx"));
const Equipe = lazy(() => import("./pages/Equipe/Equipe.jsx"));
const Agenda = lazy(() => import("./pages/Agenda/Agenda.jsx"));
const AdminConfig = lazy(() => import("./pages/AdminConfig/AdminConfig.jsx"));
const Configuracoes = lazy(() => import("./pages/Configuracao/Configuracoes.jsx"));
import EsqueciSenha from "./pages/Login/EsqueciSenha.jsx"; // ✅ NOVO
import ResetarSenha from "./pages/Login/ResetarSenha.jsx"; // ✅ NOVO
import Login from "./pages/Login/Login.jsx";
import { registerLogoutHandler } from "./services/api";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Lê o usuário salvo antes do primeiro render, para o F5 não redirecionar para /login
// (e depois para /dashboard), preservando a rota atual.
const lerUsuarioSalvo = () => {
  try {
    const savedUser = localStorage.getItem("user");
    if (!savedUser || !localStorage.getItem("token")) return null;

    const parsedUser = JSON.parse(savedUser);
    return {
      ...parsedUser,
      tipo_usuario: parsedUser.tipo_usuario || parsedUser.tipo,
    };
  } catch {
    return null;
  }
};

function App() {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [user, setUser] = useState(lerUsuarioSalvo);
  const { setTema } = useContext(ThemeContext);
  const navigate = useNavigate(); // Hook para navegar programaticamente

  useEffect(() => {
    if (user?.configuracoes?.layout_tipo) {
      setTema(user.configuracoes.layout_tipo);
    }
  }, [user, setTema]);

  // ✅ NOVO: Efeito para aplicar o tema de cores da empresa
  useEffect(() => {
    if (user?.configuracoes) {
      const { cor_primaria, cor_secundaria } = user.configuracoes;

      if (cor_primaria) {
        document.documentElement.style.setProperty('--cor-primaria', cor_primaria);
      }
      if (cor_secundaria) {
        document.documentElement.style.setProperty('--cor-secundaria', cor_secundaria);
      }
    }
  }, [user]);

  // Função de logout
  const handleLogout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsNavOpen(false);
    navigate('/login');
  }, [navigate]);


  useEffect(() => {
    registerLogoutHandler(handleLogout);
  }, [handleLogout]);

  const handleLogin = (loggedUser) => {
    const { token: _token, ...usuarioSemToken } = loggedUser;
    const usuarioNormalizado = {
      ...usuarioSemToken,
      tipo_usuario: usuarioSemToken.tipo_usuario || usuarioSemToken.tipo,
    };
    setUser(usuarioNormalizado);
    localStorage.setItem("user", JSON.stringify(usuarioNormalizado));
    navigate('/dashboard'); 
  };


  const handleConfigSave = (savedConfig) => {
    if (user.empresa_id === savedConfig.empresa_id) {
      setUser(currentUser => {
        const updatedUser = {
          ...currentUser,
          configuracoes: { ...currentUser.configuracoes, ...savedConfig }
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        return updatedUser;
      });
    }
  };

  // Se não houver usuário, renderiza as páginas de autenticação
  if (!user) {
    return (
      <>
        <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="dark" />
        <Routes>
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/esqueci-senha" element={<EsqueciSenha />} />
          <Route path="/resetar-senha/:token" element={<ResetarSenha />} />
          {/* Qualquer outra rota redireciona para o login se não estiver logado */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </>
    );
  }

  return (
    <>
      {/* Container para as notificações bonitas */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
      <Navigation
        isNavOpen={isNavOpen}
        setIsNavOpen={setIsNavOpen}
        onLogout={handleLogout} // Passa a função de logout
        usuario={user}
      />

      <main className="main-content">
        <button
          className="hamburger-button"
          onClick={() => setIsNavOpen(true)}
        >
          ☰
        </button>

        <Suspense fallback={<div className="page-loading" role="status">Carregando...</div>}>
        <Routes>
          <Route path="/dashboard" element={<Dashboard usuario={user} />} />
          <Route path="/registrar-venda" element={<RegistrarVenda usuario={user} />} />
          <Route path="/historico" element={<Historico usuario={user} />} />
          <Route path="/gerenciar" element={<Gerenciar usuario={user} />} />
          {(user.tipo_usuario === 'admin' || user.tipo_usuario === 'dono') && <Route path="/equipe" element={<Equipe usuario={user} />} />}
          <Route path="/agenda" element={<Agenda usuario={user} />} />
          <Route path="/configuracoes" element={<Configuracoes />} />
          {/* Rota de Admin, acessível apenas ao dono */}
          {user.tipo_usuario === 'dono' && <Route path="/admin" element={<AdminConfig onConfigSave={handleConfigSave} />} />}
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
        </Suspense>
      </main>

      {isNavOpen && (
        <div className="overlay" onClick={() => setIsNavOpen(false)}></div>
      )}
    </>
  );
}

export default App;
