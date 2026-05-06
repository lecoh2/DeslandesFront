import { AfterViewInit, Component, inject, OnDestroy } from '@angular/core';
import { Chart } from 'chart.js/auto';


import { DashboardService } from '../../../../core/services/dashboard.service';
import { AtendimentoAgrupadoResponse } from '../../../../core/models/atendimento/atendimento-agrupodo-response';

@Component({
  selector: 'app-graficoAtendimento',
  standalone: false,
  template: `
   <div class="row card-grafico">
  <div class="col-12 chart-container">
    <canvas id="chartjs-dashboard-graficoAtendimento"></canvas>
  </div>

  <div class="col-12 mt-3 table-area">
    <table class="table table-striped mb-0">
      <thead>
        <tr>
          <th>Mês / Tipo</th>
          <th class="text-end">Quantidade</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let item of tabelaDados">
          <td>
            <i class="fas fa-square-full" [ngStyle]="{'color': item.cor}"></i> {{ item.label }}
          </td>
          <td class="text-end">{{ item.quantidade }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>

  `,
  styleUrls: ['./grafico-atendimento.css']
})
export class GraficoAtendimento implements AfterViewInit, OnDestroy {
  private chart!: Chart;
  private dashbordService = inject(DashboardService);

  tabelaDados: { label: string; quantidade: number; cor: string }[] = [];

  private coresBase = [
    '#FF4500', '#DAA520', '#20B2AA', '#FF1493',
    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
    '#9966FF', '#FF9F40', '#8A2BE2', '#00FA9A',
    
  ];

  ngAfterViewInit(): void {
    this.dashbordService.getGraficoAtendimento().subscribe((data: AtendimentoAgrupadoResponse[]) => {
      if (!data || data.length === 0) return;

      const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

      // --- Filtra dados válidos (tipo existente e quantidade > 0)
      const dadosValidos = data.filter(d => d.tipo && d.tipo.trim() !== '' && d.quantidade > 0 && d.mes >= 1 && d.mes <= 12);

      // --- Cores por tipo
      const tipos = Array.from(new Set(dadosValidos.map(d => d.tipo)));
      const corPorTipo = new Map<string, string>();
      tipos.forEach((tipo, index) => corPorTipo.set(tipo, this.coresBase[index % this.coresBase.length]));

      const labels: string[] = [];
      const valores: number[] = [];
      const cores: string[] = [];

      // --- Agrupamento para tabela
      const agrupadoPorLabel = new Map<string, number>();

      dadosValidos.forEach(d => {
        const label = `${meses[d.mes - 1]} / ${d.tipo}`;

        // Gráfico
        labels.push(label);
        valores.push(d.quantidade);
        cores.push(corPorTipo.get(d.tipo)!);

        // Tabela
        agrupadoPorLabel.set(label, (agrupadoPorLabel.get(label) ?? 0) + d.quantidade);
      });

      // --- Monta tabela
      this.tabelaDados = Array.from(agrupadoPorLabel.entries()).map(([label, quantidade]) => ({
        label,
        quantidade,
        cor: corPorTipo.get(label.split(' / ')[1])! // pega o tipo para a cor
      }));

      this.createChart(labels, valores, cores);
    });
  }

  private createChart(labels: string[], valores: number[], cores: string[]): void {
    const ctx = document.getElementById('chartjs-dashboard-graficoAtendimento') as HTMLCanvasElement;
    this.chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data: valores,
          backgroundColor: cores,
          borderColor: cores
        }]
      },
      options: {
        maintainAspectRatio: false,
        plugins: { legend: { display: false } }
      }
    });
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }
}
