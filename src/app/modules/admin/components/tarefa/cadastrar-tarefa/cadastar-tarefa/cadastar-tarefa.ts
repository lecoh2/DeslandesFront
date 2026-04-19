import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { PrioridadeTarefaEnum } from '../../../../../../core/models/enums/prioridade/prioridade-tarefaEnum';
import { TipoVinculoEnum } from '../../../../../../core/models/enums/tipo-vinculo/tipo-vinculoEnum';
import { StatusGeralKanbanEnum } from '../../../../../../core/models/enums/status-kaban/status-kaban-geralEnum';

import { AutenticarUsuarioResponse } from '../../../../../../core/models/usuario/autenticar-usuario.response';
import { TarefaService } from '../../../../../../core/services/tarefa.service';
import { EtiquetaService } from '../../../../../../core/services/etiqueta.service';
import { AuthHelper } from '../../../../../../core/helpers/auth.helper';

import { ConsultarEtiquetaResponse } from '../../../../../../core/models/etiqueta/consultar-etiqueta-response';
import { CriarListaTarefaRequest } from '../../../../../../core/models/tarefa/criar-lista-tarefa-request';
import { CadastrarTarefaRequest } from '../../../../../../core/models/tarefa/cadastrar-tarefa.resquest';

import { UsuarioService } from '../../../../../../core/services/usuario.service';
import { ConsultarUsuarioResponse } from '../../../../../../core/models/usuario/consultar-usuarios.response';

import { ProcessoAutoComplete } from '../../../../../../core/models/processo/processo-auto-complete';
import { CasoAutoComplete } from '../../../../../../core/models/caso/caso-auto-complete';
import { AtendimentoAutoComplete } from '../../../../../../core/models/atendimento/atendimento-auto-complete';

import { ProcessoService } from '../../../../../../core/services/processo.service';
import { CasoService } from '../../../../../../core/services/caso.service';
import { AtendimentoService } from '../../../../../../core/services/atendimento.service';
import { ListaTarefasResponse } from '../../../../../../core/models/tarefa/lista-tarefas-response';

type VinculoAutoComplete =
  | ProcessoAutoComplete
  | CasoAutoComplete
  | AtendimentoAutoComplete;

@Component({
  selector: 'app-cadastrar-tarefa',
  standalone: false,
  templateUrl: './cadastrar-tarefa.html',
  styleUrl: './cadastrar-tarefa.css'
})
export class CadastrarTarefa implements OnInit {

  private builder = inject(FormBuilder);
  private router = inject(Router);
  private tarefaService = inject(TarefaService);
  private etiquetaService = inject(EtiquetaService);
  private authHelper = inject(AuthHelper);
  private usuarioService = inject(UsuarioService);
  private processoService = inject(ProcessoService);
  private casoService = inject(CasoService);
  private atendimentoService = inject(AtendimentoService);

  usuarioLogado?: AutenticarUsuarioResponse | null;

  mensagemErro: string[] = [];
  mensagemSucesso: string[] = [];
  carregando = false;

  resultadosVinculo: VinculoAutoComplete[] = [];
  listaFiltradas: ListaTarefasResponse[] = [];
  prioridadeEnum = PrioridadeTarefaEnum;
  statusEnum = StatusGeralKanbanEnum;
  tiposVinculo = Object.values(TipoVinculoEnum).filter(v => typeof v === 'number');

  responsaveis: ConsultarUsuarioResponse[] = [];
  responsaveisFiltrados: ConsultarUsuarioResponse[] = [];
  responsaveisSelecionados: ConsultarUsuarioResponse[] = [];

  grupoTarefasEtiquetas: ConsultarEtiquetaResponse[] = [];
  etiquetasSelecionadas: ConsultarEtiquetaResponse[] = [];

  // 🔥 LISTA DE TAREFAS (SEM ngModel)
  listasTarefa: CriarListaTarefaRequest[] = [];

  vinculoSelecionado: ProcessoAutoComplete | CasoAutoComplete | AtendimentoAutoComplete | null = null;

