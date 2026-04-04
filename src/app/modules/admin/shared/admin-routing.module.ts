import { RouterModule, Routes } from "@angular/router";
import { PainelPrincipalComponent } from "./components/painel-principal/painel-principal";
//import { CadastrarTipoTriagemComponent } from "./components/tipo-triagem/cadastrar-tipo-triagem/cadastrar-tipo-triagem.component";
//import { ConsultarTipoTriagemComponent } from "./components/tipo-triagem/consultar-tipo-triagem/consultar-tipo-triagem.component";
//import { CadastrarTriagemComponent } from "./components/triagem/cadastrar-triagem/cadastrar-triagem.component";
import { NgModule } from "@angular/core";

import { AdminLayoutComponent } from "./layouts/admin-layout/admin-layout";
import { AuthGuard } from "../../../core/guards/auth.guard";

export const routes: Routes = [
    {
        path: '',
        component: AdminLayoutComponent,
        children: [

            {
                path: 'painel-principal',
                component: PainelPrincipalComponent,
                canActivate: [AuthGuard] // apenas logado
            },
            //tipo triagem
            {
                path: 'cadastrar-tipo-triagem',
              //  component: CadastrarTipoTriagemComponent
            },
            {
                path: 'consultar-tipo-triagem',
              //  component: ConsultarTipoTriagemComponent
            },
            {
                path: 'editar-tipo-triagem/:id',
              //  component: EditarTipoTriagemComponent
            },
            //triagem
            {
                path: 'cadastrar-triagem',
               // component: CadastrarTriagemComponent
            },
            {
                path: 'consultar-triagem',
              //  component: ConsultarTriagemComponent
            },
            {
                path: 'editar-triagem/:id',
              //  component: EditarTriagemComponent
            },
            //pessoas
            {
                path: 'cadastrar-pessoas',
                //component: CadastrarPessoaComponent,
              //  canActivate: [AuthGuard, NivelGuard],
              //  data: { niveis: ['Super Administrador', 'Administrador', 'Administração', 'Coordenador', 'Conciliador', 'Estagiários'] }

            },
            {
                path: 'consultar-pessoas',
              //  component: ConsultarPessoasComponent,
              //  canActivate: [AuthGuard, NivelGuard],
//data: { niveis: ['Super Administrador', 'Administrador', 'Administração', 'Coordenador', 'Conciliador', 'Estagiários'] }

            },
            {
                path: 'editar-pessoa-fisica/:id',
               // component: EditarPessoaFisicaComponent,
               // canActivate: [AuthGuard, NivelGuard],
               // data: { niveis: ['Super Administrador', 'Administrador', 'Administração', 'Coordenador', 'Conciliador', 'Estagiários'] }

            },
            {
                path: 'editar-pessoa-juridica/:id',
              //  component: EditarPessoaJuridicaComponent,
              //  canActivate: [AuthGuard, NivelGuard],
                data: { niveis: ['Super Administrador', 'Administrador', 'Administração', 'Coordenador', 'Conciliador', 'Estagiários'] }

            },
            {
                path: 'abrir-reclamacao',
               // component: AbrirReclamacaoComponent,
              //  canActivate: [AuthGuard, NivelGuard],
              //  data: { niveis: ['Super Administrador', 'Administrador', 'Administração', 'Coordenador', 'Conciliador', 'Estagiários'] }
            },
            {
                path: 'consultar-reclamacao',
               // component: ConsultarReclamacaoComponent,
              //  canActivate: [AuthGuard, NivelGuard],
                data: { niveis: ['Super Administrador', 'Administrador', 'Administração', 'Coordenador', 'Conciliador', 'Estagiários'] }
            },
            {
                path: 'editar-reclamacao/:id',
               // component: EditarReclamacaoComponent,
              //  canActivate: [AuthGuard, NivelGuard],
                data: { niveis: ['Super Administrador', 'Administrador', 'Administração', 'Coordenador', 'Conciliador', 'Estagiários'] }

            },
            {
                path: 'cadastrar-audiencia',
              //  component: CadastrarAudienciaComponent,
//canActivate: [AuthGuard, NivelGuard],
                data: { niveis: ['Super Administrador', 'Administrador', 'Administração', 'Coordenador', 'Conciliador'] }

            },
            {
                path: 'visualizar-calendario-audiencia',
               // component: VisualizarCalendarioAudienciaComponent,
               // canActivate: [AuthGuard, NivelGuard],
                data: { niveis: ['Super Administrador', 'Administrador', 'Administração', 'Coordenador', 'Conciliador'] }

            },
            {
                path: 'consultar-audiencia',
              //  component: ConsultarAudienciaComponent,
              //  canActivate: [AuthGuard, NivelGuard],
                data: { niveis: ['Super Administrador', 'Administrador', 'Administração', 'Coordenador', 'Conciliador'] }

            },
            {
                path: 'editar-audiencia/:id',
             //   component: EditarAudienciaComponent,
            //    canActivate: [AuthGuard, NivelGuard],
                data: { niveis: ['Super Administrador', 'Administrador', 'Administração', 'Coordenador', 'Conciliador'] }

            },
            {
                path: 'abrir-atendimento',
              //  component: AbrirAtendimentoComponent,
             //   canActivate: [AuthGuard, NivelGuard],
                data: { niveis: ['Super Administrador', 'Administrador', 'Administração', 'Coordenador', 'Conciliador', 'Estagiários'] }

            },
            {
            //    path: 'consultar-atendimento',
             //   component: ConsultarAtendimentoComponent,
             //   canActivate: [AuthGuard, NivelGuard],
                data: { niveis: ['Super Administrador', 'Administrador', 'Administração', 'Coordenador', 'Conciliador', 'Estagiários'] }

            },
                 {
                path: 'consultar-atendimento-pj',
              //  component: ConsultarAtendimentoPJComponent,
             //   canActivate: [AuthGuard, NivelGuard],
                data: { niveis: ['Super Administrador', 'Administrador', 'Administração', 'Coordenador', 'Conciliador', 'Estagiários'] }

            },
            {
                path: 'editar-atendimento/:id',
            //    component: EditarAtendimentoComponent,
             //   canActivate: [AuthGuard, NivelGuard],
            //    data: { niveis: ['Super Administrador', 'Administrador', 'Administração', 'Coordenador', 'Conciliador', 'Estagiários'] }

            },   {
                path: 'editar-atendimento-pj/:id',
               // component: EditarAtendimentoPJComponent,
//canActivate: [AuthGuard, NivelGuard],
                data: { niveis: ['Super Administrador', 'Administrador', 'Administração', 'Coordenador', 'Conciliador', 'Estagiários'] }

            },
            {
                path: 'cadastrar-pa',
              //  component: CadastarPaComponent,
              //  canActivate: [AuthGuard, NivelGuard],
                data: { niveis: ['Super Administrador', 'Administrador', 'Administração', 'Coordenador', 'Conciliador', 'Fiscal'] }
            },
            {
                path: 'consultar-pa',
               // component: ConsultarPaComponent,
               // canActivate: [AuthGuard, NivelGuard],
                data: { niveis: ['Super Administrador', 'Administrador', 'Administração', 'Coordenador', 'Conciliador', 'Fiscal'] }
            },
            {
                path: 'editar-pa/:id',
              //  component: EditarPaComponent,
              //  canActivate: [AuthGuard, NivelGuard],
                data: { niveis: ['Super Administrador', 'Administrador', 'Administração', 'Coordenador', 'Conciliador', 'Fiscal'] }
            },
            {
                path: 'cadastrar-notificacao',
              //  component: CadastrarNotificacaoComponent,
              //  canActivate: [AuthGuard, NivelGuard],
                data: { niveis: ['Super Administrador', 'Administrador', 'Administração', 'Coordenador', 'Conciliador', 'Fiscal'] } // quem pode acessar

            }, {
                path: 'consultar-notificacao',
              //  component: ConsultarNotificacaoComponent,
              //  canActivate: [AuthGuard, NivelGuard],
                data: { niveis: ['Super Administrador', 'Administrador', 'Administração', 'Coordenador', 'Conciliador', 'Fiscal'] } // quem pode acessar

            }, {
                path: 'editar-notificacao/:id',
              //  component: EditarNotificacaoComponent,
              //  canActivate: [AuthGuard, NivelGuard],
                data: { niveis: ['Super Administrador', 'Administrador', 'Administração', 'Coordenador', 'Conciliador', 'Fiscal'] } // quem pode acessar

            },
            {
                path: 'cadastrar-artigo',
                //component: CadastrarArtigoComponent,
              //  canActivate: [AuthGuard, NivelGuard],
                data: { niveis: ['Super Administrador', 'Administrador', 'Administração', 'Coordenador', 'Conciliador'] } // quem pode acessar
            }, {
                path: 'consultar-artigo',
               /// component: ConsultarArtigoComponent,
              //  canActivate: [AuthGuard, NivelGuard],
                data: { niveis: ['Super Administrador', 'Administrador', 'Administração', 'Coordenador', 'Conciliador'] } // quem pode acessar
            }, {
                path: 'editar-artigo/:id',
               //   component: EditarArtigoComponent,
               //   canActivate: [AuthGuard, NivelGuard],
                data: { niveis: ['Super Administrador', 'Administrador', 'Administração', 'Coordenador', 'Conciliador'] } // quem pode acessar
            },
            {
                path: 'criar-usuario',
               //   component: CriarUsuarioComponent,
               //   canActivate: [AuthGuard, NivelGuard],
                data: { niveis: ['Super Administrador', 'Administrador'] } // quem pode acessar
            },
            {
                path: 'consultar-usuarios',
              //    component: ConsultarUsuariosComponent,
              //    canActivate: [AuthGuard, NivelGuard],
                data: { niveis: ['Super Administrador', 'Administrador'] } // quem pode acessar
            }, {
                path: 'editar-usuario/:id',
               //   component: EditarUsuarioComponent,
               //  canActivate: [AuthGuard, NivelGuard],
                data: { niveis: ['Super Administrador', 'Administrador'] } // quem pode acessar
            },
            {
                path: 'perfil',
               //   component: PerfilComponent,
               //   canActivate: [AuthGuard, NivelGuard],
                data: { niveis: ['Super Administrador', 'Administrador', 'Administração', 'Coordenador', 'Conciliador', 'Estagiários'] }
                // quem pode acessar
            }
            ,
            {
                path: 'cadastrar-denuncia',
               //   component: CadastrarDenunciaComponent,
               //   canActivate: [AuthGuard, NivelGuard],
                data: { niveis: ['Super Administrador', 'Administrador', 'Administração', 'Coordenador', 'Conciliador'] } // quem pode acessar
            },
              {
                path: 'consultar-denuncia',
               //   component: ConsultarDenunciaComponent,
              //    canActivate: [AuthGuard, NivelGuard],
                data: { niveis: ['Super Administrador', 'Administrador', 'Administração', 'Coordenador', 'Conciliador'] }

            },{
                path: 'editar-denuncia/:id',
               //   component: EditarDenunciaComponent,
               //   canActivate: [AuthGuard, NivelGuard],
               data: { niveis: ['Super Administrador', 'Administrador', 'Administração', 'Coordenador', 'Conciliador'] }
          },

          {
               path: 'consultas-estagiarios',
                //  component: ConsultasEstagiariosComponent,
              //    canActivate: [AuthGuard, NivelGuard],
                data: { niveis: ['Super Administrador', 'Administrador', 'Administração', 'Coordenador', 'Conciliador', ] }

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