export interface KanbanCard {
  id: string;
  titulo: string;
  status: string;
  tipo: string;
  data: string;
dataInicial:string;
dataFinal:string;
horaInicial:String;
horaFinal:string;
  responsavel?: string;
historico?:string;
novoComentario?:string;
comentarios?:string;
  usuarioCriacaoNome?:string;
prioridadeDescricao?:string;
quantidadeComentarios?: number;
  // 👇 ADICIONA ISSO
prioridade: number | null;

  etiquetas?: {
    id: string;
    nome: string;
    cor: string;
  }[];
}