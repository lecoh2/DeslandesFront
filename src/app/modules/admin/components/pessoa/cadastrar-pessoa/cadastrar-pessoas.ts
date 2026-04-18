import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { PessoaService } from '../../../../../core/services/pessoa.service';
import { CepService } from '../../../../../core/services/cep.service';
import { AuthHelper } from '../../../../../core/helpers/auth.helper';
import { PessoaFisicaRequest } from '../../../../../core/models/pessoa/pessoas-fisica-request';
import { TipoPessoa } from '../../../../../core/models/enums/tipo-pessoa/tipo-pessoa';
import { EnderecoRequest } from '../../../../../core/models/endereco/endereco-request';
import { PerfilEnum } from '../../../../../core/models/enums/perfil/perfilEnum';
import { EtiquetaService } from '../../../../../core/services/etiqueta.service';
import { ConsultarEtiquetaResponse } from '../../../../../core/models/etiqueta/consultar-etiqueta-response';
import { InformacoesComplementaresRequest } from '../../../../../core/models/informacoes-complementares/informacoes-complementares-request';
import { PessoaJuridicaRequest } from '../../../../../core/models/pessoa/pessoa-juridica-request';
import { limparNull } from '../../../../../core/utils/limpar-null';
import { AutenticarUsuarioResponse } from '../../../../../core/models/usuario/autenticar-usuario.response';
import { ContaBancariaRequest } from '../../../../../core/models/conta-bancaria/conta-bancaria-request';
import { TratamentoEnum } from '../../../../../core/models/enums/tratamento/tratamentoEnum';

@Component({
  selector: 'app-cadastrar-pessoa',
  standalone: false,
  templateUrl: './cadastrar-pessoas.html',
  styleUrls: ['./cadastrar-pessoas.css']
})
export class CadastrarPessoas implements OnInit {

  // ================== Injeção de Serviços ==================
  private pessoaService = inject(PessoaService);
  private builder = inject(FormBuilder);
  private router = inject(Router);
  private authHelper = inject(AuthHelper);
  private etiquetaService = inject(EtiquetaService);
  private cepService = inject(CepService);

  // ================== Variáveis de Estado ==================

  mensagemErro: string[] = [];
  mensagemSucesso: string[] = [];
  carregando = false;

  // ================== Enum TipoPessoa ==================
  tipoPessoaSelecionado: TipoPessoa = TipoPessoa.Fisica;
  tipoPessoaEnum = TipoPessoa; // Disponível no template
  tiposetiquetas: ConsultarEtiquetaResponse[] = [];
  etiquetasSelecionadas: ConsultarEtiquetaResponse[] = [];
  usuarioLogado?: AutenticarUsuarioResponse | null;
  // ================== Formulário ==================
  form = this.builder.group({
    nome: ['', Validators.required],
    apelido: [''],
    telefone: [''],
    site: [''],
    email: [''],
    idUsuario: [''],
    idEtiqueta: [null],
    perfil: [null,],
    // Pessoa Física
    rg: [''],
    cpf: [''],
    tituloEleitor: [''],
    carteiraTrabalho: [''],
    pisPasep: [''],
    cnh: [''],
    ctps: [''],
    passaporte: [''],
    certidaoReservista: [''],
    // Pessoa Jurídica
    cnpj: [''],
    inscricaoEstadual: [''],
    inscricaoMunicipal: [''],
    simplesNacional: [''],
    atividadeEconomica: [''],
    //  Conta Bancária (APENAS UMA VEZ)
    contaBancaria: this.builder.group({
      nomeBanco: [''],
      agencia: [''],
      conta: [''],
      pix: [''],
      tipoConta: [''],
    }),

    endereco: this.builder.group({
      logradouro: [''],
      numero: [''],
      complemento: [''],
      bairro: [''],
      localidade: [''],
      uf: [''],
      cep: ['']
    }),

    informacoesComplementares: this.builder.group({
      dataNascimento: [''],
      nomeEmpresa: [''],
      profissao: [''],
      atividadeEconomica: [''],
      estadoCivil: [''],
      tratamento: [null],
      codigo: [''],
      empresa: [''],
      contato: [''],
      cargo: [''],

      nomePai: [''],
      nomeMae: [''],
      naturalidade: [''],
      nacionalidade: [''],
      comentario: ['']
    }),

  })
  private obterContaBancaria(formValue: any): ContaBancariaRequest | undefined {
    const conta = formValue.contaBancaria;

    if (!conta) return undefined;

    const contaTratada: ContaBancariaRequest = {
      nomeBanco: conta.nomeBanco,
      agencia: conta.agencia,
      numeroConta: conta.conta,
      pix: conta.pix,
      tipoConta: conta.tipoConta === 'corrente' ? 1 : 2
    };

    const temValor = Object.values(contaTratada).some(v => v);

    return temValor ? contaTratada : undefined;
  }
  tratamentoEnum = TratamentoEnum;

