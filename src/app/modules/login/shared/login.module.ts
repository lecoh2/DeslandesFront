import { NgModule } from "@angular/core";
import { AutenticarUsuarioComponent } from "./components/autenticar-usuario/autenticar-usuario";
import { LoginRoutingModule } from "./login-routing.modules";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterLink } from "@angular/router";
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