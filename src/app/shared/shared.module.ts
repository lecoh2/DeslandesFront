// src/app/shared/shared.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

/*import { BarrasComponent } from './components/graficos/reclamacao/barras.component';
import { GraficoAtendimentoComponent } from './components/graficos/atendimento/grafico-atendimento.component';
import { GraficoAudienciaComponent } from './components/graficos/audiencia/grafico-audiencia.component';
import { GraficoReclamacaoPizzaComponent } from './components/graficos/reclamacao-pizza/grafico-reclamacao-pizza.component';
import { GraficoPaBarrasComponent } from './components/graficos/pa/grafico-pa-barras.component';
import { GraficoNotificacaoComponent } from './components/graficos/notificacao/grafico-notificacao.component';
import { GraficoUsuarioAtendimentoComponent } from './components/graficos/usuarios/grafico-usuario-atendimento.component';
import { GraficoUsuarioAtendimentoAnualComponent } from './components/graficos/usuarios/grafico-anual/grafico-usuario-atendimento-anual.component';*/
import { NgxPaginationModule } from 'ngx-pagination';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { Spinner } from './components/spinner/spinner';
import { SpinnerConsulta } from './components/spinnerconsulta/spinnercontulta.';
import { Alerts } from './components/alerts/alerts';
import { LogoAnimada } from './components/logo-animada/logo-animada';


@NgModule({
  declarations: [
     Spinner,
    SpinnerConsulta,
    Alertst,
    LogoAnimada,
    TextoCnpi,
    ModalGeral

  ],
  imports: [CommonModule],
  exports: [
    Spinner,
    SpinnerConsulta,
    Alerts,
    LogoAnimada,
    TextoCnpiAnimado,
    ModalGeral,
  /*  BarrasComponent,
    GraficoAtendimentoComponent,
    GraficoAudienciaComponent,
    GraficoReclamacaoPizzaComponent,
    GraficoPaBarrasComponent,
    GraficoNotificacaoComponent,
    GraficoUsuarioAtendimentoComponent,
    GraficoUsuarioAtendimentoAnualComponent,*/
    NgxPaginationModule,
    MatPaginatorModule,
    MatTableModule

  ]
})
export class SharedModule { }