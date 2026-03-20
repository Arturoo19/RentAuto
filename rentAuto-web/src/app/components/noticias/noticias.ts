import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-noticias',
  imports: [CommonModule],
  templateUrl: './noticias.html',
  styleUrl: './noticias.css',
})
export class Noticias {
  news = [
    {
      title: 'Nuevas incorporaciones a nuestro catálogo',
      description: 'Ampliamos nuestra selección con nuevos modelos cuidadosamente revisados para ofrecer más opciones, mayor calidad y la confianza que nos caracteriza.',
      tag: 'Novedades',
      image: '/news/new-cars.jpg'
    },
    {
      title: 'Vehículos destacados de la semana',
      description: 'Descubre los modelos más buscados y mejor valorados por nuestros clientes esta semana.',
      tag: 'Destacados',
      image: '/news/featured.jpg'
    },
    {
      title: 'Consejos para tu próximo viaje en coche',
      description: 'Te damos los mejores consejos para que tu viaje sea cómodo, seguro y sin imprevistos.',
      tag: 'Consejos',
      image: '/news/tips.jpg'
    },
  ];
}
