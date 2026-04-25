import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { CriarEventoRequest } from '../../../../../core/models/evento/criar-evento-request';
import { FormBuilder, Validators } from '@angular/forms';
import { ConsultarEtiquetaResponse } from '../../../../../core/models/etiqueta/consultar-etiqueta-response';
import { ConsultarUsuarioResponse } from '../../../../../core/models/usuario/consultar-usuarios.response';
import { AutenticarUsuarioResponse } from '../../../../../core/models/usuario/autenticar-usuario.response';
import { ActivatedRoute, Router } from '@angular/router';

import { EventoService } from '../../../../../core/services/evento.service';
import { UsuarioService } from '../../../../../core/services/usuario.service';
import { EtiquetaService } from '../../../../../core/services/etiqueta.service';
import { AuthHelper } from '../../../../../core/helpers/auth.helper';
import { StatusGeralKanbanEnum } from '../../../../../core/models/enums/status-kaban/status-kaban-geralEnum';
import { ProcessoAutoComplete } from '../../../../../core/models/processo/processo-auto-complete';
import { CasoAutoComplete } from '../../../../../core/models/caso/caso-auto-complete';
import { AtendimentoAutoComplete } from '../../../../../core/models/atendimento/atendimento-auto-complete';
import { Observable } from 'rxjs';
import { ProcessoService } from '../../../../../core/services/processo.service';
import { CasoService } from '../../../../../core/services/caso.service';
import { AtendimentoService } from '../../../../../core/services/atendimento.service';
type VinculoAutoComplete =
  | ProcessoAutoComplete
  | CasoAutoComplete
  | AtendimentoAutoComplete;
@Component({
  selector: 'app-editar-evento',
  standalone: false,
  templateUrl: './editar-evento.html',
  styleUrl: './editar-evento.css'
})
export class EditarEvento implements OnInit {

  private builder = inject(FormBuilder);
  private router = inject(Router);
  private eventoService = inject(EventoService);
  private etiquetaService = inject(EtiquetaService);
  private usuarioService = inject(UsuarioService);
  private authHelper = inject(AuthHelper);
  private route = inject(ActivatedRoute);
  id!: string;
  usuarioLogado?: AutenticarUsuarioResponse | null;
  private processoService = inject(ProcessoService);
  private casoService = inject(CasoService);
  private atendimentoService = inject(AtendimentoService);
   vinculoSelecionado: any = null;
  mensagemErro: string[] = [];
  mensagemSucesso: string[] = [];
  carregando = false;
  resultadosVinculo: VinculoAutoComplete[] = [];
  // 🔥 RESPONSÁVEIS (igual tarefa)
  responsaveis: ConsultarUsuarioResponse[] = [];
  responsaveisFiltrados: ConsultarUsuarioResponse[] = [];
  responsaveisSelecionados: ConsultarUsuarioResponse[] = [];
  statusEnum = StatusGeralKanbanEnum;
  // 🔥 ETIQUETAS
  etiquetas: ConsultarEtiquetaResponse[] = [];
  etiquetasSelecionadas: ConsultarEtiquetaResponse[] = [];
  grupoEventoEtiquetas: ConsultarEtiquetaResponse[] = [];

  form = this.builder.group({
    titulo: ['', Validators.required],
    endereco: [''],
    observacao: [''],

    dataInicial: ['', Validators.required],
    dataFinal: [''],

    horaInicial: [''],
    horaFinal: [''],

    diaInteiro: [false],

   statusKaban: this.builder.control<number | null>(null),

    intervaloRecorrencia: [1],
    tipoRecorrencia: [0],
    modalidade: [0],
    dataFimRecorrencia: [''],
    quantidadeOcorrencias: [0],

    tipoVinculo: ['' as 'processo' | 'caso' | 'atendimento'],
processoId: this.builder.control<string | null>(null),
casoId: this.builder.control<string | null>(null),
atendimentoId: this.builder.control<string | null>(null),
  });

