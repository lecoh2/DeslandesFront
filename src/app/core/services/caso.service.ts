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
import { ObterCasoResponse } from "../models/caso/obter-caso-response ";

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
  consultarCasoPaginado(pageNumber: number, pageSize: number, searchTerm?: string) {
    const params: any = { pageNumber: pageNumber.toString(), pageSize: pageSize.toString() };
    if (searchTerm) params.searchTerm = searchTerm;
    return this.http.get<any>(`${this.url}/api/v1/caso/consultar-caso-paginacao`, { params });
  }

ObterCasoPorId(id: string): Observable<ObterCasoResponse> {
  return this.http.get<ObterCasoResponse>(
    `${this.url}/api/v1/caso/obter-caso-por-id/${id}`

    
  );
}
atualizarCaso(id: string, request: any): Observable<any> {
  const token = localStorage.getItem('token');

  return this.http.put<any>(
    `${this.url}/api/v1/caso/atualizar-caso/${id}`,
    request,
    {
      headers: token
        ? { Authorization: `Bearer ${token}` }
        : {}
    }
  );
}
}