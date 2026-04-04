import { Injectable, inject } from '@angular/core';
import { AuthHelper } from '../helpers/auth.helper';

@Injectable({
  providedIn: 'root'
})
export class AccessService {
  private authHelper = inject(AuthHelper);

  hasNivel(...niveis: string[]): boolean {
    const usuario = this.authHelper.get();
    if (!usuario) return false;

    // Normaliza para comparação sem acentos e sem case sensitive
    const normalize = (str: string) =>
      str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

    const niveisNormalizados = niveis.map(n => normalize(n));

    return usuario.nivel.some(n =>
      niveisNormalizados.includes(normalize(n.nomeNivel))
    );
  }
}
