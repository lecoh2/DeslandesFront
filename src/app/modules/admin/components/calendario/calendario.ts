import { Component, OnInit, inject } from '@angular/core';
import { CalendarOptions } from '@fullcalendar/core';
import ptBrLocale from '@fullcalendar/core/locales/pt-br';

import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

import { EventoService } from '../../../../core/services/evento.service';

@Component({
  selector: 'app-calendario',
  standalone:false,
  templateUrl: './calendario.html',
})
export class Calendario implements OnInit {

  private eventoService = inject(EventoService);

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],

    initialView: 'dayGridMonth',

    locale: ptBrLocale,

    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },

    buttonText: {
      today: 'Hoje',
      month: 'Mês',
      week: 'Semana',
      day: 'Dia'
    },

    height: 'auto',

    editable: false,
    selectable: true,

    events: [],

    eventClick: (info) => {
      alert(`📅 Evento: ${info.event.title}`);
    },

    dateClick: (info) => {
      console.log('Data clicada:', info.dateStr);
    }
  };

  ngOnInit(): void {
    this.carregarEventos();
  }

  carregarEventos() {
    this.eventoService.consultarEventoPaginado(1, 100).subscribe({
      next: (res: any) => {

        console.log('EVENTOS BACKEND:', res.items);

        const eventos = res.items.map((e: any) => {

          const inicio = this.converterParaDate(e.dataInicial, e.horaInicial);
          const fim = this.converterParaDate(e.dataFinal, e.horaFinal);

          return {
            id: e.id,
            title: e.titulo,
            start: inicio,
            end: fim,
            allDay: e.diaInteiro,

            extendedProps: {
              endereco: e.endereco,
              modalidade: e.modalidade
            }
          };
        });

        console.log('EVENTOS FORMATADOS:', eventos);

        // 🔥 atualização correta (evita bug Angular)
        this.calendarOptions = {
          ...this.calendarOptions,
          events: eventos
        };
      },
      error: (err) => {
        console.error('Erro ao carregar eventos', err);
      }
    });
  }

  // 🚀 CONVERSÃO CORRETA (AQUI É O SEGREDO)
  converterParaDate(data: string, hora: string): Date {

    if (!data) return null as any;

    if (!hora || hora === '00:00:00') {
      return new Date(data + 'T00:00:00');
    }

    // remove milissegundos quebrados tipo .9999999
    const horaLimpa = hora.split('.')[0];

    return new Date(`${data}T${horaLimpa}`);
  }
}