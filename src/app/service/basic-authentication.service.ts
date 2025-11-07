import { API_URL } from './../app.constants';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { jwtDecode } from 'jwt-decode';

export const TOKEN = 'token'
export const AUTHENTICATED_USER = 'authenticaterUser'
export const USER_ROLES = 'userRoles';

interface DecodedToken {
  sub: string;      // username
  roles: string[];  // roles from backend
  exp: number;      // expiration timestamp
  iat: number;      // issued at timestamp
}

@Injectable({
  providedIn: 'root'
})
export class BasicAuthenticationService {

  constructor(private http: HttpClient) { }

  executeJWTAuthenticationService(username: string, password: string) {
    return this.http.post<any>(`${API_URL}/authenticate`, { username, password })
        .pipe(map(data => {
            localStorage.setItem('authToken', data.token);
            return data;
        }));
}

  executeAuthenticationService(username: string, password: string) {

    let basicAuthHeaderString = 'Basic ' + window.btoa(username + ':' + password);

    let headers = new HttpHeaders({
      Authorization: basicAuthHeaderString
    })

    return this.http.get<AuthenticationBean>(
      `${API_URL}/basicauth`,
      { headers }).pipe(
        map(
          data => {
            sessionStorage.setItem(AUTHENTICATED_USER, username);
            sessionStorage.setItem(TOKEN, basicAuthHeaderString);
            return data;
          }
        )
      );
    //console.log("Execute Hello World Bean Service")
  }

  getAuthenticatedUser() {
    return sessionStorage.getItem(AUTHENTICATED_USER)
  }

  setLoggedInUser(username: string) {
    localStorage.setItem('authUser', username);
  }

  getAuthenticatedToken() {
    if (this.getAuthenticatedUser())
      return sessionStorage.getItem(TOKEN)
    return null
  }

  logout() {
  localStorage.removeItem('authToken');    // JWT
  localStorage.removeItem('authUser');     // optional username
}

  getUserRoles(): string[] {
    return (localStorage.getItem('roles') || '').split(' ');
  }

  getToken() {
    const token = localStorage.getItem('authToken'); // or sessionStorage
    return !!token;
  }

  hasRole(role: string): boolean {
    const rolesStr = localStorage.getItem('roles');
    if (!rolesStr) return false;

    const roles: string[] = JSON.parse(rolesStr);
    return roles.includes(role);
  }

  isUserLoggedIn() {
    return this.getToken() != null;
  }

  getRoles(): string[] {
    const roles = localStorage.getItem('roles');
    return roles ? JSON.parse(roles) : [];
  }

}

export class AuthenticationBean {
  constructor(public message: string) { }
}