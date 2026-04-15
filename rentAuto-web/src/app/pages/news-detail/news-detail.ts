import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';

type NewsArticle = {
  title: string;
  tag: string;
  image: string;
  summary: string;
  readingTime: string;
  publishedAt: string;
  content: string[];
  highlights: string[];
  tips: string[];
  facts: { label: string; value: string }[];
  ctaTitle: string;
  ctaText: string;
};

@Component({
  selector: 'app-news-detail',
  imports: [CommonModule, RouterModule],
  templateUrl: './news-detail.html',
  styleUrl: './news-detail.css',
})
export class NewsDetail {
  private readonly articles: Record<string, NewsArticle> = {
    'nuevas-incorporaciones-catalogo': {
      title: 'Nuevas incorporaciones a nuestro catálogo',
      tag: 'Novedades',
      image: '/noticias/noticia1.jpeg',
      summary:
        'Hemos ampliado la flota con modelos recientes para que tengas más variedad y mejor experiencia al reservar.',
      readingTime: '4 min de lectura',
      publishedAt: '15 abril 2026',
      content: [
        'Durante este mes añadimos nuevos vehículos compactos, SUV y berlinas para adaptarnos a escapadas cortas, viajes familiares y rutas de negocios. El objetivo es que puedas reservar justo el tipo de coche que necesitas, sin pagar de más por extras que no vas a usar.',
        'Cada unidad se incorpora solo después de una revisión técnica completa. Validamos frenos, neumáticos, luces, sistema eléctrico y estado general de seguridad para garantizar una entrega sin sorpresas.',
        'También reforzamos el proceso de limpieza y preparación previa. De esta forma, recoges el coche listo para salir y con documentación digital disponible desde tu panel de usuario.',
      ],
      highlights: [
        'Nuevos modelos compactos para ciudad y consumo eficiente.',
        'Más SUV automáticos para viajes largos y confort premium.',
        'Mayor disponibilidad en temporadas de alta demanda.',
      ],
      tips: [
        'Reserva con 7 a 10 días de antelación para encontrar mejores tarifas.',
        'Filtra por maletero y número de plazas antes de confirmar.',
        'Revisa la política de combustible para evitar cargos extra al devolver.',
      ],
      facts: [
        { label: 'Modelos añadidos', value: '18' },
        { label: 'Revisión técnica', value: '100% completada' },
        { label: 'Tiempo medio de entrega', value: '< 15 min' },
      ],
      ctaTitle: 'Encuentra tu nuevo coche ideal',
      ctaText:
        'Explora la flota actualizada y reserva en pocos pasos con confirmación inmediata.',
    },
    'vehiculos-destacados-semana': {
      title: 'Vehículos destacados de la semana',
      tag: 'Destacados',
      image: '/noticias/noticia2.webp',
      summary:
        'Estos son los modelos que más reservas han recibido esta semana por su confort y relación calidad-precio.',
      readingTime: '5 min de lectura',
      publishedAt: '14 abril 2026',
      content: [
        'Esta semana los clientes han valorado especialmente los híbridos por su consumo reducido y su conducción suave en trayectos urbanos. Son una opción equilibrada para quienes quieren ahorrar en combustible sin renunciar a confort.',
        'En paralelo, los SUV familiares lideran las reservas de fin de semana por su espacio interior y capacidad de carga. Para viajes con equipaje o niños, siguen siendo la categoría más elegida.',
        'Los modelos ejecutivos también crecen en demanda para traslados corporativos. Suelen agotarse antes en horarios de mañana, por eso recomendamos reservar con antelación.',
      ],
      highlights: [
        'Top categoría: híbridos urbanos de bajo consumo.',
        'Más buscados para escapadas: SUV de 5 plazas con gran maletero.',
        'Incremento de reservas corporativas en berlinas premium.',
      ],
      tips: [
        'Si viajas por ciudad, prioriza versiones híbridas o microhíbridas.',
        'Para autopista larga, revisa el paquete de asistencia y conectividad.',
        'Confirma kilometraje incluido antes de finalizar la reserva.',
      ],
      facts: [
        { label: 'Categoría líder', value: 'Híbridos' },
        { label: 'Satisfacción media', value: '4.8 / 5' },
        { label: 'Ahorro combustible', value: 'hasta 28%' },
      ],
      ctaTitle: 'Reserva los modelos más solicitados',
      ctaText:
        'Asegura disponibilidad de los destacados de la semana antes de que se agoten.',
    },
    'consejos-proximo-viaje-coche': {
      title: 'Consejos para tu próximo viaje en coche',
      tag: 'Consejos',
      image: '/noticias/noticia3.webp',
      summary:
        'Prepara tu viaje con antelación para conducir más seguro, cómodo y sin imprevistos durante la ruta.',
      readingTime: '6 min de lectura',
      publishedAt: '12 abril 2026',
      content: [
        'Antes de salir, revisa la documentación del conductor, el itinerario y las paradas de descanso. Planificar cada dos horas mejora la concentración y reduce la fatiga al volante.',
        'Comprueba si en tu destino existen normas específicas de estacionamiento, peajes o zonas de bajas emisiones. Este punto evita multas y pérdidas de tiempo durante el viaje.',
        'Prepara un kit práctico con agua, cargador, botiquín básico y linterna. Son elementos simples que marcan la diferencia ante imprevistos en carretera.',
      ],
      highlights: [
        'Planificar la ruta reduce desvíos y consumo innecesario.',
        'Las pausas frecuentes mejoran seguridad y comodidad.',
        'Un kit básico de viaje evita problemas comunes en ruta.',
      ],
      tips: [
        'Guarda el teléfono de asistencia en carretera antes de salir.',
        'Evita conducir más de 8 horas en el mismo día.',
        'Si viajas con niños, añade paradas cortas cada 90 minutos.',
      ],
      facts: [
        { label: 'Descanso recomendado', value: 'cada 2 horas' },
        { label: 'Duración ideal diaria', value: '6-8 horas' },
        { label: 'Checklist previo', value: '10 minutos' },
      ],
      ctaTitle: 'Prepara tu viaje como un profesional',
      ctaText:
        'Elige un coche acorde a tu ruta y viaja con tranquilidad desde el primer kilómetro.',
    },
  };

  article: NewsArticle | null = null;

  constructor(private route: ActivatedRoute) {
    this.route.paramMap.subscribe((params) => {
      const slug = params.get('slug') ?? '';
      this.article = this.articles[slug] ?? null;
    });
  }
}
