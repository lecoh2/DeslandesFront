import { RouterModule, Routes } from "@angular/router";
import { AutenticarUsuario } from "./components/autenticar-usuario/autenticar-usuario";
import { Component, NgModule } from "@angular/core";
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

