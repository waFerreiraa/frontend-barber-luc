import React, { useState, useEffect } from 'react';
import Navigation from './components/Navigation/Navigation';
import Dashboard from './pages/Dashboard.jsx';
import RegistrarVenda from './pages/RegistrarVenda.jsx';
import Historico from './pages/Historico.jsx';
import Gerenciar from './pages/Gerenciar.jsx';
import Login from './pages/Login.jsx';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isNavOpen, setIsNavOpen] = useState(false);

  // Estado para controlar se o usuário está logado
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      // Normaliza o tipo_usuario
      const usuarioNormalizado = {
        ...parsedUser,
        tipo_usuario: parsedUser.tipo_usuario || parsedUser.tipo
      };
      setUser(usuarioNormalizado);
    }
  }, []);

  const handleLogin = (loggedUser) => {
    // Normaliza para garantir compatibilidade
    const usuarioNormalizado = {
      ...loggedUser,
      tipo_usuario: loggedUser.tipo_usuario || loggedUser.tipo
    };
    setUser(usuarioNormalizado);
    localStorage.setItem('user', JSON.stringify(usuarioNormalizado));
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard usuario={user} />;
      case 'registrarVenda':
        return <RegistrarVenda setCurrentPage={setCurrentPage} />;
      case 'historico':
        return <Historico />;
      case 'gerenciar':
        return <Gerenciar />;
      default:
        return <Dashboard usuario={user} />;
    }
  };

  // Se não estiver logado, mostra a tela de login
  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <>
      <Navigation 
        setCurrentPage={setCurrentPage} 
        isNavOpen={isNavOpen}
        setIsNavOpen={setIsNavOpen}
        setUser={setUser} // para logout
      />
      
      <main className="main-content">
        <button className="hamburger-button" onClick={() => setIsNavOpen(true)}>
          ☰
        </button>
        
        {renderPage()}
      </main>

      {isNavOpen && <div className="overlay" onClick={() => setIsNavOpen(false)}></div>}
    </>
  );
}

export default App;
