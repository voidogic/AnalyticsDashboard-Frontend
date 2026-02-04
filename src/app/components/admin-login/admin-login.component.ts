import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin-login',
  templateUrl: './admin-login.component.html',
  styleUrls: ['./admin-login.component.css']
})
export class AdminLoginComponent {
  loginForm!: FormGroup;
  isLoading = false;
  errorMessage = '';
  showPassword = false;
  rememberMe = false;

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
    const savedEmail = localStorage.getItem('adminEmail');
    const rememberMe = localStorage.getItem('rememberAdminMe') === 'true';
    if (savedEmail && rememberMe) {
      this.loginForm.patchValue({
        email: savedEmail,
        rememberMe: true
      });
    }
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

    // Save email if "Remember Me" is checked
    if (rememberMe) {
      localStorage.setItem('adminEmail', email);
      localStorage.setItem('rememberAdminMe', 'true');
    } else {
      localStorage.removeItem('adminEmail');
      localStorage.removeItem('rememberAdminMe');
    }

    this.authService.login({ email, password }, true).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.router.navigate(['/admin/dashboard']);
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
    this.router.navigate(['/admin/signup']);
  }
}