  tratamentos = Object.keys(TratamentoEnum)
    .filter(key => isNaN(Number(key)))
    .map(key => ({
      id: TratamentoEnum[key as keyof typeof TratamentoEnum],
      nome: key
    }));
  selecionarEtiqueta(etiqueta: ConsultarEtiquetaResponse) {
    if (this.etiquetasSelecionadas.some(e => e.id === etiqueta.id)) {
      this.mensagemErro = ['Etiqueta já selecionada.'];
      return;
    }

    this.etiquetasSelecionadas.push(etiqueta);
  }
  removerEtiqueta(etiqueta: ConsultarEtiquetaResponse) {
    this.etiquetasSelecionadas =
      this.etiquetasSelecionadas.filter(e => e.id !== etiqueta.id);
  }
  perfilEnum = PerfilEnum;

  perfis = Object.keys(PerfilEnum)
    .filter(key => isNaN(Number(key)))
    .map(key => ({
      id: PerfilEnum[key as keyof typeof PerfilEnum],
      nome: key
    }));
  step = 1;

  irParaStep(step: number) {
    this.step = step;
  }
  // ================== Lifecycle ==================
  get codigoControl() {
    return this.form.get('informacoesComplementares.codigo') as any;
  }
  get contatoControl() {
    return this.form.get('informacoesComplementares.contato') as any;
  }

  get cargoControl() {
    return this.form.get('informacoesComplementares.cargo') as any;
  }
  ngOnInit(): void {
    this.carregando = false;

    setTimeout(() => {
      // Recupera usuário logado
      this.usuarioLogado = this.authHelper.get();

     // if (this.usuarioLogado) {
       // this.form.get('idUsuario')?.setValue(this.usuarioLogado.idUsuario ?? null);
     // }

      // estado inicial do tipo pessoa
      this.onTipoPessoaChange(this.tipoPessoaSelecionado);

      // se existir esse controle, evita erro silencioso
      const tipoCtrl = this.form.get('tipoPessoa');
      if (tipoCtrl) {
        tipoCtrl.valueChanges.subscribe(tipo => {
          this.onTipoPessoaChange(tipo);
        });
      }

      // carrega etiquetas
      this.etiquetaService.consultar().subscribe({
        next: (tipos) => {
          this.tiposetiquetas = tipos;
          this.carregando = false;
        },
        error: () => {
          this.mensagemErro = ['Erro ao carregar as etiquetas.'];
          this.carregando = false;
        }
      });

    });
  }
  formatarTelefonesEmLinha(valor?: string): string {
    if (!valor) return '';
    return valor
      .split(';')
      .map(tel => {
        const cleaned = tel.replace(/\D/g, '');
        if (cleaned.length === 11) {
          return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        } else if (cleaned.length === 10) {
          return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
        } else {
          return tel.trim(); // não formata se não tiver 10 ou 11 dígitos
        }
      })
      .join('; ');
  }

