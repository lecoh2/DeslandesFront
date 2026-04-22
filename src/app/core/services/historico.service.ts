import { inject, Injectable } from "@angular/core";
import { environment } from "../../../environments/environment.development";
import { HttpClient } from "@angular/common/http";
import { ConsultarSexoResponse } from "../models/sexo/consutar-sexo-response";
import { Observable } from "rxjs";
import { ConsultarVaraResponse } from "../models/vara/consultar-vara-response";
import { ConsultarAcaoResponse } from "../models/acao/consultar-acao-response";
import { HistoricoGeralResponse } from "../models/historico-geral/historico-geral-response";
import { TipoEntidadeEnum } from "../models/enums/tipo-entidade/tipo-entidadeEnum";

@Injectable({
    providedIn: 'root' // Isso registra o serviço automaticamente no app
})
export class HistoricoService {
    private url = environment.apiDeslandes;
    private http = inject(HttpClient);

ConsultarHistorico(entidade: TipoEntidadeEnum, entidadeId: string): Observable<HistoricoGeralResponse[]> {
  return this.http.get<HistoricoGeralResponse[]>(
    `${this.url}/api/v1/historicogral/historico/${entidade}/${entidadeId}`
  );
}
}