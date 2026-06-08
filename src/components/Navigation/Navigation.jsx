import React from "react";
import { NavLink } from "react-router-dom";
import {
  FaHome,
  FaCashRegister,
  FaHistory,
  FaUsersCog,
  FaTools,
  FaCog,
  FaSignOutAlt,
  FaCalendarAlt,
} from "react-icons/fa";
import "./Navigation.css";

const Navigation = ({ isNavOpen, setIsNavOpen, onLogout, usuario }) => {
  const handleLinkClick = () => {
    setIsNavOpen(false);
  };

  const isAdmin = usuario?.tipo_usuario === 'admin' || usuario?.tipo_usuario === 'dono';
  const isDono = usuario?.tipo_usuario === 'dono';

  return (
    <nav className={`sidebar ${isNavOpen ? "open" : ""}`}>
      <div className="sidebar-header">
        <h2>Menu</h2>
        <button onClick={() => setIsNavOpen(false)} className="close-button">&times;</button>
      </div>

      {/* A lista principal de navegação */}
      <ul className="main-nav-list">
        <li><NavLink to="/dashboard" onClick={handleLinkClick} className={({ isActive }) => isActive ? 'active' : ''}><FaHome /> <span>Dashboard</span></NavLink></li>
        <li><NavLink to="/registrar-venda" onClick={handleLinkClick} className={({ isActive }) => isActive ? 'active' : ''}><FaCashRegister /> <span>Registrar Venda</span></NavLink></li>
        <li><NavLink to="/agenda" onClick={handleLinkClick} className={({ isActive }) => isActive ? 'active' : ''}><FaCalendarAlt /> <span>Agenda</span></NavLink></li>
        <li><NavLink to="/historico" onClick={handleLinkClick} className={({ isActive }) => isActive ? 'active' : ''}><FaHistory /> <span>Histórico</span></NavLink></li>
        {isAdmin && (
          <li><NavLink to="/gerenciar" onClick={handleLinkClick} className={({ isActive }) => isActive ? 'active' : ''}><FaUsersCog /> <span>Gerenciar</span></NavLink></li>
        )}
        {isDono && (
          <li><NavLink to="/admin" onClick={handleLinkClick} className={({ isActive }) => isActive ? 'active' : ''}><FaTools /> <span>Admin</span></NavLink></li>
        )}
      </ul>

      {/* Itens do rodapé, agora dentro de uma lista válida */}
      <div className="sidebar-footer">
        <ul>
          <li>
            <NavLink to="/configuracoes" onClick={handleLinkClick} className={({ isActive }) => isActive ? 'active' : ''}>
              <FaCog /> <span>Configurações</span>
            </NavLink>
          </li>
          <li>
            <button onClick={onLogout} className="logout-button">
              <FaSignOutAlt /> <span>Sair</span>
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navigation;
