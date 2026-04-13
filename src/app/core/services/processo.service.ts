import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "../../../environments/environment.development";

import { CadastrarProcessoRequest } from "../models/processo/cadastrar-processo-request";
import { CadastrarProcessoResponse } from "../models/processo/cadastar-processo-response";
import { Observable } from "rxjs";


@Injectable({
    providedIn: 'root' // Isso registra o serviço automaticamente no app
})
export class ProcessoService {
    //atributos
    private url = environment.apiDeslandes;
    private http = inject(HttpClient);

    cadastrarProcesso(request: CadastrarProcessoRequest): Observable<CadastrarProcessoResponse> {
        const token = localStorage.getItem('token'); // ou de onde você armazena
        return this.http.post<CadastrarProcessoResponse>(
            `${this.url}api/v1/processo/cadastrar-processo`,
            request,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );
    }
}
