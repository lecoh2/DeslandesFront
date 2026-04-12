// src/app/services/cep.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ConsultarEnderecoResponse } from '../models/endereco/consultar-endereco-response';


export interface PessoaService {
    logradouro: string;
    bairro: string;
    localidade: string;
    uf: string;
    cep: string;
    erro?: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class CepService {
    private baseUrl = 'https://viacep.com.br/ws';

    constructor(private http: HttpClient) { }

    buscarCep(cep: string): Observable<ConsultarEnderecoResponse> {
        const url = `${this.baseUrl}/${cep}/json`;
        return this.http.get<ConsultarEnderecoResponse>(url).pipe(
            catchError((error) => {
                return throwError(() => new Error('Erro ao buscar o CEP'));
            })
        );
    }
}
