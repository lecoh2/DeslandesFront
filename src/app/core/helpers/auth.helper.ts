import { inject, Injectable } from "@angular/core";
import { CryptoHelper } from "./crypto.helper";
import { AutenticarUsuarioResponse } from "../models/usuario/autenticar-usuario.response";

@Injectable({
  providedIn: 'root'
})
export class AuthHelper {
  private key = 'user-auth';
  private cryptoHelper = inject(CryptoHelper);

create(data: AutenticarUsuarioResponse): void {
  const crypt = this.cryptoHelper.encrypt(JSON.stringify(data));
  localStorage.setItem(this.key, crypt);
}

get(): AutenticarUsuarioResponse | null {
  const data = localStorage.getItem(this.key);
  if (!data) return null;

  const decrypt = this.cryptoHelper.decrypto(data);
  return JSON.parse(decrypt) as AutenticarUsuarioResponse;
}

remove(): void {
  localStorage.removeItem(this.key);
}
}