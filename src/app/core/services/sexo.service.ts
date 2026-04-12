import { inject, Injectable } from "@angular/core";
import { environment } from "../../../environments/environment.development";
import { HttpClient } from "@angular/common/http";
import { ConsultarSexoResponse } from "../models/sexo/consutar-sexo-response";
import { Observable } from "rxjs";

@Injectable({
    providedIn: 'root' // Isso registra o serviço automaticamente no app
})
export class SexoService {
    private url = environment.apiDeslandes;
    private http = inject(HttpClient);

    consultar(): Observable<ConsultarSexoResponse[]> {
        return this.http.get<ConsultarSexoResponse[]>
            (`${this.url}/api/sexo/consultar-sexo`);
    }
}