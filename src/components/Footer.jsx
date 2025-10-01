import React from 'react';
import "../styles/Footer.scss";


export default function Footer() {
  return (
    <footer>
      <p>© {new Date().getFullYear()} Barbearia. Todos os direitos reservados.</p>
      <p>
        Desenvolvido por <a href="https://seusite.com" target="_blank" rel="noopener noreferrer">Seu Nome</a>
      </p>
    </footer>
  );
}