  get podeEnviar(): boolean {
    return this.form.valid;
  }
carregarEvento() {
  this.carregando = true;

  this.eventoService.ObterEventoPorId(this.id).subscribe({
    next: res => {

      console.log('EVENTO:', res);

      let tipoVinculo: 'processo' | 'caso' | 'atendimento' | null = null;

      if (res.processoId) tipoVinculo = 'processo';
      else if (res.casoId) tipoVinculo = 'caso';
      else if (res.atendimentoId) tipoVinculo = 'atendimento';

      this.form.patchValue({
        titulo: res.titulo,
        endereco: res.endereco,
        observacao: res.observacao,

        dataInicial: res.dataInicial ? res.dataInicial.split('T')[0] : null,
        dataFinal: res.dataFinal ? res.dataFinal.split('T')[0] : null,

        horaInicial: res.horaInicial,
        horaFinal: res.horaFinal,

        diaInteiro: res.diaInteiro,

        statusKaban: res.statusGeralKanban, // ✅ corrigido

        modalidade: res.modalidade,

        processoId: res.processoId,
        casoId: res.casoId,
        atendimentoId: res.atendimentoId,

        tipoVinculo: tipoVinculo
      });

      // 👥 RESPONSÁVEIS
      this.responsaveisSelecionados =
        res.grupoEventoResponsaveis?.map((x: any) => ({
          id: x.usuarioId,
          idPessoa: '',
          nomeUsuario: x.nomeUsuario
        })) ?? [];

      // 🏷️ ETIQUETAS
      this.etiquetasSelecionadas =
        res.grupoEventoEtiquetas?.map((e: any) => ({
          id: e.etiquetaId,
          nome: e.nome,
          cor: e.cor
        })) ?? [];

      // 🔗 VÍNCULO VISUAL
      if (res.processoId) {
        this.vinculoSelecionado = {
          id: res.processoId,
          tipo: 'processo'
        };
      }
      else if (res.casoId) {
        this.vinculoSelecionado = {
          id: res.casoId,
          tipo: 'caso'
        };
      }
      else if (res.atendimentoId) {
        this.vinculoSelecionado = {
          id: res.atendimentoId,
          tipo: 'atendimento'
        };
      }
      else {
        this.vinculoSelecionado = null;
      }

      this.carregando = false;
    },
    error: () => {
      this.mensagemErro = ['Erro ao carregar evento'];
      this.carregando = false;
    }
  });
}
ngOnInit(): void {
  this.id = this.route.snapshot.paramMap.get('id')!;

  this.usuarioLogado = this.authHelper.get();

  this.carregarDados();
  this.carregarEvento(); // 🔥 FALTAVA ISSO
}

  carregarDados() {
    this.etiquetaService.consultar().subscribe({
      next: res => this.grupoEventoEtiquetas = res
    });

    this.usuarioService.consultarUsuarioResponsavel().subscribe({
      next: res => this.responsaveis = res,
      error: () => this.mensagemErro = ['Erro ao carregar responsáveis']
    });
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

  selecionarVinculo(item: any) {

    console.log('ITEM COMPLETO:', item);

    this.form.patchValue({
      processoId: null,
      casoId: null,
      atendimentoId: null
    });

    const id = item.id;

    if (!id) return;

    // 🔥 REGRA SIMPLES: identifica pelo campo existente

    if ('assunto' in item) {
      this.form.patchValue({ atendimentoId: id });
    }

    else if ('numeroProcesso' in item || 'processoPasta' in item) {
      this.form.patchValue({ processoId: id });
    }

    else {
      this.form.patchValue({ casoId: id });
    }

    console.log('FORM FINAL:', this.form.value);
  }

  // =========================
  // 🔍 BUSCAR RESPONSÁVEIS (IGUAL TAREFA)
  // =========================
  buscarResponsaveis(termo: string) {
    if (!termo) {
      this.responsaveisFiltrados = [];
      return;
    }

    this.responsaveisFiltrados = this.responsaveis
      .filter(r =>
        r.nomeUsuario.toLowerCase().includes(termo.toLowerCase())
      );
  }

  // =========================
  // 🚀 SUBMIT
  // =========================
  onSubmit(): void {

    this.mensagemErro = [];
    this.mensagemSucesso = [];

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.carregando = true;

    const f = this.form.value;
    const limpar = (v: any) => v ?? undefined;

    const request = {
      titulo: f.titulo ?? '',
      endereco: f.endereco || undefined,
      observacao: f.observacao || undefined,

      dataInicial: f.dataInicial!,
      dataFinal: f.dataFinal || undefined,

      horaInicial: f.horaInicial || undefined,
      horaFinal: f.horaFinal || undefined,

      diaInteiro: f.diaInteiro ?? false,

      statusGeralKanban: f.statusKaban ?? 1,

      tipoRecorrencia: f.tipoRecorrencia ?? 0,
      intervaloRecorrencia: f.intervaloRecorrencia ?? 0,
      modalidade: f.modalidade ?? 0,

      dataFimRecorrencia: f.dataFimRecorrencia || undefined,
      quantidadeOcorrencias: f.quantidadeOcorrencias || undefined,

      diasSemana: [],

      grupoEventoEtiquetas: this.etiquetasSelecionadas.map(e => ({
        etiquetaId: e.id!
      })),

      grupoEventoResponsaveis: this.responsaveisSelecionados.map(r => ({
        usuarioId: r.id
      })),

      processoId: limpar(f.processoId),
      casoId: limpar(f.casoId),
      atendimentoId: limpar(f.atendimentoId),
    };

    console.log('UPDATE REQUEST:', request);

    this.eventoService.editarEvento(this.id, request).subscribe({
      next: res => {

        this.mensagemSucesso = [
          res.message ?? 'Evento atualizado com sucesso'
        ];

        this.carregando = false;
      },
      error: err => this.tratarErro(err)
    });
  }

  resetar() {
    this.form.reset({
      diaInteiro: false,
      intervaloRecorrencia: 1,
      tipoRecorrencia: 0,
      modalidade: 0
    });

    this.responsaveisSelecionados = [];
    this.etiquetasSelecionadas = [];
    this.resultadosVinculo = [];
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
  private montarDataHora(data?: string | null, hora?: string | null): string | undefined {
    if (!data || !hora) return undefined;
    return new Date(`${data}T${hora}:00`).toISOString();
  }
}