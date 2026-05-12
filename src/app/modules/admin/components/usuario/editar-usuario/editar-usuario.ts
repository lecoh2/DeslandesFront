import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormArray, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { catchError, debounceTime, filter, forkJoin, map, of, switchMap, throwError } from 'rxjs';
import { AuthHelper } from '../../../../../core/helpers/auth.helper';
import { UsuarioService } from '../../../../../core/services/usuario.service';
import { PessoaService } from '../../../../../core/services/pessoa.service';
import { SetorService } from '../../../../../core/services/setor.service';
import { NivelService } from '../../../../../core/services/nivel.service';
import { ConsultarPessoaResponse } from '../../../../../core/models/pessoa/consultar-pessoa-response';
import { ConsultarSetoresResponse } from '../../../../../core/models/setores/consultar-setores-response';
import { ConsultarNiveisResponse } from '../../../../../core/models/nivel/consultar-niveis-response';
import { AutenticarUsuarioResponse } from '../../../../../core/models/usuario/autenticar-usuario.response';
import { EditarUsuarioRequest } from '../../../../../core/models/usuario/editar-usuario-request';
declare var bootstrap: any;
import { environment } from '../../../../../../environments/environment.development';
import { GrupoSetoresRequest } from '../../../../../core/models/grupo-setores/grupo-setores-request';
import { GrupoNiveisRequest } from '../../../../../core/models/grupo-niveis/grupo-niveis-request';

@Component({
  selector: 'app-editar-usuario',
  standalone: false,
  templateUrl: './editar-usuario.html',
  styleUrls: ['./editar-usuario.css']
})
export class EditarUsuario implements OnInit {

  private usuarioService = inject(UsuarioService);
  private pessoaService = inject(PessoaService);
  private setorService = inject(SetorService);
  private nivelService = inject(NivelService);
  private builder = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private authHelper = inject(AuthHelper);
  private cd = inject(ChangeDetectorRef);

  carregando = false;
  carregandoConsulta = true;
  mensagemErro: string[] = [];
  mensagemSucesso: string[] = [];
  urlBase = environment.apiDeslandes;
  carregandoCadastro = false; // quando salva
  usuarioLogado?: AutenticarUsuarioResponse | null;

  // Controles de autocomplete
  pessoaControl = new FormControl('');
  pessoasFiltradas: ConsultarPessoaResponse[] = [];
  pessoasSelecionadas: ConsultarPessoaResponse[] = [];

  setorControl = new FormControl('');
  setoresFiltrados: ConsultarSetoresResponse[] = [];
  setoresSelecionados: ConsultarSetoresResponse[] = [];

  nivelControl = new FormControl('');
  niveisFiltrados: ConsultarNiveisResponse[] = [];
  niveisSelecionados: ConsultarNiveisResponse[] = [];
  mostrarSugestoesSetor = false;
  mostrarSugestoesNiveis = false;

  // FormGroup principal
form: FormGroup = this.builder.group({
  login: ['', Validators.required],
  senha: ['', [Validators.required, this.senhaForteValidator()]],
  confirmarSenha: ['', Validators.required],
  idUsuario: [''],
  grupoSetores: this.builder.array([], this.optionalArrayValidator),
  grupoNiveis: this.builder.array([], this.optionalArrayValidator),
  pessoa: ['']
}, { validators: this.validarSenhasIguais() });

optionalArrayValidator(control: AbstractControl) {
  return null;
}

  // Getters para FormArrays
  get grupoSetores(): FormArray {
    return this.form.get('grupoSetores') as FormArray;
  }
  get grupoNiveis(): FormArray {
    return this.form.get('grupoNiveis') as FormArray;
  }

  get podeEnviar(): boolean {

    return !!this.form.get('idUsuario')?.valid &&
      !!this.form.get('login')?.valid &&
      !!this.form.get('senha')?.valid &&
      !!this.form.get('confirmarSenha')?.valid
  }

