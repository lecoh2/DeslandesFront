export interface CadastrarProcessoResponse {
    success: boolean;
  mensagem: string;
  data: {
  pasta?: string;
  titulo?: string;
  numeroProcesso?: string;
}
}