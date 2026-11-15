import React, { useContext, useEffect, useRef } from "react";
import { NavLink } from "react-router-dom";
import {
  LuLayoutDashboard,
  LuBanknote,
  LuCalendarDays,
  LuHistory,
  LuUsers,
  LuUserCog,
  LuWrench,
  LuSettings,
  LuLogOut,
  LuX,
} from "react-icons/lu";
import { ThemeContext } from "../../contexts/ThemeContext";
import LogoBarbearia from "../../assets/penteado.png";
import LogoSalao from "../../assets/mulher.png";
import "./Navigation.css";

const ROTULOS_TIPO = {
  admin: "Administrador",
  dono: "Dono",
  colaborador: "Colaborador",
};

const Navigation = ({ isNavOpen, setIsNavOpen, onLogout, usuario }) => {
  const { tema } = useContext(ThemeContext);
  const botaoFecharRef = useRef(null);

  const isAdmin = usuario?.tipo_usuario === "admin" || usuario?.tipo_usuario === "dono";
  const isDono = usuario?.tipo_usuario === "dono";

  const nomeEmpresa =
    usuario?.configuracoes?.nome_exibicao || (tema === "salao" ? "Salão de Beleza" : "Barbearia");
  const logo = usuario?.configuracoes?.logo_url || (tema === "salao" ? LogoSalao : LogoBarbearia);
  const rotuloTipo = ROTULOS_TIPO[usuario?.tipo_usuario] || "";

  const fecharMenu = () => setIsNavOpen(false);

  // Com o menu aberto no celular: Esc fecha, a página atrás não rola e o foco vai para o menu.
  useEffect(() => {
    if (!isNavOpen) return undefined;

    const aoTeclar = (evento) => {
      if (evento.key === "Escape") setIsNavOpen(false);
    };
    const overflowAnterior = document.body.style.overflow;

    document.addEventListener("keydown", aoTeclar);
    document.body.style.overflow = "hidden";
    botaoFecharRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", aoTeclar);
      document.body.style.overflow = overflowAnterior;
    };
  }, [isNavOpen, setIsNavOpen]);

  const Item = ({ to, icone, children }) => (
    <li>
      <NavLink
        to={to}
        onClick={fecharMenu}
        className={({ isActive }) => (isActive ? "active" : "")}
      >
        {icone}
        <span>{children}</span>
      </NavLink>
    </li>
  );

  return (
    <nav className={`sidebar ${isNavOpen ? "open" : ""}`} aria-label="Menu principal">
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <img className="sidebar-logo" src={logo} alt="" />
          <strong className="sidebar-empresa">{nomeEmpresa}</strong>
        </div>
        <button
          ref={botaoFecharRef}
          type="button"
          onClick={fecharMenu}
          className="close-button"
          aria-label="Fechar menu"
        >
          <LuX />
        </button>
      </div>

      <div className="sidebar-scroll">
        <ul className="main-nav-list">
          <Item to="/dashboard" icone={<LuLayoutDashboard />}>Dashboard</Item>
          <Item to="/registrar-venda" icone={<LuBanknote />}>Registrar Venda</Item>
          <Item to="/agenda" icone={<LuCalendarDays />}>Agenda</Item>
          <Item to="/historico" icone={<LuHistory />}>Histórico</Item>
        </ul>

        {isAdmin && (
          <>
            <p className="sidebar-section-title">Gestão</p>
            <ul className="main-nav-list">
              <Item to="/equipe" icone={<LuUsers />}>Equipe</Item>
              <Item to="/gerenciar" icone={<LuUserCog />}>Gerenciar</Item>
              {isDono && <Item to="/admin" icone={<LuWrench />}>Admin</Item>}
            </ul>
          </>
        )}
      </div>

      <div className="sidebar-footer">
        {usuario?.nome && (
          <div className="sidebar-usuario">
            <span className="sidebar-avatar" aria-hidden="true">
              {usuario.nome.trim().charAt(0).toUpperCase()}
            </span>
            <div className="sidebar-usuario-texto">
              <strong>{usuario.nome}</strong>
              {rotuloTipo && <span>{rotuloTipo}</span>}
            </div>
          </div>
        )}
        <ul>
          <Item to="/configuracoes" icone={<LuSettings />}>Configurações</Item>
          <li>
            <button type="button" onClick={onLogout} className="logout-button">
              <LuLogOut /> <span>Sair</span>
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navigation;
