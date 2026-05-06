import { AfterViewInit, Component, inject, OnDestroy } from '@angular/core';
import { Chart } from 'chart.js/auto';

import { DashboardService } from '../../../../core/services/dashboard.service';
import { CasoAgrupadoResponse } from '../../../../core/models/caso/caso-agrupado-response';

@Component({
  selector: 'app-graficoCaso',
  standalone: false,
  template: `
   <div class="row card-grafico">
    <div class="col-12 chart-container">
      <canvas id="chartjs-dashboard-graficoCaso"></canvas>
    </div>

    <div class="col-12 mt-3 table-area">
      <table class="table table-striped mb-0">
        <thead>
          <tr>
            <th>Mês</th>
            <th class="text-end">Quantidade</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let item of tabelaDados">
            <td>
              <i class="fas fa-square-full" [ngStyle]="{'color': item.cor}"></i>
              {{ item.label }}
            </td>
            <td class="text-end">{{ item.quantidade }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
  `,
  styleUrls: ['./grafico-caso.css']
})
export class GraficoCaso implements AfterViewInit, OnDestroy {
  private chart!: Chart;
  private dashbordService = inject(DashboardService);

  // ✅ agora coerente com uso
  tabelaDados: { label: string; quantidade: number; cor: string }[] = [];

  private coresBase = [
    '#DAA520', '#20B2AA', '#FF1493', '#00FA9A',
    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
    '#9966FF', '#FF9F40', '#8A2BE2','#FF4500',
  ];

  ngAfterViewInit(): void {
    this.dashbordService.getGraficoCaso().subscribe((data: CasoAgrupadoResponse[]) => {
      if (!data || data.length === 0) return;

      const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
                     'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

      const dadosOrdenados = [...data].sort((a, b) => a.mes - b.mes);

      const labels: string[] = [];
      const valores: number[] = [];
      const cores: string[] = [];

      for (let mes = 1; mes <= 12; mes++) {
        const item = dadosOrdenados.find(d => d.mes === mes);

        labels.push(meses[mes - 1]);
        valores.push(item?.quantidade ?? 0);

        // ✅ define cor por mês
        cores.push(this.coresBase[(mes - 1) % this.coresBase.length]);
      }

      // ✅ tabela com cor
      this.tabelaDados = labels.map((label, index) => ({
        label,
        quantidade: valores[index],
        cor: cores[index]
      }));

      this.createChart(labels, valores, cores);
    });
  }

  private createChart(labels: string[], valores: number[], cores: string[]): void {
    const ctx = document.getElementById('chartjs-dashboard-graficoCaso') as HTMLCanvasElement;

    this.chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          label: 'Casos por mês',
          data: valores,
          backgroundColor: cores,
          borderColor: cores,
          borderWidth: 1
        }]
      },
      options: {
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }
}