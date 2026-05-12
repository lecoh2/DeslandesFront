import { ChangeDetectorRef, Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidatorFn, ValidationErrors } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { UsuarioService } from '../../../../../core/services/usuario.service';
import { AuthHelper } from '../../../../../core/helpers/auth.helper';
import { EditarUsuarioRequest } from '../../../../../core/models/usuario/editar-usuario-request';
import { environment } from '../../../../../../environments/environment.development';

@Component({
  selector: 'app-perfil',
  standalone: false,
  templateUrl: './perfil.html',
  styleUrls: ['./perfil.css']
})
export class Perfil implements OnInit {

  private usuarioService = inject(UsuarioService);
  private builder = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private authHelper = inject(AuthHelper);
  private cd = inject(ChangeDetectorRef);

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  carregandoConsulta = true;
  carregandoCadastro = false;
  mensagemErro: string[] = [];
  mensagemSucesso: string[] = [];

  usuario: any;
  usuarioLogado: any;
  setores: any[] = [];
  niveis: any[] = [];
  fotoUsuario: string = 'assets/appdeslandes/img/default-avatar.jpg';
  selectedFile?: File;

  form: FormGroup = this.builder.group({
    nomeUsuario: [''],
    login: ['', Validators.required],
    senha: ['', [Validators.required, this.senhaForteValidator()]],
    confirmarSenha: ['', Validators.required],
    idPessoa: ['', Validators.required],
    id: [''],
    grupoSetores: this.builder.array([]),
    grupoNiveis: this.builder.array([]),
    dataCadastro: [''],
    email: [''],
    endereco: [''],
    telefone: [''],
    genero: ['']
  }, { validators: this.validarSenhasIguais() });

  get podeEnviar(): boolean {
    return this.form.valid;
  }

  get fotoSelecionada(): boolean {
    return !!this.selectedFile;
  }

  ngOnInit(): void {
    this.carregandoConsulta = true;
    this.usuarioLogado = this.authHelper.get();

    if (!this.usuarioLogado?.id) {
      this.mensagemErro.push('Usuário não autenticado.');
      this.carregandoConsulta = false;
      return;
    }

    this.usuarioService.consultarPerfilUsuarioPorId(this.usuarioLogado.id).subscribe({
      next: (response) => {
        const usuario = Array.isArray(response) ? response[0] : response;
        this.usuario = usuario;
        this.setores = usuario.grupoSetores ?? [];
        this.niveis = usuario.grupoNiveis ?? [];
  this.fotoUsuario = usuario.fotos?.fileUrl 
    ? `${environment.apiDeslandes}${usuario.fotos.fileUrl}` 
    : 'assets/appdeslandes/img/default-avatar.jpg';

        this.form.patchValue({
          id: usuario.id,
          nomeUsuario: usuario.nomeUsuario,
          login: usuario.login,
          dataCadastro: usuario.dataCadastro,
          email: usuario.email,
          endereco: usuario.endereco,
          telefone: usuario.telefone,
          genero: usuario.genero
        });

        this.cd.detectChanges();
        this.carregandoConsulta = false;
      },
      error: () => {
        this.mensagemErro.push('Erro ao carregar o perfil do usuário.');
        this.carregandoConsulta = false;
      }
    });
  }

  abrirUpload(): void {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    this.selectedFile = input.files[0];

    // Preview automático
    const reader = new FileReader();
    reader.onload = () => this.fotoUsuario = reader.result as string;
    reader.readAsDataURL(this.selectedFile);
  }

  /**
   * Upload da foto e cadastro no banco
   */
uploadFoto(): void {
  if (!this.selectedFile || !this.usuario?.id) {
    this.mensagemErro = ['Nenhuma foto selecionada ou usuário inválido.'];
    return;
  }

  this.carregandoCadastro = true;
  this.mensagemErro = [];
  this.mensagemSucesso = [];

  const formData = new FormData();
  formData.append('file', this.selectedFile);
  formData.append('Id', this.usuario.id);
  formData.append('Foto', this.selectedFile.name);

  this.usuarioService.cadastrarFoto(this.usuario.id, this.selectedFile).subscribe({
    next: (res: any) => {
      this.mensagemSucesso = ['Foto salva com sucesso!'];

      // Atualiza a foto exibida
      if (res.fileUrl) {
        this.fotoUsuario = `${environment.apiDeslandes}${res.fileUrl}`;
      }

      this.selectedFile = undefined;

      // Aguarda 1 segundo e recarrega a página
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    },
    error: (err) => {
      console.error('Erro ao salvar foto:', err);
      this.mensagemErro = ['Erro ao salvar foto no servidor.'];
    }
  }).add(() => this.carregandoCadastro = false);
}


  onImageError(event: Event): void {
    (event.target as HTMLImageElement).src = 'assets/appprocon/img/default-avatar.jpg';
  }

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
     
    };

    this.usuarioService.editarPorId(request).subscribe({
      next: response => this.mensagemSucesso.push(response.mensagem ?? 'Usuário atualizado com sucesso!'),
      error: e => this.tratarErro(e)
    }).add(() => this.carregandoCadastro = false);
  }

  private tratarErro(e: any): void {
    this.mensagemErro = [];
    const errorResponse = e?.error;
    if (errorResponse?.errors) {
      for (const key in errorResponse.errors) {
        if (Array.isArray(errorResponse.errors[key])) this.mensagemErro.push(...errorResponse.errors[key]);
      }
    } else if (errorResponse?.mensagem) {
      this.mensagemErro.push(errorResponse.mensagem);
    } else {
      this.mensagemErro.push('Ocorreu um erro inesperado.');
    }
  }

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

  coresBadge = [
    'badge-subtle-primary',
    'badge-subtle-success',
    'badge-subtle-warning',
    'badge-subtle-info',
    'badge-subtle-danger',
    'badge-subtle-secondary'
  ];
}
