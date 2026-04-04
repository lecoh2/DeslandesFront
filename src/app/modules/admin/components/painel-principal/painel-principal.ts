import { Component, inject } from '@angular/core';
import { AuthHelper } from '../../../../core/helpers/auth.helper';
import { environment } from '../../../../../environments/environment';
//import { DashboardService } from '../../../../core/services/dashboard.service';
//import { DasboardResponse } from '../../../../core/models/dashboard/dashboard.response';
//import { AtendimentoService } from '../../../../core/services/atendimento.service';
//import { ConsultarAtendimentoResponse } from '../../../../core/models/atendimento/consultar-atendimento-response';
//import { ReclamacaoService } from '../../../../core/services/reclamacao.service';
//import { AudienciaService } from '../../../../core/services/audiencia.service';
//import { consultarAudienciaResponse } from '../../../../core/models/audiencia/consultar-audiencia-response';
//import { ConsultarReclamacaoResponse } from '../../../../core/models/reclamacao/consultar-reclamacao-response';

import { AccessService } from '../../../../core/services/access.service';

@Component({
  selector: 'app-painel-principal',
  standalone: false,
  templateUrl: './painel-principal.html',
  styleUrl: './painel-principal.css'
})
export class PainelPrincipalComponent {
    constructor(public access: AccessService
    ) { }
 // consulta: ConsultarAtendimentoResponse[] = [];
  //consultaCincoUltimosAtendimentos: ConsultarAtendimentoResponse[] = [];
 // consultarReclamacao: ConsultarReclamacaoResponse[]=[];
 // dashboardService = inject(DashboardService);
 // private atendimentoService = inject(AtendimentoService);
 // private reclamacaoService = inject(ReclamacaoService);
 // private audienciaService = inject(AudienciaService);
 // consultaAudiencia: consultarAudienciaResponse[] = [];
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
  /*ngOnInit() {
    this.buscarCincoUltimosAtendimentos();
     this.buscarCincoUltimasAudiencias();
     this.buscarReclamacao();
    const usuario = this.authHelper.get();
    console.log('Usuário logado:', usuario); // <-- aqui
    this.nomeUsuario = this.authHelper.get()?.nomeUsuario ?? 'Usuário';
    this.sexoUsuario = this.authHelper.get()?.sexo ?? 'Masculino'; // default
    this.atendimentoService.getQuantidadeAtendimentos()
      .subscribe({
        next: (resultado) => {
          this.totalGeral = resultado.totalGeral;
          this.totalAnoAtual = resultado.totalAnoAtual;
        },
        error: (erro) => {
          console.error('Erro ao consultar quantidade de atendimentos', erro);
          this.totalGeral = 0;
          this.totalAnoAtual = 0;
        }
      });
    this.reclamacaoService.getQuantidadeReclamacao()
      .subscribe({
        next: (resultado) => {
          this.totalGeralReclamacao = resultado.totalGeral;
          this.totalAnoAtualReclamacao = resultado.totalAnoAtual;
        },
        error: (erro) => {
          console.error('Erro ao consultar quantidade de atendimentos', erro);
          this.totalGeral = 0;
          this.totalAnoAtual = 0;
        }
      });
    this.audienciaService.getQuantidadeAudiencia()
      .subscribe({
        next: (resultado) => {
          this.totalGeralAudiencia = resultado.totalGeral;
          this.totalAnoAtualAudiencia = resultado.totalAnoAtual;
        },
        error: (erro) => {
          console.error('Erro ao consultar quantidade de atendimentos', erro);
          this.totalGeral = 0;
          this.totalAnoAtual = 0;
        }
      });
  }
  buscarCincoUltimosAtendimentos() {  
    this.atendimentoService.ConsultarCincoUltimosAtendimentos().subscribe({
      next: (response) => {
        console.log('Resposta da API Audiencia:', response);
        this.consultaCincoUltimosAtendimentos = response;       
        setTimeout(() => {       
        }, 0);
      },
   
    });
  }
    buscarReclamacao() {
    this.reclamacaoService.getCincoUltimasReclamacao().subscribe({
      next: (response) => {
        console.log("Dados da Reclamacao", response);
        this.consultarReclamacao = response;    
        setTimeout(() => {         
        }, 0);      
      }, 
    });
  }
  buscarCincoUltimasAudiencias() {  
    this.audienciaService.consultarcincoUltimasAudiencias().subscribe({
      next: (response) => {
        console.log('Resposta da API Audiencia:', response);
        this.consultaAudiencia = response;       
        setTimeout(() => {       
        }, 0);
      },
   
    });
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
    */
}
