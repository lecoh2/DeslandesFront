import { Component } from '@angular/core';
import { FormBuilder, Validators } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { Router } from "@angular/router";
import { ProcessoService } from "../../../../../core/services/processo.service";
import { AuthHelper } from "../../../../../core/helpers/auth.helper";
import { VaraService } from "../../../../../core/services/vara.service";
import { UsuarioService } from "../../../../../core/services/usuario.service";
import { AcaoService } from "../../../../../core/services/acao.service";
import { PessoaService } from "../../../../../core/services/pessoa.service";
import { QualificacoesService } from "../../../../../core/services/qualificacoes.service";
import { EtiquetaService } from "../../../../../core/services/etiqueta.service";
import { inject, OnInit } from "@angular/core";
import { InstanciaEnum } from "../../../../../core/models/enums/intancia/instanciaEnum";
import { AcessoEnum } from "../../../../../core/models/enums/acesso/acesoEnum";
import { HttpErrorResponse } from '@angular/common/http';
import { forkJoin, catchError, of} from 'rxjs';
import { ConsultarVaraResponse } from '../../../../../core/models/vara/consultar-vara-response';
import { ConsultarAcaoResponse } from '../../../../../core/models/acao/consultar-acao-response';
import { ConsultarUsuarioResponse } from '../../../../../core/models/usuario/consultar-usuarios.response';
import { QualificacaoResponse } from '../../../../../core/models/qualificacao/qualificacao-response';
import { ConsultarEtiquetaResponse } from '../../../../../core/models/etiqueta/consultar-etiqueta-response';
import { PessoaSelecionada } from '../../../../../core/models/pessoa/pessoa-selecionada';
import { PessoaResumo } from '../../../../../core/models/pessoa/pessoa-resumo';
@Component({
  selector: 'app-editar-processo',
  standalone:false,
  templateUrl: './editar-processo.html',
  styleUrl: './editar-processo.css',
})


export class EditarProcesso implements OnInit {

  private builder = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private processoService = inject(ProcessoService);
  private authHelper = inject(AuthHelper);
  private varaService = inject(VaraService);
  private acaoService = inject(AcaoService);
  private usuarioService = inject(UsuarioService);
  private pessoaService = inject(PessoaService);
  private qualificacaoService = inject(QualificacoesService);
  private etiquetaService = inject(EtiquetaService);

  id!: string;

  carregando = false;
  mensagemErro: string[] = [];
  mensagemSucesso: string[] = [];

  foros: { id: string, nome: string }[] = [];

  varas: ConsultarVaraResponse[] = [];  
  varasFiltradas: ConsultarVaraResponse[] = [];

  acoes: ConsultarAcaoResponse[] = [];

  responsaveis: ConsultarUsuarioResponse[] = [];
  qualificacoes: QualificacaoResponse[] = [];

  tiposetiquetas: ConsultarEtiquetaResponse[] = [];
  etiquetasSelecionadas: ConsultarEtiquetaResponse[] = [];

  //  AGORA PADRONIZADO
  pessoasSelecionadas: PessoaSelecionada[] = [];
  pessoasFiltradas: PessoaResumo[] = [];

envolvidosSelecionados: PessoaSelecionada[] = [];
  envolvidosFiltradas: PessoaResumo[] = [];

  instanciaEnum = InstanciaEnum;
  acessoEnum = AcessoEnum;


