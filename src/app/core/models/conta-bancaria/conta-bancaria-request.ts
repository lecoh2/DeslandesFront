// conta-bancaria-request.ts
export interface ContaBancariaRequest {
  nomeBanco?: string;
  agencia?: string;
  numeroConta?: string;
  pix?: string;
  tipoConta?: number;
}