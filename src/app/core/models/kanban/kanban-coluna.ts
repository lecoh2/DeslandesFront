import { KanbanCard } from './kanban-card';

export interface KanbanColuna {
  status: number;
  nome: string;
  cor: string;
  cards: KanbanCard[];
}