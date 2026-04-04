import { inject, Injectable } from "@angular/core";

import { CryptoHelper } from "./crypto.helper";
import { AutenticarUsuarioResponse } from "../models/usuario/autenticar-usuario.response";
@Injectable({
    providedIn: 'root'
})
export class AuthHelper {
    //chave para gravar os dados na session storege
    private key: string = 'user-auth';
    //método para gravar os dados do usuário autendicado
    //na sessio storage
private cryptoHelper = inject(CryptoHelper);

    create(data: AutenticarUsuarioResponse): void {
        const crypt = this.cryptoHelper.encrypt(JSON.stringify(data));
        sessionStorage.setItem(this.key, crypt);

    }
    
    //método para retornar os dados do usuario autenticado
    get(): AutenticarUsuarioResponse | null {
        const data = sessionStorage.getItem(this.key);
        if (data != null){
            const decrypt = this.cryptoHelper.decrypto(data);
            return JSON.parse(decrypt) as AutenticarUsuarioResponse;
        }
        else
            return null;
    }
    //método para apagar os dados do usuario gravado na session storafe
    remove(): void {
        sessionStorage.removeItem(this.key);
    }
}