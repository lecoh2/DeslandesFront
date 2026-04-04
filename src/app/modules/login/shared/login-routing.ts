import { RouterModule, Routes } from "@angular/router";
import { Component, NgModule } from "@angular/core";
import { AutenticarUsuario } from "../components/autenticar-usuario/autenticar-usuario";

//Mapeamento de rotas para o modulo de login
export const routes: Routes = [
    {
        path: 'autenticar-usuario',
        component: AutenticarUsuario
    }
];
@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]

})
export class LoginRoutingModule { }

