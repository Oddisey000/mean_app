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
  private userID: string;

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
      this.userID = authInformation.userID;
      this.setAuthTimer(expiresIn / 1000);
      this.authStatusListener.next(true);
    }
  }

  private getAuthData() {
    const token = localStorage.getItem('token');
    const expirationDate = localStorage.getItem('expiration');
    const userID = localStorage.getItem('userID');

    if (!token || !expirationDate) return;
    return {
      token: token,
      expirationDate: new Date(expirationDate),
      userID: userID
    }
  }

  private saveAuthData(token: string, expirationDate: Date, userID: string) {
    localStorage.setItem('token', token);
    localStorage.setItem('expiration', expirationDate.toISOString());
    localStorage.setItem('userID', userID);
  }

  private clearAllData() {
    localStorage.removeItem('token');
    localStorage.removeItem('expiration');
    localStorage.removeItem('userID');
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

  getUserId() {
    return this.userID;
  }

  createUser(email: string, password: string) {
    const url: string = 'http://localhost:3000/api/auth/signup';
    const authData: AuthData = { email: email, password: password };
    
    this.http.post(url, authData)
    .subscribe(() => {
      this.router.navigate(['/']);
    }, error => {
      this.authStatusListener.next(false);
    });
  }

  logInUser(email: string, password: string) {
    const url: string = 'http://localhost:3000/api/auth/login';
    const authData: AuthData = { email: email, password: password };
    
    this.http.post<{ token: string, expiresIn: number, userID: string }>(url, authData).subscribe(response => {
      const token = response.token;
      this.token = token;

      if (token) {
        const expiresInDuration: number = response.expiresIn;
        const currentTimeStamp = new Date();
        const expirationDate = new Date(currentTimeStamp.getTime() + expiresInDuration * 1000);
        this.userID = response.userID;
        this.saveAuthData(token, expirationDate, this.userID);
        this.setAuthTimer(expiresInDuration);
        this.isAuthenticated = true;
        this.authStatusListener.next(true);
        this.router.navigate(['/']);
      }
    }, error => {
      this.authStatusListener.next(false);
    });
  }

  logOutUser() {
    this.token = null;
    this.userID = null;
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
