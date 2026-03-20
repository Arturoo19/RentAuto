import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-register',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  nombre = '';
  email = '';
  password = '';
  confirmPassword = '';
  passwordError = false;
  passwordLongitudError = false;

  constructor(private authService: AuthService, private router: Router) {}

  async register() {
    if (this.password.length < 6) {
      this.passwordLongitudError = true;
      return;
    }
    this.passwordLongitudError = false;

    if (this.password !== this.confirmPassword) {
      this.passwordError = true;
      return;
    }
    this.passwordError = false;

    try {
      await this.authService.register(this.email, this.password, this.nombre);
      this.router.navigate(['/home']);
    } catch (error) {
      alert('Error al crear la cuenta');
    }
  }
}