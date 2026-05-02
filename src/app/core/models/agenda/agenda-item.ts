export interface AgendaItem {
  id: number;
  title: string;

  start: Date | string;
  end?: Date | string;

  type: 'evento' | 'tarefa';

  status?: number;

  endereco?: string;
  criador?: string;

  responsaveis?: any[];
}