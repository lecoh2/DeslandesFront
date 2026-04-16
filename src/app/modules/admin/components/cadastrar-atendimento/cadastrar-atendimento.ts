import { Component, inject, ViewChild, OnInit, ElementRef, AfterViewInit } from '@angular/core';

import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';


import { catchError, debounceTime, filter, of, switchMap } from 'rxjs';


//import Quill from 'quill';



import { AuthHelper } from '../../../../core/helpers/auth.helper';
import { PessoaService } from '../../../../core/services/pessoa.service';
import { AtendimentoService } from '../../../../core/services/atendimento.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ConsultarEtiquetaResponse } from '../../../../core/models/etiqueta/consultar-etiqueta-response';
import { QualificacaoResponse } from '../../../../core/models/qualificacao/qualificacao-response';
import { PessoaResumo } from '../../../../core/models/pessoa/pessoa-resumo';
import { PessoaSelecionada } from '../../../../core/models/pessoa/pessoa-selecionada';
import { AutenticarUsuarioResponse } from '../../../../core/models/usuario/autenticar-usuario.response';
import { QualificacoesService } from '../../../../core/services/qualificacoes.service';
import { EtiquetaService } from '../../../../core/services/etiqueta.service';
import { ProcessoService } from '../../../../core/services/processo.service';
import { CasoService } from '../../../../core/services/caso.service';
import { ProcessoAutoComplete } from '../../../../core/models/processo/processo-auto-complete';
import { CasoAutoComplete } from '../../../../core/models/caso/caso-auto-complete';
import { AtendimentoAutoComplete } from '../../../../core/models/atendimento/atendimento-auto-complete';
import { Observable } from 'rxjs';
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
export class CadastrarAtendimento implements OnInit /*AfterViewInit*/ {
  // --- Injeção de dependências via inject()
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private atendimentoService = inject(AtendimentoService);
  private authHelper = inject(AuthHelper);
  private pessoaService = inject(PessoaService);
  private qualificacaoService = inject(QualificacoesService);
  private etiquetaService = inject(EtiquetaService);
  private processoService = inject(ProcessoService);
  private casoService = inject(CasoService);
  private builder = inject(FormBuilder);
  usuarioLogado?: AutenticarUsuarioResponse | null;
  resultadosVinculo: any[] = [];
  mensagemErro: string[] = [];
  mensagemSucesso: string[] = [];
  carregando = false;
  filtroVinculo = new FormControl<string | null>(null);
  // 🔥 Pessoas
  pessoasSelecionadas: PessoaSelecionada[] = [];
  pessoasFiltradas: PessoaResumo[] = [];
  qualificacoes: QualificacaoResponse[] = [];

  // 🔥 Etiquetas
  tiposetiquetas: ConsultarEtiquetaResponse[] = [];
  etiquetasSelecionadas: ConsultarEtiquetaResponse[] = [];


