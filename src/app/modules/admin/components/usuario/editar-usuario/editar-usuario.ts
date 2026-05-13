import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';

import { ActivatedRoute, Router } from '@angular/router';

import {
  catchError,
  debounceTime,
  filter,
  finalize,
  map,
  of,
  switchMap
} from 'rxjs';

import { AuthHelper } from '../../../../../core/helpers/auth.helper';

import { UsuarioService } from '../../../../../core/services/usuario.service';
import { SetorService } from '../../../../../core/services/setor.service';
import { NivelService } from '../../../../../core/services/nivel.service';

import { ConsultarSetoresResponse } from '../../../../../core/models/setores/consultar-setores-response';
import { ConsultarNiveisResponse } from '../../../../../core/models/nivel/consultar-niveis-response';

import { AutenticarUsuarioResponse } from '../../../../../core/models/usuario/autenticar-usuario.response';

import { EditarUsuarioRequest } from '../../../../../core/models/usuario/editar-usuario-request';

@Component({
  selector: 'app-editar-usuario',
  standalone: false,
  templateUrl: './editar-usuario.html',
  styleUrls: ['./editar-usuario.css']
})
export class EditarUsuario implements OnInit {

  // =========================
  // SERVICES
  // =========================

  private usuarioService = inject(UsuarioService);
  private setorService = inject(SetorService);
  private nivelService = inject(NivelService);

  private builder = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private authHelper = inject(AuthHelper);
  private cd = inject(ChangeDetectorRef);

  // =========================
  // ESTADOS
  // =========================

  carregando = false;
  carregandoConsulta = true;

  mensagemErro: string[] = [];
  mensagemSucesso: string[] = [];

  usuarioLogado?: AutenticarUsuarioResponse | null;

  // =========================
  // AUTOCOMPLETE
  // =========================

  setorControl = new FormControl('');
  mostrarSugestoesSetor = false;
  setorFiltradas: ConsultarSetoresResponse[] = [];
  setorSelecionadas: ConsultarSetoresResponse[] = [];

  niveisControl = new FormControl('');
  mostrarSugestoesNiveis = false;
  niveisFiltradas: ConsultarNiveisResponse[] = [];
  niveisSelecionadas: ConsultarNiveisResponse[] = [];

  // =========================
  // FORM
  // =========================

  form = this.builder.group({
    id: [''],
    nomeUsuario: ['', Validators.required],
    login: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    senha: ['', [Validators.required, this.senhaForteValidator()]],
    confirmarSenha: ['', Validators.required],

    GrupoSetor: this.setorControl,
    GrupoNivel: this.niveisControl

  }, {
    validators: this.validarSenhasIguais()
  });

  // =========================
  // VALIDAR BOTÃO
  // =========================

  get podeEnviar(): boolean {

    return (
      this.form.valid &&
      this.setorSelecionadas.length > 0 &&
      this.niveisSelecionadas.length > 0
    );
  }

  // =========================
  // INIT
  // =========================

  ngOnInit(): void {

    this.usuarioLogado = this.authHelper.get();

    // =========================
    // VALIDAR SENHAS
    // =========================

    this.form.get('senha')?.valueChanges.subscribe(() => {

      this.form.get('confirmarSenha')
        ?.updateValueAndValidity({ onlySelf: true });

    });

    this.form.get('confirmarSenha')?.valueChanges.subscribe(() => {

      this.form.updateValueAndValidity();

    });

    // =========================
    // AUTOCOMPLETE SETOR
    // =========================

    this.setorControl.valueChanges
      .pipe(
        debounceTime(300),

        filter((nomeSetor): nomeSetor is string =>
          !!nomeSetor && nomeSetor.length >= 1
        ),

        switchMap((nomeSetor) =>
          this.setorService.buscarPorNomeSetor(nomeSetor)
        ),

        catchError(() => of([]))
      )
      .subscribe((setores) => {

        this.setorFiltradas = setores;

      });

    // =========================
    // AUTOCOMPLETE NÍVEL
    // =========================

    this.niveisControl.valueChanges
      .pipe(
        debounceTime(300),

        filter((nomeNivel): nomeNivel is string =>
          !!nomeNivel && nomeNivel.length >= 1
        ),

        switchMap((nomeNivel) =>

          this.nivelService.buscarPorNomeNivel(nomeNivel).pipe(

            map((niveis: ConsultarNiveisResponse[]) => {

              const usuarioEhSuperAdmin =
                this.usuarioLogado?.nivel?.some(
                  (n) =>
                    n.nomeNivel
                      .trim()
                      .toLowerCase() === 'super administrador'
                );

              if (!usuarioEhSuperAdmin) {

                return niveis.filter(
                  (n) =>
                    n.nomeNivel
                      .trim()
                      .toLowerCase() !== 'super administrador'
                );
              }

              return niveis;
            }),

            catchError(() =>
              of([] as ConsultarNiveisResponse[])
            )
          )
        )
      )
      .subscribe((niveisFiltrados) => {

        this.niveisFiltradas = niveisFiltrados;

      });

    // =========================
    // CARREGAR USUARIO
    // =========================

    this.carregarUsuario();
  }

