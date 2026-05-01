import { RouterModule, Routes } from "@angular/router";
import { PainelPrincipal } from "./components/painel-principal/painel-principal";
import { NgModule } from "@angular/core";


//import { EditarTipoTriagemComponent } from "./components/tipo-triagem/editar-tipo-triagem/editar-tipo-triagem.component";
import { AuthGuard } from "../../core/guards/auth.guard";
import { NivelGuard } from "../../core/guards/nivel.guard";
import { AdminLayout } from "./layouts/layouts/admin-layout/admin-layout";
import { CadastrarPessoas } from "./components/pessoa/cadastrar-pessoa/cadastrar-pessoas";
import { ConsultarPessoas } from "./components/pessoa/consultar-pessoas/consultar-pessoas";
import { CadastrarProcesso } from "./components/processo/cadastrar-processo/cadastrar-processo";
import { CadastrarAtendimento } from "./components/atendimento/cadastrar-atendimento/cadastrar-atendimento";
import { CadastrarCaso } from "./components/caso/cadastrar-caso/cadastrar-caso";
import { GestaoAtividades } from "./components/gestao-atividades/gestao-atividades";
import { CadastrarTarefa } from "./components/tarefa/cadastrar-tarefa/cadastar-tarefa/cadastar-tarefa";
import { CadastrarEvento } from "./components/evento/cadastrar-evento/cadastrar-evento";
import { EditarTarefa } from "./components/tarefa/editar-tarefa/editar-tarefa";
import { EditarEvento } from "./components/evento/editar-evento/editar-evento";
import { ConsultarAtendimento } from "./components/atendimento/consultar-atendimento/consultar-atendimento";
import { EditarAtendimento } from "./components/atendimento/editar-atendimento/editar-atendimento";
import { ConsultarCaso } from "./components/caso/consultar-caso/consultar-caso";
import { ConsultarProcesso } from "./components/processo/consultar-processo/consultar-processo";
import { EditarCaso } from "./components/caso/editar-caso/editar-caso";
import { EditarProcesso } from "./components/processo/editar-processo/editar-processo";
import { ConsultarTarefa } from "./components/tarefa/consultar-tarefa/consultar-tarefa";
import { ConsultarEvento } from "./components/evento/consultar-evento/consultar-evento";
import { AgendaEventos } from "./components/evento/agenda-evento/agenda-eventos";
import { Calendario } from "./components/calendario/calendario";
//import { CriarUsuario } from "./components/usuario/criar-usuario/criar-usuario";


