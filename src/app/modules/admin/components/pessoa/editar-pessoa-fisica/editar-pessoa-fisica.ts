/*import { Component, inject, OnInit } from '@angular/core';
import { PessoaService } from '../../../../../core/services/pessoa.service';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthHelper } from '../../../../../core/helpers/auth.helper';
import { SexoService } from '../../../../../core/services/sexo.service';
import { ConsultarSexoResponse } from '../../../../../core/models/sexo/consutar-sexo-response';
import { CepService } from '../../../../../core/services/cep.service';
import { EditarPessoaFisicaRequest } from '../../../../../core/models/pessoa/editar-pessoa-fisica-request';
import { AutenticarUsuarioResponse } from '../../../../../core/models/usuario/autenticar-usuario.response';
import { switchMap } from 'rxjs/operators';
import { ConsultarPessoaResponse } from '../../../../../core/models/pessoa/consultar-pessoa-response';
import { ConsultarHistoricoPessoaResponse, HistoricoPessoaDados } from '../../../../../core/models/pessoa/consultar-historico-pessoa-response';

@Component({
  selector: 'app-editar-pessoa',
  standalone: false,
  templateUrl: './editar-pessoa-fisica.component.html',
  styleUrls: ['./editar-pessoa-fisica.component.css']
})
export class EditarPessoaFisicaComponent implements OnInit {
  private pessoaService = inject(PessoaService);
  private builder = inject(FormBuilder);
  private router = inject(Router);
  private authHelper = inject(AuthHelper);
  private sexoService = inject(SexoService);
  private cepService = inject(CepService);
  private route = inject(ActivatedRoute);
  tiposSexo: ConsultarSexoResponse[] = [];
  usuarioLogado?: AutenticarUsuarioResponse | null;
  historicoPessoa: ConsultarHistoricoPessoaResponse[] = [];
  //atributos
  idPessoa: string = '';
  nome: string = '';
  anoBaseTriagem: string = '';
  telefone: string = '';
  email: string = '';
  idSexo: string = '';
  profissao: string = '';
  rg: string = '';
  expeditor: string = '';
  cpf: string = '';
  logradouro: string = '';
  numero: string = '';
  complemento: string = '';
  bairro: string = '';
  localidade: string = '';
  uf: string = '';
  cep: string = '';
  mensagemErro: string[] = [];
  mensagemAviso:string[]=[];
  mensagemSucesso: string[] = [];

  carregando = false;

  temMascaraDupla = true;

  form = this.builder.group({
    idPessoa: new FormControl('', [Validators.required]),
    nome: new FormControl('', [Validators.required]),
    telefone: new FormControl(''),
    email: new FormControl('', [Validators.required, Validators.email]),
    idSexo: new FormControl('', [Validators.required]),
    profissao: new FormControl('', [Validators.required]),
    rg: new FormControl('', [Validators.required]),
    expeditor: new FormControl('', [Validators.required]),
    cpf: new FormControl('', [Validators.required]),
    logradouro: new FormControl('', [Validators.required]),
    numero: new FormControl('', [Validators.required]),
    complemento: [''],
    bairro: new FormControl('', [Validators.required]),
    localidade: new FormControl('', [Validators.required]),
    uf: new FormControl('', [Validators.required]),
    cep: new FormControl(''),
    idUsuario: new FormControl('', [Validators.required]),
    observacoes: new FormControl('', Validators.required)
  });
  limitarUf(valor: string): string {
    if (!valor) return '';
    valor = valor.replace(/[^a-zA-Z]/g, '').toUpperCase().substring(0, 2);
    return valor;
  }

  onBlurUf(): void {
    const valor = this.form.get('uf')?.value || '';
    const ufLimitada = this.limitarUf(valor);
    this.form.get('uf')?.setValue(ufLimitada);
  }
  ngOnInit(): void {
    this.carregando = true;

    this.usuarioLogado = this.authHelper.get();
    if (this.usuarioLogado) {
      this.form.get('idUsuario')?.setValue(this.usuarioLogado.idUsuario ?? null);
    }

    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.carregando = false;
      return;
    }
    this.idPessoa = id;

    // Primeiro carrega os sexos, depois carrega os dados da pessoa
    this.sexoService.consultar().pipe(
      switchMap(tipos => {
        this.tiposSexo = tipos;
        return this.pessoaService.consultarPessoaFisicaPorId(id);
      })
    ).subscribe({
      next: response => {
        this.form.patchValue({
          idPessoa: response.idPessoa,
          nome: response.nome,
          telefone: response.telefone,
          email: response.email,
          idSexo: response.sexo?.idSexo ?? '',
          profissao: response.profissao,
          rg: response.rg,
          expeditor: response.expeditor,
          cpf: response.cpf,
          logradouro: response.endereco?.logradouro,
          numero: response.endereco?.numero,
          complemento: response.endereco?.complemento,
          bairro: response.endereco?.bairro,
          localidade: response.endereco?.localidade,
          uf: response.endereco?.uf,
          cep: response.endereco?.cep,
        });
        this.carregando = false;
      },
      error: err => {
        this.tratarErro(err);
        this.carregando = false;
      }
    });
  }

  buscarCep() {
    this.mensagemErro = [];
    this.mensagemAviso=[];
    const cep = this.form.get('cep')?.value?.replace(/\D/g, '');

    if (!cep || cep.length !== 8) {
        this.mensagemAviso.push('O CEP deve conter 8 dígitos ou deixar vazio para caso for em audiência');
      return;
    }

    this.cepService.buscarCep(cep).subscribe({
      next: (endereco) => {
        if ((endereco as any).erro) {
          this.mensagemErro.push('CEP não encontrado.');
          return;
        }

        this.form.patchValue({
          logradouro: endereco.logradouro,
          bairro: endereco.bairro,
          localidade: endereco.localidade,
          uf: endereco.uf
        });
      },
      error: () => {
        this.mensagemErro.push('Erro ao buscar o CEP. Verifique sua conexão e tente novamente.');
      }
    });
  }


  private setRequired(campo: string, required: boolean) {
    const control = this.form.get(campo);
    if (!control) return;

    if (required) {
      control.setValidators(Validators.required);
    } else {
      control.clearValidators();
    }

    control.updateValueAndValidity();
  }

  onSubmit() {
    this.carregando = true;
    this.mensagemErro = [];
    this.mensagemSucesso = [];

    const request: EditarPessoaFisicaRequest = {
      idPessoa: this.form.value.idPessoa!,
      nome: this.form.value.nome!,
      profissao: this.form.value.profissao!,
      rg: this.form.value.rg!,
      expeditor: this.form.value.expeditor!,
      cpf: this.form.value.cpf!,
      email: this.form.value.email!,
      idSexo: this.form.value.idSexo!,
      telefone: this.form.value.telefone!.trim() || 'Em audiência',
      observacoes: this.form.value.observacoes!,
      idUsuario: this.form.value.idUsuario!,
      endereco: {
        logradouro: this.form.value.logradouro!,
        numero: this.form.value.numero!,
        complemento: this.form.value.complemento!,
        bairro: this.form.value.bairro!,
        localidade: this.form.value.localidade!,
        uf: this.form.value.uf!,
        cep: this.form.value.cep!.trim() || 'Em audiência'
      }
    };

    this.pessoaService.editarPessoaFisica(request).subscribe({
      next: (response) => {
        this.form.reset();
        this.mensagemErro = [];

        this.mensagemSucesso = [response?.mensagem ?? 'Pessoa atualizada com sucesso.'];

        this.carregando = false; // <-- Mostra a mensagem imediatamente

        // Agora espera 3 segundos COM A MENSAGEM VISÍVEL e só depois redireciona
        setTimeout(() => {
          this.router.navigate(['/admin/consultar-pessoas']);
        }, 3000);
      },
      error: (e) => {
        this.mensagemErro = [];
        const errorResponse = e.error;

        if (errorResponse?.errors) {
          for (const key in errorResponse.errors) {
            if (Array.isArray(errorResponse.errors[key])) {
              this.mensagemErro.push(...errorResponse.errors[key]);
            }
          }
        } else if (errorResponse?.mensagem) {
          this.mensagemErro.push(errorResponse.mensagem);
          if (errorResponse.Detalhes) this.mensagemErro.push(errorResponse.Detalhes);
        } else if (errorResponse?.Message) {
          this.mensagemErro.push(errorResponse.Message);
          if (errorResponse.inner) this.mensagemErro.push(errorResponse.inner);
        } else {
          this.mensagemErro.push('Ocorreu um erro inesperado ao processar sua solicitação.');
        }

        this.carregando = false;
      }
    });
  }

  //historico

  carregandoHistorico = false;

  abrirModalHistorico(): void {
    if (!this.idPessoa) return;

    this.carregandoHistorico = true;
    console.log('Carregando histórico de pessoas:', this.idPessoa);

    this.pessoaService.consultarHistoricoPessoaFisica(this.idPessoa).subscribe({
      next: (response) => {
        console.log('Histórico Pessoa recebido:', response);

        // Ajuste conforme o retorno real, pode ser direto array ou dentro de alguma propriedade
        const listaHistoricos = (response as any).historicos || response || [];

        this.historicoPessoa = listaHistoricos.map((item: any) => {
          const dadosAntes = item.dadosAntes ? JSON.parse(item.dadosAntes) : {};
          const dadosDepois = item.dadosDepois ? JSON.parse(item.dadosDepois) : {};

          return {
            idHistoricoPessoa: item.idHistoricoPessoa,
            idPessoa: item.idPessoa,
            idUsuario: item.idUsuario,
            dataAlteracao: item.dataAlteracao,
            tipoAlteracao: item.tipoAlteracao,
            observacoes: item.observacoes,
            dadosAntes: item.dadosAntes,
            dadosDepois: item.dadosDepois,
            dadosAntesObj: dadosAntes,
            dadosDepoisObj: dadosDepois,
            nomePessoa: dadosDepois.Nome || dadosAntes.Nome || 'Não informado',
            cpfPessoa: dadosDepois.Cpf || dadosAntes.Cpf || 'Não informado',
            rgPessoa: dadosDepois.Rg || dadosAntes.Rg || 'Não informado',
            emailPessoa: dadosDepois.Email || dadosAntes.Email || 'Não informado',
            nomeUsuario: item.usuario?.nomeUsuario || '',
            usuarioNome: item.usuario?.login || ''
          };
        });

        this.carregandoHistorico = false;
      },
      error: (err) => {
        console.error('Erro ao carregar histórico da pessoa:', err);
        this.mensagemErro.push('Erro ao carregar histórico da pessoa.');
        this.carregandoHistorico = false;
      }
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

  private tratarErro(e: any) {
    this.mensagemErro = [];
    const errorResponse = e.error;

    if (errorResponse?.errors) {
      for (const key in errorResponse.errors) {
        if (Array.isArray(errorResponse.errors[key])) {
          this.mensagemErro.push(...errorResponse.errors[key]);
        }
      }
    } else if (errorResponse?.mensagem) {
      this.mensagemErro.push(errorResponse.mensagem);
      if (errorResponse.Detalhes) {
        this.mensagemErro.push(errorResponse.Detalhes);
      }
    } else if (errorResponse?.Message) {
      this.mensagemErro.push(errorResponse.Message);
      if (errorResponse.inner) {
        this.mensagemErro.push(errorResponse.inner);
      }
    } else {
      this.mensagemErro.push('Ocorreu um erro inesperado ao processar sua solicitação.');
    }

    this.carregando = false;
  }
}
*/