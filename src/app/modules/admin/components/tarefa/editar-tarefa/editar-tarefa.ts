import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TarefaService } from '../../../../../core/services/tarefa.service';
import { EtiquetaService } from '../../../../../core/services/etiqueta.service';
import { UsuarioService } from '../../../../../core/services/usuario.service';
import { AuthHelper } from '../../../../../core/helpers/auth.helper';
import { StatusGeralKanbanEnum } from '../../../../../core/models/enums/status-kaban/status-kaban-geralEnum';
import { PrioridadeTarefaEnum } from '../../../../../core/models/enums/prioridade/prioridade-tarefaEnum';
import { ConsultarEtiquetaResponse } from '../../../../../core/models/etiqueta/consultar-etiqueta-response';
import { ConsultarUsuarioResponse } from '../../../../../core/models/usuario/consultar-usuarios.response';
import { CriarListaTarefaRequest } from '../../../../../core/models/tarefa/criar-lista-tarefa-request';
import { EditarTarefaRequest } from '../../../../../core/models/tarefa/editar-tarefa-request';
import { ListaTarefasResponse } from '../../../../../core/models/tarefa/lista-tarefas-response';
import { TipoVinculoEnum } from '../../../../../core/models/enums/tipo-vinculo/tipo-vinculoEnum';
import { ProcessoService } from '../../../../../core/services/processo.service';
import { CasoService } from '../../../../../core/services/caso.service';
import { AtendimentoService } from '../../../../../core/services/atendimento.service';



@Component({
  selector: 'app-editar-tarefa',
  standalone:false,
  templateUrl: './editar-tarefa.html',
  styleUrl: './editar-tarefa.css'
})
export class EditarTarefa implements OnInit {

  private fb = inject(FormBuilder);
  private tarefaService = inject(TarefaService);
  private etiquetaService = inject(EtiquetaService);
  private usuarioService = inject(UsuarioService);
  private authHelper = inject(AuthHelper);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private processoService = inject(ProcessoService);
  private casoService = inject(CasoService);
  private atendimentoService = inject(AtendimentoService);

  id!: string;
  tipoVinculoEnum = TipoVinculoEnum;
vinculoSelecionado: any = null;
  mensagemErro: string[] = [];
  mensagemSucesso: string[] = [];
  carregando = false;
listaFiltradas: ListaTarefasResponse[] = [];
  statusEnum = StatusGeralKanbanEnum;
  prioridadeEnum = PrioridadeTarefaEnum;

  grupoTarefasEtiquetas: ConsultarEtiquetaResponse[] = [];
  etiquetasSelecionadas: ConsultarEtiquetaResponse[] = [];
resultadosVinculo: any[] = [];
  responsaveis: ConsultarUsuarioResponse[] = [];
  responsaveisSelecionados: ConsultarUsuarioResponse[] = [];
responsaveisFiltrados: ConsultarUsuarioResponse[] = [];
  listasTarefa: CriarListaTarefaRequest[] = [];

  form = this.fb.group({
    descricao: ['', Validators.required],
    dataTarefa: [''],
    prioridade: [PrioridadeTarefaEnum.Media],
    statusGeralKanban: [StatusGeralKanbanEnum.A_Fazer],

    processoId: this.fb.control<string | null>(null),
    casoId: this.fb.control<string | null>(null),
    atendimentoId: this.fb.control<string | null>(null),

    tipoVinculo: this.fb.control<any>(null)
  });
removerBackdrop() {
  // remove classe do body
  document.body.classList.remove('modal-open');

  // remove estilos que travam a tela
  document.body.style.overflow = '';
  document.body.style.paddingRight = '';

  // remove todos os backdrops
  const backdrops = document.querySelectorAll('.modal-backdrop');
  backdrops.forEach(b => b.remove());

  // remove qualquer modal aberto
  const modals = document.querySelectorAll('.modal.show');
  modals.forEach(m => m.classList.remove('show'));
}
  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id')!;

    this.removerBackdrop(); 
      console.log('ID:', this.id);
    this.carregarBase();
    this.carregarTarefa();
  }
buscarListaTarefas(termo: string) {

  if (!termo) {
    this.listaFiltradas = [];
    return;
  }

  const termoLower = termo.toLowerCase();

  this.listaFiltradas = this.listasTarefa
    .filter(x => x.descricao?.toLowerCase().includes(termoLower))
    .map(x => ({
      descricao: x.descricao,
      quantidade: 0 // 👈 obrigatório no response
    }));
}
  // =========================
  // BASE
  // =========================
  carregarBase() {
    this.etiquetaService.consultar().subscribe(res => this.grupoTarefasEtiquetas = res);

    this.usuarioService.consultarUsuarioResponsavel().subscribe(res => {
      this.responsaveis = res;
    });
  }
