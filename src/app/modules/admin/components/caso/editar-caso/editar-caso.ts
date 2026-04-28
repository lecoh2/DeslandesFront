import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { catchError, of } from 'rxjs';

import { CasoService } from '../../../../../core/services/caso.service';
import { PessoaService } from '../../../../../core/services/pessoa.service';
import { EtiquetaService } from '../../../../../core/services/etiqueta.service';
import { QualificacoesService } from '../../../../../core/services/qualificacoes.service';
import { UsuarioService } from '../../../../../core/services/usuario.service';
import { AcessoEnum } from '../../../../../core/models/enums/acesso/acesoEnum';
import { PessoaResumo } from '../../../../../core/models/pessoa/pessoa-resumo';

@Component({
  selector: 'app-editar-caso',
  standalone:false,
  templateUrl: './editar-caso.html',
  styleUrl: './editar-caso.css'
})
export class EditarCaso implements OnInit {

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  private casoService = inject(CasoService);
  private pessoaService = inject(PessoaService);
  private etiquetaService = inject(EtiquetaService);
  private qualificacaoService = inject(QualificacoesService);
  private usuarioService = inject(UsuarioService);
envolvidosFiltrados: PessoaResumo[] = [];
  id!: string;

  carregando = false;
  mensagemErro: string[] = [];
  mensagemSucesso: string[] = [];

  acessoEnum = AcessoEnum;

  form = this.fb.group({
    pasta: [''],
    titulo: ['', Validators.required],
    descricao: [''],
    observacao: [''],
 acesso: this.fb.control<AcessoEnum | null>(null),
  responsavelId: this.fb.control<string | null>(null),
  });

  clientesSelecionados: any[] = [];
  envolvidosSelecionados: any[] = [];
  etiquetasSelecionadas: any[] = [];

  clientesFiltrados: any[] = [];


  tiposEtiquetas: any[] = [];
  qualificacoes: any[] = [];
  responsaveis: any[] = [];

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id')!;
    this.carregarDados();
    this.carregarCaso();
  }

  private carregarCaso() {
  this.carregando = true;

  this.casoService.ObterCasoPorId(this.id).subscribe({
    next: (res) => {

      // =========================
      // FORM PRINCIPAL
      // =========================
      this.form.patchValue({
        pasta: res.pasta,
        titulo: res.titulo,
        descricao: res.descricao,
        observacao: res.observacao,
        acesso: res.acesso,
        responsavelId: res.responsavelId ?? null
      });

      // =========================
      // CLIENTES
      // =========================
      this.clientesSelecionados = res.grupoCasoClientes?.map(c => ({
        id: c.pessoaId,
        nome: c.nome,
        documento: '',
        tipo: 'Fisica'
      })) || [];

      // =========================
      // ENVOLVIDOS
      // =========================
      this.envolvidosSelecionados = res.grupoCasoEnvolvidos?.map(e => ({
        id: e.pessoaId,
        idQualificacao: e.qualificacaoId,
        nome: e.nome,
        documento: '',
        tipo: 'Fisica'
      })) || [];

      // =========================
      // ETIQUETAS
      // =========================
      this.etiquetasSelecionadas = res.grupoEtiquetaCaso?.map(e => ({
        id: e.etiquetaId,
        nome: e.nome,
        cor: e.cor
      })) || [];

      this.carregando = false;
    },
    error: () => {
      this.mensagemErro = ['Erro ao carregar caso'];
      this.carregando = false;
    }
  });
}

  carregarDados() {
    this.etiquetaService.consultar().subscribe(r => this.tiposEtiquetas = r);
    this.qualificacaoService.consultarQualificacoes().subscribe(r => this.qualificacoes = r);
    this.usuarioService.consultarUsuarioResponsavel().subscribe(r => this.responsaveis = r);
  }

  buscarClientes(nome: string) {
    this.pessoaService.consultarPessoasResumo(nome)
      .pipe(catchError(() => of([])))
      .subscribe(r => this.clientesFiltrados = r);
  }

  buscarEnvolvidos(nome: string) {
    this.pessoaService.consultarPessoasResumo(nome)
      .pipe(catchError(() => of([])))
      .subscribe(r => this.envolvidosFiltrados = r);
  }

  onSubmit() {
    if (this.form.invalid) return;

    const formValue = this.form.value;

    const request = {
      ...formValue,
      grupoCasoCliente: this.clientesSelecionados.map(c => ({
        idPessoa: c.id
      })),
      grupoCasoEnvolvidos: this.envolvidosSelecionados.map(e => ({
        idPessoa: e.id,
        idQualificacao: e.idQualificacao
      })),
      grupoEtiquetaCasos: this.etiquetasSelecionadas.map(e => ({
        etiquetaId: e.id
      }))
    };

    this.casoService.atualizarCaso(this.id, request).subscribe({
      next: () => this.router.navigate(['/admin/casos']),
      error: err => console.log(err)
    });
  }
}