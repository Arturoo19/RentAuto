import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth';
import { User } from 'firebase/auth';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar {

  user: User | null = null;

  constructor(private authService: AuthService, private router: Router) {
    this.authService.getCurrentUser().subscribe(async (user) => {
      this.user = user;

      if (user) {
        const profile = await this.authService.getUserProfile(user.uid);
        const data = profile.data() as any;

        (window as any).$chatwoot?.setUser(user.uid, {
          email: user.email,
          name: data?.nombre || user.email
        });
      }
    });
  }

  logout() {
    const chatwoot = (window as any).$chatwoot;
    if (chatwoot) {
      chatwoot.reset();
    }

    this.authService.logout().then(() => {
      this.router.navigate(['/home']);
    });
  }
}