  ocultarSugestoesComDelay() {
    setTimeout(() => {
      this.mostrarSugestoesSetor = false;
      this.mostrarSugestoesNiveis = false;
    }, 200);
  }
  ocultarSugestoesComDelaySetor() {
    setTimeout(() => (this.mostrarSugestoesSetor = false), 200);
  }
  ocultarSugestoesComDelayNiveis() {
    setTimeout(() => (this.mostrarSugestoesNiveis = false), 200);
  }

ngOnInit(): void {
  this.carregando = true;

  // Atualiza validação quando senha ou confirmarSenha mudarem
  this.form.get('senha')?.valueChanges.subscribe(() =>
    this.form.get('confirmarSenha')?.updateValueAndValidity()
  );
  this.form.get('confirmarSenha')?.valueChanges.subscribe(() =>
    this.form.updateValueAndValidity()
  );

  // Usuário logado
  this.usuarioLogado = this.authHelper.get();
  if (this.usuarioLogado) {
    this.form.get('idUsuario')?.setValue(this.usuarioLogado.idUsuario ?? null);
  }

  // Autocomplete pessoa física
 
  // Autocomplete setores
  this.setorControl.valueChanges.pipe(
    debounceTime(300),
    filter((nome): nome is string => !!nome && nome.length >= 1),
    switchMap(nome => this.setorService.buscarPorNomeSetor(nome)),
    catchError(() => of([]))
  ).subscribe(setores => this.setoresFiltrados = setores);

  // Autocomplete níveis
 this.nivelControl.valueChanges
  .pipe(
    debounceTime(300),
    filter((nomeNivel): nomeNivel is string => !!nomeNivel && nomeNivel.length >= 1),
    switchMap((nomeNivel) =>
      this.nivelService.buscarPorNomeNivel(nomeNivel).pipe(
        map((niveis: ConsultarNiveisResponse[]) => {
          const usuarioEhSuperAdmin = this.usuarioLogado?.nivel?.some(
            (n) => n.nomeNivel.trim().toLowerCase() === 'super administrador'
          );

          if (!usuarioEhSuperAdmin) {
            return niveis.filter(
              (n) => n.nomeNivel.trim().toLowerCase() !== 'super administrador'
            );
          }

          return niveis;
        }),
        catchError(() => of([] as ConsultarNiveisResponse[])) // <-- tipagem explícita
      )
    )
  )
  .subscribe((niveisFiltrados) => (this.niveisFiltrados = niveisFiltrados));

  this.carregando = false;

  // Consulta usuário
  const id = this.route.snapshot.paramMap.get('id');
  if (!id) {
    this.carregandoConsulta = false;
    return;
  }

  this.usuarioService.consultarUsuarioPorId(id).subscribe({
    next: response => {
      const usuario = Array.isArray(response) ? response[0] : response;

      // Preenche form básicos
      this.form.patchValue({
        id: usuario.id ?? '',
        login: usuario.login ?? '',
     
      });

      // Limpa FormArrays atuais
      while (this.grupoSetores.length) this.grupoSetores.removeAt(0);
      while (this.grupoNiveis.length) this.grupoNiveis.removeAt(0);

      // Preenche grupoSetores e array auxiliar
      (usuario.grupoSetores ?? []).forEach((p: any) => {
        const idSetor = p.idSetor ?? p.idPessoa ?? p.id;
        const nomeSetor = p.nomeSetor ?? p.nome ?? '';
        if (idSetor) {
          this.grupoSetores.push(this.builder.group({
            idSetor: [idSetor],
            nomeSetor: [nomeSetor]
          }));
          this.setoresSelecionados.push({ idSetor, nomeSetor } as ConsultarSetoresResponse);
        }
      });

      // Preenche grupoNiveis e array auxiliar
      (usuario.grupoNiveis ?? []).forEach((n: any) => {
        const idNivel = n.idNivel ?? n.id;
        const nomeNivel = n.nomeNivel ?? n.nome ?? '';
        if (idNivel) {
          this.grupoNiveis.push(this.builder.group({
            idNivel: [idNivel],
            nomeNivel: [nomeNivel]
          }));
          this.niveisSelecionados.push({ idNivel, nomeNivel } as ConsultarNiveisResponse);
        }
      });

      this.cd.detectChanges();
      this.carregandoConsulta = false;
    },
    error: err => {
      this.tratarErro(err);
      this.carregandoConsulta = false;
    }
  });
}





