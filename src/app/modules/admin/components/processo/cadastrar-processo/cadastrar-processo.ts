import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { AuthHelper } from '../../../../../core/helpers/auth.helper';
import { ProcessoService } from '../../../../../core/services/processo.service';
import { AutenticarUsuarioResponse } from '../../../../../core/models/usuario/autenticar-usuario.response';
import { VaraService } from '../../../../../core/services/vara.service';
import { ConsultarVaraResponse } from '../../../../../core/models/vara/consultar-vara-response';
import { AcaoService } from '../../../../../core/services/acao.service';
import { ConsultarAcaoResponse } from '../../../../../core/models/acao/consultar-acao-response';
import { UsuarioService } from '../../../../../core/services/usuario.service';
import { ConsultarUsuarioResponse } from '../../../../../core/models/usuario/consultar-usuarios.response';
import { ConsultarEtiquetaResponse } from '../../../../../core/models/etiqueta/consultar-etiqueta-response';
import { PessoaResumo } from '../../../../../core/models/pessoa/pessoa-resumo';
import { PessoaSelecionada } from '../../../../../core/models/pessoa/pessoa-selecionada';
import { QualificacoesService } from '../../../../../core/services/qualificacoes.service';


import { catchError, debounceTime, filter, of, switchMap } from 'rxjs';
import { PessoaService } from '../../../../../core/services/pessoa.service';
import { QualificacaoResponse } from '../../../../../core/models/qualificacao/qualificacao-response';

@Component({
  selector: 'app-cadastrar-processo',
  standalone:false,
  templateUrl: './cadastrar-processo.html',
  styleUrl: './cadastrar-processo.css',
})
export class CadastrarProcesso implements OnInit {

  // ================== INJEÇÕES ==================
  private builder = inject(FormBuilder);
  private router = inject(Router);
  private processoService = inject(ProcessoService);
  private authHelper = inject(AuthHelper);
  private varaService = inject(VaraService);
  private acaoService = inject(AcaoService);
  private usuarioService = inject(UsuarioService);
  private pessoaService = inject(PessoaService);
  private qualificacaoService = inject(QualificacoesService);

  // ================== ESTADO ==================
  usuarioLogado?: AutenticarUsuarioResponse | null;

  mensagemErro: string[] = [];
  mensagemSucesso: string[] = [];
  carregando = false;

  varas: ConsultarVaraResponse[] = [];
  acoes: ConsultarAcaoResponse[] = [];
  responsaveis: ConsultarUsuarioResponse[] = [];
  qualificacoes: QualificacaoResponse[] = [];

  tiposetiquetas: ConsultarEtiquetaResponse[] = [];

  pessoasSelecionadas: PessoaSelecionada[] = [];
  pessoasFiltradas: PessoaResumo[] = [];

  envolvidosSelecionados: any[] = [];
  etiquetasSelecionadas: any[] = [];

  pessoaNomeControl = new FormControl('');
  mostrarSugestoesPessoa = false;

  // ================== FORM ==================
  form = this.builder.group({
    idUsuario: [''],
    acaoId: [null],
    varaId: [null, Validators.required],
    usuarioResponsavelId: [null],

    pasta: [''],
    titulo: [''],
    numeroProcesso: [''],
    linkTribunal: [''],
    objeto: [''],
    valorCausa: [null],
    distribuido: [null],
    valorCondenacao: [null],
    observacao: [''],
    instancia: [null],
    acesso: [null],
  });

  // ================== INIT ==================
  ngOnInit(): void {
    this.carregando = true;

    this.usuarioLogado = this.authHelper.get();

    if (this.usuarioLogado) {
      this.form.get('idUsuario')?.setValue(this.usuarioLogado.idUsuario ?? null);
    }

    // VARAS
    this.varaService.consultar().subscribe({
      next: (data) => {
        this.varas = data;
        this.carregando = false;
      },
      error: () => {
        this.mensagemErro = ['Erro ao carregar varas'];
        this.carregando = false;
      }
    });

    // AÇÕES
    this.acaoService.consultar().subscribe({
      next: (data) => {
        this.acoes = data;
        this.carregando = false;
      },
      error: () => {
        this.mensagemErro = ['Erro ao carregar ações'];
        this.carregando = false;
      }
    });

    // RESPONSÁVEIS
    this.usuarioService.consultarUsuarioResponsavel().subscribe({
      next: (data) => {
        this.responsaveis = data;
        this.carregando = false;
      },
      error: () => {
        this.mensagemErro = ['Erro ao carregar responsáveis'];
        this.carregando = false;
      }
    });

    // QUALIFICAÇÕES
    this.qualificacaoService.consultarQualificacoes().subscribe({
      next: (data: QualificacaoResponse[]) => {
        this.qualificacoes = data;
      },
      error: () => {
        this.mensagemErro = ['Erro ao carregar qualificações'];
      }
    });

    // AUTOCOMPLETE PESSOAS
    this.pessoaNomeControl.valueChanges.pipe(
      debounceTime(300),
      filter((nome): nome is string => !!nome && nome.trim().length >= 1),
      switchMap(nome => this.pessoaService.consultarPessoasResumo(nome)),
      catchError(() => of([]))
    ).subscribe(pessoas => this.pessoasFiltradas = pessoas);
  }

