import React from 'react';
import { NavLink } from 'react-router-dom';

import "../styles/header.scss";


export default function Header() {
  return (
    <header>
   
      <nav>
        <NavLink to="/">Sumário</NavLink>
        <NavLink to="/clientes">Clientes</NavLink>
        <NavLink to="/servicos">Serviços</NavLink>
        <NavLink to="/vendas">Vendas</NavLink>
        <NavLink to="/historico">Histórico</NavLink>
      </nav>
    </header>
  );
}
