import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';



export interface SignupData {
  fullName: string;
  email: string;
  password: string;
  role?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface User {
  _id: string;
  fullName: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: User;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromStorage());
  public currentUser$ = this.currentUserSubject.asObservable();

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(!!this.getToken());
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  private userRoleSubject = new BehaviorSubject<string | null>(this.getRoleFromStorage());
  public userRole$ = this.userRoleSubject.asObservable();

  constructor(private httpClient: HttpClient, private router: Router) {
    this.checkTokenValidity();
  }

  /**
   * Sign up new user account
   */
  signup(data: SignupData): Observable<AuthResponse> {
    const endpoint = data.role === 'admin' ? `${this.apiUrl}/signup/admin` : `${this.apiUrl}/signup`;
    return this.httpClient.post<AuthResponse>(endpoint, data).pipe(
      tap(response => {
        if (response.token && response.user) {
          this.setToken(response.token);
          this.setCurrentUser(response.user);
          this.isAuthenticatedSubject.next(true);
          this.userRoleSubject.next(response.user.role);
        }
      }),
      catchError(error => {
        console.error('Signup error:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Login user with email and password
   */
  login(data: LoginData, isAdmin: boolean = false): Observable<AuthResponse> {
    const endpoint = isAdmin ? `${this.apiUrl}/login/admin` : `${this.apiUrl}/login`;
    return this.httpClient.post<AuthResponse>(endpoint, data).pipe(
      tap(response => {
        if (response.token && response.user) {
          this.setToken(response.token);
          this.setCurrentUser(response.user);
          this.isAuthenticatedSubject.next(true);
          this.userRoleSubject.next(response.user.role);
        }
      }),
      catchError(error => {
        console.error('Login error:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get current user profile
   */
  getProfile(): Observable<AuthResponse> {
    return this.httpClient.get<AuthResponse>(`${this.apiUrl}/profile`).pipe(
      tap(response => {
        if (response.user) {
          this.setCurrentUser(response.user);
        }
      }),
      catchError(error => {
        console.error('Get profile error:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Update user profile
   */
  updateProfile(fullName: string, email: string): Observable<AuthResponse> {
    return this.httpClient.put<AuthResponse>(`${this.apiUrl}/profile`, { fullName, email }).pipe(
      tap(response => {
        if (response.user) {
          this.setCurrentUser(response.user);
        }
      }),
      catchError(error => {
        console.error('Update profile error:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Change user password
   */
  changePassword(currentPassword: string, newPassword: string, confirmPassword: string): Observable<AuthResponse> {
    return this.httpClient.post<AuthResponse>(`${this.apiUrl}/change-password`, {
      currentPassword,
      newPassword,
      confirmPassword
    }).pipe(
      catchError(error => {
        console.error('Change password error:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Logout user
   */
  logout(): Observable<AuthResponse> {
    return this.httpClient.post<AuthResponse>(`${this.apiUrl}/logout`, {}).pipe(
      tap(() => {
        this.clearAuthData();
        this.router.navigate(['/login']);
      }),
      catchError(error => {
        console.error('Logout error:', error);
        this.clearAuthData();
        this.router.navigate(['/login']);
        return throwError(() => error);
      })
    );
  }

  /**
   * Clear auth data locally and navigate to login (used by interceptor on 401)
   */
  public logoutLocal(): void {
    this.clearAuthData();
    this.router.navigate(['/login']);
  }

  /**
   * Get JWT token from localStorage
   */
  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  /**
   * Set JWT token in localStorage
   */
  private setToken(token: string): void {
    localStorage.setItem('authToken', token);
  }

  /**
   * Get current user from BehaviorSubject
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Set current user
   */
  private setCurrentUser(user: User): void {
    localStorage.setItem('currentUser', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  /**
   * Get current user from storage
   */
  private getUserFromStorage(): User | null {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  }

  /**
   * Get user role from storage
   */
  private getRoleFromStorage(): string | null {
    const user = this.getUserFromStorage();
    return user ? user.role : null;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  /**
   * Check if user is admin
   */
  isAdmin(): boolean {
    return this.userRoleSubject.value === 'admin';
  }

  /**
   * Check if user is regular user
   */
  isUser(): boolean {
    return this.userRoleSubject.value === 'user';
  }

  /**
   * Clear all auth data
   */
  private clearAuthData(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    this.userRoleSubject.next(null);
  }

  /**
   * Check if token is still valid
   */
  private checkTokenValidity(): void {
    const token = this.getToken();
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const expiryTime = payload.exp * 1000;
        if (expiryTime < Date.now()) {
          this.clearAuthData();
        }
      } catch (error) {
        console.error('Token validation error:', error);
        this.clearAuthData();
      }
    }
  }
}
