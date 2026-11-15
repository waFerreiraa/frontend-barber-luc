// Períodos usados nos filtros de vendas (Histórico e Equipe).
export const PERIODOS = [
  { id: "dia", rotulo: "Hoje" },
  { id: "semana", rotulo: "Esta semana" },
  { id: "semana_passada", rotulo: "Semana passada" },
  { id: "ultimos7", rotulo: "Últimos 7 dias" },
  { id: "mes", rotulo: "Este mês" },
];

const inicioDoDia = (data) => {
  const d = new Date(data);
  d.setHours(0, 0, 0, 0);
  return d;
};

const somarDias = (data, dias) => {
  const d = new Date(data);
  d.setDate(d.getDate() + dias);
  return d;
};

// Retorna [inicio, fim) do período. A semana vai de domingo a sábado.
export const intervaloDoPeriodo = (periodo, referencia = new Date()) => {
  const hoje = inicioDoDia(referencia);
  const domingoDestaSemana = somarDias(hoje, -hoje.getDay());

  switch (periodo) {
    case "dia":
      return [hoje, somarDias(hoje, 1)];
    case "semana":
      return [domingoDestaSemana, somarDias(domingoDestaSemana, 7)];
    case "semana_passada":
      return [somarDias(domingoDestaSemana, -7), domingoDestaSemana];
    case "ultimos7":
      return [somarDias(hoje, -6), somarDias(hoje, 1)];
    case "mes":
      return [
        new Date(hoje.getFullYear(), hoje.getMonth(), 1),
        new Date(hoje.getFullYear(), hoje.getMonth() + 1, 1),
      ];
    default:
      return [null, null];
  }
};

export const filtrarPorPeriodo = (vendas, periodo, referencia = new Date()) => {
  const [inicio, fim] = intervaloDoPeriodo(periodo, referencia);
  if (!inicio) return vendas;

  return vendas.filter((venda) => {
    const dataVenda = new Date(venda.data_venda);
    return dataVenda >= inicio && dataVenda < fim;
  });
};

const formatarDiaMes = (data) =>
  data.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });

// Ex.: "08/11 a 14/11"
export const descreverIntervalo = (periodo, referencia = new Date()) => {
  const [inicio, fim] = intervaloDoPeriodo(periodo, referencia);
  if (!inicio) return "";
  const ultimoDia = somarDias(fim, -1);
  if (inicio.getTime() === ultimoDia.getTime()) return formatarDiaMes(inicio);
  return `${formatarDiaMes(inicio)} a ${formatarDiaMes(ultimoDia)}`;
};
