import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  email = '';
  password = '';
  loginError = '';

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  login() {
    this.authService.login(this.email, this.password).subscribe({
      next: async () => {
        this.loginError = '';
        await Swal.fire({
          icon: 'success',
          title: 'Bienvenido',
          text: 'Inicio de sesión correcto',
          timer: 1600,
          showConfirmButton: false,
        });
        this.router.navigate(['/home']);
      },
      error: () => {
        this.loginError = 'Email o contraseña incorrectos';
      },
    });
  }
}
