import { Component, inject, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { catchError, debounceTime, filter, map, of, switchMap } from 'rxjs';
import { environment } from '../../../../../../environments/environment.development';
import { AuthHelper } from '../../../../../core/helpers/auth.helper';
import { PessoaService } from '../../../../../core/services/pessoa.service';
import { UsuarioService } from '../../../../../core/services/usuario.service';

import { AutenticarUsuarioResponse } from '../../../../../core/models/usuario/autenticar-usuario.response';
import { ConsultarPessoaResponse } from '../../../../../core/models/pessoa/consultar-pessoa-response';

import { CriarUsuarioRequest } from '../../../../../core/models/usuario/criar-usuario.request';
import { ConsultarSetoresResponse } from '../../../../../core/models/setores/consultar-setores-response';
import { NivelService } from '../../../../../core/services/nivel.service';
import { SetorService } from '../../../../../core/services/setor.service';
import { ConsultarNiveisResponse } from '../../../../../core/models/nivel/consultar-niveis-response';
import { ConsultarUsuarioResponse } from '../../../../../core/models/usuario/consultar-usuarios.response';


@Component({
  selector: 'app-criar-usuario',
  standalone: false,
  templateUrl: './criar-usuario.html',
  styleUrls: ['./criar-usuario.css'],
})
export class CriarUsuario implements OnInit {
  // --- Serviços
  private usuarioService = inject(UsuarioService);
  private setorService = inject(SetorService);
  private nivelService = inject(NivelService);
  private builder = inject(FormBuilder);
  private router = inject(Router);
  private authHelper = inject(AuthHelper);

  // --- Controles de autocomplete


  niveisControl = new FormControl('');
  mostrarSugestoesNiveis = false;
  niveisFiltradas: ConsultarNiveisResponse[] = [];
  niveisSelecionadas: ConsultarNiveisResponse[] = [];

  setorControl = new FormControl('');
  mostrarSugestoesSetor = false;
  setorFiltradas: ConsultarSetoresResponse[] = [];
  setorSelecionadas: ConsultarSetoresResponse[] = [];

  // --- Usuário e mensagens
  usuarioLogado?: AutenticarUsuarioResponse | null;
  mensagemErro: string[] = [];
  mensagemSucesso: string[] = [];
  carregando = false;
  urlBase = environment.apiDeslandes;

  // --- FormGroup (apenas campos que serão enviados)
  form = this.builder.group({
    nomeUsuario: ['', Validators.required],
    login: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    senha: ['', [Validators.required, this.senhaForteValidator()]],
    confirmarSenha: ['', Validators.required],

    GrupoSetor: this.setorControl,
    GrupoNivel: this.niveisControl,
  
  }, { validators: this.validarSenhasIguais() });

  // --- Validação para habilitar o botão de envio
 get podeEnviar(): boolean {
  return (
    this.form.valid &&
    this.setorSelecionadas.length > 0 &&
    this.niveisSelecionadas.length > 0
  );
}

  ngOnInit(): void {
    this.carregando = true;
    // Atualiza validação quando senha ou confirmar senha mudarem
    this.form.get('senha')?.valueChanges.subscribe(() => {
      this.form.get('confirmarSenha')?.updateValueAndValidity({ onlySelf: true });
    });
    this.form.get('confirmarSenha')?.valueChanges.subscribe(() => {
      this.form.updateValueAndValidity();
    });
 

  
    // --- Autocomplete setor
    this.setorControl.valueChanges
      .pipe(
        debounceTime(300),
        filter((nomeSetor): nomeSetor is string => !!nomeSetor && nomeSetor.length >= 1),
        switchMap((nomeSetor) => this.setorService.buscarPorNomeSetor(nomeSetor)),
        catchError(() => of([]))
      )
      .subscribe((setores) => (this.setorFiltradas = setores));

    // --- Autocomplete nível
  this.niveisControl.valueChanges
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
  .subscribe((niveisFiltrados) => (this.niveisFiltradas = niveisFiltrados));

    this.carregando = false;
  }

  // --- Ocultar sugestões
  ocultarSugestoesComDelay() {
    setTimeout(() => {
      this.mostrarSugestoesSetor = false;
      this.mostrarSugestoesNiveis = false;
    }, 200);
  }

  ocultarSugestoesComDelayNiveis() {
    setTimeout(() => (this.mostrarSugestoesNiveis = false), 200);
  }
  ocultarSugestoesComDelaySetor() {
    setTimeout(() => (this.mostrarSugestoesSetor = false), 200);
  }



  // --- Seleção / remoção de setor
  selecionarSetor(setor: ConsultarSetoresResponse) {
    if (this.setorSelecionadas.some((s) => s.idSetor === setor.idSetor)) {
      this.mensagemErro = ['Esse setor já foi selecionado.'];
      return;
    }
    this.setorSelecionadas.push(setor);
    this.setorControl.setValue('');
    this.mostrarSugestoesSetor = false;
  }

  removerSetorSelecionada(setor: ConsultarSetoresResponse) {
    this.setorSelecionadas = this.setorSelecionadas.filter((s) => s.idSetor !== setor.idSetor);
  }

  // --- Seleção / remoção de nível
  selecionarNivel(nivel: ConsultarNiveisResponse) {
    if (this.niveisSelecionadas.some((n) => n.idNivel === nivel.idNivel)) {
      this.mensagemErro = ['Esse nível já foi selecionado.'];
      return;
    }
    this.niveisSelecionadas.push(nivel);
    this.niveisControl.setValue('');
    this.mostrarSugestoesNiveis = false;
  }

  removerNivelSelecionado(nivel: ConsultarNiveisResponse) {
    this.niveisSelecionadas = this.niveisSelecionadas.filter((n) => n.idNivel !== nivel.idNivel);
  }

  // --- Envio do formulário
  onSubmit() {
    this.carregando = true;
    this.mensagemErro = [];
    this.mensagemSucesso = [];

    if (!this.podeEnviar) {
      this.mensagemErro = ['Preencha todos os campos obrigatórios corretamente.'];
      this.carregando = false;
      return;
    }

    const request: CriarUsuarioRequest = {
      nomeUsuario: this.form.value.nomeUsuario ?? undefined,
      login: this.form.value.login ?? undefined,
      email:this.form.value.email ?? undefined,
      senha: this.form.value.senha ?? undefined,
      grupoSetor: this.setorSelecionadas.map((s) => ({ idSetor: s.idSetor! })),
      grupoNivel: this.niveisSelecionadas.map((n) => ({ idNivel: n.idNivel! })),
    };

    console.log('Objeto request enviado:', request);

    this.usuarioService.cadastrar(request).subscribe({
      next: (response) => {
        this.carregando = false;
        this.mensagemSucesso = [response.mensagem];
        console.log('Usuário cadastrado:', response.dados);

        // 🔹 Limpar formulário e seleções
        this.form.reset();
  
        this.setorSelecionadas = [];
        this.niveisSelecionadas = [];

        // 🔹 Resetar controles de autocomplete
   
        this.setorControl.setValue('');
        this.niveisControl.setValue('');
        setTimeout(() => {
          this.carregando = false;
          this.mensagemSucesso = [response?.mensagem || 'Usuário cadastradO com sucesso!'];
          this.router.navigate(['/admin/consultar-usuarios']);
        }, 3000);
      },
      error: (e) => {
        this.tratarErro(e);
        this.carregando = false;
      },
    });
  }


  // --- Tratamento de erros do backend
  private tratarErro(e: any) {
    const errorResponse = e?.error;
    this.mensagemErro = [];

    // 1️⃣ ModelState / FluentValidation
    if (errorResponse?.errors) {
      for (const key in errorResponse.errors) {
        if (Array.isArray(errorResponse.errors[key])) {
          this.mensagemErro.push(...errorResponse.errors[key]);
        }
      }
    }
    // 2️⃣ ApplicationException ou ValidationException
    else if (errorResponse?.mensagem) {
      this.mensagemErro.push(errorResponse.mensagem);

      if (errorResponse.detalhes) this.mensagemErro.push(errorResponse.detalhes);
      else if (errorResponse.Detalhes) this.mensagemErro.push(errorResponse.Detalhes);
    }
    // 3️⃣ Exception.Message
    else if (errorResponse?.Message) {
      this.mensagemErro.push(errorResponse.Message);
      if (errorResponse.inner) this.mensagemErro.push(errorResponse.inner);
    }
    // 4️⃣ Caso nenhum dos anteriores
    else {
      this.mensagemErro.push('Ocorreu um erro inesperado ao processar sua solicitação.');
    }

    // Garantir que o array não tenha duplicatas
    this.mensagemErro = Array.from(new Set(this.mensagemErro));

    // Log para debugging
    console.error('Erro recebido do backend:', e);
  }

  // Validator de senhas iguais
  validarSenhasIguais(): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
      const senha = group.get('senha')?.value;
      const confirmar = group.get('confirmarSenha')?.value;
      if (senha && confirmar && senha !== confirmar) {
        return { senhasDiferentes: true };
      }
      return null;
    };
  }
  // Validator de senha forte
  // Validator de senha forte
  senhaForteValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const valor = control.value;
      if (!valor) return null;
      const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,}$/;
      return regex.test(valor) ? null : {
        senhaFraca: 'A senha deve ter pelo menos 8 caracteres, incluindo letras maiúsculas, minúsculas, números e símbolos. EX(Procon2025@)'
      };
    };
  }

}