export const routes: Routes = [
    {
        path: '',
        component: AdminLayout,
        children: [

            {
                path: 'painel-principal',
                component: PainelPrincipal,
                canActivate: [AuthGuard] // apenas logado
            },
               //pessoas
            {
                path: 'cadastrar-pessoas',
                component: CadastrarPessoas,
                canActivate: [AuthGuard, NivelGuard],
                data: { niveis: ['Super Administrador', 'Administrador', 'Administração', 'Coordenador', 'Conciliador', 'Estagiários'] }

            },
            {
                path: 'consultar-pessoas',
                component: ConsultarPessoas,
                canActivate: [AuthGuard, NivelGuard],
                data: { niveis: ['Super Administrador', 'Administrador', 'Administração', 'Coordenador', 'Conciliador', 'Estagiários'] }

            },
//processo
              {
                path: 'cadastrar-processo',
                component: CadastrarProcesso,
                canActivate: [AuthGuard, NivelGuard],
                data: { niveis: ['Super Administrador', 'Administrador', 'Administração', 'Coordenador', 'Conciliador', 'Estagiários'] }

            },{
              path: 'editar-processo/:id',
                component: EditarProcesso,
                canActivate: [AuthGuard, NivelGuard],
                data: { niveis: ['Super Administrador', 'Administrador', 'Administração', 'Coordenador', 'Conciliador', 'Estagiários'] }

            },
            {
                path: 'consultar-processo',
                component: ConsultarProcesso,
                canActivate: [AuthGuard, NivelGuard],
                data: { niveis: ['Super Administrador', 'Administrador', 'Administração', 'Coordenador', 'Conciliador', 'Estagiários'] }

            },
            //atendmento
              {
                path: 'cadastrar-atendimento',
                component: CadastrarAtendimento,
                canActivate: [AuthGuard, NivelGuard],
                data: { niveis: ['Super Administrador', 'Administrador', 'Administração', 'Coordenador', 'Conciliador', 'Estagiários'] }
            },
               {
                path: 'consultar-atendimento',
                component: ConsultarAtendimento,
                canActivate: [AuthGuard, NivelGuard],
                data: { niveis: ['Super Administrador', 'Administrador', 'Administração', 'Coordenador', 'Conciliador', 'Estagiários'] }

            },     {
                path: 'editar-atendimento/:id',
                component: EditarAtendimento,
                canActivate: [AuthGuard, NivelGuard],
                data: { niveis: ['Super Administrador', 'Administrador', 'Administração', 'Coordenador', 'Conciliador', 'Estagiários'] }

            },
               //ação
              {
                path: 'cadastrar-caso',
                component: CadastrarCaso,
                canActivate: [AuthGuard, NivelGuard],
                data: { niveis: ['Super Administrador', 'Administrador', 'Administração', 'Coordenador', 'Conciliador', 'Estagiários'] }

            },{
                path: 'consultar-caso',
                component: ConsultarCaso,
                canActivate: [AuthGuard, NivelGuard],
                data: { niveis: ['Super Administrador', 'Administrador', 'Administração', 'Coordenador', 'Conciliador', 'Estagiários'] }

            },
                {
                path: 'editar-caso/:id',
                component: EditarCaso,
                canActivate: [AuthGuard, NivelGuard],
                data: { niveis: ['Super Administrador', 'Administrador', 'Administração', 'Coordenador', 'Conciliador', 'Estagiários'] }

            },
               //tarefa
              {
                path: 'cadastrar-tarefa',
                component: CadastrarTarefa,
                canActivate: [AuthGuard, NivelGuard],
                data: { niveis: ['Super Administrador', 'Administrador', 'Administração', 'Coordenador', 'Conciliador', 'Estagiários'] }

            },    //tarefa
              {
                path: 'editar-tarefa/:id',
                component: EditarTarefa,
                canActivate: [AuthGuard, NivelGuard],
                data: { niveis: ['Super Administrador', 'Administrador', 'Administração', 'Coordenador', 'Conciliador', 'Estagiários'] }

            },
               {
                path: 'consultar-tarefa',
                component: ConsultarTarefa,
                canActivate: [AuthGuard, NivelGuard],
                data: { niveis: ['Super Administrador', 'Administrador', 'Administração', 'Coordenador', 'Conciliador', 'Estagiários'] }

            },
                {
                path: 'cadastrar-evento',
                component: CadastrarEvento,
                canActivate: [AuthGuard, NivelGuard],
                data: { niveis: ['Super Administrador', 'Administrador', 'Administração', 'Coordenador', 'Conciliador', 'Estagiários'] }

            }, {
                path: 'editar-evento/:id',
                component: EditarEvento,
                canActivate: [AuthGuard, NivelGuard],
                data: { niveis: ['Super Administrador', 'Administrador', 'Administração', 'Coordenador', 'Conciliador', 'Estagiários'] }

            },
              {
                path: 'consultar-evento',
                component: ConsultarEvento,
                canActivate: [AuthGuard, NivelGuard],
                data: { niveis: ['Super Administrador', 'Administrador', 'Administração', 'Coordenador', 'Conciliador', 'Estagiários'] }

            },
              {
                path: 'agenda-eventos',
                component: AgendaEventos,
                canActivate: [AuthGuard, NivelGuard],
                data: { niveis: ['Super Administrador', 'Administrador', 'Administração', 'Coordenador', 'Conciliador', 'Estagiários'] }

            },
             //atividades
              {
                path: 'gestao-atividades',
                component: GestaoAtividades,
                canActivate: [AuthGuard, NivelGuard],
                data: { niveis: ['Super Administrador', 'Administrador', 'Administração', 'Coordenador', 'Conciliador', 'Estagiários'] }

            },

            { path: '', redirectTo: 'painel-principal', pathMatch: 'full' }
        ]
    }
];
@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AdminRoutingModule { }