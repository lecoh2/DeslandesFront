export interface CriarListaTarefaRequest {
  descricao: string;
  concluida?: boolean;
  dataConclusao?: Date | null;
}