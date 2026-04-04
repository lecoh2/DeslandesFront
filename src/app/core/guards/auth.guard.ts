import { inject, Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { AuthHelper } from "../helpers/auth.helper";

@Injectable({
    providedIn: 'root'
})
export class AuthGuard {
    //injeção de dependencia
    router = inject(Router);
    helper = inject(AuthHelper);
    /**
     * Método para verificar se o suuario esta 
     * autenticado e se poderar acessar a rota
     */
    canActivate(): boolean {
        //por padrão irmemos negar o acesso a rota
        if (this.helper.get() == null) {
            this.router.navigate(['/login/autenticar-usuario']);
            return false;
        }
        return true;
    }
}