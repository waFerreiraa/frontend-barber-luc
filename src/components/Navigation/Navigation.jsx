// src/components/Navigation.jsx
import React from 'react';
import './Navigation.css';

// Recebendo as novas propriedades
const Navigation = ({ setCurrentPage, isNavOpen, setIsNavOpen }) => {

  const handleNavClick = (page) => {
    setCurrentPage(page);
    setIsNavOpen(false); // Fecha o menu ao selecionar uma página
  };

  // Adiciona a classe 'open' condicionalmente
  return (
    <nav className={`sidebar ${isNavOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <h2>Barbearia</h2>
        <span>Painel</span>
        {/* NOVO: Botão de fechar */}
        <button className="close-button" onClick={() => setIsNavOpen(false)}>
          &times;
        </button>
      </div>
      <ul>
        <li onClick={() => handleNavClick('dashboard')}>Dashboard</li>
        <li onClick={() => handleNavClick('registrarVenda')}>Registrar Venda</li>
        <li onClick={() => handleNavClick('historico')}>Histórico</li>
        <li onClick={() => handleNavClick('gerenciar')}>Gerenciar</li>
      </ul>
    </nav>
  );
};

export default Navigation;