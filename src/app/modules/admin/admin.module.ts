import { NgModule } from "@angular/core";
import { AdminRoutingModule } from "./admin-routing.module";
import { Siderbar } from "./shared/siderbar/siderbar";
import { Navbar } from "./shared/navbar/navbar";
import { Footer } from "./shared/footer/footer";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterLink } from "@angular/router";

import { SharedModule } from "../../shared/shared.module";
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { FullCalendarModule } from '@fullcalendar/angular';
import { PainelPrincipal } from "./components/painel-principal/painel-principal";
import { AdminLayout } from "./layouts/layouts/admin-layout/admin-layout";
import { CadastrarPessoas } from "./components/pessoa/cadastrar-pessoa/cadastrar-pessoas";
import { CadastrarEtiquetas } from "./components/etiquetas/cadastrar-etiquetas/cadastrar-etiquetas";


@NgModule({
    declarations: [//componente do módulo
        AdminLayout,
        PainelPrincipal,
        CadastrarPessoas,
        CadastrarEtiquetas,



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
        RouterLink,
        SharedModule,  
              
        NgxMaskDirective,
        FullCalendarModule,
    ]
})
export class AdminModule { }