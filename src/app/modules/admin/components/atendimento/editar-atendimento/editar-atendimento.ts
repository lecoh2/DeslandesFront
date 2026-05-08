import {
  ChangeDetectorRef,
  Component,
  inject,
  OnInit
} from '@angular/core';

import {
  ActivatedRoute,
  Router
} from '@angular/router';

import {
  FormBuilder,
  FormControl
} from '@angular/forms';

import {
  catchError,
  debounceTime,
  finalize,
  Observable,
  of,
  switchMap
} from 'rxjs';

import {
  HttpErrorResponse
} from '@angular/common/http';

import { AuthHelper } from '../../../../../core/helpers/auth.helper';

import { PessoaService } from '../../../../../core/services/pessoa.service';
import { AtendimentoService } from '../../../../../core/services/atendimento.service';
import { EtiquetaService } from '../../../../../core/services/etiqueta.service';
import { ProcessoService } from '../../../../../core/services/processo.service';
import { CasoService } from '../../../../../core/services/caso.service';

import { ConsultarEtiquetaResponse } from '../../../../../core/models/etiqueta/consultar-etiqueta-response';

import { PessoaResumo } from '../../../../../core/models/pessoa/pessoa-resumo';

import { PessoaSelecionadaAtendimento } from '../../../../../core/models/pessoa/pessoa-selecionada-atendimento';

import { ProcessoAutoComplete } from '../../../../../core/models/processo/processo-auto-complete';

import { CasoAutoComplete } from '../../../../../core/models/caso/caso-auto-complete';

import { AtendimentoAutoComplete } from '../../../../../core/models/atendimento/atendimento-auto-complete';

import { ObterAtendimentoResponse } from '../../../../../core/models/atendimento/obter-atendimento-response';

import { AutenticarUsuarioResponse } from '../../../../../core/models/usuario/autenticar-usuario.response';

type VinculoAutoComplete =
  | ProcessoAutoComplete
  | CasoAutoComplete
  | AtendimentoAutoComplete;

@Component({
  selector: 'app-editar-atendimento',
  standalone: false,
  templateUrl: './editar-atendimento.html',
  styleUrls: ['./editar-atendimento.css']
})
export class EditarAtendimento implements OnInit {

  // =========================
  // INJEÇÕES
  // =========================
  private router = inject(Router);

  private route = inject(ActivatedRoute);

  private atendimentoService = inject(AtendimentoService);

  private authHelper = inject(AuthHelper);

  private pessoaService = inject(PessoaService);

  private etiquetaService = inject(EtiquetaService);

  private processoService = inject(ProcessoService);

  private casoService = inject(CasoService);

  private fb = inject(FormBuilder);

  private cdr = inject(ChangeDetectorRef);

  // =========================
  // ESTADO
  // =========================
  usuarioLogado?: AutenticarUsuarioResponse | null;

  carregando = false;

  mensagemErro: string[] = [];

  mensagemSucesso: string[] = [];

  id!: string;

  // =========================
  // VÍNCULO
  // =========================
  filtroVinculo = new FormControl<string | null>(null);

  resultadosVinculo: VinculoAutoComplete[] = [];

  vinculoSelecionado: VinculoAutoComplete | null = null;

  // =========================
  // CLIENTES
  // =========================
  pessoasSelecionadas: PessoaSelecionadaAtendimento[] = [];

  pessoasFiltradas: PessoaResumo[] = [];

  // =========================
  // ETIQUETAS
  // =========================
  tiposetiquetas: ConsultarEtiquetaResponse[] = [];

  etiquetasSelecionadas: ConsultarEtiquetaResponse[] = [];

  // =========================
  // FORM
  // =========================
  form = this.fb.group({

    registro: [''],

    assunto: this.fb.control<string | null>(null),

    tipoVinculo: this.fb.control<
      'processo'
      | 'caso'
      | 'atendimento'
      | null
    >(null),

    processoId: this.fb.control<string | null>(null),

    casoId: this.fb.control<string | null>(null),

    atendimentoId: this.fb.control<string | null>(null),

    responsavelId: this.fb.control<string | null>(null)
  });

