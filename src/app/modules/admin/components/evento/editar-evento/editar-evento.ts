import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';

import { EventoService } from '../../../../../core/services/evento.service';
import { UsuarioService } from '../../../../../core/services/usuario.service';
import { EtiquetaService } from '../../../../../core/services/etiqueta.service';
import { AuthHelper } from '../../../../../core/helpers/auth.helper';
import { ProcessoService } from '../../../../../core/services/processo.service';
import { CasoService } from '../../../../../core/services/caso.service';
import { AtendimentoService } from '../../../../../core/services/atendimento.service';
import { ChangeDetectorRef } from '@angular/core';
import { ConsultarEtiquetaResponse } from '../../../../../core/models/etiqueta/consultar-etiqueta-response';
import { ConsultarUsuarioResponse } from '../../../../../core/models/usuario/consultar-usuarios.response';
import { AutenticarUsuarioResponse } from '../../../../../core/models/usuario/autenticar-usuario.response';
import { StatusGeralKanbanEnum } from '../../../../../core/models/enums/status-kaban/status-kaban-geralEnum';
import { finalize } from 'rxjs';
import { ProcessoAutoComplete } from '../../../../../core/models/processo/processo-auto-complete';
import { CasoAutoComplete } from '../../../../../core/models/caso/caso-auto-complete';
import { AtendimentoAutoComplete } from '../../../../../core/models/atendimento/atendimento-auto-complete';

type VinculoAutoComplete =
  | ProcessoAutoComplete
  | CasoAutoComplete
  | AtendimentoAutoComplete;

@Component({
  selector: 'app-editar-evento',
  standalone: false,
  templateUrl: './editar-evento.html',
  styleUrls: ['./editar-evento.css']
})
export class EditarEvento implements OnInit {

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);
  private eventoService = inject(EventoService);
  private etiquetaService = inject(EtiquetaService);
  private usuarioService = inject(UsuarioService);
  private processoService = inject(ProcessoService);
  private casoService = inject(CasoService);
  private atendimentoService = inject(AtendimentoService);
  private authHelper = inject(AuthHelper);

  id!: string;
  carregando = false;

  usuarioLogado?: AutenticarUsuarioResponse | null;

  mensagemErro: string[] = [];
  mensagemSucesso: string[] = [];

  resultadosVinculo: VinculoAutoComplete[] = [];
  vinculoSelecionado: any = null;

  responsaveis: ConsultarUsuarioResponse[] = [];
  responsaveisFiltrados: ConsultarUsuarioResponse[] = [];
  responsaveisSelecionados: ConsultarUsuarioResponse[] = [];

  grupoEventoEtiquetas: ConsultarEtiquetaResponse[] = [];
  etiquetasSelecionadas: ConsultarEtiquetaResponse[] = [];

  statusEnum = StatusGeralKanbanEnum;

  form = this.fb.group({
    titulo: ['', Validators.required],
    endereco: [''],
    observacao: [''],

    dataInicial: ['', Validators.required],
    dataFinal: [''],

    horaInicial: [''],
    horaFinal: [''],

    diaInteiro: [false],

    statusGeralKanban: [StatusGeralKanbanEnum.A_Fazer],

    intervaloRecorrencia: [1],
    tipoRecorrencia: [0],
    modalidade: [0],

    dataFimRecorrencia: [''],
    quantidadeOcorrencias: [0],

    tipoVinculo: [null as 'processo' | 'caso' | 'atendimento' | null],
    processoId: [null as string | null],
    casoId: [null as string | null],
    atendimentoId: [null as string | null],
  });

  get podeEnviar(): boolean {
    return this.form.valid;
  }

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id')!;
    this.usuarioLogado = this.authHelper.get();

    this.carregarDados();
    this.carregarEvento();

    // 🔥 limpa vínculo ao trocar tipo
    this.form.get('tipoVinculo')?.valueChanges.subscribe(() => {
      this.resultadosVinculo = [];
      this.vinculoSelecionado = null;

      this.form.patchValue({
        processoId: null,
        casoId: null,
        atendimentoId: null
      });
    });
  }

  irParaLista() {
    this.router.navigate(['/admin/consultar-atendimento']);
  }

  carregarDados() {
    this.etiquetaService.consultar().subscribe(res => {
      this.grupoEventoEtiquetas = res;
    });

    this.usuarioService.consultarUsuarioResponsavel().subscribe({
      next: res => this.responsaveis = res,
      error: () => this.mensagemErro = ['Erro ao carregar responsáveis']
    });
  }
