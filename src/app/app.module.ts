import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

// Components
import { UserSignupComponent } from './components/user-signup/user-signup.component';
import { UserLoginComponent } from './components/user-login/user-login.component';
import { AdminSignupComponent } from './components/admin-signup/admin-signup.component';
import { AdminLoginComponent } from './components/admin-login/admin-login.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { OrdersComponent } from './components/orders/orders.component';
import { PurchaseComponent } from './components/purchase/purchase.component';
import { SettingsComponent } from './components/settings/settings.component';
import { HelpComponent } from './components/help/help.component';
import { MyAccountComponent } from './components/my-account/my-account.component';
import { AdminUsersComponent } from './components/admin-users/admin-users.component';
import { AdminAnalyticsComponent } from './components/admin-analytics/admin-analytics.component';
import { UserAnalyticsComponent } from './components/user-analytics/user-analytics.component';

// Services
import { AuthService } from './services/auth.service';
import { DataService } from './services/data.service';

// Guards
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';

// Interceptors
import { AuthInterceptor } from './interceptors/auth.interceptor';

@NgModule({
  declarations: [
    AppComponent,
    UserSignupComponent,
    UserLoginComponent,
    AdminSignupComponent,
    AdminLoginComponent,
    SidebarComponent,
    DashboardComponent,
    OrdersComponent,
    PurchaseComponent,
    SettingsComponent,
    HelpComponent,
    MyAccountComponent,
    AdminUsersComponent,
    AdminAnalyticsComponent,
    UserAnalyticsComponent
  ],
  imports: [
    CommonModule,
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    AppRoutingModule
  ],
  providers: [
    AuthService,
    DataService,
    AuthGuard,
    AdminGuard,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
