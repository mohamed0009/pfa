import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss'
})
export class SignupComponent implements OnInit {
  signupForm!: FormGroup;
  loading = false;
  submitted = false;
  errorMessage = '';
  successMessage = '';
  showPassword = false;
  showConfirmPassword = false;
  passwordStrength: 'weak' | 'medium' | 'strong' = 'weak';

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  selectedRole: 'USER' | 'TRAINER' | 'ADMIN' = 'USER';

  ngOnInit(): void {
    // Initialize form with validation
    this.signupForm = this.formBuilder.group({
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email, this.emailFormatValidator.bind(this)]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        this.passwordStrengthValidator
      ]],
      confirmPassword: ['', [Validators.required]],
      role: ['USER', [Validators.required]],
      acceptTerms: [false, [Validators.requiredTrue]]
    }, {
      validators: this.passwordMatchValidator
    });
    
    // Watch role changes to update email validation
    this.signupForm.get('role')?.valueChanges.subscribe(role => {
      this.selectedRole = role;
      this.signupForm.get('email')?.updateValueAndValidity();
    });
  }
  
  // Custom validator for email format based on role
  emailFormatValidator(control: AbstractControl): ValidationErrors | null {
    const email = control.value;
    if (!email) {
      return null; // Let required validator handle empty emails
    }
    
    if (!this.selectedRole) {
      return null; // Wait for role selection
    }
    
    const emailLower = email.toLowerCase().trim();
    
    // First check basic email format
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(emailLower)) {
      return null; // Let Validators.email handle this
    }
    
    let expectedDomain = '';
    
    switch (this.selectedRole) {
      case 'USER':
        expectedDomain = '@etud.com';
        break;
      case 'TRAINER':
        expectedDomain = '@form.com';
        break;
      case 'ADMIN':
        expectedDomain = '@adm.com';
        break;
      default:
        return null;
    }
    
    if (!emailLower.endsWith(expectedDomain)) {
      return { emailFormat: { expectedDomain, role: this.selectedRole } };
    }
    
    return null;
  }

  // Custom validator for password strength
  passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) {
      return null;
    }

    const hasNumber = /[0-9]/.test(value);
    const hasUpper = /[A-Z]/.test(value);
    const hasLower = /[a-z]/.test(value);
    
    const passwordValid = hasNumber && hasUpper && hasLower;

    return !passwordValid ? { passwordStrength: true } : null;
  }

  // Custom validator to check if passwords match
  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (!password || !confirmPassword) {
      return null;
    }

    if (confirmPassword.value === '') {
      return null;
    }

    return password.value === confirmPassword.value ? null : { passwordMismatch: true };
  }

  // Convenience getter for easy access to form fields
  get f() {
    return this.signupForm.controls;
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  updatePasswordStrength(): void {
    const password = this.f['password'].value;
    if (!password) {
      this.passwordStrength = 'weak';
      return;
    }

    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    if (strength <= 2) {
      this.passwordStrength = 'weak';
    } else if (strength <= 3) {
      this.passwordStrength = 'medium';
    } else {
      this.passwordStrength = 'strong';
    }
  }

  getPasswordStrengthText(): string {
    switch (this.passwordStrength) {
      case 'weak': return 'Faible';
      case 'medium': return 'Moyen';
      case 'strong': return 'Fort';
      default: return '';
    }
  }

  getPasswordStrengthWidth(): string {
    switch (this.passwordStrength) {
      case 'weak': return '33%';
      case 'medium': return '66%';
      case 'strong': return '100%';
      default: return '0%';
    }
  }

  onSubmit(): void {
    this.submitted = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Stop if form is invalid
    if (this.signupForm.invalid) {
      return;
    }

    this.loading = true;
    
    // Split fullName into firstName and lastName
    const fullName = this.signupForm.value.fullName.trim();
    const nameParts = fullName.split(' ', 2);
    const firstName = nameParts[0] || '';
    const lastName = nameParts.length > 1 ? nameParts[1] : '';

    const signupData = {
      email: this.signupForm.value.email.trim().toLowerCase(),
      password: this.signupForm.value.password,
      firstName: firstName,
      lastName: lastName,
      role: this.signupForm.value.role
    };

    this.authService.signup(signupData).subscribe({
      next: (response) => {
        console.log('✅ Signup successful - User created in database:', response);
        
        // Afficher le message de succès avec plus de détails
        const userName = firstName || response.firstName || 'Utilisateur';
        const userEmail = signupData.email;
        this.successMessage = `✅ Compte créé avec succès dans la base de données ! Bienvenue ${userName} (${userEmail}) !`;
        this.loading = false;
        this.errorMessage = ''; // Effacer les erreurs précédentes
        
        // Store token
        if (response.token) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('user', JSON.stringify(response));
          console.log('✅ Token stored in localStorage');
        }
        
        // Attendre 4 secondes pour bien voir la notification avant de rediriger
        setTimeout(() => {
          const role = response.role?.toUpperCase() || this.signupForm.value.role;
          console.log(`🔄 Redirecting to ${role} dashboard...`);
          if (role === 'ADMIN') {
            this.router.navigate(['/admin/dashboard']);
          } else if (role === 'TRAINER') {
            this.router.navigate(['/trainer/dashboard']);
          } else {
            this.router.navigate(['/user/dashboard']);
          }
        }, 4000); // Augmenté à 4 secondes
      },
      error: (error) => {
        console.error('❌ Signup error:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        
        // Message d'erreur détaillé
        let errorMsg = 'Erreur lors de l\'inscription. Veuillez réessayer.';
        
        if (error?.error?.message) {
          errorMsg = error.error.message;
        } else if (error?.error?.error) {
          errorMsg = error.error.error;
        } else if (error?.message) {
          errorMsg = error.message;
        } else if (error?.status === 0 || error?.statusText === 'Unknown Error') {
          errorMsg = 'Impossible de se connecter au serveur. Vérifiez que le backend est démarré sur http://localhost:8081';
        } else if (error?.status === 400) {
          errorMsg = 'Données invalides. Vérifiez votre email et votre mot de passe.';
        } else if (error?.status === 500) {
          errorMsg = 'Erreur serveur. Veuillez réessayer plus tard.';
        }
        
        this.errorMessage = errorMsg;
        this.loading = false;
        this.successMessage = '';
      },
      complete: () => {
        // Ne pas mettre loading à false ici car on le fait dans next ou error
      }
    });
  }
}





