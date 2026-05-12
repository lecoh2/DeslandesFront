export interface ContaFinanceira {
  id: string;
  tipo: number;
  valor: number;
  valorPago: number;
  dataVencimento: Date;
  status: number;
  descricao: string;

  processoId?: string;
  casoId?: string;
  atendimentoId?: string;
  clienteId?: string;
}