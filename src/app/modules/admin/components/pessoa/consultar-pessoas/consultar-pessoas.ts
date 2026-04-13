declare var $: any;
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { ConsultarPessoaResponse } from '../../../../../core/models/pessoa/consultar-pessoa-response';
import { environment } from '../../../../../../environments/environment.development';
import { PessoaService } from '../../../../../core/services/pessoa.service';
import { Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { trigger, transition, style, animate } from '@angular/animations';
@Component({
  selector: 'app-consultar-pessoas',
  standalone: false,
  templateUrl: './consultar-pessoas.html',
  styleUrl: './consultar-pessoas.css',
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
export class ConsultarPessoas implements OnInit {


  displayedColumns: string[] = ['nome', 'profissao', 'cpf', 'rg', 'telefone', 'acoes'];
  dataSource = new MatTableDataSource<ConsultarPessoaResponse>([]);
  totalRegistros = 0;
  paginaAtual = 1;
  tamanhoPagina = 10;
  totalPaginas = 1;
  paginasVisiveis: number[] = [];
  carregando = false;
  filtro = '';

  consulta: ConsultarPessoaResponse[] = [];
  mensagemErro: string[] = [];
  mensagemSucesso: string[] = [];

  urlBase = environment.apiDeslandes;

  tipoPessoaSelecionado: 'fisica' | 'juridica' = 'fisica';

  private service = inject(PessoaService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.carregarPessoas();
  } aplicarFiltro() {
    this.paginaAtual = 1;
    this.carregarPessoas();
  }

carregarPessoas() {
  this.carregando = true;
  this.mensagemErro = [];
  this.mensagemSucesso = [];

  if (this.tipoPessoaSelecionado === 'fisica') {
    this.service.consultarPessoaFisicaPaginado(this.paginaAtual, this.tamanhoPagina, this.filtro).subscribe({
      next: (response: any) => {
      
        this.dataSource.data = response.items || []; // tabela física usa dataSource
        this.totalRegistros = response.totalCount || 0;
        this.totalPaginas = Math.ceil(this.totalRegistros / this.tamanhoPagina);
        this.atualizarPaginasVisiveis();
        this.carregando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.mensagemErro = ['Erro ao consultar pessoas físicas.'];
        this.carregando = false;
      }
    });
  } 
  else {
    this.service.consultarPessoaJuridicaPaginado(this.paginaAtual, this.tamanhoPagina, this.filtro).subscribe({
      next: (response: any) => {
        console.log(this.formatarInscricaoEstadual('123456789'));
        this.consulta = response.items || []; // tabela jurídica usa consulta
        this.totalRegistros = response.totalCount || 0;
        this.totalPaginas = Math.ceil(this.totalRegistros / this.tamanhoPagina);
        this.atualizarPaginasVisiveis();
        this.carregando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.mensagemErro = ['Erro ao consultar pessoas jurídicas.'];
        this.carregando = false;
      }
    });
  }
}

    irParaPagina(p: number) {
      if (p < 1 || p > this.totalPaginas) return;
      this.paginaAtual = p;
      this.carregarPessoas();
    }
getIconPerfil(perfil?: number) {
  switch (perfil) {
    case 1:
      return 'fas fa-user text-primary';
    case 2:
      return 'fas fa-address-book text-success';
    default:
      return 'fas fa-question-circle text-muted';
  }
}
    atualizarPaginasVisiveis() {
      const maxVisiveis = 5;
      let start = Math.max(1, this.paginaAtual - Math.floor(maxVisiveis / 2));
      let end = Math.min(this.totalPaginas, start + maxVisiveis - 1);
      start = Math.max(1, end - maxVisiveis + 1); // ajuste final
      this.paginasVisiveis = Array.from({ length: end - start + 1 }, (_, i) => start + i);
    }
   onTipoPessoaChange() {
  this.destroyDataTables();
  this.dataSource.data = [];
  this.consulta = [];
  this.paginaAtual = 1;
  this.carregarPessoas();
}


    initDataTable(selector: string) {
      const table = $(selector);
      if ($.fn.DataTable.isDataTable(table)) {
        table.DataTable().destroy();
      }
      table.DataTable({
        responsive: true,
        language: { url: 'assets/appprocon/datatable/datatable-ptbr.json' }
      });
    }

    destroyDataTables() {
      ['#datatables-fisica', '#datatables-juridica'].forEach(selector => {
        const table = $(selector);
        if ($.fn.DataTable.isDataTable(table)) {
          table.DataTable().destroy();
        }
      });
    }

    formatarTelefoneArray(telefones ?: string): string[] {
      if (!telefones) return [];

      return telefones.split(';').map(tel => {
        const cleaned = tel.replace(/\D/g, '');
        if (cleaned.length === 11) {
          return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        }
        if (cleaned.length === 10) {
          return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
        }
        return tel;
      });
    }

    formatarCpf(cpf ?: string): string {
      if (!cpf) return '';
      const cleaned = cpf.replace(/\D/g, '');

      if (cleaned.length !== 11) return cpf;

      return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }

 formatarRg(rg?: string): string {
  if (!rg) return '';

  // ⛔ Não formatar quando vier "NADA COSTA"
  if (rg.trim().toUpperCase() === 'NADA CONSTA') {
    return rg; // retorna exatamente como veio
  }

  const cleaned = rg.replace(/\D/g, '');

  if (cleaned.length < 7 || cleaned.length > 9) return rg;

  return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{0,1})/, (_, p1, p2, p3, p4) => {
    return `${p1}.${p2}.${p3}` + (p4 ? `-${p4}` : '');
  });
}


formatarInscricaoEstadual(ie?: string): string {
  if (!ie) return '';

  // ✅ Se já tem pontuação, retorna como está
  if (ie.includes('.') || ie.includes('-') || ie.includes('/')) {
    return ie;
  }

  const cleaned = ie.replace(/\D/g, '');

  if (cleaned.length === 9) {
    return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{1})/, '$1.$2.$3-$4');
  }

  return ie;
}

    formatarInscricaoMunicipal(im ?: string): string {
      if (!im) return '';
      const cleaned = im.replace(/\D/g, '');

      // Exemplo genérico para 7 dígitos: 123.4567
      if (cleaned.length === 7) {
        return cleaned.replace(/(\d{3})(\d{4})/, '$1.$2');
      }

      // Se quiser adaptar para outros tamanhos, adicione mais regras aqui
      return im;
    }
    formatarCnpj(cnpj ?: string): string {
      if (!cnpj) return '';
      const cleaned = cnpj.replace(/\D/g, '');

      if (cleaned.length !== 14) return cnpj; // CNPJ deve ter 14 dígitos

      return cleaned.replace(
        /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
        '$1.$2.$3/$4-$5'
      );
    }
  }
