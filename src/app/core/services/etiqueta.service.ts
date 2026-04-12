import { inject, Injectable } from "@angular/core";
import { environment } from "../../../environments/environment.development";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { ConsultarEtiquetaResponse } from "../models/etiqueta/consultar-etiqueta-response";

@Injectable({
    providedIn: 'root' // Isso registra o serviço automaticamente no app
})
export class EtiquetaService {
    private url = environment.apiDeslandes;
    private http = inject(HttpClient);

    consultar(): Observable<ConsultarEtiquetaResponse[]> {
        return this.http.get<ConsultarEtiquetaResponse[]>
            (`${this.url}/api/v1/etiquetas/consultar-etiquetas`);
    }
}