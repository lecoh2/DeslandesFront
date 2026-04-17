import { inject, Injectable } from "@angular/core";
import { environment } from "../../../environments/environment.development";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";


import { ApiResponse } from "../models/respostas/api-response";
import { CriarAtendimentoClienteRequest } from "../models/atendimento/criar-atendimento-cliente-request";
import { CriarAtendimentoClienteResponse } from "../models/atendimento/criar-atendimento-response";
import { AtendimentoAutoComplete } from "../models/atendimento/atendimento-auto-complete";

@Injectable({
  providedIn: 'root' // Isso registra o serviço automaticamente no app
})
export class AtendimentoService {
  //atributos
  private url = environment.apiDeslandes;
  private http = inject(HttpClient);

  //métodos para cadastrar reclamacao

  cadastrarAtendimento(request: CriarAtendimentoClienteRequest): Observable<ApiResponse<CriarAtendimentoClienteResponse>> {
  const token = localStorage.getItem('token');

  return this.http.post<ApiResponse<CriarAtendimentoClienteResponse>>(
    `${this.url}/api/v1/atendimento/cadastrar-atendimento`,
    request,
    {
      headers: token
        ? { Authorization: `Bearer ${token}` }
        : {}
    }
  );
  
}  
 consultarAtendimentoAutoComplete(termo?: string, limite: number = 50) {
     const params: any = { limite: limite.toString() };
   
     if (termo) {
       params.termo = termo;
     }
   
     return this.http.get<AtendimentoAutoComplete[]>(
       `${this.url}/api/v1/atendimento/consultar-atendiemnto-autocomplete`,
       { params }
     );
   }

/*
    cadastrarPJ(request: CadastrarAtendimentoRequest): Observable<CadastrarAtendimentoResponse> {
    return this.http.post<CadastrarAtendimentoResponse>
      (`${this.url}/api/atendimento/cadastrar-atendimento-pj`, request)
  }
  consultarAtendimentoConPaginacao(): Observable<PagedResult<ConsultarAtendimentoResponse>> {
    return this.http.get<PagedResult<ConsultarAtendimentoResponse>>(
      `${this.url}/api/atendimento/consultar-atendimento-paginacao`
    );
  }

  consultarAtendimentoPaginado(pageNumber: number, pageSize: number, searchTerm?: string) {
  const params: any = { pageNumber: pageNumber.toString(), pageSize: pageSize.toString() };
  if (searchTerm) params.searchTerm = searchTerm;
  return this.http.get<any>(`${this.url}/api/atendimento/consultar-atendimento-paginacao`, { params });
}
  consultarAtendimentoPaginadoPJ(pageNumber: number, pageSize: number, searchTerm?: string) {
  const params: any = { pageNumber: pageNumber.toString(), pageSize: pageSize.toString() };
  if (searchTerm) params.searchTerm = searchTerm;
  return this.http.get<any>(`${this.url}/api/atendimento/consultar-atendimento-paginacao-pj`, { params });
}

  consultarAtendimento(): Observable<ConsultarAtendimentoResponse[]> {
    return this.http.get<ConsultarAtendimentoResponse[]>
      (`${this.url}/api/atendimento/consultar-atendimento`);
  }

  consultarAtendimentoPorId(id: string): Observable<ConsultarAtendimentoResponse[]> {
    return this.http.get<ConsultarAtendimentoResponse[]>
      (`${this.url}/api/atendimento/consultar-atendimento-por-id/${id}`
      );
  }  consultarAtendimentoPJPorId(id: string): Observable<ConsultarAtendimentoResponse[]> {
    return this.http.get<ConsultarAtendimentoResponse[]>
      (`${this.url}/api/atendimento/consultar-atendimento-por-id-pj/${id}`
      );
  }

  editarPorId(dto: EditarAtendimentoRequest): Observable<EditarAtendimentoResponse> {
    return this.http.put<EditarAtendimentoResponse>(
      `${this.url}/api/atendimento/atualizar-atendimento/${dto.idAtendimento}`,
      dto
    );
  }
  editarPorIdPj(dto: EditarAtendimentoRequest): Observable<EditarAtendimentoResponse> {
    return this.http.put<EditarAtendimentoResponse>(
      `${this.url}/api/atendimento/atualizar-atendimento-pj/${dto.idAtendimento}`,
      dto
    );
  }
  removerclamadaAtendimento(idReclamada: string, idAtendimento: string): Observable<any> {
    return this.http.delete(`${this.url}/api/atendimento/remover-reclamada-atendimento/${idReclamada}/${idAtendimento}`);
  }
  removerReclamanteAtendimento(idReclamante: string, idAtendimento: string): Observable<any> {
    return this.http.delete(`${this.url}/api/atendimento/remover-reclamante-atendimento/${idReclamante}/${idAtendimento}`);
  }
  removerReclamanteAtendimentoPJ(idReclamante: string, idAtendimento: string): Observable<any> {
    return this.http.delete(`${this.url}/api/atendimento/remover-reclamante-atendimento-pj/${idReclamante}/${idAtendimento}`);
  }
  adicionarReclamante(idAtendimento: string, idReclamante: string): Observable<any> {
    return this.http.post(
      `${this.url}/api/atendimento/adicionar-reclamante-atendimento/${idAtendimento}/${idReclamante}`,
      null // sem corpo pois só usa params na URL
    );
  }
 adicionarReclamantePj(idAtendimento: string, idReclamante: string): Observable<any> {
    return this.http.post(
      `${this.url}/api/atendimento/adicionar-reclamante-atendimento-pj/${idAtendimento}/${idReclamante}`,
      null // sem corpo pois só usa params na URL
    );
  }



  adicionarReclamada(idAtendimento: string, idReclamada: string): Observable<any> {
    return this.http.post(
      `${this.url}/api/atendimento/adicionar-reclamada-atendimento/${idAtendimento}/${idReclamada}`,
      null // sem corpo pois só usa params na URL
    );
  }


  removerReclamadasRepresentanteAtendimentoJuridico(idReclamada: string, idAtendimento: string): Observable<any> {
    return this.http.delete(`${this.url}/api/atendimento/remover-representante-atendimento-juridico/${idReclamada}/${idAtendimento}`);
  }
  removerReclamanteRepresentanteAtendimento(idReclamada: string, idAtendimento: string): Observable<any> {
    return this.http.delete(`${this.url}/api/atendimento/remover-reclamante-representante-fisico/${idReclamada}/${idAtendimento}`);
  }

  adicionarRepresentanteReclamante(idReclamante: string, idAtendimento: string): Observable<any> {
    return this.http.post(
      `${this.url}/api/atendimento/adicionar-grupo-representante-atendimento-fisico/${idReclamante}/${idAtendimento}`,
      null // sem corpo pois só usa params na URL
    );
  }

  adicionarRepresentanteReclamada(idAtendimento: string, idReclamada: string): Observable<any> {
    return this.http.post(
      `${this.url}/api/atendimento/adicionar-grupo-representante-atendimento-juridico/${idAtendimento}/${idReclamada}`,
      null // sem corpo pois só usa params na URL
    );
  }
  adicionarArtigos(idAtendimento: string, idArtigo: string): Observable<any> {
    return this.http.post(
      `${this.url}/api/atendimento/adicionar-grupo-artigo-atendimento/${idAtendimento}/${idArtigo}`,
      null // sem corpo pois só usa params na URL
    );
  }
  removerArtigos(idArtigo: string, idAtendimento: string): Observable<any> {
    return this.http.delete(`${this.url}/api/atendimento/remover-grupo-artigo-atendimento/${idArtigo}/${idAtendimento}`);
  }

  consultarHistoricoAtendimento(id: string): Observable<ConsultarAtendimentoHistoricoResponse> {
    return this.http.get<ConsultarAtendimentoHistoricoResponse>(
      `${this.url}/api/atendimento/consultar-historico-atendimento/${id}`
    );
  }
  consultarCadastrarReclamacaoAtendimento(codigo: number, anoBase: string): Observable<ConsultarAtendimentoResponse> {
    return this.http.get<ConsultarAtendimentoResponse>(
      `${this.url}/api/atendimento/consultar-cadastrar-reclamacao/${codigo}/${anoBase}`
    );
  }
  ConsultarGrupoAtendimentoReclamacao(idAtendimento: string): Observable<ConsultarAtendimentoResponse> {
    return this.http.get<ConsultarAtendimentoResponse>(
      `${this.url}/api/atendimento/consultar-grupo-atendimento/${idAtendimento}`
    );
  }

getQuantidadeAtendimentos(anoBase?: string) {
  return this.http.get<{ totalGeral: number; totalAnoAtual: number }>(
    `${this.url}/api/atendimento/consultar-atendimento-quantidade`,
    {
      params: anoBase ? { anoBase } : {}
    }
  );
}

 ConsultarCincoUltimosAtendimentos(): Observable<ConsultarAtendimentoResponse[]> {
    return this.http.get<ConsultarAtendimentoResponse[]>
      (`${this.url}/api/atendimento/consultar-cinco-ultimas-atendimentos`);
  }
*/
}
