import { Component, Inject, inject, OnInit } from '@angular/core';
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
  private acaoService = inject(AcaoService)
  private usaurioService= inject(UsuarioService);
  usuarioLogado?: AutenticarUsuarioResponse | null;
    tiposetiquetas: ConsultarEtiquetaResponse[] = [];
  // ================== ESTADO ==================
  mensagemErro: string[] = [];
  mensagemSucesso: string[] = [];
  carregando = false;
  varas: ConsultarVaraResponse[] = [];
  acoes: ConsultarAcaoResponse[] = [];
  responsaveis:ConsultarUsuarioResponse[]=[];

  // ================== ARRAYS N:N ==================
  clientesSelecionados: any[] = [];
  envolvidosSelecionados: any[] = [];
  etiquetasSelecionadas: any[] = [];

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

    // usuário logado
    this.usuarioLogado = this.authHelper.get();

    if (this.usuarioLogado) {
      this.form.get('idUsuario')?.setValue(this.usuarioLogado.idUsuario ?? null);
    }

    // varas
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
    // acao
    this.acaoService.consultar().subscribe({
      next: (data) => {
        this.acoes = data;
        this.carregando = false;
      },
      error: () => {
        this.mensagemErro = ['Erro ao carregar varas'];
        this.carregando = false;
      }
    });
    //responsavel
    this.usaurioService.consultarUsuarioResponsavel().subscribe({
      next: (data) => {
        this.responsaveis = data;
        this.carregando = false;
      },
      error: () => {
        this.mensagemErro = ['Erro ao carregar varas'];
        this.carregando = false;
      }
    });
  }

  private obterVaraId(formValue: any): string | undefined {
    const varaId = formValue.varaId;

    if (!varaId) return undefined;

    return varaId;
  }
  // ================== SUBMIT ==================
  onSubmit(): void {
    this.mensagemErro = [];
    this.mensagemSucesso = [];

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.carregando = true;

    const formValue = this.form.value;

    const limpar = (v: any) => v ?? undefined;

    const request = {

      acaoId: limpar(formValue.acaoId),
      varaId: formValue.varaId!, // obrigatório
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

      grupoCliente: this.clientesSelecionados
        .filter(c => c.idPessoa && c.idQualificacao)
        .map(c => ({
          idPessoa: c.idPessoa,
          idQualificacao: c.idQualificacao
        })),

      grupoEnvolvidos: this.envolvidosSelecionados
        .filter(e => e.idPessoa && e.idQualificacao)
        .map(e => ({
          idPessoa: e.idPessoa,
          idQualificacao: e.idQualificacao
        })),

       grupoPessoasEtiquetas: this.etiquetasSelecionadas
          .filter(e => e.id)
          .map(e => ({ idEtiqueta: e.id! })),

       
    };

    this.processoService.cadastrarProcesso(request).subscribe({
      next: (response) => {
        this.form.reset();
        this.carregando = false;
        this.mensagemSucesso = [response?.mensagem];

        // opcional
        this.router.navigate(['/admin/processos']);
      },
      error: (err: HttpErrorResponse) => this.tratarErro(err)
    });
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