// Percentual = parte da venda que o colaborador recebe (0 a 100).
// Sem percentual configurado, não há divisão: tudo fica com o dono.
export const temPercentual = (percentual) =>
  percentual !== null && percentual !== undefined && percentual !== "";

export const dividirValor = (valor, percentual) => {
  const total = Number(valor || 0);
  if (!temPercentual(percentual)) {
    return { colaborador: 0, dono: total, configurado: false };
  }
  const colaborador = (total * Number(percentual)) / 100;
  return { colaborador, dono: total - colaborador, configurado: true };
};

export const somarDivisao = (vendas) =>
  vendas.reduce(
    (acc, venda) => {
      const parte = dividirValor(venda.valor_total, venda.percentual_comissao);
      acc.total += Number(venda.valor_total || 0);
      acc.colaborador += parte.colaborador;
      acc.dono += parte.dono;
      acc.configurado = acc.configurado || parte.configurado;
      return acc;
    },
    { total: 0, colaborador: 0, dono: 0, configurado: false }
  );

export const formatarMoeda = (valor) =>
  Number(valor || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