carregarEvento() {
  this.carregando = true;

  this.eventoService.ObterEventoPorId(this.id).subscribe({
    next: res => {

      console.log('EVENTO COMPLETO:', res);

      const tipo =
        res.processoId ? 'processo' :
        res.casoId ? 'caso' :
        res.atendimentoId ? 'atendimento' : null;

      // =========================
      // FORM PRINCIPAL
      // =========================
      this.form.patchValue({
        titulo: res.titulo,
        endereco: res.endereco,
        observacao: res.observacao,

        dataInicial: res.dataInicial ? res.dataInicial.split('T')[0] : null,
        dataFinal: res.dataFinal ? res.dataFinal.split('T')[0] : null,

        horaInicial: res.horaInicial,
        horaFinal: res.horaFinal,

        diaInteiro: res.diaInteiro,

        statusGeralKanban: res.statusGeralKanban,
        modalidade: res.modalidade,

        processoId: res.processoId,
        casoId: res.casoId,
        atendimentoId: res.atendimentoId,

        tipoVinculo: tipo
      });

      // =========================
      // ETIQUETAS
      // =========================
      this.etiquetasSelecionadas =
        res.grupoEventoEtiquetas?.map((x: any) => ({
          id: x.etiquetaId,
          nome: x.nome,
          cor: x.cor
        })) ?? [];

      // =========================
      // RESPONSÁVEIS
      // =========================
      this.responsaveisSelecionados =
        res.grupoEventoResponsaveis?.map((x: any) => ({
          id: x.usuarioId,
          nomeUsuario: x.nomeUsuario ?? '',
          idPessoa: x.idPessoa ?? ''
        })) ?? [];

      // =========================
      // VÍNCULO VISUAL (🔥 AJUSTE IMPORTANTE)
      // =========================
      this.vinculoSelecionado = null;

      if (res.processoId) {
        this.vinculoSelecionado = {
          id: res.processoId,
          numeroProcesso: res.processoNumero,
          titulo: res.processoPasta
        };
      }
      else if (res.casoId) {
        this.vinculoSelecionado = {
          id: res.casoId,
          pasta: res.casoPasta
        };
      }
      else if (res.atendimentoId) {
        this.vinculoSelecionado = {
          id: res.atendimentoId,
          assunto: res.atendimentoAssunto
        };
      }

      this.carregando = false;
    },

    error: () => {
      this.mensagemErro = ['Erro ao carregar evento'];
      this.carregando = false;
    }
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
    this.form.patchValue({
      processoId: null,
      casoId: null,
      atendimentoId: null
    });

    if ('assunto' in item) this.form.patchValue({ atendimentoId: item.id });
    else if ('numeroProcesso' in item) this.form.patchValue({ processoId: item.id });
    else this.form.patchValue({ casoId: item.id });
  }

  buscarResponsaveis(termo: string) {
    this.responsaveisFiltrados = this.responsaveis
      .filter(r => r.nomeUsuario.toLowerCase().includes(termo.toLowerCase()));
  }

onSubmit() {
  if (this.form.invalid) return;

  this.carregando = true;

  const f = this.form.value;

  const request = {
    titulo: f.titulo ?? '',
    endereco: f.endereco ?? '',
    observacao: f.observacao ?? '',

    dataInicial: f.dataInicial || null,
    dataFinal: f.dataFinal || null,

    horaInicial: f.horaInicial || null,
    horaFinal: f.horaFinal || null,

    diaInteiro: f.diaInteiro ?? false,

    statusGeralKanban: f.statusGeralKanban,
    modalidade: f.modalidade,

    intervaloRecorrencia: f.intervaloRecorrencia,
    tipoRecorrencia: f.tipoRecorrencia,
    dataFimRecorrencia: f.dataFimRecorrencia || null,
    quantidadeOcorrencias: f.quantidadeOcorrencias,

    processoId: f.processoId ?? null,
    casoId: f.casoId ?? null,
    atendimentoId: f.atendimentoId ?? null,
    grupoEventoEtiquetas: this.etiquetasSelecionadas.map(e => ({
  etiquetaId: e.id!
})),
grupoEventoResponsavel: this.responsaveisSelecionados
  .filter(r => r.id)
  .map(r => ({
    UsuarioId: r.id
  }))
  };

  this.eventoService.editarEvento(this.id, request)
    .pipe(
      finalize(() => {
        this.carregando = false;
        this.cdr.detectChanges();
      })
    )
    .subscribe({
      next: () => {
        this.mensagemSucesso = ['Evento atualizado com sucesso'];
      },
      error: err => this.tratarErro(err)
    });
}

  tratarErro(err: HttpErrorResponse) {
    this.mensagemErro = ['Erro inesperado'];
    this.carregando = false;
  }
}