import { Agente } from '../interfaces/agente';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AgenteService {
  constructor(private httpClient: HttpClient) {}

  postAgente(agente: Agente): Observable<any> {
    return this.httpClient.post<any>(`${environment.api}/agente`, agente);
  }

  getAgente(inmobiliaria: string, rfc: string): Observable<Agente> {
    return this.httpClient.get<Agente>(
      `${environment.api}/agente/${inmobiliaria}/${rfc}`
    );
  }

  deleteAgente(rfc: string): Observable<any> {
    return this.httpClient.delete<any>(`${environment.api}/agente`, {
      body: { rfc },
    });
  }
}
