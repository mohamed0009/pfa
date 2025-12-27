import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  loading = false;
  submitted = false;
  errorMessage = '';
  showPassword = false;
  returnUrl = '/';

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Initialize form
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });

    // Get return url from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  // Convenience getter for easy access to form fields
  get f() {
    return this.loginForm.controls;
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    this.submitted = true;
    this.errorMessage = '';

    // Stop if form is invalid
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;

    this.authService.login(this.loginForm.value).subscribe({
      next: (user) => {
        console.log('Login successful', user);
        // Rediriger selon le rôle
        const role = user.role?.toUpperCase();
        if (role === 'ADMIN') {
          this.router.navigate(['/admin/dashboard']);
        } else if (role === 'TRAINER') {
          this.router.navigate(['/trainer/dashboard']);
        } else {
          this.router.navigate(['/user/dashboard']);
        }
      },
      error: (error) => {
        console.error('❌ Login error:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        
        // Message d'erreur détaillé
        let errorMsg = 'Erreur lors de la connexion. Veuillez réessayer.';
        
        if (error?.error?.message) {
          errorMsg = error.error.message;
        } else if (error?.error?.error) {
          errorMsg = error.error.error;
        } else if (error?.message) {
          errorMsg = error.message;
        } else if (error?.status === 0 || error?.statusText === 'Unknown Error') {
          errorMsg = 'Impossible de se connecter au serveur. Vérifiez que le backend est démarré sur http://localhost:8081';
        } else if (error?.status === 401) {
          errorMsg = 'Email ou mot de passe incorrect.';
        } else if (error?.status === 500) {
          errorMsg = 'Erreur serveur. Veuillez réessayer plus tard.';
        }
        
        this.errorMessage = errorMsg;
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  onForgotPassword(): void {
    const email = this.f['email'].value;
    if (email && this.f['email'].valid) {
      this.authService.forgotPassword(email).subscribe({
        next: () => {
          alert('Password reset link has been sent to your email.');
        },
        error: (error) => {
          this.errorMessage = 'Failed to send reset link. Please try again.';
        }
      });
    } else {
      alert('Please enter a valid email address first.');
    }
  }
}





