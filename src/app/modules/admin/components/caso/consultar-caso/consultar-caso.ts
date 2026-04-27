declare var $: any;

import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';

import { CasoService } from '../../../../../core/services/caso.service';

@Component({
  selector: 'app-consultar-caso',
  standalone:false,
  templateUrl: './consultar-caso.html',
  styleUrl: './consultar-caso.css',
})
export class ConsultarCaso implements OnInit {

  displayedColumns: string[] = ['titulo', 'registro', 'clientes', 'etiquetas', 'acoes'];

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

  private casoService = inject(CasoService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.carregarCasos();
  }

  aplicarFiltro() {
    this.paginaAtual = 1;
    this.carregarCasos();
  }

  carregarCasos() {
    this.carregando = true;
    this.mensagemErro = [];
    this.mensagemSucesso = [];

    this.casoService
      .consultarCasoPaginado(this.paginaAtual, this.tamanhoPagina, this.filtro)
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
          this.mensagemErro = ['Erro ao consultar casos.'];
          this.carregando = false;
        }
      });
  }

  irParaPagina(p: number) {
    if (p < 1 || p > this.totalPaginas) return;
    this.paginaAtual = p;
    this.carregarCasos();
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

  // 👥 CLIENTES
  getClientes(item: any): string {
    return item?.grupoCasoCliente
      ?.map((c: any) => c.nome)
      .join(', ') || '';
  }

  // 🏷️ ETIQUETAS
  getEtiquetas(item: any): string {
    return item?.grupoCasoEtiqueta
      ?.map((e: any) => e.nome)
      .join(', ') || '';
  }
}