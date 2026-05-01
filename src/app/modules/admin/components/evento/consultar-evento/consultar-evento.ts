declare var $: any;

import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EventoService } from '../../../../../core/services/evento.service';

@Component({
  selector: 'app-consultar-evento',
  standalone: false,
  templateUrl: './consultar-evento.html',
  styleUrl: './consultar-evento.css'
})
export class ConsultarEvento implements OnInit {

  dataSource: any[] = [];
  consulta: any[] = [];

  totalRegistros = 0;
  paginaAtual = 1;
  tamanhoPagina = 10;
  totalPaginas = 1;
  paginasVisiveis: number[] = [];

  carregando = false;
  filtro = '';

  mensagemErro: string[] = [];
  mensagemSucesso: string[] = [];

  private eventoService = inject(EventoService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.carregarEventos();
  }

  aplicarFiltro() {
    this.paginaAtual = 1;
    this.carregarEventos();
  }

  carregarEventos() {
    this.carregando = true;
    this.mensagemErro = [];

    this.eventoService
      .consultarEventoPaginado(this.paginaAtual, this.tamanhoPagina, this.filtro)
      .subscribe({
        next: (response: any) => {

          const items = response.items || [];

          this.consulta = items;
          this.dataSource = items;

          this.totalRegistros = response.totalCount || 0;
          this.totalPaginas = response.totalPages || 1;

          this.atualizarPaginasVisiveis();

          this.carregando = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.mensagemErro = ['Erro ao consultar eventos.'];
          this.carregando = false;
        }
      });
  }

  irParaPagina(p: number) {
    if (p < 1 || p > this.totalPaginas) return;
    this.paginaAtual = p;
    this.carregarEventos();
  }

  atualizarPaginasVisiveis() {
    const maxVisiveis = 5;

    let start = Math.max(1, this.paginaAtual - Math.floor(maxVisiveis / 2));
    let end = Math.min(this.totalPaginas, start + maxVisiveis - 1);

    start = Math.max(1, end - maxVisiveis + 1);

    this.paginasVisiveis = Array.from(
      { length: end - start + 1 },
      (_, i) => start + i
    );
  }

  // =========================
  // HELPERS
  // =========================

  getData(item: any): string {
    if (!item.dataInicial) return '';
    return new Date(item.dataInicial).toLocaleDateString('pt-BR');
  }

  getHora(item: any): string {
    if (item.diaInteiro) return 'Dia inteiro';
    return item.horaInicial?.substring(0, 5) ?? '';
  }

  getModalidade(valor: number): string {
    switch (valor) {
      case 1: return 'Presencial';
      case 2: return 'Online';
      default: return '-';
    }
  }

  getStatus(valor: number): string {
    switch (valor) {
      case 1: return 'A Fazer';
      case 2: return 'Em Andamento';
      case 3: return 'Concluído';
      case 4: return 'Cancelado';
      default: return '-';
    }
  }
}