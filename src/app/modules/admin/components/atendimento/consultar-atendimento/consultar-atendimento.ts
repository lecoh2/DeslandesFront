declare var $: any;

import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { trigger, transition, style, animate } from '@angular/animations';

import { AtendimentoService } from '../../../../../core/services/atendimento.service';

@Component({
  selector: 'app-consultar-atendimento',
  standalone: false,
  templateUrl: './consultar-atendimento.html',
  styleUrl: './consultar-atendimento.css',
  animations: [
    trigger('fadeAnimation', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-in', style({ opacity: 1 })),
      ]),
      transition(':leave', [
        animate('300ms ease-out', style({ opacity: 0 })),
      ]),
    ]),
  ],
})
export class ConsultarAtendimento implements OnInit {

  // 🔥 tabela (igual pessoa)
  displayedColumns: string[] = ['assunto', 'registro', 'clientes', 'etiquetas', 'acoes'];

  dataSource = new MatTableDataSource<any>([]);
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

  private atendimentoService = inject(AtendimentoService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.carregarAtendimentos();
  }

  // =========================
  // 🔎 FILTRO
  // =========================
  aplicarFiltro() {
    this.paginaAtual = 1;
    this.carregarAtendimentos();
  }

  // =========================
  // 📦 CARREGAR DADOS
  // =========================
  carregarAtendimentos() {
    this.carregando = true;
    this.mensagemErro = [];
    this.mensagemSucesso = [];

    this.atendimentoService
      .consultarAtendimentoPaginado(this.paginaAtual, this.tamanhoPagina, this.filtro)
      .subscribe({
        next: (response: any) => {

          const items = response.items || [];

          this.consulta = items;
          this.dataSource.data = items;

          this.totalRegistros = response.totalCount || 0;
          this.totalPaginas = Math.ceil(this.totalRegistros / this.tamanhoPagina);

          this.atualizarPaginasVisiveis();

          this.carregando = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.mensagemErro = ['Erro ao consultar atendimentos.'];
          this.carregando = false;
        }
      });
  }

  // =========================
  //  PAGINAÇÃO
  // =========================
  irParaPagina(p: number) {
    if (p < 1 || p > this.totalPaginas) return;
    this.paginaAtual = p;
    this.carregarAtendimentos();
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
  // 🔄 TROCA DE TIPO (caso queira filtro futuro)
  // =========================
  onTipoPessoaChange() {
    this.dataSource.data = [];
    this.consulta = [];
    this.paginaAtual = 1;
    this.carregarAtendimentos();
  }

  // =========================
  // 🧠 HELPERS PARA TEMPLATE
  // =========================

  getClientes(item: any): string {
    return item?.grupoAtendimentoCliente
      ?.map((c: any) => c.nome)
      .join(', ') || '';
  }

  getEtiquetas(item: any): string {
    return item?.grupoAtendimentoEtiqueta
      ?.map((e: any) => e.nome)
      .join(', ') || '';
  }
}