// src/App.jsx
import React, { useState } from 'react';
import Navigation from './components/Navigation/Navigation';
import Dashboard from './pages/Dashboard';
import RegistrarVenda from './pages/RegistrarVenda';
import Historico from './pages/Historico';
import Gerenciar from './pages/Gerenciar';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  
  // NOVO: Estado para controlar se o menu lateral está aberto no mobile
  const [isNavOpen, setIsNavOpen] = useState(false);

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'registrarVenda':
        return <RegistrarVenda setCurrentPage={setCurrentPage} />; // Passando a função setCurrentPage
      case 'historico':
        return <Historico />;
      case 'gerenciar':
        return <Gerenciar />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <>
      {/* Passamos o estado e a função para o componente de navegação */}
      <Navigation 
        setCurrentPage={setCurrentPage} 
        isNavOpen={isNavOpen}
        setIsNavOpen={setIsNavOpen}
      />
      
      <main className="main-content">
        {/* NOVO: Botão Hambúrguer que só aparece no mobile */}
        <button className="hamburger-button" onClick={() => setIsNavOpen(true)}>
          ☰
        </button>
        
        {renderPage()}
      </main>

      {/* NOVO: Overlay que fecha o menu ao clicar fora */}
      {isNavOpen && <div className="overlay" onClick={() => setIsNavOpen(false)}></div>}
    </>
  );
}

export default App;