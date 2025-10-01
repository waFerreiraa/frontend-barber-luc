// src/components/Card.jsx
import React from 'react';

const Card = ({ children, style, onClick }) => {
  return (
    <div className="card" style={style} onClick={onClick}>
      {children}
    </div>
  );
};

export default Card;