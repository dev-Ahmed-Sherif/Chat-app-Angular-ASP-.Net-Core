import { Component, inject, signal } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';
import { ApiResponse } from '../models/api-response';
import { Router, RouterLink } from '@angular/router';
import { ButtonComponent } from '../components/button/button.component';

@Component({
  selector: 'app-register',
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    RouterLink,
    ButtonComponent,
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  email!: string;
  password!: string;
  userName!: string;
  fullName!: string;
  profilePicture: string = 'https://randomuser.me/api/portraits/lego/5.jpg';
  profileImage: File | null = null;

  authService = inject(AuthService);
  toast = inject(MatSnackBar);
  router = inject(Router);

  hide = signal(true);
  register() {
    this.authService.isLoading.set(true);
    const formData = new FormData();
    formData.append('email', this.email);
    formData.append('password', this.password);
    formData.append('fullName', this.fullName);
    formData.append('userName', this.userName);
    if (this.profileImage) {
      formData.append(
        'profileImage',
        this.profileImage,
        this.profileImage.name
      );
    }

    this.authService.register(formData).subscribe({
      next: () => {
        this.toast.open('Registration successful', 'Close', {
          duration: 7000,
          panelClass: ['snackbar-success'],
        });
        this.authService.isLoading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        let err = error.error as ApiResponse<string>;
        this.toast.open(err.error, 'Close', {
          duration: 7000,
          panelClass: ['snackbar-error'],
        });
        this.authService.isLoading.set(false);
      },
      complete: () => {
        this.router.navigate(['/login']);
        this.authService.isLoading.set(false);
      },
    });
  }

  togglePassword(event: MouseEvent) {
    // event.preventDefault();
    // this.hide.update((prev) => !prev);
    this.hide.set(!this.hide());
    event.stopPropagation();
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (!file) {
      return;
    }
    this.profileImage = file;

    const reader = new FileReader();
    reader.onload = (e) => {
      this.profilePicture = e.target?.result as string;
      console.log(e.target?.result);
    };
    reader.readAsDataURL(file);
    console.log(this.profilePicture);
  }
}
