import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ApiResponse } from '../models/api-response';
import { User } from '../models/user';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private baseUrl = 'http://localhost:5093/api/account';

  private httpClient = inject(HttpClient);

  private token = 'token';
  private user = 'user';


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


  profile(): Observable<ApiResponse<User>> {
    return this.httpClient
      .get<ApiResponse<User>>(`${this.baseUrl}/profile`, {
        headers: {
          Authorization: `Bearer ${this.getAccessToken}`,
        },
      })

      .pipe(
        tap((response) => {
          if (response.isSuccess) {
            localStorage.setItem(this.user, JSON.stringify(response.data));
          }
          return response;
        })
      );
  }



  get getAccessToken(): string | null {
    // console.log('getAccessToken', localStorage.getItem(this.token));
    return localStorage.getItem(this.token) || '';
  }

  isLoggedIn(): boolean {
    return !!this.getAccessToken;
  }
  logout() {
    localStorage.removeItem(this.token);
    localStorage.removeItem(this.user);
  }
  get currentLoggedUser(): User | null {
    const user: User = JSON.parse(localStorage.getItem(this.user) || '{}');
    return user ? user : null;
  }

}
