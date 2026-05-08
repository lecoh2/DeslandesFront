import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { environment } from '../../../../../environments/environment.development';
import { AccessService } from '../../../../core/services/access.service';
import { AuthHelper } from '../../../../core/helpers/auth.helper';
import { DashboardService } from '../../../../core/services/dashboard.service';
import { ProcessoResumoResponse } from '../../../../core/models/processo-resumo/processo-resumo-response';
import { ObterTarefaResponse } from '../../../../core/models/tarefa/obter-tarefa-response';

@Component({
  selector: 'app-painel-principal',
  standalone: false,
  templateUrl: './painel-principal.html',
  styleUrls: ['./painel-principal.css']
})
export class PainelPrincipal implements OnInit {

  constructor(public access: AccessService) { }

  private dashboardService = inject(DashboardService);
  private authHelper = inject(AuthHelper);
  private cdr = inject(ChangeDetectorRef);
  consultaProcesso: ProcessoResumoResponse[] = [];
  consultarTarefas: ObterTarefaResponse[] = [];
  pastasExpandidas: Set<string> = new Set();
  urlBase = environment.apiDeslandes;
  totalProcessosAnoAtual: number = 0;
  totalProcessos: number = 0;
  totalCasosAnoAtual: number = 0;
  totalCaso: number = 0;
  totalAtendimentoAnoAtual: number = 0;
  totalAtendimento: number = 0;
  currentYear = new Date().getFullYear();

  clientesExpandidos: Set<string> = new Set();
  nomeUsuario = '';
  sexoUsuario = '';

  ngOnInit(): void {
    this.carregarUsuario();
    this.carregarProcessos();
    this.carregarTarefas();
    this.carregarTotais();
  }

  private carregarUsuario(): void {
    const usuario = this.authHelper.get();

    this.nomeUsuario = usuario?.nomeUsuario ?? 'Usuário';
    this.sexoUsuario = usuario?.sexo ?? 'Masculino';
  }


  togglePasta(id: string): void {
    if (this.pastasExpandidas.has(id)) {
      this.pastasExpandidas.delete(id);
    } else {
      this.pastasExpandidas.add(id);
    }
  }

  isPastaExpandida(id: string): boolean {
    return this.pastasExpandidas.has(id);
  }
  limitarTexto(texto?: string, limite: number = 37): string {
    if (!texto) return '';
    return texto.length > limite
      ? texto.substring(0, limite) + '...'
      : texto;
  }

  precisaVerMais(texto?: string, limite: number = 37): boolean {
    return !!texto && texto.length > limite;
  }
  private carregarProcessos(): void {
    this.dashboardService.getUltimosProcessos()
      .subscribe({
        next: (res) => {

          this.consultaProcesso = res ?? [];

          // 🔥 força 1 ciclo de render depois do async inicial
          this.cdr.markForCheck();
        }
      });
  }
  private carregarTotais(): void {

    this.dashboardService.getTotalProcessos()
      .subscribe(res => {
        this.totalProcessos = res ?? 0;
      });
         this.dashboardService.getTotalCaso()
      .subscribe(res => {
        this.totalCaso = res ?? 0;
      });
         this.dashboardService.getTotalAtendimento()
      .subscribe(res => {
        this.totalAtendimento = res ?? 0;
      });

    this.dashboardService.getUltimosProcessosAnoAtual()
      .subscribe(res => {
        this.totalProcessosAnoAtual = res ?? 0;
      });
    this.dashboardService.getUltimosAtendimentoAnoAtual()
      .subscribe(res => {
        this.totalAtendimentoAnoAtual = res ?? 0;
      });
    this.dashboardService.getUltimosCasoAnoAtual()
      .subscribe(res => {
        this.totalCasosAnoAtual = res ?? 0;
      });
  }
  private carregarTarefas(): void {
    this.dashboardService.getUltimasTarefas()
      .subscribe({
        next: (res) => {
          console.log('RES TAREFAS:', res);
          this.consultarTarefas = res ?? [];

          // 🔥 força 1 ciclo de render depois do async inicial
          this.cdr.markForCheck();
        }
      });
  }
  trackById(index: number, item: ProcessoResumoResponse) {
    return item?.id ?? index;
  }
  getStatusLabel(status: number): string {
    switch (status) {
      case 1: return 'A Fazer';
      case 2: return 'Em Andamento';
      case 3: return 'Concluído';
      case 4: return 'Cancelado';
      default: return '---';
    }
  } getPrioridadeLabel(prioridade: number): string {
    switch (prioridade) {
      case 1: return 'Baixa';
      case 2: return 'Média';
      case 3: return 'Alta';
      case 4: return 'Urgente';
      default: return 'Indefinida';
    }
  }
  /* getsaudacaoUsuario(): string {
     return this.sexoUsuario?.toLowerCase() === 'feminino'
       ? 'Bem-vinda'
       : 'Bem-vindo';
   }*/
  prioridadeMap: Record<number, string> = {
    1: 'Baixa',
    2: 'Média',
    3: 'Alta',
    4: 'Urgente'
  };
  statusKanbanMap: Record<number, string> = {
    1: 'A Fazer',
    2: 'Em Andamento',
    3: 'Concluído',
    4: 'Cancelado'
  };


toggleClientes(id: string): void {
  if (this.clientesExpandidos.has(id)) {
    this.clientesExpandidos.delete(id);
  } else {
    this.clientesExpandidos.add(id);
  }
}

clientesEstaExpandido(id: string): boolean {
  return this.clientesExpandidos.has(id);
}
}