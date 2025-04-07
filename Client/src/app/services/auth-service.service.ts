import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ApiResponse } from '../models/api-response';

@Injectable({
  providedIn: 'root',
})
export class AuthServiceService {
  private baseUrl = 'http://localhost:5093/api/account';

  private httpClient = inject(HttpClient);
  token = 'token';

  register(data: FormData): Observable<ApiResponse<string>> {
    return this.httpClient
      .post<ApiResponse<string>>(`${this.baseUrl}/register`, data)
      .pipe(
        tap((response) => {
          localStorage.setItem(this.token, response.data);
          return response;
        })
      );
  }
  login(email: string, password: string): Observable<ApiResponse<string>> {
    return this.httpClient
      .post<ApiResponse<string>>(`${this.baseUrl}/login`, { email, password })
      .pipe(
        tap((response) => {
          if (response.isSuccess) {
            localStorage.setItem(this.token, response.data);
          }
          return response;
        })
      );
  }
}
