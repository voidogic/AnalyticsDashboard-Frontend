import { Component, OnInit } from '@angular/core';
import { AuthService } from './services/auth.service';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'SmartWinnrr';
  isAuthenticated$: Observable<boolean>;
  currentUser$ = this.authService.currentUser$;
  showSidebar = false;

  constructor(private authService: AuthService, private router: Router) {
    this.isAuthenticated$ = this.authService.isAuthenticated$;
  }

  ngOnInit(): void {
    this.isAuthenticated$.subscribe(isAuth => {
      this.showSidebar = isAuth && !this.isLoginPage();
    });
    this.router.events.subscribe(() => {
      this.isAuthenticated$.subscribe(isAuth => {
        this.showSidebar = isAuth && !this.isLoginPage();
      });
    });
  }

  isLoginPage(): boolean {
    const url = this.router.url;
    return url.includes('/login') || url.includes('/signup');
  }

  logout(): void {
    this.authService.logout().subscribe(
      () => {
        // Navigation happens in service
      },
      error => {
        // Even if logout fails, we redirect in service
      }
    );
  }
}
