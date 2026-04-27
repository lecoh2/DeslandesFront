import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';

import { ProcessoService } from '../../../../../core/services/processo.service';

@Component({
  selector: 'app-consultar-processo',
  standalone:false,
  templateUrl: './consultar-processo.html',
  styleUrl: './consultar-processo.css',
})
export class ConsultarProcesso implements OnInit {

  displayedColumns: string[] = ['pasta', 'numeroProcesso', 'titulo', 'acoes'];

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

  private processoService = inject(ProcessoService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.carregarProcessos();
  }

  aplicarFiltro() {
    this.paginaAtual = 1;
    this.carregarProcessos();
  }

  carregarProcessos() {
    this.carregando = true;
    this.mensagemErro = [];

    this.processoService
      .consultarProcessoPaginado(this.paginaAtual, this.tamanhoPagina, this.filtro)
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
          this.mensagemErro = ['Erro ao consultar processos.'];
          this.carregando = false;
        }
      });
  }

  irParaPagina(p: number) {
    if (p < 1 || p > this.totalPaginas) return;
    this.paginaAtual = p;
    this.carregarProcessos();
  }

  atualizarPaginasVisiveis() {
    const maxVisiveis = 5;

    let start = Math.max(1, this.paginaAtual - 2);
    let end = Math.min(this.totalPaginas, start + maxVisiveis - 1);

    start = Math.max(1, end - maxVisiveis + 1);

    this.paginasVisiveis = Array.from(
      { length: end - start + 1 },
      (_, i) => start + i
    );
  }
}