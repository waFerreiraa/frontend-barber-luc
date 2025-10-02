import React from 'react';
import './Navigation.css';

// Recebendo setUser do App para controlar logout
const Navigation = ({ setCurrentPage, isNavOpen, setIsNavOpen, setUser }) => {

  const handleNavClick = (page) => {
    setCurrentPage(page);
    setIsNavOpen(false); // Fecha o menu ao selecionar uma página
  };

  // Função de logout: limpa localStorage e avisa o App
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <nav className={`sidebar ${isNavOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <h2>Barbearia</h2>
        <span>Painel</span>
        {/* Botão de fechar menu no mobile */}
        <button className="close-button" onClick={() => setIsNavOpen(false)}>
          &times;
        </button>
      </div>
      <ul>
        <li onClick={() => handleNavClick('dashboard')}>Dashboard</li>
        <li onClick={() => handleNavClick('registrarVenda')}>Registrar Venda</li>
        <li onClick={() => handleNavClick('historico')}>Histórico</li>
        <li onClick={() => handleNavClick('gerenciar')}>Gerenciar</li>
        <li onClick={handleLogout} className="logout-button">Logout</li>
      </ul>
    </nav>
  );
};

export default Navigation;