  // =========================
  // INIT
  // =========================
  ngOnInit(): void {

    this.usuarioLogado = this.authHelper.get();

    const idParam = this.route.snapshot.paramMap.get('id');

    if (!idParam) {

      this.mensagemErro = ['ID inválido'];

      return;
    }

    this.id = idParam;

    this.carregarDados();

    this.carregarAtendimento();

    this.inicializarAutocomplete();

    // 🔥 RESET AO TROCAR TIPO
    this.form.get('tipoVinculo')?.valueChanges.subscribe(() => {

      this.resultadosVinculo = [];

      this.vinculoSelecionado = null;

      this.filtroVinculo.setValue('');

      this.limparVinculos();
    });
  }

  // =========================
  // NAVEGAÇÃO
  // =========================
  irParaLista(): void {

    this.router.navigate([
      '/admin/consultar-atendimento'
    ]);
  }

  // =========================
  // LIMPAR VÍNCULOS
  // =========================
  private limparVinculos(): void {

    this.form.patchValue({
      processoId: null,
      casoId: null,
      atendimentoId: null
    });

    this.vinculoSelecionado = null;

    this.resultadosVinculo = [];
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

        this.mensagemErro = [
          'Erro ao carregar etiquetas'
        ];
      }
    });
  }

  // =========================
  // CARREGAR ATENDIMENTO
  // =========================
  private carregarAtendimento() {

    this.carregando = true;

    this.atendimentoService
      .ObterAtendimentoPorId(this.id)
      .subscribe({

        next: (res: ObterAtendimentoResponse) => {

          // =========================
          // FORM
          // =========================
          this.form.patchValue({

            assunto: res.assunto,

            registro: res.registro,

            processoId: res.processoId,

            casoId: res.casoId,

            atendimentoId: res.atendimentoPaiId,

            responsavelId: res.responsavelId
          });

          // =========================
          // TIPO VÍNCULO
          // =========================
          let tipo:
            | 'processo'
            | 'caso'
            | 'atendimento'
            | null = null;

          if (res.processoId)
            tipo = 'processo';

          else if (res.casoId)
            tipo = 'caso';

          else if (res.atendimentoPaiId)
            tipo = 'atendimento';

          this.form.patchValue({
            tipoVinculo: tipo
          });

          // =========================
          // VÍNCULO VISUAL
          // =========================
          if (res.processoId) {

            this.vinculoSelecionado = {
              id: res.processoId,
              pasta: res.processoPasta ?? ''
            } as ProcessoAutoComplete;
          }

          else if (res.casoId) {

            this.vinculoSelecionado = {
              id: res.casoId,
              pasta: res.casoPasta ?? ''
            } as CasoAutoComplete;
          }

          else if (res.atendimentoPaiId) {

            this.vinculoSelecionado = {
              id: res.atendimentoPaiId,
              assunto: res.atendimentoAssunto ?? ''
            } as AtendimentoAutoComplete;
          }

          else {

            this.vinculoSelecionado = null;
          }

          // =========================
          // CLIENTES
          // =========================
          this.pessoasSelecionadas =
            res.grupoAtendimentoCliente?.map((c: any) => ({

              id: c.pessoaId,

              nome: c.nome ?? '',

              documento: '',

              tipo: 'Fisica'

            })) || [];

          // =========================
          // ETIQUETAS
          // =========================
          this.etiquetasSelecionadas =
            res.grupoAtendimentoEtiqueta?.map(e => ({

              id: e.etiquetaId,

              nome: e.nome,

              cor: e.cor

            })) || [];

          this.carregando = false;
        },

        error: () => {

          this.mensagemErro = [
            'Erro ao carregar atendimento'
          ];

          this.carregando = false;
        }
      });
  }

  // =========================
  // AUTOCOMPLETE
  // =========================
  private inicializarAutocomplete() {

    this.filtroVinculo.valueChanges.pipe(

      debounceTime(300),

      switchMap(termo => {

        const tipo =
          this.form.get('tipoVinculo')?.value;

        if (!tipo)
          return of([]);

        const valor =
          (termo ?? '').trim();

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
  // SELECIONAR VÍNCULO
  // =========================
  selecionarVinculo(item: VinculoAutoComplete) {

    this.vinculoSelecionado = item;

    this.resultadosVinculo = [];

    this.limparVinculos();

    if ('numeroProcesso' in item) {

      this.form.patchValue({
        processoId: item.id
      });

      return;
    }

    if ('assunto' in item) {

      this.form.patchValue({
        atendimentoId: item.id
      });

      return;
    }

    this.form.patchValue({
      casoId: item.id
    });
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
  // BUSCAR VÍNCULO
  // =========================
  buscarVinculo(termo: string) {

    const tipo =
      this.form.get('tipoVinculo')?.value;

    if (!tipo || !termo) {

      this.resultadosVinculo = [];

      return;
    }

    let request$:
      Observable<VinculoAutoComplete[]>;

    if (tipo === 'processo') {

      request$ =
        this.processoService
          .consultarProcessoAutoComplete(termo);
    }
    else if (tipo === 'caso') {

      request$ =
        this.casoService
          .consultarCasoAutoComplete(termo);
    }
    else {

      request$ =
        this.atendimentoService
          .consultarAtendimentoAutoComplete(termo);
    }

    request$.subscribe(res => {

      this.resultadosVinculo = res;
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
        'Selecione pelo menos um cliente'
      ];

      return;
    }

    this.carregando = true;

    const formValue = this.form.value;

    const request = {

      assunto: formValue.assunto!,

      registro:
        formValue.registro ?? undefined,

      processoId:
        formValue.processoId ?? undefined,

      casoId:
        formValue.casoId ?? undefined,

      atendimentoId:
        formValue.atendimentoId ?? undefined,

      responsavelId:
        formValue.responsavelId ?? undefined,

      grupoAtendimentoEtiqueta:
        this.etiquetasSelecionadas.map(e => ({

          etiquetaId: e.id
        })),

      grupoAtendimentoCliente:
        this.pessoasSelecionadas.map(p => ({

          pessoaId: p.id
        }))
    };

    this.atendimentoService
      .atualizarAtendimento(this.id, request)
      .pipe(

        finalize(() => {

          this.carregando = false;

          this.cdr.detectChanges();
        })

      )
      .subscribe({

        next: (res) => {

          this.mensagemSucesso = [
            res.message
          ];

          setTimeout(() => {

            this.router.navigate([
              '/admin/consultar-atendimento'
            ]);

          }, 3000);
        },

        error: (err: HttpErrorResponse) => {

          this.tratarErro(err);
        }
      });
  }

  // =========================
  // LABEL AUTOCOMPLETE
  // =========================
getLabel(item: VinculoAutoComplete & { tipo?: string }): string {

  if (!item) return '';

  if (item.tipo === 'processo') {

    const cnj = this.formatarCNJ((item as any).numeroProcesso);

    return `${cnj} - ${(item as any).pasta ?? ''}`;
  }

  if (item.tipo === 'caso') {
    return (item as any).pasta ?? '';
  }

  if (item.tipo === 'atendimento') {
    return (item as any).assunto ?? '';
  }

  return '';
}
  // =========================
  // FORMATAR CNJ
  // =========================
  formatarCNJ(numero?: string): string {

    if (!numero)
      return '';

    const n =
      numero.replace(/\D/g, '');

    if (n.length !== 20)
      return numero;

    return `${n.slice(0, 7)}-${n.slice(7, 9)}.${n.slice(9, 13)}.${n.slice(13, 14)}.${n.slice(14, 16)}.${n.slice(16, 20)}`;
  }

  // =========================
  // TRATAR ERRO
  // =========================
  private tratarErro(
    err: HttpErrorResponse
  ) {

    this.mensagemErro = [];

    const e = err.error;

    if (e?.errors) {

      for (const key in e.errors) {

        this.mensagemErro.push(
          ...e.errors[key]
        );
      }
    }
    else if (e?.mensagem) {

      this.mensagemErro.push(
        e.mensagem
      );
    }
    else {

      this.mensagemErro.push(
        'Erro inesperado.'
      );
    }

    this.carregando = false;
  }
}