  // Seleção e remoção de setor
  selecionarSetor(setor: ConsultarSetoresResponse) {
    if (this.setoresSelecionados.some(s => s.idSetor === setor.idSetor)) {
      this.mensagemErro = ['Esse setor já foi selecionado.'];
      return;
    }
    this.setoresSelecionados.push(setor);
    // não adiciona ao FormArray aqui — deixamos para salvarSetor() ou para visualização
    this.setorControl.setValue('');
  }

  removerSetorSelecionado(pessoa: ConsultarSetoresResponse) {
    this.setoresSelecionados = this.setoresSelecionados.filter(p => p.idSetor !== pessoa.idSetor);
  }

  removerNivelSelecionado(pessoa: ConsultarNiveisResponse) {
    this.niveisSelecionados = this.niveisSelecionados.filter(p => p.idNivel !== pessoa.idNivel);
  }

  // Seleção e remoção de nível
  selecionarNivel(nivel: ConsultarNiveisResponse) {
    if (this.niveisSelecionados.some(n => n.idNivel === nivel.idNivel)) {
      this.mensagemErro = ['Esse nível já foi selecionado.'];
      return;
    }
    this.niveisSelecionados.push(nivel);
    this.nivelControl.setValue('');
  }

  // Envio do formulário
 onSubmit(): void {
  this.carregandoCadastro = true;
  this.mensagemErro = [];
  this.mensagemSucesso = [];

  if (!this.podeEnviar) {
    this.mensagemErro.push('Preencha todos os campos obrigatórios corretamente.');
    this.carregandoCadastro = false;
    return;
  }

  const request: EditarUsuarioRequest = {
    id: this.form.value.id,
    login: this.form.value.login,
    senha: this.form.value.senha
    // NÃO enviamos grupoSetores nem grupoNiveis aqui
  };

  this.usuarioService.editarPorId(request).subscribe({
    next: response => {
      this.mensagemSucesso.push(response.mensagem ?? 'Usuário atualizado com sucesso!');
      setTimeout(() => this.router.navigate(['/admin/consultar-usuarios']), 2000);
    },
    error: e => this.tratarErro(e)
  }).add(() => this.carregandoCadastro = false);
}


  // Tratamento de erros
  private tratarErro(e: any) {
    const errorResponse = e?.error;
    this.mensagemErro = [];

    if (errorResponse?.errors) {
      for (const key in errorResponse.errors) {
        if (Array.isArray(errorResponse.errors[key])) this.mensagemErro.push(...errorResponse.errors[key]);
      }
    } else if (errorResponse?.mensagem) {
      this.mensagemErro.push(errorResponse.mensagem);
      if (errorResponse.detalhes) this.mensagemErro.push(errorResponse.detalhes);
    } else if (errorResponse?.Message) {
      this.mensagemErro.push(errorResponse.Message);
    } else {
      this.mensagemErro.push('Ocorreu um erro inesperado.');
    }

    this.mensagemErro = Array.from(new Set(this.mensagemErro));
    console.error('Erro backend:', e);
  }