  form = this.builder.group({
    acaoId: [null],
    foroId: [null],
    varaId: [null, Validators.required],
    usuarioResponsavelId: [null],
    juizo: [''],
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
private carregarDadosIniciais() {
  this.carregando = true;
  this.mensagemErro = [];

  forkJoin({
    varas: this.varaService.consultar(),
    acoes: this.acaoService.consultar(),
    usuarios: this.usuarioService.consultarUsuarioResponsavel(),
    qualificacoes: this.qualificacaoService.consultarQualificacoes(),
    etiquetas: this.etiquetaService.consultar()
  }).subscribe({
    next: (res) => {

      const { varas, acoes, usuarios, qualificacoes, etiquetas } = res as {
        varas: ConsultarVaraResponse[];
        acoes: ConsultarAcaoResponse[];
        usuarios: ConsultarUsuarioResponse[];
        qualificacoes: QualificacaoResponse[];
        etiquetas: ConsultarEtiquetaResponse[];
      };

      // 🔥 VARAS + FOROS
      this.varas = varas;
      this.varasFiltradas = varas;

      const mapa = new Map<string, string>();
      varas.forEach(v => {
        if (v.foroId && v.nomeForo) {
          mapa.set(v.foroId, v.nomeForo);
        }
      });

      this.foros = Array.from(mapa, ([id, nome]) => ({ id, nome }));

      // 🔥 OUTROS DADOS
      this.acoes = acoes;
      this.responsaveis = usuarios;
      this.qualificacoes = qualificacoes;
      this.tiposetiquetas = etiquetas;

      // 🔥 IMPORTANTE (somente no EDITAR)
      if (this.id) {
        this.carregarProcesso();
      }
    },
    error: () => {
      this.mensagemErro = ['Erro ao carregar dados iniciais'];
      this.carregando = false;
    },
    complete: () => {
      this.carregando = false;
    }
  });
}irParaLista(): void {
  this.router.navigate(['/admin/consultar-processo']);
}
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
  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id')!;

    this.carregarDadosIniciais();
    this.carregarProcesso();

    this.form.get('foroId')?.valueChanges.subscribe(foroId => {
      if (!foroId) {
        this.varasFiltradas = this.varas;
        return;
      }

      this.varasFiltradas = this.varas.filter(v => v.foroId === foroId);
      this.form.get('varaId')?.setValue(null);
    });
  }

  // ================= CARREGAR PROCESSO =================
  private carregarProcesso() {
    this.carregando = true;

    this.processoService.ObterProcessoPorId(this.id).subscribe({
      next: (res: any) => {

        // FORM
        this.form.patchValue({
          acaoId: res.acaoId,
          varaId: res.varaId,
          usuarioResponsavelId: res.usuarioResponsavelId,
          juizo: res.juizo,
          pasta: res.pasta,
          titulo: res.titulo,
          numeroProcesso: res.numeroProcesso,
          linkTribunal: res.linkTribunal,
          objeto: res.objeto,
          valorCausa: res.valorCausa,
          distribuido: res.distribuido,
          valorCondenacao: res.valorCondenacao,
          observacao: res.observacao,
          instancia: res.instancia,
          acesso: res.acesso
        });

        // CLIENTES
        this.pessoasSelecionadas = (res.grupoClienteProcesso ?? []).map((c: any) => ({
          id: c.pessoaId,
          nome: c.nome,
          idQualificacao: c.qualificacaoId
        }));

       // ENVOLVIDOS
        this.envolvidosSelecionados = (res.grupoEnvolvidosProcesso ?? []).map((e: any) => ({
          id: e.pessoaId,
          nome: e.nome,
          idQualificacao: e.qualificacaoId
        }));

        // ETIQUETAS
        this.etiquetasSelecionadas = (res.grupoEtiquetasProcesso ?? []).map((e: any) => ({
          id: e.etiquetaId,
          nome: e.nome,
          cor: e.cor
        }));

        this.carregando = false;
      },
      error: () => {
        this.mensagemErro = ['Erro ao carregar processo'];
        this.carregando = false;
      }
    });
  }
  onSubmit(): void {
  this.mensagemErro = [];
  this.mensagemSucesso = [];

  if (this.form.invalid) {
    this.form.markAllAsTouched();
    return;
  }

  if (this.pessoasSelecionadas.some(p => !p.idQualificacao)) {
    this.mensagemErro = ['Selecione a qualificação para todos os clientes.'];
    return;
  }

  if (this.envolvidosSelecionados.some(e => !e.idQualificacao)) {
    this.mensagemErro = ['Selecione a qualificação para todos os envolvidos.'];
    return;
  }

  this.carregando = true;

  const f = this.form.value;
  const limpar = (v: any) => v ?? undefined;

  const request = {
    acaoId: limpar(f.acaoId),
    varaId: f.varaId!,
    usuarioResponsavelId: limpar(f.usuarioResponsavelId),
    juizo: limpar(f.juizo),
    pasta: limpar(f.pasta),
    titulo: limpar(f.titulo),
    numeroProcesso: limpar(f.numeroProcesso),
    linkTribunal: limpar(f.linkTribunal),
    objeto: limpar(f.objeto),
    valorCausa: limpar(f.valorCausa),
    distribuido: limpar(f.distribuido),
    valorCondenacao: limpar(f.valorCondenacao),
    observacao: limpar(f.observacao),
    instancia: limpar(f.instancia),
    acesso: limpar(f.acesso),

    grupoClienteProcesso: this.pessoasSelecionadas.map(p => ({
      idPessoa: p.id,
      idQualificacao: p.idQualificacao
    })),

    grupoEnvolvidosProcesso: this.envolvidosSelecionados.map(e => ({
      idPessoa: e.id,
      idQualificacao: e.idQualificacao
    })),

    grupoEtiquetasProcesso: this.etiquetasSelecionadas.map(e => ({
      etiquetaId: e.id
    }))
  };

  this.processoService.editarProcesso(this.id, request).subscribe({
    next: (res: any) => {
      this.carregando = false;

      this.mensagemSucesso = [
        res.message ?? 'Processo atualizado com sucesso'
      ];

      setTimeout(() => {
        this.router.navigate(['/admin/consultar-processo']);
      }, 3000);
    },
    error: (err) => this.tratarErro(err)
  });
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
