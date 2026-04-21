export interface KanbanCard {
  id: string;
  titulo: string;
  status: string;
  tipo: string;
  data: string;

  responsavel?: string;

  usuarioCriacaoNome?:string,

  // 👇 ADICIONA ISSO
prioridade: number | null;

  etiquetas?: {
    id: string;
    nome: string;
    cor: string;
  }[];
}