  formatarCampoTelefone() {
    const telCtrl = this.form.get('telefone');
    const valor = telCtrl?.value;

    if (!valor) return;

    const telefones = valor.split(';').map(t => t.trim()).filter(t => t);
    //aumenta o quantidade
    if (telefones.length > 3) {
      this.mensagemErro = ['Você só pode informar no máximo três telefones.'];
      // Remove o que foi digitado a mais (opcional)
      telCtrl?.setValue(telefones.slice(0, 2).join('; '));
    } else {
      telCtrl?.setValue(this.formatarTelefonesEmLinha(valor));
    }
  } formatarLimitarTelefones() {
    const controle = this.form.get('telefone');
    if (!controle) return;

    const valor = controle.value;
    if (!valor) return;

    const formatado = this.limitarTelefonesMaximo22Numeros(valor);
    controle.setValue(formatado);
  }

  validarQuantidadeTelefones(valor: string): boolean {
    const telefones = valor.split(';').map(t => t.trim()).filter(t => t);
    //retorno ate 3 numeros
    return telefones.length <= 3;
  }
  limitarSeparadores(event: KeyboardEvent) {
    const input = this.form.get('telefone')?.value || '';
    const quantidadePontoVirgula = (input.match(/;/g) || []).length;

    //aumenta a quantidade de ponto e virgula
    if (event.key === ';' && quantidadePontoVirgula >= 2) {
      event.preventDefault(); // bloqueia a digitação
    }
  } limitarTelefonesMaximo22Numeros(valor: string): string {
    // Extrai apenas os números (ignorando espaços, parênteses, hífens, etc.)
    //aumenta o numero de digitos
    const apenasNumeros = valor.replace(/\D/g, '').substring(0, 33);

    let resultado = '';
    let contador = 0;

    while (contador < apenasNumeros.length) {
      const restante = apenasNumeros.length - contador;

      if (restante >= 11) {
        // Formata como celular com 9 dígitos
        resultado += `(${apenasNumeros.substr(contador, 2)}) ${apenasNumeros.substr(contador + 2, 5)}-${apenasNumeros.substr(contador + 7, 4)}; `;
        contador += 11;
      } else if (restante >= 10) {
        // Formata como fixo com 8 dígitos
        resultado += `(${apenasNumeros.substr(contador, 2)}) ${apenasNumeros.substr(contador + 2, 4)}-${apenasNumeros.substr(contador + 6, 4)}; `;
        contador += 10;
      } else {
        break; // se restarem menos de 10, não tenta formatar
      }
    }

    return resultado.trim().replace(/;$/, ''); // remove o último ";" se necessário
  }
  //==================emails===================

