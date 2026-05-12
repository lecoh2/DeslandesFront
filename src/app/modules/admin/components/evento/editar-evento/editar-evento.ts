declare var bootstrap: any;
import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
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
import { HistoricoService } from '../../../../../core/services/historico.service';
import { TipoEntidadeEnum } from '../../../../../core/models/enums/tipo-entidade/tipo-entidadeEnum';

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
  @ViewChild('modalHistorico')
  modalHistorico!: ElementRef;
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
  private historicoService = inject(HistoricoService);
  
  id!: string;
  carregando = false;

  usuarioLogado?: AutenticarUsuarioResponse | null;

  mensagemErro: string[] = [];
  mensagemSucesso: string[] = [];

  resultadosVinculo: VinculoAutoComplete[] = [];
  vinculoSelecionado: VinculoAutoComplete | null = null;
  responsaveis: ConsultarUsuarioResponse[] = [];
  responsaveisFiltrados: ConsultarUsuarioResponse[] = [];
  responsaveisSelecionados: ConsultarUsuarioResponse[] = [];

  grupoEventoEtiquetas: ConsultarEtiquetaResponse[] = [];
  etiquetasSelecionadas: ConsultarEtiquetaResponse[] = [];

  statusEnum = StatusGeralKanbanEnum;
  historico: any[] = [];
  carregandoHistorico = false;
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

      this.limparVinculos();

    });
  }

  irParaLista() {
    this.router.navigate(['/admin/gestao-atividades']);
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
        this.resultadosVinculo = [];
        let tipo: 'processo' | 'caso' | 'atendimento' | null = null;

        if (res.processoId != null) tipo = 'processo';
        else if (res.casoId != null) tipo = 'caso';
        else if (res.atendimentoId != null) tipo = 'atendimento';

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

        }, { emitEvent: false });

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
        this.vinculoSelecionado = res.processoId
          ? {
            id: res.processoId,
            pasta: res.processoPasta
          } as ProcessoAutoComplete
          : res.casoId
            ? {
              id: res.casoId,
              pasta: res.casoPasta
            } as CasoAutoComplete
            : res.atendimentoId
              ? {
                id: res.atendimentoId,
                assunto: res.atendimentoAssunto
              } as AtendimentoAutoComplete
              : null;


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

  selecionarVinculo(item: VinculoAutoComplete) {

    const tipo = this.form.get('tipoVinculo')?.value;

    // 🔥 limpa tudo antes
    this.limparVinculos();

    this.resultadosVinculo = [];

    this.vinculoSelecionado = item;

    const id = item.id ?? null;

    if (tipo === 'processo') {

      this.form.patchValue({
        processoId: id
      });
    }
    else if (tipo === 'caso') {

      this.form.patchValue({
        casoId: id
      });
    }
    else if (tipo === 'atendimento') {

      this.form.patchValue({
        atendimentoId: id
      });
    }
  }

  buscarResponsaveis(termo: string) {
    this.responsaveisFiltrados = this.responsaveis
      .filter(r => r.nomeUsuario.toLowerCase().includes(termo.toLowerCase()));
  }

  onSubmit() {
    if (this.form.invalid) return;

    this.carregando = true;

    const f = this.form.value;
    const quantidadeVinculos = [
      f.processoId,
      f.casoId,
      f.atendimentoId
    ].filter(Boolean).length;

    if (quantidadeVinculos > 1) {

      this.mensagemErro = [
        'O evento não pode possuir mais de um vínculo.'
      ];

      this.carregando = false;

      return;
    }
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
        next: (res) => {
          this.carregando = false;
          this.mensagemSucesso = [res.message];

          setTimeout(() => {
            this.router.navigate(['/admin/gestao-atividades']);
          }, 3000);
        },
        error: (err: HttpErrorResponse) => this.tratarErro(err)
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
  } private limparVinculos(): void {

    this.form.patchValue({
      processoId: null,
      casoId: null,
      atendimentoId: null
    });

    this.vinculoSelecionado = null;

    this.resultadosVinculo = [];
  }
  abrirHistoricoProcesso(processoId: string) {

    this.carregandoHistorico = true;

    this.historico = [];

    const modal =
      new bootstrap.Modal(
        this.modalHistorico.nativeElement
      );

    modal.show();

    this.historicoService
      .ConsultarHistorico(
        TipoEntidadeEnum.Evento,
        processoId
      )
      .subscribe({

        next: (res) => {

          this.historico = (res ?? []).map(h => ({
            ...h,
            antes: h.dadosAntes
              ? JSON.parse(h.dadosAntes)
              : null,

            depois: h.dadosDepois
              ? JSON.parse(h.dadosDepois)
              : null
          }));

          this.carregandoHistorico = false;

          this.cdr.detectChanges();
        },

        error: (err) => {

          console.error(err);

          this.carregandoHistorico = false;
        }

      });
  }
  // =========================
  // FORMATAR VALOR
  // =========================

  formatarCampo(campo: string): string {
    const map: any = {
      Titulo: 'Título',
      DataInicial: 'Data Inicial',
      DataFinal: 'Data Final',
      HoraInicial: 'Hora Inicial',
      HoraFinal: 'Hora Final',
      DiaInteiro: 'Dia Inteiro',
      Endereco: 'Endereço',
      Observacao: 'Observação',
      Modalidade: 'Modalidade',
      StatusGeralKanban: 'Status',
      Responsaveis: 'Responsáveis'
    };

    return map[campo] || campo;
  }

  formatarValor(valor: any, campo: string): string {

    if (valor === null || valor === undefined) return '-';

    // ARRAY (Responsáveis)
    if (Array.isArray(valor)) {
      return valor.join(', ');
    }

    // BOOLEAN
    if (typeof valor === 'boolean') {
      return valor ? 'Sim' : 'Não';
    }

    // STATUS
    if (campo === 'StatusGeralKanban') {
      return this.getStatusLabel(valor);
    }
    // 🔥 MODALIDADE (AQUI)
    if (campo === 'Modalidade') {
      return this.getModalidadeLabel(valor);
    }
    // DATA
    if (campo.toLowerCase().includes('data')) {
      return new Date(valor).toLocaleDateString('pt-BR');
    }

    // HORA
    if (campo.toLowerCase().includes('hora')) {
      return valor;
    }

    return valor.toString();
  } getStatusLabel(status: number): string {
    switch (status) {
      case 1: return 'A Fazer';
      case 2: return 'Em Andamento';
      case 3: return 'Concluído';
      case 4: return 'Cancelado';
      default: return '---';
    }
  }
  getModalidadeLabel(status: number): string {
    switch (status) {
      case 1: return 'Presencial';
      case 2: return 'Online';
      case 3: return 'Hibrido ';
      case 4: return 'Nao se aplica';
      default: return '---';
    }
  } getMudancas(h: any): { campo: string, antes: any, depois: any }[] {
    if (!h.antes || !h.depois) return [];

    const mudancas: any[] = [];

    Object.keys(h.depois).forEach(key => {
      const antes = h.antes[key];
      const depois = h.depois[key];

      if (JSON.stringify(antes) !== JSON.stringify(depois)) {
        mudancas.push({ campo: key, antes, depois });
      }
    });

    return mudancas;
  }
}