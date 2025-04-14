import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { AuthService } from '../services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiResponse } from '../models/api-response';
import { Router, RouterLink } from '@angular/router';
@Component({
  selector: 'app-login',
  imports: [
    MatInputModule,
    FormsModule,
    MatFormFieldModule,
    MatIconModule,
    RouterLink,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  email!: string;
  password!: string;

  private authService = inject(AuthService);
  private toast = inject(MatSnackBar);
  private router = inject(Router);

  hide = signal(false);

  login() {
    this.authService.login(this.email, this.password).subscribe({
      next: () => {
        this.authService.profile().subscribe();

        this.toast.open('Login successful', 'Close', { duration: 7000 });
      },
      error: (err: HttpErrorResponse) => {
        let error = err.error as ApiResponse<string>;
        this.toast.open(error.message, 'Close', {
          duration: 7000,
          panelClass: ['snackbar-error'],
        });
      },
      complete: () => {
        this.router.navigate(['/']);
      },
    });
  }
  togglePassword(event: MouseEvent) {
    this.hide.set(!this.hide());
    event.stopPropagation();
  }
}
