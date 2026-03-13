import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-register',
  imports: [CommonModule,FormsModule,RouterModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  email = ''
  password = ''
  confirmPassword = ''
  passwordError = false

  constructor(
    private authService: AuthService, 
    private router: Router){}

  async register(){
    if(this.password!== this.confirmPassword){
      this.passwordError = true
      return
    }
    this.passwordError = false
    try{
      await this.authService.register(this.email,this.password)
      alert("Usuario creado")
      this.router.navigate(['/login'])
    } catch(error){
      console.error(error);
      alert(error);
    }
  }
}
