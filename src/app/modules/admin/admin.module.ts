import { NgModule } from "@angular/core";
import { AdminRoutingModule } from "./admin-routing.module";
import { Siderbar } from "./shared/siderbar/siderbar";
import { Navbar } from "./shared/navbar/navbar";
import { Footer } from "./shared/footer/footer";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { SharedModule } from "../../shared/shared.module";
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { FullCalendarModule } from '@fullcalendar/angular';
import { PainelPrincipal } from "./components/painel-principal/painel-principal";
import { AdminLayout } from "./layouts/layouts/admin-layout/admin-layout";
import { CadastrarPessoas } from "./components/pessoa/cadastrar-pessoa/cadastrar-pessoas";
import { CadastrarEtiquetas } from "./components/etiquetas/cadastrar-etiquetas/cadastrar-etiquetas";
import { ConsultarPessoas } from "./components/pessoa/consultar-pessoas/consultar-pessoas";
import { CadastrarProcesso } from "./components/processo/cadastrar-processo/cadastrar-processo";
import { AutocompletePessoa } from "./components/autocomplete-pessoas/autocomplete-pessoas";
import { CadastrarAtendimento } from "./components/atendimento/cadastrar-atendimento/cadastrar-atendimento";
import { AutocompletePessoaAtendimento } from "./components/autocomplete-pessoas-atendimento/autocomplete-pessoa-atendimento";
import { Vinculo } from "./components/auto-complete-vinculos-proc-caso-atend/vinculo";
import { CadastrarCaso } from "./components/caso/cadastrar-caso/cadastrar-caso";
import { GestaoAtividades } from "./components/gestao-atividades/gestao-atividades";
import { CadastrarTarefa } from "./components/tarefa/cadastrar-tarefa/cadastar-tarefa/cadastar-tarefa";
import { CadastrarResponsaveis } from "./components/responsaveis/cadastrar-responsaveis";
import { AutocompleteListaTarefas } from "./components/auto-complete-lista-tarefas/autocomplete-lista-tarefas";
import { CadastrarEvento } from "./components/evento/cadastrar-evento/cadastrar-evento";
import { EditarCaso } from "./components/caso/editar-caso/editar-caso";
import { EditarTarefa } from "./components/tarefa/editar-tarefa/editar-tarefa";
import { EditarEvento } from "./components/evento/editar-evento/editar-evento";
import { ConsultarAtendimento } from "./components/atendimento/consultar-atendimento/consultar-atendimento";
import { EditarAtendimento } from "./components/atendimento/editar-atendimento/editar-atendimento";
import { ConsultarCaso } from "./components/caso/consultar-caso/consultar-caso";
import { ConsultarProcesso } from "./components/processo/consultar-processo/consultar-processo";
import { EditarProcesso } from "./components/processo/editar-processo/editar-processo";




@NgModule({
    declarations: [//componente do módulo
        AdminLayout,
        PainelPrincipal,
        CadastrarPessoas,
        CadastrarEtiquetas,
        ConsultarPessoas,
        CadastrarProcesso,
        ConsultarProcesso,
        EditarProcesso,
        CadastrarAtendimento,
        ConsultarAtendimento,
        EditarAtendimento,
        CadastrarCaso,
        ConsultarCaso,
        EditarCaso,
        GestaoAtividades,
        CadastrarTarefa,
        EditarTarefa,
        CadastrarEvento,
        EditarEvento,
    


        //autocomplete
        AutocompletePessoa,
        AutocompletePessoaAtendimento,
        AutocompleteListaTarefas,
        CadastrarResponsaveis,
        Vinculo,
        //siderbar, navbar, footer
        Siderbar,
        Navbar,
        Footer,
    ],
    imports: [//biblioteca e configuração do módulo
        AdminRoutingModule,
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule,
        SharedModule,  
              
        NgxMaskDirective,
        FullCalendarModule,
    ]
})
export class AdminModule { }