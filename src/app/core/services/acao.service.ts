import { inject, Injectable } from "@angular/core";
import { environment } from "../../../environments/environment.development";
import { HttpClient } from "@angular/common/http";
import { ConsultarSexoResponse } from "../models/sexo/consutar-sexo-response";
import { Observable } from "rxjs";
import { ConsultarVaraResponse } from "../models/vara/consultar-vara-response";
import { ConsultarAcaoResponse } from "../models/acao/consultar-acao-response";

@Injectable({
    providedIn: 'root' // Isso registra o serviço automaticamente no app
})
export class AcaoService {
    private url = environment.apiDeslandes;
    private http = inject(HttpClient);

    consultar(): Observable<ConsultarAcaoResponse[]> {
        return this.http.get<ConsultarAcaoResponse[]>
            (`${this.url}/api/v1/acao/consultar-acao`);
    }
}