  vinculoSelecionado: ProcessoAutoComplete | CasoAutoComplete | AtendimentoAutoComplete | null = null;
  // ================= FORM =================
  form = this.builder.group({

    registro: [''],
    assunto: this.builder.control<string | null>(null),

    tipoVinculo: this.builder.control<'processo' | 'caso' | 'atendimento' | null>(null),

    processoId: this.builder.control<string | null>(null),
    casoId: this.builder.control<string | null>(null),
    atendimentoPaiId: this.builder.control<string | null>(null),

    responsavelId: this.builder.control<string | null>(null)
  });
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
    request$ = this.casoService.consultarCassoAutoComplete(termo);
  } else {
    request$ = this.atendimentoService.consultarAtendimentoAutoComplete(termo);
  }

  request$.subscribe(res => {
    this.resultadosVinculo = res;
  });
} selecionarVinculo(item: any) {
    const tipo = this.form.get('tipoVinculo')?.value;

    this.resultadosVinculo = [];

    this.form.patchValue({
      processoId: null,
      casoId: null,
      atendimentoPaiId: null
    });

    if (tipo === 'processo') {
      this.form.patchValue({ processoId: item.id });
    } else if (tipo === 'caso') {
      this.form.patchValue({ casoId: item.id });
    } else {
      this.form.patchValue({ atendimentoPaiId: item.id });
    }
  }
  // ================= INIT =================
  ngOnInit(): void {
    this.usuarioLogado = this.authHelper.get();

    this.carregarDados();

    // 🔥 reset ao trocar tipo
    this.form.get('tipoVinculo')?.valueChanges.subscribe(() => {
      this.resultadosVinculo = [];
      this.vinculoSelecionado = null;
      this.filtroVinculo.setValue('');
    });

    // 🔥 autocomplete correto
    this.filtroVinculo.valueChanges.pipe(
      debounceTime(300),
      switchMap((termo) => {
        const tipo = this.form.get('tipoVinculo')?.value;

        if (!tipo) return of([]);

        const valor = (termo ?? '').toString().trim();

        if (valor.length < 2) {
          this.resultadosVinculo = [];
          return of([]);
        }

        if (tipo === 'processo') {
          return this.processoService.consultarProcessoAutoComplete(valor);
        }

        if (tipo === 'caso') {
          return this.casoService.consultarCassoAutoComplete(valor);
        }

        return this.atendimentoService.consultarAtendimentoAutoComplete(valor);
      }),
      catchError(() => of([]))
    ).subscribe(res => {
      this.resultadosVinculo = res;
    });
  }
  formatarCNJ(numero?: string): string {
    if (!numero) return '';

    const n = numero.replace(/\D/g, '');

    if (n.length !== 20) return numero; // evita quebrar

    return `${n.slice(0, 7)}-${n.slice(7, 9)}.${n.slice(9, 13)}.${n.slice(13, 14)}.${n.slice(14, 16)}.${n.slice(16, 20)}`;
  }
  private carregarDados() {


    this.etiquetaService.consultar().subscribe({
      next: (data) => this.tiposetiquetas = data,
      error: () => this.mensagemErro = ['Erro ao carregar etiquetas']
    });
  }

  // ================= BUSCA =================
  buscarPessoas(nome: string) {
    this.pessoaService.consultarPessoasResumo(nome)
      .pipe(catchError(() => of([])))
      .subscribe(res => this.pessoasFiltradas = res);
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
      this.mensagemErro = ['Selecione pelo menos um cliente.'];
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
      atendimentoPaiId: limpar(formValue.atendimentoPaiId),
      responsavelId: limpar(formValue.responsavelId),

      grupoAtendimentoEtiquetas: this.etiquetasSelecionadas.map(e => ({
        etiquetaId: e.id!
      })),

      grupoAtendimentoCliente: this.pessoasSelecionadas.map(p => ({
        pessoaId: p.id
      }))
    };

    console.log('📦 REQUEST ATENDIMENTO:', request);

    this.atendimentoService.cadastrarAtendimento(request).subscribe({
      next: (res) => {
        this.resetar();
        this.carregando = false;
        this.mensagemSucesso = [res.message];
        this.router.navigate(['/admin/cadastrar-atendimento']);
      },
      error: (err: HttpErrorResponse) => this.tratarErro(err)
    });
  }
  onSelecionarVinculo(id: string) {
    const tipo = this.form.get('tipoVinculo')?.value;

    // limpa tudo antes
    this.form.patchValue({
      processoId: null,
      casoId: null,
      atendimentoPaiId: null
    });

    if (tipo === 'processo') {
      this.form.patchValue({ processoId: id });
    }

    if (tipo === 'caso') {
      this.form.patchValue({ casoId: id });
    }

    if (tipo === 'atendimento') {
      this.form.patchValue({ atendimentoPaiId: id });
    }
  }
  // ================= RESET =================
  private resetar() {
    this.form.reset();
    this.pessoasSelecionadas = [];
    this.etiquetasSelecionadas = [];
  }

  getLabel(item: ProcessoAutoComplete | CasoAutoComplete | AtendimentoAutoComplete): string {

    if ('numeroProcesso' in item) {
      const cnj = this.formatarCNJ(item.numeroProcesso);
      return `${cnj} - ${item.titulo ?? ''}`;
    }

    if ('titulo' in item) {
      return item.titulo;
    }

    if ('assunto' in item) {
      return item.assunto;
    }

    return '';
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