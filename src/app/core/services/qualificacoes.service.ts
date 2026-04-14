import { inject, Injectable } from "@angular/core";
import { environment } from "../../../environments/environment.development";
import { HttpClient } from "@angular/common/http";
import { ConsultarSexoResponse } from "../models/sexo/consutar-sexo-response";
import { Observable } from "rxjs";
import { QualificacaoResponse } from "../models/qualificacao/qualificacao-response";

@Injectable({
    providedIn: 'root' // Isso registra o serviço automaticamente no app
})
export class QualificacoesService {
    private url = environment.apiDeslandes;
    private http = inject(HttpClient);

    consultarQualificacoes(): Observable<QualificacaoResponse[]> {
        return this.http.get<QualificacaoResponse[]>
            (`${this.url}/api/v1/qualificacao/consultar-qualidicacao`);
    }
}