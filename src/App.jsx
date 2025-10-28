import React, { useState, useEffect } from "react";
import Navigation from "./components/Navigation/Navigation";
import Dashboard from "./pages/Dashboard.jsx";
import RegistrarVenda from "./pages/RegistrarVenda.jsx";
import Historico from "./pages/Historico.jsx";
import Gerenciar from "./pages/Gerenciar.jsx";
import Login from "./pages/Login.jsx";
import { registerLogoutHandler } from "./services/api";

function App() {
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [user, setUser] = useState(null);

  // Inicializa usuário a partir do localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      const usuarioNormalizado = {
        ...parsedUser,
        tipo_usuario: parsedUser.tipo_usuario || parsedUser.tipo,
      };
      setUser(usuarioNormalizado);
    }
  }, []);

  // Função de logout
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsNavOpen(false);
  };

  // Registra logout automático global
  useEffect(() => {
    registerLogoutHandler(handleLogout);
  }, []);

  const handleLogin = (loggedUser) => {
    const usuarioNormalizado = {
      ...loggedUser,
      tipo_usuario: loggedUser.tipo_usuario || loggedUser.tipo,
    };
    setUser(usuarioNormalizado);
    localStorage.setItem("user", JSON.stringify(usuarioNormalizado));
  };

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <Dashboard usuario={user} />;
      case "registrarVenda":
        return <RegistrarVenda setCurrentPage={setCurrentPage} />;
      case "historico":
        return <Historico />;
      case "gerenciar":
        return <Gerenciar />;
      default:
        return <Dashboard usuario={user} />;
    }
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <>
      <Navigation
        setCurrentPage={setCurrentPage}
        isNavOpen={isNavOpen}
        setIsNavOpen={setIsNavOpen}
        setUser={setUser}
      />

      <main className="main-content">
        <button
          className="hamburger-button"
          onClick={() => setIsNavOpen(true)}
        >
          ☰
        </button>

        {renderPage()}
      </main>

      {isNavOpen && (
        <div className="overlay" onClick={() => setIsNavOpen(false)}></div>
      )}
    </>
  );
}

export default App;
