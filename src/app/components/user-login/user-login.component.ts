import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-user-login',
  templateUrl: './user-login.component.html',
  styleUrls: ['./user-login.component.css']
})
export class UserLoginComponent {
  loginForm!: FormGroup;
  isLoading = false;
  errorMessage = '';
  showPassword = false;
  selectedRole: 'user' | 'admin' = 'user';

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.initializeForm();
    this.loadSavedEmail();
  }

  /**
   * Initialize login form with validation
   */
  private initializeForm(): void {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  /**
   * Load saved email from localStorage if "Remember Me" was checked
   */
  private loadSavedEmail(): void {
    const savedEmail = localStorage.getItem('userEmail');
    const rememberMe = localStorage.getItem('rememberMe') === 'true';
    if (savedEmail && rememberMe) {
      this.loginForm.patchValue({
        email: savedEmail,
        rememberMe: true
      });
    }
  }

  /**
   * Toggle between user and admin role
   */
  toggleRole(role: 'user' | 'admin'): void {
    this.selectedRole = role;
    this.errorMessage = '';
  }

  /**
   * Get form control for template
   */
  getControl(name: string) {
    return this.loginForm.get(name);
  }

  /**
   * Toggle password visibility
   */
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  /**
   * Handle form submission
   */
  onSubmit(): void {
    this.errorMessage = '';

    if (this.loginForm.invalid) {
      this.errorMessage = 'Please fill all fields correctly';
      return;
    }

    this.isLoading = true;
    const { email, password, rememberMe } = this.loginForm.value;
    const isAdmin = this.selectedRole === 'admin';

    // Save email if "Remember Me" is checked
    const emailKey = isAdmin ? 'adminEmail' : 'userEmail';
    const rememberKey = isAdmin ? 'rememberAdminMe' : 'rememberMe';
    
    if (rememberMe) {
      localStorage.setItem(emailKey, email);
      localStorage.setItem(rememberKey, 'true');
    } else {
      localStorage.removeItem(emailKey);
      localStorage.removeItem(rememberKey);
    }

    this.authService.login({ email, password }, isAdmin).subscribe({
      next: (response) => {
        this.isLoading = false;
        const dashboardPath = isAdmin ? '/admin/dashboard' : '/dashboard';
        this.router.navigate([dashboardPath]);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Login failed. Please try again.';
      }
    });
  }

  /**
   * Navigate to signup page
   */
  navigateToSignup(): void {
    this.router.navigate(['/signup']);
  }

  /**
   * Navigate to forgot password page
   */
  navigateToForgotPassword(): void {
    this.router.navigate(['/forgot-password']);
  }
}
