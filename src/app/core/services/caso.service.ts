import { inject, Injectable } from "@angular/core";
import { environment } from "../../../environments/environment.development";
import { HttpClient } from "@angular/common/http";
import { ConsultarSexoResponse } from "../models/sexo/consutar-sexo-response";
import { Observable } from "rxjs";
import { ConsultarVaraResponse } from "../models/vara/consultar-vara-response";
import { ConsultarAcaoResponse } from "../models/acao/consultar-acao-response";
import { AtendimentoAutoComplete } from "../models/atendimento/atendimento-auto-complete";
import { CadastrarCaso } from "../../modules/admin/components/caso/cadastrar-caso/cadastrar-caso";
import { CriarCasoRequest } from "../models/caso/cadastrar-caso-request";
import { CriarCasoResponse } from "../models/caso/cadastrar-caso-response";
import { ApiResponse } from "../models/respostas/api-response";

@Injectable({
    providedIn: 'root' // Isso registra o serviço automaticamente no app
})
export class CasoService {
    private url = environment.apiDeslandes;
    private http = inject(HttpClient);

     cadastrarCaso(request: CriarCasoRequest): Observable<ApiResponse<CriarCasoResponse>> {
      const token = localStorage.getItem('token');
    
      return this.http.post<ApiResponse<CriarCasoResponse>>(
        `${this.url}/api/v1/caso/cadatrar-caso`,
        request,
        {
          headers: token
            ? { Authorization: `Bearer ${token}` }
            : {}
        }
      );
      
    }

   consultarCasoAutoComplete(termo?: string, limite: number = 50) {
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