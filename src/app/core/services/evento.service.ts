import { inject, Injectable } from "@angular/core";
import { environment } from "../../../environments/environment.development";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";


import { ApiResponse } from "../models/respostas/api-response";
import { CriarAtendimentoClienteRequest } from "../models/atendimento/criar-atendimento-cliente-request";
import { CriarAtendimentoClienteResponse } from "../models/atendimento/criar-atendimento-response";
import { AtendimentoAutoComplete } from "../models/atendimento/atendimento-auto-complete";
import { CriarEventoRequest } from "../models/evento/criar-evento-request";
import { CriarEventoResponse } from "../models/evento/criar-evento-response";
import { ObterEventoResponse } from "../models/evento/obter-evento-response ";

@Injectable({
    providedIn: 'root' // Isso registra o serviço automaticamente no app
})
export class EventoService {
    //atributos
    private url = environment.apiDeslandes;
    private http = inject(HttpClient);

    //métodos para cadastrar reclamacao

    cadastrarEvento(request: CriarEventoRequest): Observable<ApiResponse<CriarEventoResponse>> {
        const token = localStorage.getItem('token');

        return this.http.post<ApiResponse<CriarEventoResponse>>(
            `${this.url}/api/v1/evento/cadastrar-evento`,
            request,
            {
                headers: token
                    ? { Authorization: `Bearer ${token}` }
                    : {}
            }
        );

    }

    ObterEventoPorId(id: string): Observable<ObterEventoResponse> {
      return this.http.get<ObterEventoResponse>(
        `${this.url}/api/v1/evento/obter-evento-por-id/${id}`
  
        
      );
    }
    editarEvento(id: string, request: any): Observable<ApiResponse<CriarEventoResponse>> {
  const token = localStorage.getItem('token');

  return this.http.put<ApiResponse<CriarEventoResponse>>(
    `${this.url}/api/v1/evento/atualizar-evento/${id}`,
    request,
    {
      headers: token
        ? { Authorization: `Bearer ${token}` }
        : {}
    }
  );
}
}