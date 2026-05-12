/*declare var $: any;*/
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { ConsultarUsuarioResponse } from '../../../../../core/models/usuario/consultar-usuarios.response';
import { environment } from '../../../../../../environments/environment.development';
import { UsuarioService } from '../../../../../core/services/usuario.service';
import { Router } from '@angular/router';
import { animate, style, transition, trigger } from '@angular/animations';
import { MatTableDataSource } from '@angular/material/table';


@Component({
  selector: 'app-consultar-usuarios',
  standalone: false,
  templateUrl: './consultar-usuarios.html',
  styleUrl: './consultar-usuarios.css',
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
export class ConsultarUsuarios {
  displayedColumns: string[] = ['nome', 'login', 'setor(s)', 'nivel(s)', 'situacao', 'acoes'];
  dataSource = new MatTableDataSource<ConsultarUsuarioResponse>([]);
  totalRegistros = 0;
  paginaAtual = 1;
  tamanhoPagina = 10;
  totalPaginas = 1;
  paginasVisiveis: number[] = [];
  carregando = false;
  filtro = '';
 consulta: ConsultarUsuarioResponse[] = [];
  mensagemErro: string[] = [];
  mensagemSucesso: string[] = [];

  urlBase = environment.apiDeslandes;

  private service = inject(UsuarioService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.buscarUsuarios();
  }
  aplicarFiltro() {
    this.paginaAtual = 1;
    this.buscarUsuarios();
  }
desbloquearUsuario(idUsuario: string) {
  if (!idUsuario) return;

  this.carregando = true;
  this.mensagemErro = [];
  this.mensagemSucesso = [];

  this.service.desbloquearUsuarioPorId(idUsuario).subscribe({
    next: () => {
      this.mensagemSucesso = ['Usuário desbloqueado com sucesso.'];

      // destrói o datatable antes de recarregar
     // this.destroyDataTables();

      // recarrega os dados
      this.buscarUsuarios();
    },
    error: () => {
      this.mensagemErro = ['Erro ao desbloquear usuário.'];
      this.carregando = false;
    }
  });
}

  /*buscarUsuarios() {
    this.carregando = true;
    this.mensagemErro = [];
    this.mensagemSucesso = [];

    this.service.consultarUsuarios().subscribe({
      next: (response) => {
        console.log("Dados da consulta", response);
        this.consulta = response;
        this.carregando = false;
        this.cdr.detectChanges();
        setTimeout(() => {
          this.initDataTable('#datatables-usuario');
        }, 0);
      },
      error: () => {
        this.mensagemErro = ['Erro ao consultar usuario.']; // <-- Correção da mensagem
        this.carregando = false;
      }
    });
  }*/

    buscarUsuarios() {
  this.carregando = true;
    this.mensagemErro = [];

       this.service.consultarUsuariosPaginado(this.paginaAtual, this.tamanhoPagina, this.filtro).subscribe({
      next: (response: any) => {
        this.dataSource.data = response.items || [];
        this.totalRegistros = response.totalCount || 0;
        this.totalPaginas = Math.ceil(this.totalRegistros / this.tamanhoPagina);
        this.atualizarPaginasVisiveis();
        this.carregando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.mensagemErro = ['Erro ao consultar atendimentop.'];
        this.carregando = false;
      }
    });
  }

 atualizarPaginasVisiveis() {
    const maxVisiveis = 5;
    let start = Math.max(1, this.paginaAtual - Math.floor(maxVisiveis / 2));
    let end = Math.min(this.totalPaginas, start + maxVisiveis - 1);
    start = Math.max(1, end - maxVisiveis + 1); // ajuste final
    this.paginasVisiveis = Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }
  /*initDataTable(selector: string) {
    const table = $(selector);
    if ($.fn.DataTable.isDataTable(table)) {
      table.DataTable().destroy();
    }
    table.DataTable({
      responsive: true,
      language: { url: 'assets/appprocon/datatable/datatable-ptbr.json' },
    });
  }*/
  irParaPagina(p: number) {
    if (p < 1 || p > this.totalPaginas) return;
    this.paginaAtual = p;
    this.buscarUsuarios();
  }
  /*destroyDataTables() {
    ['#datatables-usuario'].forEach(selector => {
      const table = $(selector);
      if ($.fn.DataTable.isDataTable(table)) {
        table.DataTable().destroy();
      }
    });
  }*/
}

  
