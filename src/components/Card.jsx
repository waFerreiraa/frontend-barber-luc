// src/components/Card.jsx
import React from 'react';
import './Card.css'; // Criaremos este CSS separado

const Card = ({ children, className = '', style, onClick }) => {
  return (
    <div className={`card ${className}`} style={style} onClick={onClick}>
      {children}
    </div>
  );
};

export default Card;