  // =========================
  // CARREGAR USUARIO
  // =========================

  carregarUsuario(): void {

    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {

      this.carregandoConsulta = false;
      return;
    }

    this.usuarioService
      .consultarUsuarioPorId(id)
      .subscribe({

        next: (response: any) => {

          const usuario =
            Array.isArray(response)
              ? response[0]
              : response;

          // =========================
          // FORM
          // =========================

          this.form.patchValue({

            id: usuario.id,
            nomeUsuario: usuario.nomeUsuario,
            login: usuario.login,
            email: usuario.email

          });

          // =========================
          // SETORES
          // =========================

          this.setorSelecionadas =

            usuario.grupoSetores?.map((x: any) => ({

              idSetor:
                x.setor?.idSetor ??
                x.idSetor ??
                x.id,

              nomeSetor:
                x.setor?.nomeSetor ??
                x.nomeSetor ??
                ''

            })) ?? [];

          // =========================
          // NIVEIS
          // =========================

          this.niveisSelecionadas =

            usuario.grupoNiveis?.map((x: any) => ({

              idNivel:
                x.nivel?.idNivel ??
                x.idNivel ??
                x.id,

              nomeNivel:
                x.nivel?.nomeNivel ??
                x.nomeNivel ??
                ''

            })) ?? [];

          this.carregandoConsulta = false;

          this.cd.detectChanges();
        },

        error: (e) => {

          this.tratarErro(e);

          this.carregandoConsulta = false;
        }
      });
  }

  // =========================
  // SELECIONAR SETOR
  // =========================

  selecionarSetor(setor: ConsultarSetoresResponse): void {

    if (
      this.setorSelecionadas.some(
        (s) => s.idSetor === setor.idSetor
      )
    ) {

      this.mensagemErro = [
        'Esse setor já foi selecionado.'
      ];

      return;
    }

    this.setorSelecionadas.push(setor);

    this.setorControl.setValue('');

    this.mostrarSugestoesSetor = false;
  }

  // =========================
  // REMOVER SETOR
  // =========================

  removerSetorSelecionada(
    setor: ConsultarSetoresResponse
  ): void {

    this.setorSelecionadas =
      this.setorSelecionadas.filter(
        (s) => s.idSetor !== setor.idSetor
      );
  }

  // =========================
  // SELECIONAR NIVEL
  // =========================

  selecionarNivel(
    nivel: ConsultarNiveisResponse
  ): void {

    if (
      this.niveisSelecionadas.some(
        (n) => n.idNivel === nivel.idNivel
      )
    ) {

      this.mensagemErro = [
        'Esse nível já foi selecionado.'
      ];

      return;
    }

    this.niveisSelecionadas.push(nivel);

    this.niveisControl.setValue('');

    this.mostrarSugestoesNiveis = false;
  }

  // =========================
  // REMOVER NIVEL
  // =========================

  removerNivelSelecionado(
    nivel: ConsultarNiveisResponse
  ): void {

    this.niveisSelecionadas =
      this.niveisSelecionadas.filter(
        (n) => n.idNivel !== nivel.idNivel
      );
  }

