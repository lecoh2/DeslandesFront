import { Injectable, inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthHelper } from '../helpers/auth.helper';

@Injectable({
  providedIn: 'root'
})
export class NivelGuard {
  private router = inject(Router);
  private authHelper = inject(AuthHelper);

  canActivate(route: any): boolean {
    const usuario = this.authHelper.get();
    if (!usuario) {
      this.router.navigate(['/login/autenticar-usuario']);
      return false;
    }

    // níveis permitidos informados na rota
    const niveisPermitidos = route.data['niveis'] as string[];

    // normaliza strings (sem acento e case-insensitive)
    const normalize = (str: string) =>
      str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

    const niveisPermitidosNormalizados = niveisPermitidos.map(n => normalize(n));
    const niveisUsuarioNormalizados = usuario.nivel.map(n => normalize(n.nomeNivel));

    // verifica se o usuário tem algum dos níveis permitidos
    const temNivel = niveisUsuarioNormalizados.some(n => niveisPermitidosNormalizados.includes(n));

    if (!temNivel) {
      // redireciona se o usuário não tiver nível suficiente
      this.router.navigate(['/admin/painel-principal']);
      return false;
    }

    return true;
  }
}
