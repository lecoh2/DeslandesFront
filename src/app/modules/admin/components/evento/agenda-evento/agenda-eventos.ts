import {
    Component,
    OnInit,
    inject,
    NgZone,
    ChangeDetectorRef,
    ChangeDetectionStrategy
} from '@angular/core';

import { CalendarOptions } from '@fullcalendar/core';
import ptBrLocale from '@fullcalendar/core/locales/pt-br';

import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

import { EventoService } from '../../../../../core/services/evento.service';

@Component({
    selector: 'app-agenda-eventos',
    standalone:false,
    templateUrl: './agenda-eventos.html',
    styleUrls: ['./agenda-eventos.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AgendaEventos implements OnInit {

    private eventoService = inject(EventoService);
    private ngZone = inject(NgZone);
    private cdr = inject(ChangeDetectorRef);

    eventoSelecionado: any = null;

    carregando = false;
    mensagemErro: string[] = [];
    filtro = '';

    calendarOptions: CalendarOptions = {
        plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],

        initialView: 'dayGridMonth',

        locales: [ptBrLocale],
        locale: 'pt-br',
        firstDay: 1,

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

        height: 700,
        expandRows: true,

        editable: false,
        selectable: true,

        events: [],

        eventClick: (info) => this.onEventClick(info),

        eventDidMount: (info) => {
            const props = info.event.extendedProps;
            info.el.title = `${props['endereco']} | ${props['criador']}`;
        },

        eventContent: (arg) => {
            const props = arg.event.extendedProps;

            return {
                html: `
                    <div style="font-size:12px; line-height:1.4; padding:2px">
                        <div style="font-weight:600;">
                            ${arg.event.title}
                        </div>
                        <div>
                            📍 ${props['endereco'] || ''}
                        </div>
                    </div>
                `
            };
        },

        dateClick: (info) => {
            console.log('Data clicada:', info.dateStr);
        }
    };

    ngOnInit(): void {
        this.carregarEventos();
    }

    // =========================
    // CLICK EVENTO (CORRIGIDO)
    // =========================
    onEventClick(info: any) {

        const e = info.event;

        const evento = {
            id: e.id,
            titulo: e.title,
            endereco: e.extendedProps?.['endereco'] ?? '',
            criador: e.extendedProps?.['criador'] ?? '',
            modalidade: e.extendedProps?.['modalidade'],
            status: e.extendedProps?.['status'],
            responsaveis: e.extendedProps?.['responsaveis'] ?? [],
            start: e.start,
            end: e.end
        };

        this.ngZone.run(() => {

            this.eventoSelecionado = evento;

            // 🔥 garante atualização imediata no OnPush
            this.cdr.markForCheck();

            console.log('EVENTO SELECIONADO:', this.eventoSelecionado);
        });
    }

    fecharSidebar() {
        this.eventoSelecionado = null;
        this.cdr.markForCheck();
    }

    // =========================
    // CARREGAR EVENTOS
    // =========================
    carregarEventos() {

        this.carregando = true;
        this.mensagemErro = [];

        this.eventoService
            .consultarEventoPaginado(1, 1000, this.filtro)
            .subscribe({
                next: (res: any) => {

                    const eventos = (res.items || []).map((e: any) => {

                        const start = new Date(`${e.dataInicial}T${(e.horaInicial || '00:00:00').split('.')[0]}`);
                        const end = new Date(`${e.dataFinal}T${(e.horaFinal || '00:00:00').split('.')[0]}`);

                        return {
                            id: e.id,
                            title: e.titulo,
                            start,
                            end,
                            allDay: e.diaInteiro,

                            backgroundColor: this.getCorStatus(e.statusGeralKanban),
                            borderColor: this.getCorStatus(e.statusGeralKanban),

                            extendedProps: {
                                endereco: e.endereco,
                                modalidade: e.modalidade,
                                status: e.statusGeralKanban,
                                responsaveis: e.grupoEventoResponsavel,
                                criador: e.usuarioCriacao?.nomeUsuario
                            }
                        };
                    });

                    this.calendarOptions = {
                        ...this.calendarOptions,
                        events: eventos
                    };

                    this.carregando = false;
                    this.cdr.markForCheck();
                },
                error: () => {
                    this.mensagemErro = ['Erro ao carregar eventos'];
                    this.carregando = false;
                    this.cdr.markForCheck();
                }
            });
    }

    // =========================
    // CORES STATUS
    // =========================
    getCorStatus(status: number): string {
        switch (status) {
            case 1: return '#3498db';
            case 2: return '#f39c12';
            case 3: return '#2ecc71';
            case 4: return '#e74c3c';
            default: return '#95a5a6';
        }
    }

    getModalidadeTexto(valor: number): string {
        switch (valor) {
            case 1: return 'Presencial';
            case 2: return 'Online';
            case 3: return 'Híbrido';
            case 4: return 'Não se aplica';
            default: return 'Desconhecido';
        }
    }

    getStatusTexto(valor: number): string {
        switch (valor) {
            case 1: return 'A fazer';
            case 2: return 'Em andamento';
            case 3: return 'Concluído';
            case 4: return 'Cancelado';
            default: return 'Desconhecido';
        }
    }
}