import {
  Component,
  inject,
  OnInit
} from '@angular/core';

import {
  FormBuilder,
  FormControl
} from '@angular/forms';

import { Router } from '@angular/router';

import {
  catchError,
  debounceTime,
  of,
  switchMap,
  Observable
} from 'rxjs';

import { HttpErrorResponse } from '@angular/common/http';

import { AuthHelper } from '../../../../../core/helpers/auth.helper';

import { PessoaService } from '../../../../../core/services/pessoa.service';
import { AtendimentoService } from '../../../../../core/services/atendimento.service';
import { QualificacoesService } from '../../../../../core/services/qualificacoes.service';
import { EtiquetaService } from '../../../../../core/services/etiqueta.service';
import { ProcessoService } from '../../../../../core/services/processo.service';
import { CasoService } from '../../../../../core/services/caso.service';

import { ConsultarEtiquetaResponse } from '../../../../../core/models/etiqueta/consultar-etiqueta-response';
import { QualificacaoResponse } from '../../../../../core/models/qualificacao/qualificacao-response';

import { PessoaResumo } from '../../../../../core/models/pessoa/pessoa-resumo';
import { PessoaSelecionada } from '../../../../../core/models/pessoa/pessoa-selecionada';

import { ProcessoAutoComplete } from '../../../../../core/models/processo/processo-auto-complete';
import { CasoAutoComplete } from '../../../../../core/models/caso/caso-auto-complete';
import { AtendimentoAutoComplete } from '../../../../../core/models/atendimento/atendimento-auto-complete';

import { AutenticarUsuarioResponse } from '../../../../../core/models/usuario/autenticar-usuario.response';

type VinculoAutoComplete =
  | ProcessoAutoComplete
  | CasoAutoComplete
  | AtendimentoAutoComplete;

@Component({
  selector: 'app-abrir-reclamacao',
  standalone: false,
  templateUrl: './cadastrar-atendimento.html',
  styleUrl: './cadastrar-atendimento.css'
})
export class CadastrarAtendimento implements OnInit {

  // =========================
  // INJEÇÕES
  // =========================
  private builder = inject(FormBuilder);

  private router = inject(Router);

  private atendimentoService = inject(AtendimentoService);

  private authHelper = inject(AuthHelper);

  private pessoaService = inject(PessoaService);

  private qualificacaoService = inject(QualificacoesService);

  private etiquetaService = inject(EtiquetaService);

  private processoService = inject(ProcessoService);

  private casoService = inject(CasoService);

  // =========================
  // USUÁRIO
  // =========================
  usuarioLogado?: AutenticarUsuarioResponse | null;

  // =========================
  // UI
  // =========================
  mensagemErro: string[] = [];

  mensagemSucesso: string[] = [];

  carregando = false;

  // =========================
  // AUTOCOMPLETE VÍNCULO
  // =========================
  filtroVinculo = new FormControl<string | null>(null);

  resultadosVinculo: VinculoAutoComplete[] = [];

  vinculoSelecionado: VinculoAutoComplete | null = null;

  // =========================
  // PESSOAS
  // =========================
  pessoasSelecionadas: PessoaSelecionada[] = [];

  pessoasFiltradas: PessoaResumo[] = [];

  qualificacoes: QualificacaoResponse[] = [];

  // =========================
  // ETIQUETAS
  // =========================
  tiposetiquetas: ConsultarEtiquetaResponse[] = [];

  etiquetasSelecionadas: ConsultarEtiquetaResponse[] = [];

  // =========================
  // FORM
  // =========================
  form = this.builder.group({

    registro: [''],

    assunto: this.builder.control<string | null>(null),

    tipoVinculo: this.builder.control<
      'processo'
      | 'caso'
      | 'atendimento'
      | null
    >(null),

    processoId: this.builder.control<string | null>(null),

    casoId: this.builder.control<string | null>(null),

    atendimentoId: this.builder.control<string | null>(null),

    responsavelId: this.builder.control<string | null>(null)
  });

  // =========================
  // INIT
  // =========================
  ngOnInit(): void {

    this.usuarioLogado = this.authHelper.get();

    this.carregarDados();

    // 🔥 RESET AO TROCAR TIPO
    this.form.get('tipoVinculo')?.valueChanges.subscribe(() => {

      this.resultadosVinculo = [];

      this.vinculoSelecionado = null;

      this.filtroVinculo.setValue('');

   this.limparVinculos();
    });

    // 🔥 AUTOCOMPLETE
    this.filtroVinculo.valueChanges.pipe(

      debounceTime(300),

      switchMap((termo) => {

        const tipo = this.form.get('tipoVinculo')?.value;

        if (!tipo)
          return of([]);

        const valor = (termo ?? '').trim();

        if (valor.length < 2) {

          this.resultadosVinculo = [];

          return of([]);
        }

        if (tipo === 'processo') {
          return this.processoService
            .consultarProcessoAutoComplete(valor);
        }

        if (tipo === 'caso') {
          return this.casoService
            .consultarCasoAutoComplete(valor);
        }

        return this.atendimentoService
          .consultarAtendimentoAutoComplete(valor);

      }),

      catchError(() => of([]))

    ).subscribe(res => {

      this.resultadosVinculo = res;

    });
  }

