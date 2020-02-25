import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthData } from './auth-data.model';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private token: string;
  private authStatusListener = new Subject<boolean>();
  private isAuthenticated: boolean = false;
  private tokenTimer: any;

  private setAuthTimer(duration: number) {
    this.tokenTimer = setTimeout(() => {
      this.logOutUser();
    }, duration * 1000);
  }

  autoAuthUser() {
    const authInformation = this.getAuthData();
    if (!authInformation) return;

    const currentTimeStamp = new Date();
    const expiresIn = authInformation.expirationDate.getTime() - currentTimeStamp.getTime();

    if (expiresIn > 0) {
      this.token = authInformation.token;
      this.isAuthenticated = true;
      this.setAuthTimer(expiresIn / 1000);
      this.authStatusListener.next(true);
    }
  }

  private getAuthData() {
    const token = localStorage.getItem('token');
    const expirationDate = localStorage.getItem('expiration');

    if (!token || !expirationDate) return;
    return {
      token: token,
      expirationDate: new Date(expirationDate)
    }
  }

  private saveAuthData(token: string, expirationDate: Date) {
    localStorage.setItem('token', token);
    localStorage.setItem('expiration', expirationDate.toISOString());
  }

  private clearAllData() {
    localStorage.removeItem('token');
    localStorage.removeItem('expiration');
  }

  getIsAuth() {
    return this.isAuthenticated;
  }

  getToken() {
    return this.token;
  }

  getAuthStatusListener() {
    return this.authStatusListener.asObservable();
  }

  createUser(email: string, password: string) {
    const url: string = 'http://localhost:3000/api/auth/signup';
    const authData: AuthData = { email: email, password: password };
    
    this.http.post(url, authData).subscribe(response => {
      console.log(response);
    });
  }

  logInUser(email: string, password: string) {
    const url: string = 'http://localhost:3000/api/auth/login';
    const authData: AuthData = { email: email, password: password };
    
    this.http.post<{ token: string, expiresIn: number }>(url, authData).subscribe(response => {
      const token = response.token;
      this.token = token;

      if (token) {
        const expiresInDuration: number = response.expiresIn;
        const currentTimeStamp = new Date();
        const expirationDate = new Date(currentTimeStamp.getTime() + expiresInDuration * 1000);
        this.saveAuthData(token, expirationDate);
        this.setAuthTimer(expiresInDuration);
        this.isAuthenticated = true;
        this.authStatusListener.next(true);
        this.router.navigate(['/']);
      }
    });
  }

  logOutUser() {
    this.token = null;
    this.isAuthenticated = false;
    this.authStatusListener.next(false);
    this.router.navigate(['/']);
    this.clearAllData();
    
    clearTimeout(this.tokenTimer);
  }

  constructor(
    private http: HttpClient,
    private router: Router) { }
}
