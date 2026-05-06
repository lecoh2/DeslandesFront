import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';

// 👇 IMPORTAR ISSO
import { NgxMaskDirective, NgxMaskPipe } from 'ngx-mask';

import { Spinner } from './components/spinner/spinner';
import { SpinnerConsulta } from './components/spinnerconsulta/spinnercontulta.';
import { Alerts } from './components/alerts/alerts';
import { LogoAnimada } from './components/logo-animada/logo-animada';
import { TextoDeslandesAnimado } from './components/texto-deslandes-animado/texto-deslandes-animado';
import { ModalGeral } from './components/modal-geral/modal-geral';
import { AutocompletePessoa } from '../modules/admin/components/autocomplete-pessoas/autocomplete-pessoas';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GraficoAtendimento } from './components/graficos/atendimento/grafico-atendimento';
import { GraficoProcesso } from './components/graficos/processo/grafico-processo';
import { GraficoCaso } from './components/graficos/caso/grafico-caso';


@NgModule({
  declarations: [
    Spinner,
    SpinnerConsulta,
    LogoAnimada,
    Alerts,
    TextoDeslandesAnimado,
    ModalGeral,
    GraficoAtendimento,
    GraficoProcesso,
    GraficoCaso,

  ],
  imports: [
    CommonModule,
    NgxPaginationModule,
    MatPaginatorModule,
    MatTableModule,

   
    // 👇 ADICIONA AQUI
    NgxMaskDirective,
    NgxMaskPipe,
    FormsModule,            // 🔥 ESSENCIAL
    ReactiveFormsModule
  ],
  exports: [
    Spinner,
    SpinnerConsulta,
    Alerts,
    LogoAnimada,
    TextoDeslandesAnimado,
    ModalGeral,
    GraficoAtendimento,
    GraficoProcesso,
    GraficoCaso,



    NgxPaginationModule,
    MatPaginatorModule,
    MatTableModule,

    // 👇 EXPORTA TAMBÉM (IMPORTANTE!)
    NgxMaskDirective,
    NgxMaskPipe
  ]
})
export class SharedModule { }