import { NgModule } from "@angular/core";

import { LoginRoutingModule } from "./login-routing.module";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { AutenticarUsuario } from "./components/autenticar-usuario/autenticar-usuario";
import { SharedModule } from "../../shared/shared.module";




@NgModule({
    declarations: [
        //componente do módulo
        AutenticarUsuario,


    ],
    imports: [
        //biblioteca ou configuração do módulo
        LoginRoutingModule,
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        RouterLink,
        SharedModule
    ]
})
export class LoginModule { }