import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-faq',
  imports: [CommonModule],
  templateUrl: './faq.html',
  styleUrl: './faq.css',
})
export class Faq {
  openIndex: number | null = null;

  faqs = [
    { question: '¿Qué documentos necesito para alquilar un coche?', answer: 'Necesitas un carné de conducir válido, un documento de identidad o pasaporte y una tarjeta de crédito o débito a tu nombre.' },
    { question: '¿Puedo cancelar mi reserva?', answer: 'Sí, puedes cancelar tu reserva de forma gratuita hasta 24 horas antes de la recogida. Después de ese plazo se aplicará una tarifa de cancelación.' },
    { question: '¿Está incluido el seguro?', answer: 'Todos nuestros vehículos incluyen seguro básico a terceros. También ofrecemos seguros a todo riesgo por un coste adicional.' },
    { question: '¿Puedo devolver el coche en una ciudad diferente?', answer: 'Sí, ofrecemos la opción de devolución en otra ubicación. Consulta el coste adicional en el momento de la reserva.' },
    { question: '¿Cuál es la edad mínima para alquilar?', answer: 'La edad mínima es de 21 años y tener el carné de conducir desde hace al menos 1 año. Para conductores menores de 25 años puede aplicarse un cargo adicional.' },
  ];

  toggle(i: number) {
    this.openIndex = this.openIndex === i ? null : i;
  }
  openChat() {
  (window as any).$chatwoot?.toggle('open');
}
}
