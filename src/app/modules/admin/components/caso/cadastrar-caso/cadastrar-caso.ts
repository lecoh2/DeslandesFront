import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { catchError, of } from 'rxjs';


import { HttpErrorResponse } from '@angular/common/http';
import { AutenticarUsuarioResponse } from '../../../../../core/models/usuario/autenticar-usuario.response';
import { CasoService } from '../../../../../core/services/caso.service';
import { PessoaService } from '../../../../../core/services/pessoa.service';
import { EtiquetaService } from '../../../../../core/services/etiqueta.service';
import { QualificacoesService } from '../../../../../core/services/qualificacoes.service';
import { AuthHelper } from '../../../../../core/helpers/auth.helper';
import { PessoaSelecionada } from '../../../../../core/models/pessoa/pessoa-selecionada';
import { PessoaResumo } from '../../../../../core/models/pessoa/pessoa-resumo';
import { ConsultarEtiquetaResponse } from '../../../../../core/models/etiqueta/consultar-etiqueta-response';
import { QualificacaoResponse } from '../../../../../core/models/qualificacao/qualificacao-response';
import { AcessoEnum } from '../../../../../core/models/enums/acesso/acesoEnum';
import { UsuarioService } from '../../../../../core/services/usuario.service';
import { ConsultarUsuarioResponse } from '../../../../../core/models/usuario/consultar-usuarios.response';

@Component({
  selector: 'app-cadastrar-caso',
  standalone: false,
  templateUrl: './cadastrar-caso.html',
  styleUrl: './cadastrar-caso.css'
})
export class CadastrarCaso implements OnInit {

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private casoService = inject(CasoService);
  private pessoaService = inject(PessoaService);
  private etiquetaService = inject(EtiquetaService);
  private qualificacaoService = inject(QualificacoesService);
  private authHelper = inject(AuthHelper);
private usuarioService = inject(UsuarioService);
  usuarioLogado?: AutenticarUsuarioResponse | null;

  mensagemErro: string[] = [];
  mensagemSucesso: string[] = [];
  carregando = false;

  // ================= PESSOAS =================
  clientesSelecionados: PessoaSelecionada[] = [];
  clientesFiltrados: PessoaResumo[] = [];
  envolvidosFiltradas: PessoaResumo[] = [];
  envolvidosSelecionados: PessoaSelecionada[] = [];
responsaveis: ConsultarUsuarioResponse[] = [];
  envolvidosFiltrados: PessoaResumo[] = [];

  qualificacoes: QualificacaoResponse[] = [];
  acessoEnum = AcessoEnum;
  // ================= ETIQUETAS =================
  tiposEtiquetas: ConsultarEtiquetaResponse[] = [];
  etiquetasSelecionadas: ConsultarEtiquetaResponse[] = [];

  // ================= FORM =================
  form = this.fb.group({
    pasta: [''],
    titulo: ['', Validators.required],
    descricao: [''],
    observacao: [''],
    acesso: [null],
    responsavelId: [''],
    usuarioCadastroId:[''],
  });

  ngOnInit(): void {
    this.usuarioLogado = this.authHelper.get();

    this.form.patchValue({
     
       usuarioCadastroId: this.usuarioLogado?.idUsuario
    });

    this.carregarDados();
  }

  private carregarDados() {
    this.etiquetaService.consultar().subscribe({
      next: (res) => this.tiposEtiquetas = res
    });

    this.qualificacaoService.consultarQualificacoes().subscribe({
      next: (res) => this.qualificacoes = res
    });
    this.usuarioService.consultarUsuarioResponsavel().subscribe({
    next: (res) => this.responsaveis = res,
    error: () => this.mensagemErro = ['Erro ao carregar responsáveis']
  });
  }

  // ================= BUSCA =================
  buscarClientes(nome: string) {
    this.pessoaService.consultarPessoasResumo(nome)
      .pipe(catchError(() => of([])))
      .subscribe(res => this.clientesFiltrados = res);
  }

  buscarEnvolvidos(nome: string) {
    this.pessoaService.consultarPessoasResumo(nome)
      .pipe(catchError(() => of([])))
      .subscribe(res => this.envolvidosFiltradas = res);
  }



  removerEnvolvido(index: number) {
    this.envolvidosSelecionados.splice(index, 1);
  }

  // ================= SUBMIT =================
  onSubmit(): void {
    this.mensagemErro = [];
    this.mensagemSucesso = [];

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (this.clientesSelecionados.length === 0) {
      this.mensagemErro = ['Selecione pelo menos um cliente'];
      return;
    }
    // 🔥 👉 COLOCA AQUI
    if (this.envolvidosSelecionados.some(e => !e.idQualificacao)) {
      this.mensagemErro = ['Selecione a qualificação para todos os envolvidos'];
      return;
    }
    this.carregando = true;

    const formValue = this.form.value;
    const limpar = (v: any) => v ?? undefined;

    const request = {
      pasta: limpar(formValue.pasta),
      titulo: formValue.titulo!,
      descricao: limpar(formValue.descricao),
      observacao: limpar(formValue.observacao),
      acesso: limpar(formValue.acesso),
      responsavelId: limpar(formValue.responsavelId),
      usuarioCadastroId: limpar(formValue.usuarioCadastroId),
      grupoCasoClientes: this.clientesSelecionados.map(c => ({
        idPessoa: c.id
      })),

      grupoCasoEnvolvidos: this.envolvidosSelecionados.map(e => ({
        idPessoa: e.id,
        idQualificacao: e.idQualificacao!
      })),

      grupoEtiquetaCasos: this.etiquetasSelecionadas.map(e => ({
        etiquetaId: e.id
      }))
    };

    console.log('📦 REQUEST CASO:', request);

    this.casoService.cadastrarCaso(request).subscribe({
      next: (res) => {
        this.resetar();
        this.carregando = false;
        this.mensagemSucesso = [res.message];
        this.router.navigate(['/admin/cadastrar-caso']);
      },
      error: (err: HttpErrorResponse) => this.tratarErro(err)
    });
  }

  private resetar() {
    this.form.reset();
    this.clientesSelecionados = [];
    this.envolvidosSelecionados = [];
    this.etiquetasSelecionadas = [];
  }

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