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
import { TarefaService } from '../../../../../core/services/tarefa.service';
import { forkJoin } from 'rxjs';

@Component({
    selector: 'app-agenda-eventos',
    standalone: false,
    templateUrl: './agenda-eventos.html',
    styleUrls: ['./agenda-eventos.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AgendaEventos implements OnInit {

    private eventoService = inject(EventoService);
    private tarefaService = inject(TarefaService);
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

            const p: any = info.event.extendedProps || {};
            const type = p['type'];

            if (type === 'evento') {
                info.el.title =
                    `${p['endereco'] ?? ''} | 👤 ${p['criador'] ?? ''}`;
            }

            if (type === 'tarefa') {
                info.el.title =
                    `${info.event.title} | Prioridade: ${p['prioridadeTexto'] ?? '-'}`;
            }
        },

       eventContent: (arg) => {

    const p: any = arg.event.extendedProps || {};
    const isEvento = p['type'] === 'evento';

    const cor = isEvento
        ? this.getCorStatus(Number(p['status'] ?? 0))
        : this.getCorPrioridade(Number(p['prioridade'] ?? 0));

    const label = isEvento ? 'Evento' : 'Tarefa';

    const subInfo = isEvento
        ? (p['endereco'] ?? '')
        : this.getPrioridadeTexto(Number(p['prioridade'] ?? 0));

    return {
        html: `
        <div style="
            font-size:12px;
            padding:6px 8px;
           
            background:#1f2937;
            color:#e5e7eb;
            border-left:4px solid ${cor};
            box-shadow:0 2px 6px rgba(0,0,0,.15);
            line-height:1.2;
        ">

            <div style="
                display:flex;
                align-items:center;
                justify-content:space-between;
                gap:6px;
                font-weight:600;
            ">
                <span style="
                    font-size:10px;
                    padding:2px 6px;
                   
                    background:${cor};
                    color:#fff;
                    text-transform:uppercase;
                    letter-spacing:.5px;
                ">
                    ${label}
                </span>

                <span style="flex:1; margin-left:6px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                    ${arg.event.title}
                </span>
            </div>

            <div style="
                font-size:11px;
                opacity:.8;
                margin-top:3px;
                white-space:nowrap;
                overflow:hidden;
                text-overflow:ellipsis;
            ">
                ${subInfo}
            </div>

        </div>
        `
    };
}
    };

    ngOnInit(): void {
        this.carregarAgenda();
    }

    // =========================
    // CLICK
    // =========================
    onEventClick(info: any) {

    const e = info.event;
    const p: any = e.extendedProps || {};

  const responsaveis = (p['responsaveis'] ?? []).map((r: any) => r.nomeUsuario);

this.ngZone.run(() => {

    this.eventoSelecionado = {
        id: e.id,
        titulo: e.title,
        start: e.start,
        end: e.end,

        type: p['type'],

        endereco: p['endereco'],
        criador: p['criador'],
        modalidade: p['modalidade'],
        status: p['status'],

        prioridade: p['prioridade'],
        prioridadeTexto: p['prioridadeTexto'],

        // 🔥 AQUI A CORREÇÃO REAL
        responsaveis: [...responsaveis]
    };

    this.eventoSelecionado = { ...this.eventoSelecionado };

    this.cdr.detectChanges();
});
}

    fecharSidebar() {
        this.eventoSelecionado = null;
        this.cdr.markForCheck();
    }

    // =========================
    // CARREGAR AGENDA
    // =========================
    carregarAgenda() {

        this.carregando = true;
        this.mensagemErro = [];

        forkJoin({
            eventos: this.eventoService.consultarEventoPaginado(1, 1000, this.filtro),
            tarefas: this.tarefaService.consultarTarefaPaginado(1, 1000, this.filtro)
        }).subscribe({
            next: ({ eventos, tarefas }) => {

                // =========================
                // EVENTOS
                // =========================
                const eventosMapeados = (eventos?.items ?? []).map((e: any) => {

                    const start = new Date(`${e.dataInicial}T${(e.horaInicial || '00:00:00').split('.')[0]}`);
                    const end = new Date(`${e.dataFinal}T${(e.horaFinal || '00:00:00').split('.')[0]}`);

                    return {
                        id: String(e.id),
                        title: e.titulo,
                        start,
                        end,

                        backgroundColor: this.getCorStatus(Number(e.statusGeralKanban ?? 0)),
                        borderColor: this.getCorStatus(Number(e.statusGeralKanban ?? 0)),

                        extendedProps: {
                            type: 'evento',
                            endereco: e.endereco,
                            modalidade: e.modalidade,
                            status: Number(e.statusGeralKanban ?? 0),
                            responsaveis: e.grupoEventoResponsavel,
                            criador: e.usuarioCriacao?.nomeUsuario
                        }
                    };
                });

                // =========================
                // TAREFAS (CORRIGIDO FINAL)
                // =========================
const tarefasMapeadas = (tarefas?.items ?? []).map((t: any) => {
    console.log('TAREFA RAW:', t);
    console.log('RESPONSAVEIS RAW:', t.grupoTarefaResponsaveis);

    const prioridade = Number(t.prioridade ?? 0);

    return {
        id: String(t.id),
        title: t.descricao,
        start: new Date(t.dataTarefa),

        backgroundColor: this.getCorPrioridade(prioridade),
        borderColor: this.getCorPrioridade(prioridade),

        extendedProps: {
            type: 'tarefa',

            prioridade,
            prioridadeTexto: this.getPrioridadeTexto(prioridade),

            status: Number(t.statusGeralKanban ?? 0),

            // 🔥 CORREÇÃO AQUI
            responsaveis: (t.grupoTarefaResponsaveis ?? []).map((r: any) => ({
                nomeUsuario: r.nome
            }))
        }
    };
});

                // =========================
                // AGENDA FINAL
                // =========================
                const agenda = [...eventosMapeados, ...tarefasMapeadas];

                this.calendarOptions = {
                    ...this.calendarOptions,
                    events: agenda
                };

                this.carregando = false;
                this.cdr.detectChanges();
            },

            error: (err) => {
                console.error(err);
                this.mensagemErro = ['Erro ao carregar agenda'];
                this.carregando = false;
                this.cdr.markForCheck();
            }
        });
    }

    // =========================
    // CORES
    // =========================
    getCorStatus(status: number): string {
        switch (Number(status)) {
            case 1: return '#3498db';
            case 2: return '#f39c12';
            case 3: return '#2ecc71';
            case 4: return '#e74c3c';
            default: return '#95a5a6';
        }
    }

    getCorPrioridade(prioridade: number): string {
        switch (Number(prioridade)) {
            case 1: return '#2ecc71';
            case 2: return '#f39c12';
            case 3: return '#e67e22';
            case 4: return '#e74c3c';
            default: return '#95a5a6';
        }
    }

    getPrioridadeTexto(prioridade: number): string {
        switch (Number(prioridade)) {
            case 1: return 'Baixa';
            case 2: return 'Média';
            case 3: return 'Alta';
            case 4: return 'Urgente';
            default: return 'Desconhecida';
        }
    }

    getStatusTexto(valor: number): string {
        switch (Number(valor)) {
            case 1: return 'A fazer';
            case 2: return 'Em andamento';
            case 3: return 'Concluído';
            case 4: return 'Cancelado';
            default: return 'Desconhecido';
        }
    }
    getModalidadeTexto(valor: number): string {
    switch (Number(valor)) {
        case 1: return 'Presencial';
        case 2: return 'Online';
        case 3: return 'Híbrido';
        case 4: return 'Não se aplica';
        default: return 'Desconhecido';
    }
}
}