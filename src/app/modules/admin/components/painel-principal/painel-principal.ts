import { Component, inject } from '@angular/core';
import { AuthHelper } from '../../../../core/helpers/auth.helper';
import { environment } from '../../../../../environments/environment';


import { AccessService } from '../../../../core/services/access.service';

@Component({
  selector: 'app-painel-principal',
  standalone: false,
  templateUrl: './painel-principal.html',
  styleUrl: './painel-principal.css'
})
export class PainelPrincipal {
    constructor(public access: AccessService
    ) { }

  authHelper = inject(AuthHelper);
  totalGeral: number = 0;
  totalAnoAtual: number = 0;
  totalGeralReclamacao: number = 0;
  totalAnoAtualReclamacao: number = 0;
  urlBase = environment.apiDeslandes;
  totalGeralAudiencia: number = 0;
  totalAnoAtualAudiencia: number = 0;
  currentYear: number = new Date().getFullYear(); // <- adiciona isso
  nomeUsuario: string = '';
  sexoUsuario: string = '';
  //atributos 
  //dashboard: DasboardResponse[] = [];

  //evendo executado ao abrir o componente
  get saudacaoUsuario(): string {
    if (!this.sexoUsuario) return 'Bem-vindo(a)';
    return this.sexoUsuario.toLowerCase() === 'feminino' ? 'Bem-vinda' : 'Bem-vindo';
  }
ngOnInit() {
  const usuario = this.authHelper.get();

  console.log('Usuário logado:', usuario);

  if (usuario) {
    this.nomeUsuario = usuario.nomeUsuario;
    this.sexoUsuario = usuario.sexo ?? 'Masculino';
  } else {
    this.nomeUsuario = 'Usuário';
  }
}
formatarCpf(cpf?: string): string {
    if (!cpf) return '';
    const cleaned = cpf.replace(/\D/g, '');
    if (cleaned.length !== 11) return cpf;
    return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }

  formatarCnpj(cnpj?: string): string {
    if (!cnpj) return '';
    const cleaned = cnpj.replace(/\D/g, '');
    if (cleaned.length !== 14) return cnpj;
    return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }
  formatarData(data?: string | Date): string {
    if (!data) return '';

    const d = typeof data === 'string' ? new Date(data) : data;

    if (isNaN(d.getTime())) return ''; // data inválida

    const dia = String(d.getDate()).padStart(2, '0');
    const mes = String(d.getMonth() + 1).padStart(2, '0'); // meses de 0 a 11
    const ano = d.getFullYear();

    return `${dia}/${mes}/${ano}`;
  }
    
}
