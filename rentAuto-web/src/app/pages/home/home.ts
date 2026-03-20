import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Navbar } from '../../components/navbar/navbar';
import { FormsModule } from '@angular/forms';
import { CarsCarusel } from '../../components/cars-carusel/cars-carusel';
import { Noticias } from "../../components/noticias/noticias";
import { Faq } from "../../components/faq/faq";

@Component({
  selector: 'app-home',
  imports: [RouterModule, CommonModule, FormsModule, CarsCarusel, Noticias, Faq],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  promoActive = false;
  promoCode = '';

}