  // =========================
  // CARREGAR DADOS
  // =========================
  private carregarDados() {

    this.etiquetaService.consultar().subscribe({

      next: (data) => {
        this.tiposetiquetas = data;
      },

      error: () => {
        this.mensagemErro = ['Erro ao carregar etiquetas'];
      }
    });
  }

  // =========================
  // BUSCAR VÍNCULO
  // =========================
  buscarVinculo(termo: string) {

    const tipo = this.form.get('tipoVinculo')?.value;

    if (!tipo || !termo) {

      this.resultadosVinculo = [];

      return;
    }

    let request$: Observable<VinculoAutoComplete[]>;

    if (tipo === 'processo') {

      request$ =
        this.processoService.consultarProcessoAutoComplete(termo);

    } else if (tipo === 'caso') {

      request$ =
        this.casoService.consultarCasoAutoComplete(termo);

    } else {

      request$ =
        this.atendimentoService.consultarAtendimentoAutoComplete(termo);
    }

    request$.subscribe(res => {

      this.resultadosVinculo = res;

    });
  }

  // =========================
  // SELECIONAR VÍNCULO
  // =========================
  selecionarVinculo(item: VinculoAutoComplete) {

    const tipo = this.form.get('tipoVinculo')?.value;

    this.resultadosVinculo = [];

    this.vinculoSelecionado = item;

    // 🔥 limpa tudo antes
 this.limparVinculos();

    if (tipo === 'processo') {

      this.form.patchValue({
        processoId: item.id
      });
    }
    else if (tipo === 'caso') {

      this.form.patchValue({
        casoId: item.id
      });
    }
    else {

      this.form.patchValue({
        atendimentoId: item.id
      });
    }
  }

  // =========================
  // BUSCAR PESSOAS
  // =========================
  buscarPessoas(nome: string) {

    this.pessoaService
      .consultarPessoasResumo(nome)
      .pipe(catchError(() => of([])))
      .subscribe(res => {

        this.pessoasFiltradas = res;

      });
  }

  // =========================
  // SUBMIT
  // =========================
  onSubmit(): void {

    this.mensagemErro = [];

    this.mensagemSucesso = [];

    if (this.form.invalid) {

      this.form.markAllAsTouched();

      return;
    }

    if (this.pessoasSelecionadas.length === 0) {

      this.mensagemErro = [
        'Selecione pelo menos um cliente.'
      ];

      return;
    }

    this.carregando = true;

    const formValue = this.form.value;

    const limpar = (v: any) => v ?? undefined;

    const request = {

      assunto: formValue.assunto!,

      registro: limpar(formValue.registro),

      processoId: limpar(formValue.processoId),

      casoId: limpar(formValue.casoId),

      atendimentoId: limpar(formValue.atendimentoId),

      responsavelId: limpar(formValue.responsavelId),

      grupoAtendimentoEtiquetas:
        this.etiquetasSelecionadas.map(e => ({
          etiquetaId: e.id!
        })),

      grupoAtendimentoCliente:
        this.pessoasSelecionadas.map(p => ({
          pessoaId: p.id
        }))
    };

    console.log('📦 REQUEST:', request);

    this.atendimentoService
      .cadastrarAtendimento(request)
      .subscribe({

        next: (res) => {

          this.resetar();

          this.carregando = false;

          this.mensagemSucesso = [res.message];

          this.router.navigate([
            '/admin/cadastrar-atendimento'
          ]);
        },

        error: (err: HttpErrorResponse) => {
          this.tratarErro(err);
        }
      });
  }

  // =========================
  // RESET
  // =========================
  private resetar() {

    this.form.reset();

    this.pessoasSelecionadas = [];

    this.etiquetasSelecionadas = [];

    this.resultadosVinculo = [];

    this.vinculoSelecionado = null;
  }

  // =========================
  // LABEL AUTOCOMPLETE
  // =========================
  getLabel(
    item: ProcessoAutoComplete
      | CasoAutoComplete
      | AtendimentoAutoComplete
  ): string {

    if ('numeroProcesso' in item) {

      const cnj = this.formatarCNJ(item.numeroProcesso);

      return `${cnj} - ${item.pasta ?? ''}`;
    }

    if ('pasta' in item) {
      return item.pasta;
    }

    if ('assunto' in item) {
      return item.assunto;
    }

    return '';
  }

  // =========================
  // FORMATAR CNJ
  // =========================
  formatarCNJ(numero?: string): string {

    if (!numero)
      return '';

    const n = numero.replace(/\D/g, '');

    if (n.length !== 20)
      return numero;

    return `${n.slice(0, 7)}-${n.slice(7, 9)}.${n.slice(9, 13)}.${n.slice(13, 14)}.${n.slice(14, 16)}.${n.slice(16, 20)}`;
  }

  // =========================
  // TRATAR ERRO
  // =========================
  private tratarErro(err: HttpErrorResponse) {

    this.mensagemErro = [];

    const e = err.error;

    if (e?.errors) {

      for (const key in e.errors) {

        this.mensagemErro.push(...e.errors[key]);
      }
    }
    else if (e?.mensagem) {

      this.mensagemErro.push(e.mensagem);
    }
    else {

      this.mensagemErro.push('Erro inesperado.');
    }

    this.carregando = false;
  }
private limparVinculos(): void {

  this.form.patchValue({
    processoId: null,
    casoId: null,
    atendimentoId: null
  });

  this.vinculoSelecionado = null;

  this.resultadosVinculo = [];
}
}