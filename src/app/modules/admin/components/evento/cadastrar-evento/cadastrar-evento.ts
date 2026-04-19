import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { CriarEventoRequest } from '../../../../../core/models/evento/criar-evento-request';
import { FormBuilder, Validators } from '@angular/forms';
import { ConsultarEtiquetaResponse } from '../../../../../core/models/etiqueta/consultar-etiqueta-response';
import { ConsultarUsuarioResponse } from '../../../../../core/models/usuario/consultar-usuarios.response';
import { AutenticarUsuarioResponse } from '../../../../../core/models/usuario/autenticar-usuario.response';
import { Router } from '@angular/router';

import { EventoService } from '../../../../../core/services/evento.service';
import { UsuarioService } from '../../../../../core/services/usuario.service';
import { EtiquetaService } from '../../../../../core/services/etiqueta.service';
import { AuthHelper } from '../../../../../core/helpers/auth.helper';
import { StatusGeralKanbanEnum } from '../../../../../core/models/enums/status-kaban/status-kaban-geralEnum';

@Component({
  selector: 'app-cadastrar-evento',
  standalone: false,
  templateUrl: './cadastrar-evento.html',
  styleUrl: './cadastrar-evento.css'
})
export class CadastrarEvento implements OnInit {

  private builder = inject(FormBuilder);
  private router = inject(Router);
  private eventoService = inject(EventoService);
  private etiquetaService = inject(EtiquetaService);
  private usuarioService = inject(UsuarioService);
  private authHelper = inject(AuthHelper);

  usuarioLogado?: AutenticarUsuarioResponse | null;

  mensagemErro: string[] = [];
  mensagemSucesso: string[] = [];
  carregando = false;

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

    statusKaban: [null],

    intervaloRecorrencia: [1],
    tipoRecorrencia: [0],

    dataFimRecorrencia: [''],
    quantidadeOcorrencias: [null]
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
      next: res => this.grupoEventoEtiquetas = res
    });

    this.usuarioService.consultarUsuarioResponsavel().subscribe({
      next: res => this.responsaveis = res,
      error: () => this.mensagemErro = ['Erro ao carregar responsáveis']
    });
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

const request: CriarEventoRequest = {

  titulo: limpar(f.titulo) ?? '',
  endereco: limpar(f.endereco),
  observacao: limpar(f.observacao),

  dataInicial: limpar(f.dataInicial),
  dataFinal: limpar(f.dataFinal),

  horaInicial: limpar(f.horaInicial),
  horaFinal: limpar(f.horaFinal),

  diaInteiro: f.diaInteiro ?? false,

  // ✅ NOME CORRETO
  statusGeralKanban: limpar(f.statusKaban) ?? 0,

  tipoRecorrencia: f.tipoRecorrencia ?? 0,
  intervaloRecorrencia: f.intervaloRecorrencia ?? 1,

  dataFimRecorrencia: limpar(f.dataFimRecorrencia),
  quantidadeOcorrencias: limpar(f.quantidadeOcorrencias),

  // (opcional)
  diasSemana: [],

  // ✅ NOME CORRETO
  grupoEventoEtiquetas: this.etiquetasSelecionadas.map(e => ({
    etiquetaId: e.id!
  })),

  // ✅ NOME CORRETO
  grupoEventoResponsaveis: this.responsaveisSelecionados.map(r => ({
    usuarioId: r.id
  }))
};

    this.eventoService.cadastrarEvento(request).subscribe({
      next: res => {
        this.resetar();
        this.mensagemSucesso = [`Evento "${res.data.titulo}" criado com sucesso!`];
        this.carregando = false;
      },
      error: err => this.tratarErro(err)
    });
  }

  resetar() {
    this.form.reset();
    this.responsaveisSelecionados = [];
    this.etiquetasSelecionadas = [];
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