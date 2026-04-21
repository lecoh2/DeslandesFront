import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { KanbanColuna } from '../../../../core/models/kanban/kanban-coluna';
import { KanbanService } from '../../../../core/services/kanban.service';

declare var bootstrap: any;

@Component({
  selector: 'app-gestao-atividades',
  standalone: false,
  templateUrl: './gestao-atividades.html',
  styleUrl: './gestao-atividades.css'
})
export class GestaoAtividades implements OnInit {

  colunas: KanbanColuna[] = [];
  private colunasOriginais: KanbanColuna[] = [];

  private kanbanService = inject(KanbanService);
  private cdr = inject(ChangeDetectorRef);

  cardSelecionado: any = null;
  isLoadingDetalhe = false;

  private modalInstance: any;
filtro = {
  periodo: null as string | null,
  atribuicao: null as string | null,
  pessoaId: null as string | null,
  tipo: null as string | null,
  status: null as string | null
};filtrarPorStatus(): void {
  if (!this.filtro.status) {
    this.colunas = structuredClone(this.colunasOriginais);
    return;
  }

  this.colunas = this.colunasOriginais.map(coluna => ({
    ...coluna,
    cards: coluna.cards.filter(c =>
      String(c.status) === String(this.filtro.status)
    )
  }));
}
prioridadeLabel: Record<number, string> = {
  1: 'Baixa',
  2: 'Média',
  3: 'Alta',
  4: 'Urgente'
};

prioridadeCor: Record<number, string> = {
  1: '#2ecc71',
  2: '#f1c40f',
  3: '#e67e22',
  4: '#e74c3c'
};
getPrioridadeLabel(p: number): string {
  return this.prioridadeLabel[p] ?? '---';
}

getPrioridadeCor(p: number): string {
  return this.prioridadeCor[p] ?? '#6c757d';
}
getPrioridade(p?: number | null): { label: string; cor: string } {
  if (!p) {
    return { label: 'Sem prioridade', cor: '#6c757d' };
  }

  switch (p) {
    case 1: return { label: 'Baixa', cor: '#2ecc71' };
    case 2: return { label: 'Média', cor: '#f1c40f' };
    case 3: return { label: 'Alta', cor: '#e67e22' };
    case 4: return { label: 'Urgente', cor: '#e74c3c' };
    default: return { label: '---', cor: '#6c757d' };
  }
}
limparFiltro(): void {
  this.filtro = {
    periodo: null,
    atribuicao: null,
    pessoaId: null,
    tipo: null,
    status: null
  };

  this.colunas = structuredClone(this.colunasOriginais);
}
  ngOnInit(): void {
    this.carregarKanban();
  }

  carregarKanban(): void {
this.kanbanService.consultar().subscribe({
  next: (res) => {

this.colunas = res.map(coluna => ({
  ...coluna,
  cards: (coluna.cards ?? []).map(card => ({
    ...card,
    prioridade: card.prioridade ?? null
  }))
}));

this.colunasOriginais = structuredClone(this.colunas);
  }
});
  }

  selecionarCard(card: any): void {

    this.cardSelecionado = null;
    this.isLoadingDetalhe = true;

    // abre modal IMEDIATO
    const el = document.getElementById('modalDetalhes');
    this.modalInstance = bootstrap.Modal.getOrCreateInstance(el);
    this.modalInstance.show();

    this.kanbanService.obterDetalhes(card.id, card.tipo)
      .subscribe({
        next: (res) => {

          this.cardSelecionado = {
            ...res,
            responsaveis: res.responsaveis ?? [],
            etiquetas: res.etiquetas ?? []
          };

          this.isLoadingDetalhe = false;

          this.cdr.detectChanges();
        },
        error: () => {
          this.isLoadingDetalhe = false;
        }
      });
  }
}