import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  isSidebarOpen = true;
  currentUser$ = this.authService.currentUser$;
  isAdmin$: Observable<boolean>;

  constructor(private router: Router, private authService: AuthService) {
    this.isAdmin$ = new Observable(observer => {
      this.authService.userRole$.subscribe(role => {
        observer.next(role === 'admin');
      });
    });
  }

  ngOnInit(): void {}

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
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
