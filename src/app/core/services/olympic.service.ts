import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {BehaviorSubject, throwError} from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import {Olympic} from "../models/Olympic";

@Injectable({
  providedIn: 'root',
})
export class OlympicService {
  private olympicUrl = './assets/mock/olympic.json';
  private olympics$ = new BehaviorSubject<Olympic[]>([]);

  constructor(private http: HttpClient) {}

  loadInitialData() {
    return this.http.get<any>(this.olympicUrl).pipe(
      tap((value) => this.olympics$.next(value)),
      catchError((error, caught) => {
        console.error('Erreur lors de la récupération des données :', error);
        this.olympics$.next([]);
        return throwError(() => error);
      })
    );
  }

  getOlympics() {
    return this.olympics$.asObservable();
  }
}
