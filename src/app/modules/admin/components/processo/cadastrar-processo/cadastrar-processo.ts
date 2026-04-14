import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
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
import { PessoaService } from '../../../../../core/services/pessoa.service';
import { QualificacaoResponse } from '../../../../../core/models/qualificacao/qualificacao-response';

import { catchError, of } from 'rxjs';
import { EtiquetaService } from '../../../../../core/services/etiqueta.service';
import { InstanciaEnum } from '../../../../../core/models/enums/intancia/instanciaEnum';
import { AcessoEnum } from '../../../../../core/models/enums/acesso/acesoEnum';

@Component({
  selector: 'app-cadastrar-processo',
  standalone: false,
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
  private etiquetaService = inject(EtiquetaService);
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
  etiquetasSelecionadas: ConsultarEtiquetaResponse[] = [];
  // 🔥 AGORA PADRONIZADO
  pessoasSelecionadas: PessoaSelecionada[] = [];
  pessoasFiltradas: PessoaResumo[] = [];

  envolvidosSelecionados: PessoaSelecionada[] = [];
  envolvidosFiltradas: PessoaResumo[] = [];

instanciaEnum = InstanciaEnum;
acessoEnum = AcessoEnum;

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

    this.carregarDadosIniciais();
          // carrega etiquetas
      this.etiquetaService.consultar().subscribe({
        next: (tipos) => {
          this.tiposetiquetas = tipos;
          this.carregando = false;
        },
        error: () => {
          this.mensagemErro = ['Erro ao carregar as etiquetas.'];
          this.carregando = false;
        }
      });
  }

  // ================== CARGAS ==================
  private carregarDadosIniciais() {

    this.varaService.consultar().subscribe({
      next: (data) => this.varas = data,
      error: () => this.mensagemErro = ['Erro ao carregar varas']
    });

    this.acaoService.consultar().subscribe({
      next: (data) => this.acoes = data,
      error: () => this.mensagemErro = ['Erro ao carregar ações']
    });

    this.usuarioService.consultarUsuarioResponsavel().subscribe({
      next: (data) => this.responsaveis = data,
      error: () => this.mensagemErro = ['Erro ao carregar responsáveis']
    });

    this.qualificacaoService.consultarQualificacoes().subscribe({
      next: (data) => this.qualificacoes = data,
      error: () => this.mensagemErro = ['Erro ao carregar qualificações']
    });

    this.carregando = false;
  }

  // ================== BUSCAS (NOVO PADRÃO) ==================
  buscarPessoas(nome: string) {
    this.pessoaService.consultarPessoasResumo(nome)
      .pipe(catchError(() => of([])))
      .subscribe(res => this.pessoasFiltradas = res);
  }

  buscarEnvolvidos(nome: string) {
    this.pessoaService.consultarPessoasResumo(nome)
      .pipe(catchError(() => of([])))
      .subscribe(res => this.envolvidosFiltradas = res);
  }

  // ================== SUBMIT ==================
  onSubmit(): void {
    this.mensagemErro = [];
    this.mensagemSucesso = [];

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    // 🔥 VALIDAÇÕES
    if (this.pessoasSelecionadas.some(p => !p.idQualificacao)) {
      this.mensagemErro = ['Selecione a qualificação para todos os clientes.'];
      return;
    }

    if (this.envolvidosSelecionados.some(e => !e.idQualificacao)) {
      this.mensagemErro = ['Selecione a qualificação para todos os envolvidos.'];
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

      grupoEnvolvidos: this.envolvidosSelecionados.map(e => ({
        idPessoa: e.id,
         idQualificacao: e.idQualificacao ?? undefined
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
selecionarEtiqueta(etiqueta: ConsultarEtiquetaResponse) {
    if (this.etiquetasSelecionadas.some(e => e.id === etiqueta.id)) {
      this.mensagemErro = ['Etiqueta já selecionada.'];
      return;
    }

    this.etiquetasSelecionadas.push(etiqueta);
  }
  removerEtiqueta(etiqueta: ConsultarEtiquetaResponse) {
    this.etiquetasSelecionadas =
      this.etiquetasSelecionadas.filter(e => e.id !== etiqueta.id);
  }
  // ================== RESET ==================
  private resetarFormulario() {
    this.form.reset();
    this.pessoasSelecionadas = [];
    this.envolvidosSelecionados = [];

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