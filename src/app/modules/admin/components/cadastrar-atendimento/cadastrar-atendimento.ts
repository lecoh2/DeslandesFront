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

  mensagemErro: string[] = [];
  mensagemSucesso: string[] = [];
  carregando = false;

  // 🔥 Pessoas
  pessoasSelecionadas: PessoaSelecionada[] = [];
  pessoasFiltradas: PessoaResumo[] = [];
  qualificacoes: QualificacaoResponse[] = [];

  // 🔥 Etiquetas
  tiposetiquetas: ConsultarEtiquetaResponse[] = [];
  etiquetasSelecionadas: ConsultarEtiquetaResponse[] = [];
resultadosVinculo: (ProcessoAutoComplete | CasoAutoComplete | AtendimentoAutoComplete)[] = [];

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

  // ================= INIT =================
  ngOnInit(): void {
    this.usuarioLogado = this.authHelper.get();

    this.carregarDados();
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
buscarVinculo(termo: string): void {
  const tipo = this.form.get('tipoVinculo')?.value;

  if (!termo || !tipo) {
    this.resultadosVinculo = [];
    return;
  }

  let request$: Observable<
    ProcessoAutoComplete[] | CasoAutoComplete[] | AtendimentoAutoComplete[]
  > | null = null;

  if (tipo === 'processo') {
    request$ = this.processoService.consultarProcessoAutoComplete(termo);
  } else if (tipo === 'caso') {
    request$ = this.casoService.consultarCassoAutoComplete(termo);
  } else if (tipo === 'atendimento') {
    request$ = this.atendimentoService.consultarAtendimentoAutoComplete(termo);
  }

  request$?.pipe(
    catchError(() => of([]))
  ).subscribe((res) => {
    this.resultadosVinculo = res;
  });
}
getLabel(item: ProcessoAutoComplete | CasoAutoComplete | AtendimentoAutoComplete): string {
  if ('numeroProcesso' in item) {
    return item.numeroProcesso || item.titulo || '';
  }

  if ('titulo' in item) {
    return item.titulo;
  }

  if ('assunto' in item) {
    return item.assunto;
  }

  return '';
}
 selecionarVinculo(item: ProcessoAutoComplete | CasoAutoComplete | AtendimentoAutoComplete) {
  const tipo = this.form.get('tipoVinculo')?.value;

  this.vinculoSelecionado = item;
  this.resultadosVinculo = [];

  // limpa tudo
  this.form.patchValue({
    processoId: null,
    casoId: null,
    atendimentoPaiId: null
  });

  if (tipo === 'processo') {
    this.form.patchValue({ processoId: item.id });
  }

  if (tipo === 'caso') {
    this.form.patchValue({ casoId: item.id });
  }

  if (tipo === 'atendimento') {
    this.form.patchValue({ atendimentoPaiId: item.id });
  }
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