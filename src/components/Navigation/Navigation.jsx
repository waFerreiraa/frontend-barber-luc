import React from 'react';
import { FaTachometerAlt, FaCashRegister, FaHistory, FaUsers, FaSignOutAlt } from 'react-icons/fa';
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
        <button className="close-button" onClick={() => setIsNavOpen(false)}>
          &times;
        </button>
      </div>
      <ul>
        <li onClick={() => handleNavClick('dashboard')}>
          <FaTachometerAlt className="icon" /> Dashboard
        </li>
        <li onClick={() => handleNavClick('registrarVenda')}>
          <FaCashRegister className="icon" /> Registrar Venda
        </li>
        <li onClick={() => handleNavClick('historico')}>
          <FaHistory className="icon" /> Histórico
        </li>
        <li onClick={() => handleNavClick('gerenciar')}>
          <FaUsers className="icon" /> Gerenciar
        </li>
        <li onClick={handleLogout} className="logout-button">
          <FaSignOutAlt className="icon" /> Logout
        </li>
      </ul>
    </nav>
  );
};

export default Navigation;
