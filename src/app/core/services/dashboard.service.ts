import { inject, Injectable } from "@angular/core";
import { environment } from "../../../environments/environment.development";
import { HttpClient } from "@angular/common/http";
import { map, Observable } from "rxjs";
import { ProcessoResumoResponse } from "../models/processo-resumo/processo-resumo-response";
import { AtendimentoAgrupadoResponse } from "../models/atendimento/atendimento-agrupodo-response";
import { ProcessoAgrupadoResponse } from "../models/processo/proceso-agrupado-response";
import { CasoAgrupadoResponse } from "../models/caso/caso-agrupado-response";

@Injectable({
    providedIn: 'root'
})
export class DashboardService {

    private url = environment.apiDeslandes;
    private http = inject(HttpClient);

getUltimosAtendimentos(qtd: number = 5): Observable<any[]> {
  return this.http.get<any[]>(
    `${this.url}/api/v1/atendimento/ultimos-atendimentos?quantidade=${qtd}`
  );
}
getUltimosProcessos(qtd: number = 5): Observable<any[]> {
  return this.http.get<any[]>(
    `${this.url}/api/v1/processo/ultimos-processos`,
    { params: { quantidade: qtd } }
  );
}
getUltimosProcessosAnoAtual(): Observable<number> {
  return this.http.get<number>(
    `${this.url}/api/v1/processo/contar-processo-anoatual`
  );
}
getTotalProcessos(): Observable<number> {
  return this.http.get<number>(
    `${this.url}/api/v1/processo/contar-processos-total`
  );
}

getUltimosAtendimentoAnoAtual(): Observable<number> {
  return this.http.get<number>(
    `${this.url}/api/v1/atendimento/contar-atendimento-anoatual`
  );
}
getTotalAtendimento(): Observable<number> {
  return this.http.get<number>(
    `${this.url}/api/v1/atendimento/contar-atendimento-total`
  );
}
getUltimosCasoAnoAtual(): Observable<number> {
  return this.http.get<number>(
    `${this.url}/api/v1/caso/contar-caso-anoatual`
  );
}
getTotalCaso(): Observable<number> {
  return this.http.get<number>(
    `${this.url}/api/v1/caso/contar-caso-total`
  );
}

getUltimasTarefas(qtd: number = 5): Observable<any[]> {
  return this.http.get<any[]>(
    `${this.url}/api/v1/tarefa/ultimas-tarefas?quantidade=${qtd}`
  );
}
getUltimosEventos(qtd: number = 5): Observable<any[]> {
  return this.http.get<any[]>(
    `${this.url}/api/v1/evento/ultimos-eventos?quantidade=${qtd}`
  );
}
getUltimosCasos(qtd: number = 5): Observable<any[]> {
  return this.http.get<any[]>(
    `${this.url}/api/v1/caso/ultimos-casos?quantidade=${qtd}`
  );
}

/*******Gafico***** */
  getGraficoAtendimento(): Observable<AtendimentoAgrupadoResponse[]> {
    return this.http.get<AtendimentoAgrupadoResponse[]>(`${this.url}/api/v1/atendimento/consultar-graficos-atendimento`);
  }
    getGraficoProceso(): Observable<ProcessoAgrupadoResponse[]> {
    return this.http.get<ProcessoAgrupadoResponse[]>(`${this.url}/api/v1/processo/consultar-graficos-processo`);
  }
     getGraficoCaso(): Observable<CasoAgrupadoResponse[]> {
    return this.http.get<CasoAgrupadoResponse[]>(`${this.url}/api/v1/caso/consultar-graficos-casos`);
  }
}