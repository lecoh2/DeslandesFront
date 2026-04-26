import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormControl } from '@angular/forms';
import { catchError, debounceTime, Observable, of, switchMap } from 'rxjs';

import { AuthHelper } from '../../../../../core/helpers/auth.helper';
import { PessoaService } from '../../../../../core/services/pessoa.service';
import { AtendimentoService } from '../../../../../core/services/atendimento.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ConsultarEtiquetaResponse } from '../../../../../core/models/etiqueta/consultar-etiqueta-response';
import { PessoaResumo } from '../../../../../core/models/pessoa/pessoa-resumo';
import { PessoaSelecionada } from '../../../../../core/models/pessoa/pessoa-selecionada';
import { AutenticarUsuarioResponse } from '../../../../../core/models/usuario/autenticar-usuario.response';
import { EtiquetaService } from '../../../../../core/services/etiqueta.service';
import { ProcessoService } from '../../../../../core/services/processo.service';
import { CasoService } from '../../../../../core/services/caso.service';
import { ProcessoAutoComplete } from '../../../../../core/models/processo/processo-auto-complete';
import { CasoAutoComplete } from '../../../../../core/models/caso/caso-auto-complete';
import { AtendimentoAutoComplete } from '../../../../../core/models/atendimento/atendimento-auto-complete';
import { ObterAtendimentoResponse } from '../../../../../core/models/atendimento/obter-atendimento-response';
import { PessoaSelecionadaAtendimento } from '../../../../../core/models/pessoa/pessoa-selecionada-atendimento';

type VinculoAutoComplete =
  | ProcessoAutoComplete
  | CasoAutoComplete
  | AtendimentoAutoComplete;

@Component({
  selector: 'app-editar-atendimento',
  standalone:false,
  templateUrl: './editar-atendimento.html',
  styleUrls: ['./editar-atendimento.css']
})
export class EditarAtendimento implements OnInit {

  // 🔥 INJEÇÕES
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private atendimentoService = inject(AtendimentoService);
  private authHelper = inject(AuthHelper);
  private pessoaService = inject(PessoaService);
  private etiquetaService = inject(EtiquetaService);
  private processoService = inject(ProcessoService);
  private casoService = inject(CasoService);
  private fb = inject(FormBuilder);

  // 🔥 ESTADO
  usuarioLogado?: AutenticarUsuarioResponse | null;
  carregando = false;
  mensagemErro: string[] = [];
  mensagemSucesso: string[] = [];

  id!: string;

  // 🔥 VÍNCULO
  filtroVinculo = new FormControl<string | null>(null);
  resultadosVinculo: VinculoAutoComplete[] = [];

  // 🔥 CLIENTES
pessoasSelecionadas: PessoaSelecionadaAtendimento[] = [];
  pessoasFiltradas: PessoaResumo[] = [];

  // 🔥 ETIQUETAS
  tiposetiquetas: ConsultarEtiquetaResponse[] = [];
  etiquetasSelecionadas: ConsultarEtiquetaResponse[] = [];

  // 🔥 FORM
  form = this.fb.group({
    registro: [''],
    assunto: this.fb.control<string | null>(null),

    tipoVinculo: this.fb.control<'processo' | 'caso' | 'atendimento' | null>(null),

    processoId: this.fb.control<string | null>(null),
    casoId: this.fb.control<string | null>(null),
    atendimentoPaiId: this.fb.control<string | null>(null),

    responsavelId: this.fb.control<string | null>(null)
  });