buscarResponsaveis(termo: string) {
  if (!termo) {
    this.responsaveisFiltrados = this.responsaveis;
    return;
  }

  const termoLower = termo.toLowerCase();

  this.responsaveisFiltrados = this.responsaveis.filter(x =>
    x.nomeUsuario?.toLowerCase().includes(termoLower)
  );
}
buscarVinculo(termo: string) {

  const tipo = this.form.get('tipoVinculo')?.value;

  if (!tipo || !termo) {
    this.resultadosVinculo = [];
    return;
  }

  let request$: Observable<any[]>;

  if (tipo === TipoVinculoEnum.Processo || tipo === 'processo') {
    request$ = this.processoService.consultarProcessoAutoComplete(termo);
  }
  else if (tipo === TipoVinculoEnum.Caso || tipo === 'caso') {
    request$ = this.casoService.consultarCasoAutoComplete(termo);
  }
  else {
    request$ = this.atendimentoService.consultarAtendimentoAutoComplete(termo);
  }

  request$.subscribe(res => {
    this.resultadosVinculo = res;
  });
}
selecionarVinculo(item: any) {

  console.log('Selecionado:', item);

  if (!item) return;

  // limpa tudo primeiro
  this.form.patchValue({
    processoId: null,
    casoId: null,
    atendimentoId: null
  });

  // exemplo simples (ajuste conforme seu objeto)
  if (item.tipo === 'processo') {
    this.form.patchValue({ processoId: item.id });
  }

  if (item.tipo === 'caso') {
    this.form.patchValue({ casoId: item.id });
  }

  if (item.tipo === 'atendimento') {
    this.form.patchValue({ atendimentoId: item.id });
  }
}
  // =========================
  // CARREGA TAREFA
  // =========================
 carregarTarefa() {
  this.carregando = true;

  this.tarefaService.ObterTarefaPorId(this.id).subscribe({
    next: res => {

      console.log('CASO PASTA:', res.casoPasta);
      console.log('PROCESSO PASTA:', res.processoPasta);
      console.log('ATENDIMENTO:', res.atendimentoAssunto);

      // 🔗 TIPO DE VÍNCULO
      let tipoVinculo: TipoVinculoEnum | null = null;

      if (res.processoId) tipoVinculo = TipoVinculoEnum.Processo;
      else if (res.casoId) tipoVinculo = TipoVinculoEnum.Caso;
      else if (res.atendimentoId) tipoVinculo = TipoVinculoEnum.Atendimento;

      // 🧾 FORM
      this.form.patchValue({
        descricao: res.descricao,
        dataTarefa: res.dataTarefa ? res.dataTarefa.split('T')[0] : null,
        prioridade: res.prioridade,
        statusGeralKanban: res.statusGeralKanban,

        processoId: res.processoId,
        casoId: res.casoId,
        atendimentoId: res.atendimentoId,

        tipoVinculo: tipoVinculo
      });

      // 📋 LISTA
      this.listasTarefa = res.listasTarefa?.map(x => ({
        descricao: x.descricao
      })) ?? [];

      // 👥 RESPONSÁVEIS
this.responsaveisSelecionados =
  res.grupoTarefaResponsaveis?.map((x: any) => ({
    id: x.id,
    idPessoa: x.idPessoa ?? '',
    nomeUsuario: x.nomeUsuario
  })) ?? [];

      // 🏷️ ETIQUETAS
      this.etiquetasSelecionadas =
        res.grupoTarefasEtiquetas?.map((x: any) => ({
          id: x.id,
          nome: x.nome,
          cor: x.cor
        })) ?? [];

      // 🔗 VÍNCULO (SIMPLIFICADO E FUNCIONAL)
      if (res.processoId) {
        this.vinculoSelecionado = {
          id: res.processoId,
          tipo: 'processo',
          pasta: res.processoPasta
        };
      }
      else if (res.casoId) {
        this.vinculoSelecionado = {
          id: res.casoId,
          tipo: 'caso',
          pasta: res.casoPasta
        };
      }
      else if (res.atendimentoId) {
        this.vinculoSelecionado = {
          id: res.atendimentoId,
          tipo: 'atendimento',
          pasta: res.atendimentoAssunto
        };
      }
      else {
        this.vinculoSelecionado = null;
      }

      this.carregando = false;
    },
    error: () => {
      this.mensagemErro = ['Erro ao carregar tarefa'];
      this.carregando = false;
    }
  });
}

  // =========================
  // LISTA
  // =========================
  adicionarItemLista() {
    this.listasTarefa.push({ descricao: '' });
  }

  removerItemLista(i: number) {
    this.listasTarefa.splice(i, 1);
  }

  atualizarDescricaoLista(i: number, valor: string) {
    this.listasTarefa[i].descricao = valor;
  }

  // =========================
  // SUBMIT UPDATE
  // =========================
  onSubmit() {

    this.mensagemErro = [];
    this.mensagemSucesso = [];

    if (this.form.invalid) return;

    this.carregando = true;

    const f = this.form.value;

    const request: EditarTarefaRequest = {
      descricao: f.descricao ?? '',
     dataTarefa: f.dataTarefa ? new Date(f.dataTarefa) : null,
      prioridade: f.prioridade!,
      statusGeralKanban: f.statusGeralKanban!,

      processoId: f.processoId,
      casoId: f.casoId,
      atendimentoId: f.atendimentoId,

      grupoTarefasEtiquetas: this.etiquetasSelecionadas.map(e => ({
        etiquetaId: e.id!
      })),

      grupoTarefaResponsaveis: this.responsaveisSelecionados.map(r => ({
        usuarioId: r.id
      })),

      listasTarefa: this.listasTarefa
        .filter(x => x.descricao?.trim())
        .map(x => ({
          descricao: x.descricao.trim()
        }))
    };

    /*this.tarefaService.editarTarefa(this.id, request).subscribe({
      next: res => {
        this.mensagemSucesso = [res.message];
        this.carregando = false;
      },
      error: err => this.tratarErro(err)
    });*/
  }

  // =========================
  // ERRO
  // =========================
  tratarErro(err: HttpErrorResponse) {
    this.mensagemErro = ['Erro ao atualizar tarefa'];
    this.carregando = false;
  }
}