  formatarCampoEmail() {
    const emailCtrl = this.form.get('email');
    const valor = emailCtrl?.value;

    if (!valor) return;

    const emails = valor
      .split(';')
      .map(e => e.trim())
      .filter(e => e);

    // máximo 3 emails
    if (emails.length > 3) {
      this.mensagemErro = ['Você só pode informar no máximo três e-mails.'];

      emailCtrl?.setValue(emails.slice(0, 3).join('; '));
    } else {
      emailCtrl?.setValue(emails.join('; '));
    }
  } validarQuantidadeEmails(valor: string): boolean {
    const emails = valor
      .split(';')
      .map(e => e.trim())
      .filter(e => e);

    return emails.length <= 3;
  } limitarSeparadoresEmail(event: KeyboardEvent) {
    const input = this.form.get('email')?.value || '';
    const quantidade = (input.match(/;/g) || []).length;

    if (event.key === ';' && quantidade >= 2) {
      event.preventDefault();
    }
  } validarEmails(valor: string): boolean {
    const emails = valor
      .split(';')
      .map(e => e.trim())
      .filter(e => e);

    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return emails.every(email => regex.test(email));
  } validarCampoEmail() {
    const controle = this.form.get('email');
    if (!controle) return;

    const valor = controle.value;
    if (!valor) return;

    if (!this.validarQuantidadeEmails(valor)) {
      this.mensagemErro = ['Máximo de 3 e-mails permitido.'];
      return;
    }

    if (!this.validarEmails(valor)) {
      this.mensagemErro = ['Um ou mais e-mails estão inválidos.'];
      return;
    }
  } limitarEmailsMaximo(valor: string): string {
    if (!valor) return '';

    // separa os emails
    let emails = valor
      .split(';')
      .map(e => e.trim())
      .filter(e => e);

    //  limita até 3 emails
    emails = emails.slice(0, 3);

    //  limita tamanho de cada email (ex: 100 caracteres)
    emails = emails.map(e => e.substring(0, 100));

    //  remove duplicados (opcional)
    emails = [...new Set(emails)];

    //  valida formato básico
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    emails = emails.filter(e => regex.test(e));

    //  monta string final
    let resultado = '';

    for (let i = 0; i < emails.length; i++) {
      resultado += emails[i];

      if (i < emails.length - 1) {
        resultado += '; ';
      }
    }

    return resultado;
  }
  // ================== CEP ==================
  buscarCep(): void {
    this.mensagemErro = [];
    const cep = this.form.get('endereco.cep')?.value?.replace(/\D/g, '');
    if (!cep || cep.length !== 8) {
      this.mensagemErro.push('O CEP deve conter 8 dígitos.');
      return;
    }

    this.cepService.buscarCep(cep).subscribe({
      next: (endereco: any) => {
        if (endereco.erro) {
          this.mensagemErro.push('CEP não encontrado.');
          return;
        }

        this.form.patchValue({
          endereco: {
            logradouro: endereco.logradouro,
            bairro: endereco.bairro,
            localidade: endereco.localidade,
            uf: endereco.uf
          }
        });
      },
      error: (err: HttpErrorResponse) => {
        this.mensagemErro.push('Erro ao buscar o CEP.');
      }
    });
  }

  limitarUf(valor: string): string {
    if (!valor) return '';
    return valor.replace(/[^a-zA-Z]/g, '').toUpperCase().substring(0, 2);
  }

  onBlurUf(): void {
    const valor = this.form.get('endereco.uf')?.value || '';
    this.form.get('endereco.uf')?.setValue(this.limitarUf(valor));
  }

