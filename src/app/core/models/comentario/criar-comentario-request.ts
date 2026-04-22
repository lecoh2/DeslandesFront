export interface CriarComentarioRequest {
  tarefaId?: string | null;
  eventoId?: string | null;
  texto: string;
}