  // Validators
  validarSenhasIguais(): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
      const senha = group.get('senha')?.value;
      const confirmar = group.get('confirmarSenha')?.value;
      return senha && confirmar && senha !== confirmar ? { senhasDiferentes: true } : null;
    };
  }

  senhaForteValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const valor = control.value;
      if (!valor) return null;
      const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,}$/;
      return regex.test(valor) ? null : { senhaFraca: 'A senha deve ter pelo menos 8 caracteres, incluindo letras maiúsculas, minúsculas, números e símbolos.' };
    };
  }

  // Remoção de vínculo servidor -> atualiza FormArray e arrays locais
removerSetores(index: number) {
  const grupo = this.grupoSetores.at(index);
  const idSetor = grupo?.get('idSetor')?.value;
  const idUsuario = this.form.get('idUsuario')?.value;

  if (!idSetor || !idUsuario) return;

  if (!confirm(`Tem certeza que deseja desvincular o setor ${grupo?.get('nomeSetor')?.value}?`)) return;

  this.setorService.removerUsuarioSetor(idUsuario, idSetor).subscribe({
    next: res => {
      this.grupoSetores.removeAt(index);
      this.setoresSelecionados = this.setoresSelecionados.filter(s => s.idSetor !== idSetor);
      this.mensagemSucesso = [res.mensagem ?? 'Setor removido com sucesso.'];
      this.cd.detectChanges();
    },
    error: err => {
      this.mensagemErro = [err.error?.mensagem ?? 'Erro ao remover setor.'];
    }
  });
}


removerNivel(index: number) {
  const grupo = this.grupoNiveis.at(index);
  const idNivel = grupo?.get('idNivel')?.value;
  const idUsuario = this.form.get('idUsuario')?.value;

  if (!idNivel || !idUsuario) return;

  if (!confirm(`Tem certeza que deseja desvincular o nível ${grupo?.get('nomeNivel')?.value}?`)) return;

  this.usuarioService.removerUsuarioNivel(idUsuario, idNivel).subscribe({
    next: res => {
      this.grupoNiveis.removeAt(index);
      this.niveisSelecionados = this.niveisSelecionados.filter(n => n.idNivel !== idNivel);
      this.mensagemSucesso = [res.mensagem ?? 'Nível removido com sucesso.'];
      this.cd.detectChanges();
    },
    error: err => {
      this.mensagemErro = [err.error?.mensagem ?? 'Erro ao remover nível.'];
    }
  });
}



