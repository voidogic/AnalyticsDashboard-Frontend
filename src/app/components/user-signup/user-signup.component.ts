import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-user-signup',
  templateUrl: './user-signup.component.html',
  styleUrls: ['./user-signup.component.css']
})
export class UserSignupComponent {
  signupForm!: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  showPassword = false;
  selectedRole: 'user' | 'admin' = 'user';

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.initializeForm();
  }

  /**
   * Toggle between user and admin role
   */
  toggleRole(role: 'user' | 'admin'): void {
    this.selectedRole = role;
    this.errorMessage = '';
    this.successMessage = '';
  }

  /**
   * Initialize signup form with validation
   */
  private initializeForm(): void {
    this.signupForm = this.formBuilder.group({
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      agreeTerms: [false, Validators.requiredTrue]
    }, { validators: this.passwordMatchValidator });
  }

  /**
   * Custom validator to check if passwords match
   */
  private passwordMatchValidator(group: FormGroup): { [key: string]: any } | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  /**
   * Get form control for template
   */
  getControl(name: string) {
    return this.signupForm.get(name);
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
    this.successMessage = '';

    if (this.signupForm.invalid) {
      this.errorMessage = 'Please fill all fields correctly';
      return;
    }

    this.isLoading = true;
    const { fullName, email, password } = this.signupForm.value;
    const role = this.selectedRole;

    this.authService.signup({ fullName, email, password, role }).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.successMessage = response.message;
        setTimeout(() => {
          const dashboardPath = role === 'admin' ? '/admin/dashboard' : '/dashboard';
          this.router.navigate([dashboardPath]);
        }, 1500);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Signup failed. Please try again.';
      }
    });
  }

  /**
   * Navigate to login page
   */
  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }
}
