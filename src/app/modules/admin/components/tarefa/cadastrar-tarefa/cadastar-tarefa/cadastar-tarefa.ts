import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError, of } from 'rxjs';
import { PrioridadeTarefaEnum } from '../../../../../../core/models/enums/prioridade/prioridade-tarefaEnum';
import { TipoVinculoEnum } from '../../../../../../core/models/enums/tipo-vinculo/tipo-vinculoEnum';
import { AutenticarUsuarioResponse } from '../../../../../../core/models/usuario/autenticar-usuario.response';
import { TarefaService } from '../../../../../../core/services/tarefa.service';
import { PessoaService } from '../../../../../../core/services/pessoa.service';
import { EtiquetaService } from '../../../../../../core/services/etiqueta.service';
import { AuthHelper } from '../../../../../../core/helpers/auth.helper';
import { PessoaResumo } from '../../../../../../core/models/pessoa/pessoa-resumo';
import { PessoaSelecionada } from '../../../../../../core/models/pessoa/pessoa-selecionada';
import { ConsultarEtiquetaResponse } from '../../../../../../core/models/etiqueta/consultar-etiqueta-response';
import { StatusGeralKanbanEnum } from '../../../../../../core/models/enums/status-kaban/status-kaban-geralEnum';


@Component({
  selector: 'app-cadastrar-tarefa',
  standalone:false,
  templateUrl: './cadastrar-tarefa.html',
  styleUrl: './cadastrar-tarefa.css'
})
export class CadastrarTarefa implements OnInit {

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private tarefaService = inject(TarefaService);
  private pessoaService = inject(PessoaService);
  private etiquetaService = inject(EtiquetaService);
  private authHelper = inject(AuthHelper);

  usuarioLogado?: AutenticarUsuarioResponse | null;
tiposVinculo = Object.values(TipoVinculo).filter(v => typeof v === 'number');
  mensagemErro: string[] = [];
  mensagemSucesso: string[] = [];
  carregando = false;

  // 👥 RESPONSÁVEIS / ENVOLVIDOS
  pessoasFiltradas: PessoaResumo[] = [];
  envolvidosSelecionados: PessoaSelecionada[] = [];

  // 🏷️ ETIQUETAS
  etiquetas: ConsultarEtiquetaResponse[] = [];
  etiquetasSelecionadas: ConsultarEtiquetaResponse[] = [];

  prioridadeEnum = PrioridadeTarefa;
  statusEnum = StatusGeralKanban;

  // 🧾 FORM
  form = this.fb.group({
    descricao: ['', Validators.required],
    dataTarefa: [null],
    responsavelId: [null, Validators.required],
    prioridade: [PrioridadeTarefa.Media],
    statusGeralKanban: [StatusGeralKanban.AFazer]
  });

  // ================= INIT =================
  ngOnInit(): void {
    this.usuarioLogado = this.authHelper.get();
    this.carregarDados();
  }

  // ================= LOAD =================
  carregarDados() {
    this.etiquetaService.consultar().subscribe({
      next: (res) => this.etiquetas = res
    });
  }

  // ================= BUSCAR PESSOAS =================
  buscarPessoas(nome: string) {
    this.pessoaService.consultarPessoasResumo(nome)
      .pipe(catchError(() => of([])))
      .subscribe(res => this.pessoasFiltradas = res);
  }

  // ================= SUBMIT =================
  onSubmit(): void {
    this.mensagemErro = [];
    this.mensagemSucesso = [];

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.carregando = true;

    const formValue = this.form.value;

    const request = {
      descricao: formValue.descricao!,
      dataTarefa: formValue.dataTarefa,
      responsavelId: formValue.responsavelId,
      prioridade: formValue.prioridade,
      statusGeralKanban: formValue.statusGeralKanban,

      etiquetas: this.etiquetasSelecionadas.map(e => ({
        etiquetaId: e.id
      })),

      grupoTarefaResponsaveis: this.envolvidosSelecionados.map(e => ({
        pessoaId: e.id
      }))
    };

    console.log('📦 REQUEST TAREFA:', request);

    this.tarefaService.cadastrar(request).subscribe({
      next: (res) => {
        this.resetar();
        this.mensagemSucesso = [res.message];
        this.carregando = false;
      },
      error: (err: HttpErrorResponse) => this.tratarErro(err)
    });
  }

  // ================= RESET =================
  resetar() {
    this.form.reset();
    this.envolvidosSelecionados = [];
    this.etiquetasSelecionadas = [];
  }
  getStatusKanbanLabel(valor: StatusGeralKanbanEnum): string {
  switch (valor) {
    case StatusGeralKanban.A_Fazer:
      return 'A Fazer';
    case StatusGeralKanban.Em_Andamento:
      return 'Em Andamento';
    case StatusGeralKanban.Concluido:
      return 'Concluído';
    case StatusGeralKanban.Cancelado:
      return 'Cancelado';
    default:
      return '';
  }
}
  getTipoVinculoLabel(valor: TipoVinculoEnum): string {
  switch (valor) {
    case TipoVinculo.Processo:
      return 'Processo';
    case TipoVinculo.Caso:
      return 'Caso';
    case TipoVinculo.Atendimento:
      return 'Atendimento';
    default:
      return '';
  }
}
getPrioridadeLabel(valor: PrioridadeTarefaEnum): string {
  switch (valor) {
    case PrioridadeTarefa.Baixa:
      return 'Baixa';
    case PrioridadeTarefa.Media:
      return 'Média';
    case PrioridadeTarefa.Alta:
      return 'Alta';
    case PrioridadeTarefa.Urgente:
      return 'Urgente';
    default:
      return '';
  }
}
  // ================= ERRO =================
  tratarErro(err: HttpErrorResponse) {
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