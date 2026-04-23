import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { KanbanColuna } from '../../../../core/models/kanban/kanban-coluna';
import { KanbanService } from '../../../../core/services/kanban.service';

import { ComentarioService } from '../../../../core/services/comenario.service';
import { CriarComentarioResponse } from '../../../../core/models/comentario/criar-comentario-response';
import { HistoricoService } from '../../../../core/services/historico.service';
import { TipoEntidadeEnum } from '../../../../core/models/enums/tipo-entidade/tipo-entidadeEnum';

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
  private comentarioService = inject(ComentarioService)
  private cdr = inject(ChangeDetectorRef);
  private historicoService = inject(HistoricoService);
  comentarios: CriarComentarioResponse[] = [];
  novoComentario: string = '';
  mensagemSucesso: string[] = [];
  mensagemErro: string[] = [];
  cardSelecionado: any = null;
  isLoadingDetalhe = false;
  cardIdSelecionado: string | null = null;
  mensagemSucessoAtual: string | null = null;
  mensagemErroAtual: string | null = null;

  historico: any[] = [];
  private modalInstance: any;
  filtro = {
    periodo: null as string | null,
    atribuicao: null as string | null,
    pessoaId: null as string | null,
    tipo: null as string | null,
    status: null as string | null
  }; 
