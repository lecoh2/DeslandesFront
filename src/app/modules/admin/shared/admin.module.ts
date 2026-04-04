import { NgModule } from "@angular/core";
import { PainelPrincipalComponent } from "./components/painel-principal/painel-principal.component";
import { CadastrarTipoTriagemComponent } from "./components/tipo-triagem/cadastrar-tipo-triagem/cadastrar-tipo-triagem.component";
import { ConsultarTipoTriagemComponent } from "./components/tipo-triagem/consultar-tipo-triagem/consultar-tipo-triagem.component";
import { EditarTipoTriagemComponent } from "./components/tipo-triagem/editar-tipo-triagem/editar-tipo-triagem.component";
import { AdminRoutingModule } from "./admin-routing.module";
import { SiderbarComponent } from "./shared/siderbar/siderbar.component";
import { NavbarComponent } from "./shared/navbar/navbar.component";
import { FooterComponent } from "./shared/footer/footer.component";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { AdminLayoutComponent } from "./layouts/admin-layout/admin-layout.component";
import { SharedModule } from "../../shared/shared.module";
import { CadastrarTriagemComponent } from "./components/triagem/cadastrar-triagem/cadastrar-triagem.component";
import { ConsultarTriagemComponent } from "./components/triagem/consultar-triagem/consultar-triagem.component";
import { EditarTriagemComponent } from "./components/triagem/editar-triagem/editar-triagem.component";
import { CadastrarPessoaComponent } from "./components/pessoa/cadastrar-pessoa/cadastrar-pessoas.component";
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { ConsultarPessoasComponent } from "./components/pessoa/consultar-pessoas/consultar-pessoas.component";
import { EditarPessoaFisicaComponent } from "./components/pessoa/editar-pessoa-fisica/editar-pessoa-fisica.component";
import { EditarPessoaJuridicaComponent } from "./components/pessoa/editar-pessoa-juridica/editar-pessoa-juridica.component";
import { AbrirReclamacaoComponent } from "./components/reclamacao/abrir-reclamacao/abrir-reclamacao.component";
import { ConsultarReclamacaoComponent } from "./components/reclamacao/consultar-reclamacao/consultar-reclamacao.component";
import { EditarReclamacaoComponent } from "./components/reclamacao/editar-reclamacao/editar-reclamacao.component";
import { CadastrarAudienciaComponent } from "./components/audiencia/cadastrar-audiencia/cadastrar-audiencia.component";
import { VisualizarCalendarioAudienciaComponent } from "./components/audiencia/visualizar-calendario-audiencia/visualizar-calendario-audiencia.component";
import { FullCalendarModule } from '@fullcalendar/angular';
import { EditarAudienciaComponent } from "./components/audiencia/editar-audiencia/editar-audiencia.component";
import { ConsultarAudienciaComponent } from "./components/audiencia/consultar-audiencia/consultar-audiencia.component";
import { AbrirAtendimentoComponent } from "./components/atendimento/abrir-atendimento/abrir-atendimento.component";
import { ConsultarAtendimentoComponent } from "./components/atendimento/consultar-atendimento/consultar-atendimento.component";
import { EditarAtendimentoComponent } from "./components/atendimento/editar-atendimento/editar-atendimento.component";
import { CadastarPaComponent } from "./components/pa/cadastar-pa/cadastar-pa.component";
import { ConsultarPaComponent } from "./components/pa/consular-pa/consultar-pa.component";
import { EditarPaComponent } from "./components/pa/editar-pa/editar-pa.component";
import { CadastrarNotificacaoComponent } from "./components/notificacao/criar-notificacao/cadastrar-notificacao.component";
import { ConsultarNotificacaoComponent } from "./components/notificacao/consultar-notificacao/consultar-notificacao.component";
import { EditarNotificacaoComponent } from "./components/notificacao/editar-notificacao/editar-notificacao.component";
import { ConsultarArtigoComponent } from "./components/artigo/consultar-artigo/consultar-artigo.component";
import { CadastrarArtigoComponent } from "./components/artigo/cadastrar-artigo/cadastrar-artigo.component";
import { EditarArtigoComponent } from "./components/artigo/editar-artigo/editar-artigo.component";
import { CriarUsuarioComponent } from "./components/usuario/criar-usuario/criar-usuario.component";
import { ConsultarUsuariosComponent } from "./components/usuario/consultar-usuarios/consultar-usuarios.component";
import { EditarUsuarioComponent } from "./components/usuario/editar-usuario/editar-usuario.component";
import { PerfilComponent } from "./components/usuario/perfil/perfil.component";
import { CadastrarDenunciaComponent } from "./components/denuncia/cadastrar-denuncia/cadastrar-denuncia.component";
import { EditarDenunciaComponent } from "./components/denuncia/editar-denuncia/editar-denuncia.component";
import { ConsultarDenunciaComponent } from "./components/denuncia/consultar-denuncia/consultar-denuncia.component";
import { ConsultasEstagiariosComponent } from "./components/estagiarios/consultas-estagiarios/consultas-estagiarios.component";
import { ConsultarAtendimentoPJComponent } from "./components/atendimento/consultar-atendimento-pj/consultar-atendimento-pj.component";
import { EditarAtendimentoPJComponent } from "./components/atendimento/editar-atendimento-pj/editar-atendimento-pj.component";


@NgModule({
    declarations: [//componente do módulo
        AdminLayoutComponent,
        PainelPrincipalComponent,
        //tipo triagem
        CadastrarTipoTriagemComponent,
        ConsultarTipoTriagemComponent,
        EditarTriagemComponent,
        //triagem
        CadastrarTriagemComponent,
        ConsultarTriagemComponent,
        EditarTipoTriagemComponent,
        //Pessoas
        CadastrarPessoaComponent,
        ConsultarPessoasComponent,
        EditarPessoaFisicaComponent,
        EditarPessoaJuridicaComponent,
        //Reclamacao
        AbrirReclamacaoComponent,
        ConsultarReclamacaoComponent,
        EditarReclamacaoComponent,
        //Audiencia
        CadastrarAudienciaComponent,
        VisualizarCalendarioAudienciaComponent,
        EditarAudienciaComponent,
        ConsultarAudienciaComponent,
        //atendimento
        AbrirAtendimentoComponent,
        ConsultarAtendimentoComponent,
        ConsultarAtendimentoPJComponent,
        EditarAtendimentoComponent,
        EditarAtendimentoPJComponent,
        //Pa
        CadastarPaComponent,
        ConsultarPaComponent,
        EditarPaComponent,
        //Notificacao/Intimacao
        CadastrarNotificacaoComponent,
        ConsultarNotificacaoComponent,
        EditarNotificacaoComponent,
        //Artigos
        CadastrarArtigoComponent,
        ConsultarArtigoComponent,
        EditarArtigoComponent,
        //Usuarios
        CriarUsuarioComponent,
        ConsultarUsuariosComponent,
        EditarUsuarioComponent,
        PerfilComponent,
        //Denúncia
        CadastrarDenunciaComponent,
       ConsultarDenunciaComponent,
        EditarDenunciaComponent,
        //Estagiarios
        ConsultasEstagiariosComponent,
        //siderbar, navbar, footer
        SiderbarComponent,
        NavbarComponent,
        FooterComponent,
    ],
    imports: [//biblioteca e configuração do módulo
        AdminRoutingModule,
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        RouterLink,
        SharedModule,
        NgxMaskDirective,
        FullCalendarModule,
    ]
})
export class AdminModule { }