import { Injectable } from "@angular/core";
import { environment } from "../../../environments/environment.development";
import * as CryptoJS from 'crypto-js';



@Injectable({
    providedIn: 'root'
})
export class CryptoHelper {
    //capturando a chave secreta deinida no encironment
    private secretKey: string = environment.secretKey;
    //método para criptografar
    encrypt(value: string): string {
        return CryptoJS.AES.encrypt(value, this.secretKey).toString();
    }
    //método para descriptografar
    decrypto(value: string): string {
        const bytes = CryptoJS.AES.decrypt(value, this.secretKey);
        return bytes.toString(CryptoJS.enc.Utf8)
    }

}