filtrarPorStatus(): void {

  if (!this.filtro.status) {
    this.colunas = structuredClone(this.colunasOriginais);
    return;
  }

  this.colunas = this.colunasOriginais.map(coluna => ({
    ...coluna,
   cards: coluna.cards.filter(c => Number(c.status) === Number(this.filtro.status))
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
getCorColuna(status: number): string {
  switch (status) {
    case 1: return 'bg-secondary';   // A Fazer
    case 2: return 'bg-primary';     // Em Andamento
    case 3: return 'bg-success';     // Concluído
       // Cancelado
    default: return 'bg-dark';
  }
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

  mudarStatus(id: string, status: number) {
  this.kanbanService.atualizarStatus(id, status)
    .subscribe(() => {
      this.carregarKanban(); // 🔥 atualiza tela
    });
}
  ngOnInit(): void {

    this.carregarKanban();
  }
carregarKanban(): void {
  this.kanbanService.consultar().subscribe({
    next: (res) => {

      this.colunas = res
        .filter(coluna => coluna.status !== 4) // ❌ remove cancelado
        .map(coluna => ({
          ...coluna,
          cards: (coluna.cards ?? []).map(card => ({
            ...card,
            prioridade: card.prioridade ?? null
          }))
        }))
        .filter(coluna => coluna.cards.length > 0); // 🔥 remove coluna vazia

      this.colunasOriginais = structuredClone(this.colunas);
    }
  });
}
  getStatusLabel(status: number): string {
    switch (status) {
      case 1: return 'A Fazer';
      case 2: return 'Em Andamento';
      case 3: return 'Concluído';
      case 4: return 'Cancelado';
      default: return '---';
    }
  }
  getModalidadeLabel(status: number): string {
    switch (status) {
      case 1: return 'Presencial';
      case 2: return 'Online';
      case 3: return 'Hibrido ';
      case 4: return 'Nao se aplica';
      default: return '---';
    }
  }
  getMudancas(h: any): { campo: string, antes: any, depois: any }[] {
    if (!h.antes || !h.depois) return [];

    const mudancas: any[] = [];

    Object.keys(h.depois).forEach(key => {
      const antes = h.antes[key];
      const depois = h.depois[key];

      if (JSON.stringify(antes) !== JSON.stringify(depois)) {
        mudancas.push({ campo: key, antes, depois });
      }
    });

    return mudancas;
  }

  formatarCampo(campo: string): string {
    const map: any = {
      Titulo: 'Título',
      DataInicial: 'Data Inicial',
      DataFinal: 'Data Final',
      HoraInicial: 'Hora Inicial',
      HoraFinal: 'Hora Final',
      DiaInteiro: 'Dia Inteiro',
      Endereco: 'Endereço',
      Observacao: 'Observação',
      Modalidade: 'Modalidade',
      StatusGeralKanban: 'Status',
      Responsaveis: 'Responsáveis'
    };

    return map[campo] || campo;
  }

  formatarValor(valor: any, campo: string): string {

    if (valor === null || valor === undefined) return '-';

    // ARRAY (Responsáveis)
    if (Array.isArray(valor)) {
      return valor.join(', ');
    }

    // BOOLEAN
    if (typeof valor === 'boolean') {
      return valor ? 'Sim' : 'Não';
    }

    // STATUS
    if (campo === 'StatusGeralKanban') {
      return this.getStatusLabel(valor);
    }
    // 🔥 MODALIDADE (AQUI)
    if (campo === 'Modalidade') {
      return this.getModalidadeLabel(valor);
    }
    // DATA
    if (campo.toLowerCase().includes('data')) {
      return new Date(valor).toLocaleDateString('pt-BR');
    }

    // HORA
    if (campo.toLowerCase().includes('hora')) {
      return valor;
    }

    return valor.toString();
  }
  selecionarCard(card: any): void {

    this.cardSelecionado = card;
    this.cardIdSelecionado = card.id;

    this.mensagemSucessoAtual = null;
    this.mensagemErroAtual = null;

    this.comentarios = [];
    this.novoComentario = '';

    this.isLoadingDetalhe = true;

    const el = document.getElementById('modalDetalhes');
    this.modalInstance = bootstrap.Modal.getOrCreateInstance(el);
    this.modalInstance.show();

    // 🔥 AGORA SIM
    this.carregarHistorico(card);

    this.kanbanService.obterDetalhes(card.id, card.tipo)
      .subscribe({
        next: (res) => {

          this.cardSelecionado = {
            ...res,
            responsaveis: res.responsaveis ?? [],
            etiquetas: res.etiquetas ?? []
          };

          this.isLoadingDetalhe = false;

          this.carregarComentarios();

          this.cdr.detectChanges();
        },
        error: () => this.isLoadingDetalhe = false
      });
  }
  carregarHistorico(card: any) {

    console.log('CARD RECEBIDO:', card);
    console.log('TIPO:', card.tipo);

    const entidade =
      card.tipo?.toLowerCase?.() === 'evento'
        ? TipoEntidadeEnum.Evento
        : TipoEntidadeEnum.Tarefa;

    console.log('ENTIDADE ENVIADA:', entidade);

    this.historicoService
      .ConsultarHistorico(entidade, card.id)
      .subscribe({
        next: (res) => {
          console.log('HISTÓRICO RECEBIDO:', res);
          this.historico = (res ?? []).map(h => ({
            ...h,
            antes: h.dadosAntes ? JSON.parse(h.dadosAntes) : null,
            depois: h.dadosDepois ? JSON.parse(h.dadosDepois) : null
          }));
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('ERRO HISTÓRICO:', err);
        }
      });
  }
  adicionarComentario() {

    if (!this.novoComentario?.trim()) return;

    const request = {
      tarefaId: this.cardSelecionado.tipo === 'Tarefa'
        ? this.cardSelecionado.id
        : null,

      eventoId: this.cardSelecionado.tipo === 'Evento'
        ? this.cardSelecionado.id
        : null,

      texto: this.novoComentario
    };

    this.comentarioService.criarComentario(request).subscribe({
      next: (res) => {

        this.novoComentario = '';

        // 🔥 AQUI É O SEGREDO
        this.mensagemSucessoAtual =
          res?.message ?? 'Comentário cadastrado com sucesso';

        this.mensagemErroAtual = null;

        this.carregarComentarios();

        this.cdr.detectChanges();

        // auto remove
        setTimeout(() => {
          this.mensagemSucessoAtual = null;
          this.cdr.detectChanges();
        }, 3000);
      },
      error: () => {
        this.mensagemErroAtual = 'Erro ao cadastrar comentário';
      }
    });
  }
  carregarComentarios() {

    if (!this.cardSelecionado) return;

    const params: any = {};

    if (this.cardSelecionado.tipo === 'Tarefa') {
      params.tarefaId = this.cardSelecionado.id;
    }

    if (this.cardSelecionado.tipo === 'Evento') {
      params.eventoId = this.cardSelecionado.id;
    }

    this.comentarioService.obterComentario(params)
      .subscribe({
        next: (res) => {
          this.comentarios = res ?? [];
          this.cdr.detectChanges();
        }
      });
  }
}