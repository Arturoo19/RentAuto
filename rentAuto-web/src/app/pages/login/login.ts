import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterModule,FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  email = ''
  password = ''

  constructor(
    private authService: AuthService,
    private router: Router
  ){}

  async login(){
    try{
      await this.authService.login(this.email,this.password)
      this.router.navigate(['/home'])
    }catch(error){
      alert("Error al iniciar sesion")
    }
  }
}