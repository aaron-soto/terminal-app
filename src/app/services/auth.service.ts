import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private baseUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  register(email: string, password: string): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/register`,
      { email, password },
      { withCredentials: true }
    );
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/login`,
      { email, password },
      { withCredentials: true }
    );
  }

  logout(): Observable<any> {
    return this.http.get(`${this.baseUrl}/logout`, { withCredentials: true });
  }

  getSessionStatus(): Observable<any> {
    return this.http.get(`${this.baseUrl}/auth/status`, {
      withCredentials: true,
    });
  }
}
