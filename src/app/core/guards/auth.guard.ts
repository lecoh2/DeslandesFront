import { inject, Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { AuthHelper } from "../helpers/auth.helper";

@Injectable({
  providedIn: 'root'
})
export class AuthGuard {

  private router = inject(Router);
  private helper = inject(AuthHelper);

  canActivate(): boolean {

    // 🔥 evita erro no SSR (Node não tem window)
    if (typeof window === 'undefined') {
      return true;
    }

    const usuario = this.helper.get();

    if (!usuario) {
      this.router.navigateByUrl('/login/autenticar-usuario');
      return false;
    }

    return true;
  }
}