import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../app.constants';
import { BasicAuthenticationService } from '../service/basic-authentication.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
  username = '';
  password = '';
  confirmPassword = '';
  errorMessage = '';
  successMessage = '';

  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: BasicAuthenticationService
  ) {}

  handleSignup() {
    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match!';
      return;
    }

    this.http.post<any>(`${API_URL}/api/signup`, {
      username: this.username,
      password: this.password
    }).subscribe({
      next: (response) => {
        // Save JWT token returned from signup
        localStorage.setItem('authToken', response.token);

        // Update menu/navbar state if needed
        this.authService.setLoggedInUser(this.username);

        // Show success message
        this.successMessage = response.message || 'Signup successful!';

        // Redirect to welcome page
        this.router.navigate(['/welcome', this.username]);
      },
      error: err => {
        this.errorMessage = err.error?.message || 'Signup failed. Try again.';
      }
    });
  }
}
