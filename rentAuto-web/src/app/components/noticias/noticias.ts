import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-noticias',
  imports: [CommonModule, RouterModule],
  templateUrl: './noticias.html',
  styleUrl: './noticias.css',
})
export class Noticias {
  news = [
    {
      slug: 'nuevas-incorporaciones-catalogo',
      title: 'Nuevas incorporaciones a nuestro catálogo',
      description: 'Ampliamos nuestra selección con nuevos modelos cuidadosamente revisados para ofrecer más opciones, mayor calidad y la confianza que nos caracteriza.',
      tag: 'Novedades',
      image: '/noticias/noticia1.jpeg'
    },
    {
      slug: 'vehiculos-destacados-semana',
      title: 'Vehículos destacados de la semana',
      description: 'Descubre los modelos más buscados y mejor valorados por nuestros clientes esta semana.',
      tag: 'Destacados',
      image: '/noticias/noticia2.webp'
    },
    {
      slug: 'consejos-proximo-viaje-coche',
      title: 'Consejos para tu próximo viaje en coche',
      description: 'Te damos los mejores consejos para que tu viaje sea cómodo, seguro y sin imprevistos.',
      tag: 'Consejos',
      image: '/noticias/noticia3.webp'
    },
  ];
}
