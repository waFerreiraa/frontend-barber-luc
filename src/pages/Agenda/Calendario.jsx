import React, { useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import "./Calendario.css";

const NOMES_MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

// Gera uma chave "YYYY-MM-DD" a partir de uma data (no fuso local)
const getDateKey = (date) => {
  const ano = date.getFullYear();
  const mes = String(date.getMonth() + 1).padStart(2, "0");
  const dia = String(date.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
};

const Calendario = ({ agendamentos, selectedDate, onSelectDate }) => {
  // Mês atualmente exibido (começa no mês da data selecionada ou hoje)
  const [mesAtual, setMesAtual] = useState(() => {
    const base = selectedDate || new Date();
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });

  // Conjunto de dias que possuem agendamento (para marcar com bolinha)
  const diasComAgendamento = new Set(
    (agendamentos || []).map((ag) =>
      getDateKey(new Date(ag.data_hora_inicio)),
    ),
  );

  const hojeKey = getDateKey(new Date());
  const selectedKey = selectedDate ? getDateKey(selectedDate) : null;

  // Monta a grade de dias do mês (incluindo espaços vazios no início)
  const ano = mesAtual.getFullYear();
  const mes = mesAtual.getMonth();
  const primeiroDiaSemana = new Date(ano, mes, 1).getDay(); // 0 = domingo
  const diasNoMes = new Date(ano, mes + 1, 0).getDate();

  const celulas = [];
  // Espaços vazios antes do dia 1
  for (let i = 0; i < primeiroDiaSemana; i++) {
    celulas.push(null);
  }
  // Dias do mês
  for (let dia = 1; dia <= diasNoMes; dia++) {
    celulas.push(new Date(ano, mes, dia));
  }

  const irParaMesAnterior = () => {
    setMesAtual(new Date(ano, mes - 1, 1));
  };

  const irParaProximoMes = () => {
    setMesAtual(new Date(ano, mes + 1, 1));
  };

  return (
    <div className="calendario">
      <div className="calendario-header">
        <button
          type="button"
          className="calendario-nav"
          onClick={irParaMesAnterior}
          aria-label="Mês anterior"
        >
          <FaChevronLeft />
        </button>
        <span className="calendario-titulo">
          {NOMES_MESES[mes]} {ano}
        </span>
        <button
          type="button"
          className="calendario-nav"
          onClick={irParaProximoMes}
          aria-label="Próximo mês"
        >
          <FaChevronRight />
        </button>
      </div>

      <div className="calendario-grade calendario-dias-semana">
        {DIAS_SEMANA.map((dia) => (
          <div key={dia} className="calendario-dia-semana">
            {dia}
          </div>
        ))}
      </div>

      <div className="calendario-grade">
        {celulas.map((data, index) => {
          if (!data) {
            return <div key={`vazio-${index}`} className="calendario-celula vazia" />;
          }

          const dataKey = getDateKey(data);
          const ehHoje = dataKey === hojeKey;
          const ehSelecionado = dataKey === selectedKey;
          const temAgendamento = diasComAgendamento.has(dataKey);

          const classes = ["calendario-celula"];
          if (ehHoje) classes.push("hoje");
          if (ehSelecionado) classes.push("selecionado");

          return (
            <button
              type="button"
              key={dataKey}
              className={classes.join(" ")}
              onClick={() => onSelectDate(data)}
            >
              <span className="calendario-numero">{data.getDate()}</span>
              {temAgendamento && <span className="calendario-marcador" />}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Calendario;
