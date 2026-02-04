import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserSignupComponent } from './components/user-signup/user-signup.component';
import { UserLoginComponent } from './components/user-login/user-login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { OrdersComponent } from './components/orders/orders.component';
import { PurchaseComponent } from './components/purchase/purchase.component';
import { SettingsComponent } from './components/settings/settings.component';
import { HelpComponent } from './components/help/help.component';
import { MyAccountComponent } from './components/my-account/my-account.component';
import { AdminUsersComponent } from './components/admin-users/admin-users.component';
import { AdminAnalyticsComponent } from './components/admin-analytics/admin-analytics.component';
import { UserAnalyticsComponent } from './components/user-analytics/user-analytics.component';
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';

const routes: Routes = [
  // Unified auth routes
  { path: 'login', component: UserLoginComponent },
  { path: 'signup', component: UserSignupComponent },
  
  // Legacy routes - redirect to unified pages
  { path: 'user/login', redirectTo: '/login', pathMatch: 'full' },
  { path: 'user/signup', redirectTo: '/signup', pathMatch: 'full' },
  { path: 'admin/login', redirectTo: '/login', pathMatch: 'full' },
  { path: 'admin/signup', redirectTo: '/signup', pathMatch: 'full' },

  // User routes
  {
    path: 'user',
    children: [
      {
        path: 'dashboard',
        component: DashboardComponent,
        canActivate: [AuthGuard],
        data: { role: 'user' }
      }
    ]
  },

  // Admin routes
  {
    path: 'admin',
    children: [
      {
        path: 'dashboard',
        component: DashboardComponent,
        canActivate: [AuthGuard],
        data: { role: 'admin' }
      }
    ]
  },

  // Dashboard and main pages
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'orders',
    component: OrdersComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'purchase',
    component: PurchaseComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'settings',
    component: SettingsComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'help',
    component: HelpComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'my-account',
    component: MyAccountComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'analytics',
    component: UserAnalyticsComponent,
    canActivate: [AuthGuard]
  },

  // Admin-only pages
  {
    path: 'admin-users',
    component: AdminUsersComponent,
    canActivate: [AdminGuard]
  },
  {
    path: 'admin-analytics',
    component: AdminAnalyticsComponent,
    canActivate: [AdminGuard]
  },

  // Default redirect
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