  // =========================
  // SUBMIT
  // =========================

  onSubmit(): void {

this.carregando = true;

this.mensagemErro = [];
this.mensagemSucesso = [];

this.cd.detectChanges();

    if (!this.podeEnviar) {

      this.mensagemErro = [
        'Preencha todos os campos obrigatórios corretamente.'
      ];

      this.carregando = false;

      return;
    }

    const request: EditarUsuarioRequest = {

      id: this.form.value.id ?? undefined,

      nomeUsuario:
        this.form.value.nomeUsuario ?? undefined,

      login:
        this.form.value.login ?? undefined,

      email:
        this.form.value.email ?? undefined,

      senha:
        this.form.value.senha ?? undefined,

      grupoSetores:

        this.setorSelecionadas.map((s) => ({

          idSetor: s.idSetor!

        })),

      grupoNiveis:

        this.niveisSelecionadas.map((n) => ({

          idNivel: n.idNivel!

        }))
    };console.log(
  'Objeto request enviado para edição:',
  JSON.stringify(request, null, 2)
);

    console.log(
      'Objeto request enviado:',
      request
    );

 this.usuarioService
  .editarPorId(request)
  .pipe(

    finalize(() => {

      this.carregando = false;

      this.cd.detectChanges();
    })
  )
  .subscribe({

    next: (response) => {

      console.log('RESPONSE:', response);

      this.mensagemSucesso = [

        response.message ??
        'Usuário atualizado com sucesso!'
      ];

      this.cd.detectChanges();

      setTimeout(() => {

        this.router.navigate([
          '/admin/consultar-usuarios'
        ]);

      }, 3000);
    },

    error: (e) => {

      this.tratarErro(e);
    }
  });
  }

  // =========================
  // TRATAR ERRO
  // =========================

  private tratarErro(e: any): void {

    const errorResponse = e?.error;

    this.mensagemErro = [];

    if (errorResponse?.errors) {

      for (const key in errorResponse.errors) {

        if (
          Array.isArray(
            errorResponse.errors[key]
          )
        ) {

          this.mensagemErro.push(
            ...errorResponse.errors[key]
          );
        }
      }
    }

    else if (errorResponse?.mensagem) {

      this.mensagemErro.push(
        errorResponse.mensagem
      );

      if (errorResponse.detalhes) {

        this.mensagemErro.push(
          errorResponse.detalhes
        );
      }
    }

    else if (errorResponse?.Message) {

      this.mensagemErro.push(
        errorResponse.Message
      );
    }

    else {

      this.mensagemErro.push(
        'Ocorreu um erro inesperado ao processar sua solicitação.'
      );
    }

    this.mensagemErro = [
      ...new Set(this.mensagemErro)
    ];

    console.error(
      'Erro recebido do backend:',
      e
    );
  }

  // =========================
  // VALIDAR SENHAS
  // =========================

  validarSenhasIguais(): ValidatorFn {

    return (
      group: AbstractControl
    ): ValidationErrors | null => {

      const senha =
        group.get('senha')?.value;

      const confirmar =
        group.get('confirmarSenha')?.value;

      if (
        senha &&
        confirmar &&
        senha !== confirmar
      ) {

        return {
          senhasDiferentes: true
        };
      }

      return null;
    };
  }

  // =========================
  // SENHA FORTE
  // =========================

  senhaForteValidator(): ValidatorFn {

    return (
      control: AbstractControl
    ): ValidationErrors | null => {

      const valor = control.value;

      if (!valor) return null;

      const regex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,}$/;

      return regex.test(valor)

        ? null

        : {
          senhaFraca:
            'A senha deve ter pelo menos 8 caracteres, incluindo letras maiúsculas, minúsculas, números e símbolos. EX(Procon2025@)'
        };
    };
  }

  // =========================
  // SUGESTÕES
  // =========================

  ocultarSugestoesComDelaySetor(): void {

    setTimeout(() => {

      this.mostrarSugestoesSetor = false;

    }, 200);
  }

  ocultarSugestoesComDelayNiveis(): void {

    setTimeout(() => {

      this.mostrarSugestoesNiveis = false;

    }, 200);
  }
}