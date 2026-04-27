import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth';
import { filter } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar implements OnInit {
  user: any = null;
  mobileMenuOpen = false;

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.user = this.authService.getCurrentUser();

    // оновлюємо юзера після кожної навігації
    // тобто після логіну коли Angular переходить на іншу сторінку
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      this.user = this.authService.getCurrentUser();
      this.mobileMenuOpen = false;
    });
  }

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  closeMobileMenu() {
    this.mobileMenuOpen = false;
  }

  logout() {
    this.user = null;
    this.mobileMenuOpen = false;
    this.authService.logout();
  }
}
