import React from "react";
import {
  FaTachometerAlt,
  FaCashRegister,
  FaHistory,
  FaUsers,
  FaSignOutAlt,
} from "react-icons/fa";
import "./Navigation.css";
import { logoutUser } from "../../services/api";

const Navigation = ({ setCurrentPage, isNavOpen, setIsNavOpen, setUser }) => {
  const handleNavClick = (page) => {
    setCurrentPage(page);
    setIsNavOpen(false);
  };

  const handleLogout = () => {
    logoutUser(); // limpa token e user
    setUser(null); // redireciona para Login
    setIsNavOpen(false);
  };

  return (
    <nav className={`sidebar ${isNavOpen ? "open" : ""}`}>
      <div className="sidebar-header">
        <h2>Barbearia</h2>
        <span>Painel</span>
        <button
          className="close-button"
          onClick={() => setIsNavOpen(false)}
          aria-label="Fechar menu"
        >
          &times;
        </button>
      </div>

      <ul>
        <li onClick={() => handleNavClick("dashboard")}>
          <FaTachometerAlt className="icon" /> Dashboard
        </li>
        <li onClick={() => handleNavClick("registrarVenda")}>
          <FaCashRegister className="icon" /> Registrar Venda
        </li>
        <li onClick={() => handleNavClick("historico")}>
          <FaHistory className="icon" /> Histórico
        </li>
        <li onClick={() => handleNavClick("gerenciar")}>
          <FaUsers className="icon" /> Serviços
        </li>
        <li onClick={handleLogout} className="logout-button">
          <FaSignOutAlt className="icon" /> Sair
        </li>
      </ul>
    </nav>
  );
};

export default Navigation;
