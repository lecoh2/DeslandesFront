import { inject, Injectable } from "@angular/core";
import { environment } from "../../../environments/environment.development";
import { HttpClient } from "@angular/common/http";
import { ConsultarSexoResponse } from "../models/sexo/consutar-sexo-response";
import { Observable } from "rxjs";
import { ConsultarVaraResponse } from "../models/vara/consultar-vara-response";
import { ConsultarAcaoResponse } from "../models/acao/consultar-acao-response";
import { AtendimentoAutoComplete } from "../models/atendimento/atendimento-auto-complete";

@Injectable({
    providedIn: 'root' // Isso registra o serviço automaticamente no app
})
export class CasoService {
    private url = environment.apiDeslandes;
    private http = inject(HttpClient);

   consultarCassoAutoComplete(termo?: string, limite: number = 50) {
     const params: any = { limite: limite.toString() };
   
     if (termo) {
       params.termo = termo;
     }
   
     return this.http.get<AtendimentoAutoComplete[]>(
       `${this.url}/api/v1/caso/consultar-caso-autocpmplete`,
       { params }
     );
   }
}