  // ================= INIT =================
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
  }

  // ================= CARREGAMENTO =================
  private carregarDados() {
    this.etiquetaService.consultar().subscribe({
      next: (data) => this.tiposetiquetas = data,
      error: () => this.mensagemErro = ['Erro ao carregar etiquetas']
    });
  }

  private carregarAtendimento() {
    this.carregando = true;

    this.atendimentoService.ObterAtendimentoPorId(this.id).subscribe({
      next: (res: ObterAtendimentoResponse) => {

        // FORM
        this.form.patchValue({
          assunto: res.assunto,
          registro: res.registro,
          processoId: res.processoId,
          casoId: res.casoId,
          atendimentoPaiId: res.atendimentoPaiId,
          responsavelId: res.responsavelId
        });

        // TIPO VÍNCULO + LABEL
        if (res.processoId) {
          this.form.patchValue({ tipoVinculo: 'processo' });
          this.filtroVinculo.setValue('Processo selecionado');
        }

        if (res.casoId) {
          this.form.patchValue({ tipoVinculo: 'caso' });
          this.filtroVinculo.setValue('Caso selecionado');
        }

        if (res.atendimentoPaiId) {
          this.form.patchValue({ tipoVinculo: 'atendimento' });
          this.filtroVinculo.setValue('Atendimento selecionado');
        }

        // CLIENTES
   this.pessoasSelecionadas = res.grupoAtendimentoCliente?.map((c: any) => ({
  id: c.pessoaId,
  nome: c.nome ?? '',
  documento: '',
  tipo: 'Fisica'
})) || [];

        // ETIQUETAS
        this.etiquetasSelecionadas = res.grupoAtendimentoEtiqueta?.map(e => ({
          id: e.etiquetaId,
          nome: e.nome,
          cor: e.cor
        })) || [];

        this.carregando = false;
      },
      error: () => {
        this.mensagemErro = ['Erro ao carregar atendimento'];
        this.carregando = false;
      }
    });
  }

  // ================= AUTOCOMPLETE =================
  private inicializarAutocomplete() {
    this.form.get('tipoVinculo')?.valueChanges.subscribe(() => {
      this.resultadosVinculo = [];
      this.filtroVinculo.setValue('');
    });

    this.filtroVinculo.valueChanges.pipe(
      debounceTime(300),
      switchMap(termo => {
        const tipo = this.form.get('tipoVinculo')?.value;

        if (!tipo) return of([]);

        const valor = (termo ?? '').trim();

        if (valor.length < 2) {
          this.resultadosVinculo = [];
          return of([]);
        }

        if (tipo === 'processo') {
          return this.processoService.consultarProcessoAutoComplete(valor);
        }

        if (tipo === 'caso') {
          return this.casoService.consultarCasoAutoComplete(valor);
        }

        return this.atendimentoService.consultarAtendimentoAutoComplete(valor);
      }),
      catchError(() => of([]))
    ).subscribe(res => this.resultadosVinculo = res);
  }

  selecionarVinculo(item: any) {
    const tipo = this.form.get('tipoVinculo')?.value;

    this.form.patchValue({
      processoId: null,
      casoId: null,
      atendimentoPaiId: null
    });

    if (tipo === 'processo') this.form.patchValue({ processoId: item.id });
    if (tipo === 'caso') this.form.patchValue({ casoId: item.id });
    if (tipo === 'atendimento') this.form.patchValue({ atendimentoPaiId: item.id });

    this.resultadosVinculo = [];
  }

  // ================= PESSOAS =================
  buscarPessoas(nome: string) {
    this.pessoaService.consultarPessoasResumo(nome)
      .pipe(catchError(() => of([])))
      .subscribe(res => this.pessoasFiltradas = res);
  }
  buscarVinculo(termo: string) {
    const tipo = this.form.get('tipoVinculo')?.value;

    if (!tipo || !termo) {
      this.resultadosVinculo = [];
      return;
    }

    let request$: Observable<VinculoAutoComplete[]>;

    if (tipo === 'processo') {
      request$ = this.processoService.consultarProcessoAutoComplete(termo);
    } else if (tipo === 'caso') {
      request$ = this.casoService.consultarCasoAutoComplete(termo);
    } else {
      request$ = this.atendimentoService.consultarAtendimentoAutoComplete(termo);
    }

    request$.subscribe(res => this.resultadosVinculo = res);
  }
  // ================= SUBMIT =================
  onSubmit(): void {
    this.mensagemErro = [];
    this.mensagemSucesso = [];

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (this.pessoasSelecionadas.length === 0) {
      this.mensagemErro = ['Selecione pelo menos um cliente'];
      return;
    }

    this.carregando = true;

    const formValue = this.form.value;

    const request = {
      assunto: formValue.assunto!,
      registro: formValue.registro ?? undefined,

      processoId: formValue.processoId ?? undefined,
      casoId: formValue.casoId ?? undefined,
      atendimentoPaiId: formValue.atendimentoPaiId ?? undefined,
      responsavelId: formValue.responsavelId ?? undefined,

      grupoAtendimentoEtiquetas: this.etiquetasSelecionadas.map(e => ({
        etiquetaId: e.id!
      })),

      grupoAtendimentoCliente: this.pessoasSelecionadas.map(p => ({
        pessoaId: p.id
      }))
    };

    this.atendimentoService.atualizarAtendimento(this.id, request).subscribe({
      next: (res) => {
        this.carregando = false;
        this.mensagemSucesso = [res.message];

        setTimeout(() => {
          this.router.navigate(['/admin/consultar-atendimento']);
        }, 2000);
      },
      error: (err: HttpErrorResponse) => this.tratarErro(err)
    });
  }

  // ================= ERRO =================
  private tratarErro(err: HttpErrorResponse) {
    this.mensagemErro = [];

    const e = err.error;

    if (e?.errors) {
      for (const key in e.errors) {
        this.mensagemErro.push(...e.errors[key]);
      }
    } else if (e?.mensagem) {
      this.mensagemErro.push(e.mensagem);
    } else {
      this.mensagemErro.push('Erro inesperado.');
    }

    this.carregando = false;
  }
}