  // ================== Tipo Pessoa ==================
  onTipoPessoaChange(tipo: TipoPessoa): void {
    this.tipoPessoaSelecionado = tipo;

    if (tipo === TipoPessoa.Fisica) {

      //  Física obrigatórios
      this.setRequired('cpf', true);

      //  Jurídica não obrigatórios
      this.setRequired('cnpj', false);
      this.setRequired('inscricaoEstadual', false);
      this.setRequired('inscricaoMunicipal', false);

      // Limpa Jurídica
      this.form.patchValue({
        cnpj: '',
        inscricaoEstadual: '',
        inscricaoMunicipal: ''
      });

    } else {

      //  Jurídica obrigatórios
      this.setRequired('cnpj', true);

      //  Física não obrigatórios
      this.setRequired('cpf', false);

      // Limpa Física
      this.form.patchValue({
        cpf: '',

        rg: '',
        tituloEleitor: '',
        carteiraTrabalho: '',
        pisPasep: '',
        cnh: '',
        passaporte: '',
        certidaoReservista: ''
      });
    }

    this.form.updateValueAndValidity();
  }
  private setRequired(campo: string, required: boolean): void {
    const control = this.form.get(campo);
    if (!control) return;

    if (required) {
      control.setValidators(Validators.required);
    } else {
      control.clearValidators();
    }

    control.updateValueAndValidity();
  }
  // ================== Submit ==================
  onSubmit(): void {
    this.mensagemErro = [];
    this.mensagemSucesso = [];

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.carregando = true;

    const formValue = this.form.value;

    const preencherNadaConsta = (campo: any) =>
      campo ? campo : 'NADA CONSTA';

    const informacoes = limparNull(
      formValue.informacoesComplementares
    ) as InformacoesComplementaresRequest;

    const endereco = limparNull<EnderecoRequest>(
      formValue.endereco ?? {}
    );

    const contaBancaria = this.obterContaBancaria(formValue);

    // ================== PESSOA FÍSICA ==================
    if (this.tipoPessoaSelecionado === TipoPessoa.Fisica) {
      console.log("FORM:", this.form.value);
      const request: PessoaFisicaRequest = {
        //idUsuario: this.form.value.idUsuario ?? undefined,
        idUsuario: this.usuarioLogado?.idUsuario ?? undefined,
        nome: formValue.nome!,
        apelido: formValue.apelido!,
        telefone: formValue.telefone!,
        site: formValue.site!,
        email: formValue.email!,
        perfil: formValue.perfil ? Number(formValue.perfil) : undefined,
        rg: preencherNadaConsta(formValue.rg),
        cpf: formValue.cpf!,
        tituloEleitor: preencherNadaConsta(formValue.tituloEleitor),
        carteiraTrabalho: preencherNadaConsta(formValue.carteiraTrabalho),
        pisPasep: preencherNadaConsta(formValue.pisPasep),
        cnh: preencherNadaConsta(formValue.cnh),
        passaporte: preencherNadaConsta(formValue.passaporte),
        certidaoReservista: preencherNadaConsta(formValue.certidaoReservista),
        endereco: endereco,
        informacoesComplementares: informacoes,

        grupoPessoasEtiquetas: this.etiquetasSelecionadas
          .filter(e => e.id)
          .map(e => ({ idEtiqueta: e.id! })),

        // ✅ opcional direto (SEM IF e SEM SPREAD)
        contaBancaria: contaBancaria as ContaBancariaRequest | undefined
      };
      console.log("REQUEST:", request);

      this.pessoaService.cadastrarPessoaFisica(request).subscribe({
        next: (response) => {
          this.form.reset();
          this.carregando = false;
       this.mensagemSucesso = [response?.message];
          this.router.navigate(['/admin/cadastrar-pessoas']);
        },
        error: (err: HttpErrorResponse) => this.tratarErro(err)
      });
    }

    // ================== PESSOA JURÍDICA ==================
    else {
      const info = formValue.informacoesComplementares;

      const request: PessoaJuridicaRequest = {

       idUsuario: this.usuarioLogado?.idUsuario ?? undefined,
        nome: formValue.nome!,
        apelido: formValue.apelido!,
        site: formValue.site!,
        telefone: formValue.telefone!,
        email: formValue.email!,
        cnpj: formValue.cnpj!,

        inscricaoEstadual: preencherNadaConsta(formValue.inscricaoEstadual),
        inscricaoMunicipal: preencherNadaConsta(formValue.inscricaoMunicipal),

        atividadeEconomica: preencherNadaConsta(info?.atividadeEconomica),

        endereco: endereco,
        informacoesComplementares: informacoes,
        grupoPessoasEtiquetas: this.etiquetasSelecionadas
          .filter(e => e.id)
          .map(e => ({ idEtiqueta: e.id! })),
        contaBancaria: contaBancaria as ContaBancariaRequest | undefined
      };

      this.pessoaService.cadastrarPessoaJuridica(request).subscribe({
        next: (response) => {
          this.form.reset();
          this.carregando = false;
        this.mensagemSucesso = [response?.message];
          this.router.navigate(['/admin/cadastrar-pessoas']);
        },
        error: (err: HttpErrorResponse) => this.tratarErro(err)
      });
    }
  }
 // validação para habilitar submit — exige PF e PJ pelo seu requisito original
 get podeEnviar(): boolean {
    return this.form.valid;
  }


  // ================== Tratar Erros ==================
  private tratarErro(err: HttpErrorResponse): void {
    this.mensagemErro = [];
    const errorResponse = err.error;

    if (errorResponse?.errors) {
      for (const key in errorResponse.errors) {
        this.mensagemErro.push(...errorResponse.errors[key]);
      }
    } else if (errorResponse?.mensagem) {
      this.mensagemErro.push(errorResponse.mensagem);
    } else {
      this.mensagemErro.push('Erro inesperado.');
    }

    this.carregando = false;
  }
}