  // ================== PESSOAS ==================
  selecionarPessoa(pessoa: PessoaResumo) {
    if (this.pessoasSelecionadas.some(p => p.id === pessoa.id)) {
      this.mensagemErro = ['Essa pessoa já foi selecionada.'];
      return;
    }

    this.pessoasSelecionadas.push({
      ...pessoa,
      idQualificacao: null
    });

    this.pessoaNomeControl.setValue('');
    this.mostrarSugestoesPessoa = false;
  }

  removerPessoaSelecionada(pessoa: PessoaSelecionada) {
    this.pessoasSelecionadas = this.pessoasSelecionadas.filter(p => p.id !== pessoa.id);
  }

  ocultarSugestoesComDelay() {
    setTimeout(() => {
      this.mostrarSugestoesPessoa = false;
    }, 200);
  }

  // ================== SUBMIT ==================
  onSubmit(): void {
    this.mensagemErro = [];
    this.mensagemSucesso = [];

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    // 🔥 VALIDAÇÃO ESSENCIAL
    if (this.pessoasSelecionadas.some(p => !p.idQualificacao)) {
      this.mensagemErro = ['Selecione a qualificação para todos os clientes.'];
      return;
    }

    this.carregando = true;

    const formValue = this.form.value;

    const limpar = (v: any) => v ?? undefined;

    const request = {
      acaoId: limpar(formValue.acaoId),
      varaId: formValue.varaId!,
      usuarioResponsavelId: limpar(formValue.usuarioResponsavelId),

      pasta: limpar(formValue.pasta),
      titulo: limpar(formValue.titulo),
      numeroProcesso: limpar(formValue.numeroProcesso),
      linkTribunal: limpar(formValue.linkTribunal),
      objeto: limpar(formValue.objeto),
      valorCausa: limpar(formValue.valorCausa),
      distribuido: limpar(formValue.distribuido),
      valorCondenacao: limpar(formValue.valorCondenacao),
      observacao: limpar(formValue.observacao),
      instancia: limpar(formValue.instancia),
      acesso: limpar(formValue.acesso),

      grupoCliente: this.pessoasSelecionadas.map(p => ({
        idPessoa: p.id,
   idQualificacao: p.idQualificacao ?? undefined
      })),

      grupoEnvolvidos: this.envolvidosSelecionados
        .filter(e => e.idPessoa && e.idQualificacao)
        .map(e => ({
          idPessoa: e.idPessoa,
          idQualificacao: e.idQualificacao
        })),

      grupoPessoasEtiquetas: this.etiquetasSelecionadas
        .filter(e => e.id)
        .map(e => ({ idEtiqueta: e.id }))
    };

    this.processoService.cadastrarProcesso(request).subscribe({
      next: (response) => {
        this.resetarFormulario();
        this.carregando = false;
        this.mensagemSucesso = [response?.mensagem];

        this.router.navigate(['/admin/processos']);
      },
      error: (err: HttpErrorResponse) => this.tratarErro(err)
    });
  }

  // ================== RESET ==================
  private resetarFormulario() {
    this.form.reset();
    this.pessoasSelecionadas = [];

    if (this.usuarioLogado) {
      this.form.get('idUsuario')?.setValue(this.usuarioLogado.idUsuario ?? null);
    }
  }

  // ================== ERROS ==================
  private tratarErro(err: HttpErrorResponse): void {
    this.mensagemErro = [];

    const errorResponse = err.error;

    if (errorResponse?.errors) {
      for (const key in errorResponse.errors) {
        this.mensagemErro.push(...errorResponse.errors[key]);
      }
    } else if (errorResponse?.mensagem) {
      this.mensagemErro.push(errorResponse.mensagem);
    } else {
      this.mensagemErro.push('Erro inesperado.');
    }

    this.carregando = false;
  }
}