  form = this.builder.group({
    descricao: ['', Validators.required],
    dataTarefa: ['', Validators.required],
    prioridade: [PrioridadeTarefaEnum.Media],
    statusGeralKanban: [StatusGeralKanbanEnum.A_Fazer],
    tipoVinculo: this.builder.control<'processo' | 'caso' | 'atendimento' | null>(null),

    processoId: this.builder.control<string | null>(null),
    casoId: this.builder.control<string | null>(null),
    atendimentoId: this.builder.control<string | null>(null),

    responsavelId: this.builder.control<string | null>(null)
  });

  get podeEnviar(): boolean {
    return this.form.valid;
  }

  ngOnInit(): void {
    this.usuarioLogado = this.authHelper.get();
    this.carregarDados();
  }

  carregarDados() {
    this.etiquetaService.consultar().subscribe({
      next: res => this.grupoTarefasEtiquetas = res
    });

    this.usuarioService.consultarUsuarioResponsavel().subscribe({
      next: res => this.responsaveis = res,
      error: () => this.mensagemErro = ['Erro ao carregar responsáveis']
    });
  }

  // =========================
  // LISTA DE TAREFAS
  // =========================

  adicionarItemLista() {
    this.listasTarefa = [
      ...this.listasTarefa,
      { descricao: '' }
    ];
  }

  removerItemLista(index: number) {
    this.listasTarefa = this.listasTarefa.filter((_, i) => i !== index);
  }

atualizarDescricaoLista(index: number, valor: string) {
  this.listasTarefa[index].descricao = valor;
}

  // =========================
  // RESPONSÁVEIS
  // =========================

  buscarResponsaveis(termo: string) {
    if (!termo) {
      this.responsaveisFiltrados = [];
      return;
    }

    this.responsaveisFiltrados = this.responsaveis
      .filter(r => r.nomeUsuario.toLowerCase().includes(termo.toLowerCase()));
  }

  // =========================
  // VÍNCULO
  // =========================

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

    request$.subscribe(res => this.resultadosVinculo = res);
  }

  selecionarVinculo(item: any) {
    const tipo = this.form.get('tipoVinculo')?.value;

    this.resultadosVinculo = [];

    this.form.patchValue({
      processoId: null,
      casoId: null,
      atendimentoId: null
    });

    if (tipo === 'processo') this.form.patchValue({ processoId: item.id });
    else if (tipo === 'caso') this.form.patchValue({ casoId: item.id });
    else this.form.patchValue({ atendimentoId: item.id });
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
if (this.listasTarefa.length === 0) {
  this.mensagemErro = ['Adicione pelo menos um item na lista de tarefas.'];
  return;
}
    this.carregando = true;

    const f = this.form.value;
    const limpar = (v: any) => v ?? undefined;

    const request: CadastrarTarefaRequest = {
      descricao: limpar(f.descricao) ?? '',
      dataTarefa: limpar(f.dataTarefa),
      usuarioCriacaoId: this.usuarioLogado?.idUsuario,
      responsavelId: limpar(f.responsavelId),

      processoId: limpar(f.processoId),
      casoId: limpar(f.casoId),
      atendimentoId: limpar(f.atendimentoId),

      prioridade: f.prioridade!,
      statusGeralKanban: f.statusGeralKanban!,

      grupoTarefasEtiquetas: this.etiquetasSelecionadas.map(e => ({
        etiquetaId: e.id!
      })),

      grupoTarefaResponsaveis: this.responsaveisSelecionados.map(r => ({
        usuarioId: r.id
      })),

      // 🔥 GARANTIDO SEM VALOR VAZIO
      listasTarefa: this.listasTarefa
        .filter(x => x.descricao?.trim())
        .map(x => ({
          descricao: x.descricao.trim()
        }))
    };

    this.tarefaService.cadastrarTarefa(request).subscribe({
      next: res => {
        this.resetar();
        this.mensagemSucesso = [res.message];
        this.carregando = false;
      },
      error: err => this.tratarErro(err)
    });
  }
buscarListaTarefas(termo: string) {
  this.tarefaService.consultarListaTarefaAutoComplete(termo)
    .subscribe(res => this.listaFiltradas = res);
}
resetar() {
  this.form.reset();
  this.responsaveisSelecionados = [];
  this.etiquetasSelecionadas = [];
  this.listasTarefa = [];
}

  tratarErro(err: HttpErrorResponse) {
    const e = err.error;

    this.mensagemErro = [];

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