salvarSetor() {
  const idUsuario = this.form.get('idUsuario')?.value;

  if (!idUsuario) {
    this.mensagemErro = ['ID do Usuário não informado'];
    return;
  }

  if (this.setoresSelecionados.length === 0) {
    this.mensagemErro = ['Nenhum setor selecionado'];
    return;
  }

  this.mensagemErro = [];
  this.mensagemSucesso = [];

  const chamadas$ = this.setoresSelecionados.map(p => 
    this.setorService.adicionarUsuarioSetor(idUsuario, p.idSetor).pipe(
      catchError(err => {
        // Verifica se o erro é "já vinculado"
        if (err.error?.mensagem?.includes('já está vinculado')) {
          // Adiciona apenas se ainda não estiver no FormArray
          const existe = this.grupoSetores.controls.some(c => c.get('idSetor')?.value === p.idSetor);
          if (!existe) {
            this.mensagemErro.push(`O setor ${p.nomeSetor} já está vinculado.`);
          }
          return of(null); // Retorna nulo para continuar forkJoin
        }
        return throwError(() => err); // outros erros
      })
    )
  );

  forkJoin(chamadas$).subscribe({
    next: () => {
      this.setoresSelecionados.forEach(p => {
        const exists = this.grupoSetores.controls.some(c => c.get('idSetor')?.value === p.idSetor);
        if (!exists) {
          this.grupoSetores.push(this.builder.group({
            idSetor: [p.idSetor],
            nomeSetor: [p.nomeSetor]
          }));
        }
      });

      this.setoresSelecionados = [];
      this.setorControl.reset();
      this.mostrarSugestoesSetor = false;

      if (this.mensagemErro.length === 0) {
        this.mensagemSucesso.push('Setor(es) adicionado(s) com sucesso!');
      }

      this.cd.detectChanges();
      document.querySelectorAll('.modal.show').forEach(modalEl => {
        const modal = bootstrap.Modal.getInstance(modalEl);
        modal?.hide();
      });

      setTimeout(() => this.mensagemSucesso = [], 3000);
      setTimeout(() => this.mensagemErro = [], 5000); // limpa aviso após 5s
    },
    error: err => {
      this.mensagemErro.push('Erro inesperado ao adicionar setor.');
      console.error(err);
    }
  });
}



  fecharModalEAtualizarSetor() {
    document.querySelectorAll('.modal.show').forEach(modalEl => {
      const modal = bootstrap.Modal.getInstance(modalEl);
      modal?.hide();
    });
    setTimeout(() => location.reload(), 300);
  }

  // Adiciona níveis ao usuário (chamadas ao backend) e ao FormArray local
 salvarNivel() {
  const idUsuario = this.form.get('idUsuario')?.value;

  if (!idUsuario) {
    this.mensagemErro = ['ID do Usuário não informado'];
    return;
  }

  if (this.niveisSelecionados.length === 0) {
    this.mensagemErro = ['Nenhum nivel selecionado'];
    return;
  }

  this.mensagemErro = [];
  this.mensagemSucesso = [];

  const chamadas$ = this.niveisSelecionados.map(p => 
    this.nivelService.adicionarUsuarioNivel(idUsuario, p.idNivel).pipe(
      catchError(err => {
        // Verifica se o erro é "já vinculado"
        if (err.error?.mensagem?.includes('já está vinculado')) {
          // Adiciona apenas se ainda não estiver no FormArray
          const existe = this.grupoNiveis.controls.some(c => c.get('idNivel')?.value === p.idNivel);
          if (!existe) {
            this.mensagemErro.push(`O setor ${p.nomeNivel} já está vinculado.`);
          }
          return of(null); // Retorna nulo para continuar forkJoin
        }
        return throwError(() => err); // outros erros
      })
    )
  );

  forkJoin(chamadas$).subscribe({
    next: () => {
      this.niveisSelecionados.forEach(p => {
        const exists = this.grupoNiveis.controls.some(c => c.get('idNivel')?.value === p.idNivel);
        if (!exists) {
          this.grupoNiveis.push(this.builder.group({
            idNivel: [p.idNivel],
            nomeNivel: [p.nomeNivel]
          }));
        }
      });

      this.niveisSelecionados = [];
      this.nivelControl.reset();
      this.mostrarSugestoesNiveis = false;

      if (this.mensagemErro.length === 0) {
        this.mensagemSucesso.push('Setor(es) adicionado(s) com sucesso!');
      }

      this.cd.detectChanges();
      document.querySelectorAll('.modal.show').forEach(modalEl => {
        const modal = bootstrap.Modal.getInstance(modalEl);
        modal?.hide();
      });

      setTimeout(() => this.mensagemSucesso = [], 3000);
      setTimeout(() => this.mensagemErro = [], 5000); // limpa aviso após 5s
    },
    error: err => {
      this.mensagemErro.push('Erro inesperado ao adicionar nivel.');
      console.error(err);
    }
  });
}

  fecharModalEAtualizarNivel() {
    document.querySelectorAll('.modal.show').forEach(modalEl => {
      const modal = bootstrap.Modal.getInstance(modalEl);
      modal?.hide();
    });
    setTimeout(() => location.reload(), 300);
  }

  // --- aliases para evitar erros de template que chamavam métodos com outros nomes ---
  fecharModalEAtualizar() {
    // alias para compatibilidade com template (chama o fechar de setores)
    this.fecharModalEAtualizarSetor();
  }

  salvarReclamantesAtendimento() {
    // alias para compatibilidade com template — redireciona para salvar principal
    this.onSubmit();
  }

  // manter compatibilidade com o antigo nome

}
