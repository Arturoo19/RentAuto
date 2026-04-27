import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';

type InfoContent = {
  pageType: string;
  title: string;
  subtitle: string;
  intro: string;
  lastUpdated: string;
  legalNotice: string;
  quickFacts: string[];
  sections: {
    heading: string;
    paragraphs: string[];
    bullets: string[];
  }[];
  faqs: {
    question: string;
    answer: string;
  }[];
  supportCard: {
    title: string;
    description: string;
    primaryActionLabel: string;
    primaryActionLink: string;
  };
};

@Component({
  selector: 'app-info-page',
  imports: [CommonModule, RouterModule],
  templateUrl: './info-page.html',
  styleUrl: './info-page.css',
})
export class InfoPage {
  private readonly pages: Record<string, InfoContent> = {
    privacy: {
      pageType: 'privacy',
      title: 'Política de privacidad',
      subtitle: 'Transparencia y protección de datos',
      intro:
        'Tratamos tus datos con criterios de minimización, seguridad y control por parte del usuario para que puedas reservar con confianza.',
      lastUpdated: 'Última actualización: 27/04/2026',
      legalNotice: 'Aplicable a todos los usuarios que utilicen la plataforma web y móvil de RentAuto.',
      quickFacts: [
        'No vendemos información personal.',
        'Solo compartimos datos con proveedores necesarios para prestar el servicio.',
        'Puedes solicitar acceso, rectificación o eliminación cuando quieras.',
      ],
      sections: [
        {
          heading: 'Datos que recopilamos',
          paragraphs: [
            'Recopilamos únicamente la información necesaria para gestionar reservas, soporte y cumplimiento normativo.',
            'Los datos de pago se procesan con pasarelas certificadas y no se almacenan íntegramente en nuestra plataforma.',
          ],
          bullets: [
            'Identificación y contacto: nombre, email y teléfono.',
            'Operativa de reserva: fechas, oficina, categoría de vehículo y extras.',
            'Facturación y trazabilidad de transacciones.',
          ],
        },
        {
          heading: 'Finalidades del tratamiento',
          paragraphs: [
            'Usamos tus datos para ejecutar la reserva, mantener la seguridad de la cuenta y responder incidencias.',
            'Solo tratamos la información con base legal válida: ejecución de contrato, consentimiento o interés legítimo.',
          ],
          bullets: [
            'Gestión de reservas, cambios y cancelaciones.',
            'Prevención de fraude y protección de la plataforma.',
            'Obligaciones legales, fiscales y de auditoría.',
          ],
        },
      ],
      faqs: [
        {
          question: '¿Cuánto tiempo se conservan mis datos?',
          answer:
            'Conservamos la información durante el tiempo estrictamente necesario para la finalidad del servicio y los plazos legales aplicables.',
        },
        {
          question: '¿Cómo puedo ejercer mis derechos de privacidad?',
          answer:
            'Puedes contactarnos desde la página de contacto para solicitar acceso, rectificación, limitación u oposición al tratamiento.',
        },
      ],
      supportCard: {
        title: 'Gestiona tus derechos de privacidad',
        description:
          'Nuestro equipo de soporte te ayuda a gestionar cualquier solicitud relacionada con protección de datos.',
        primaryActionLabel: 'Solicitar asistencia',
        primaryActionLink: '/contact',
      },
    },
    terms: {
      pageType: 'terms',
      title: 'Términos y condiciones',
      subtitle: 'Condiciones de uso del servicio',
      intro:
        'Estas condiciones definen derechos y responsabilidades al reservar, conducir y devolver un vehículo RentAuto.',
      lastUpdated: 'Última actualización: 27/04/2026',
      legalNotice: 'La aceptación de estos términos es necesaria para formalizar cualquier reserva.',
      quickFacts: [
        'Reserva sujeta a disponibilidad en tiempo real.',
        'Requisitos de edad y licencia según categoría de vehículo.',
        'Cancelaciones y cambios bajo política vigente al momento de la contratación.',
      ],
      sections: [
        {
          heading: 'Reservas y modificaciones',
          paragraphs: [
            'La reserva queda confirmada al completar el proceso de pago y recibir confirmación por correo electrónico.',
            'Las modificaciones se tramitan según disponibilidad de flota y condiciones tarifarias vigentes.',
          ],
          bullets: [
            'Confirmación digital inmediata con detalles de la reserva.',
            'Cambios sujetos a diferencias de precio o categoría.',
            'Cancelaciones con política variable según tarifa.',
          ],
        },
        {
          heading: 'Requisitos para el conductor',
          paragraphs: [
            'El conductor principal debe acreditar identidad y licencia válidas al recoger el vehículo.',
            'En categorías premium pueden aplicarse requisitos adicionales de edad, experiencia y fianza.',
          ],
          bullets: [
            'Edad mínima general: 21 años (puede variar por categoría).',
            'Licencia con al menos 1 año de antigüedad.',
            'Documento identificativo vigente en el momento de recogida.',
          ],
        },
      ],
      faqs: [
        {
          question: '¿Puedo añadir un segundo conductor?',
          answer:
            'Sí, en la mayoría de reservas es posible añadir conductores adicionales con coste y requisitos específicos.',
        },
        {
          question: '¿Qué pasa si devuelvo el coche tarde?',
          answer:
            'Puede aplicarse un recargo por demora según el tiempo excedido y la política de la tarifa contratada.',
        },
      ],
      supportCard: {
        title: 'Aclara condiciones antes de reservar',
        description:
          'Te ayudamos a validar requisitos, coberturas y documentación para evitar incidencias en mostrador.',
        primaryActionLabel: 'Hablar con un agente',
        primaryActionLink: '/contact',
      },
    },
    cookies: {
      pageType: 'cookies',
      title: 'Política de cookies',
      subtitle: 'Controla tu experiencia y preferencias',
      intro:
        'Las cookies permiten que la web funcione correctamente, recuerde tus preferencias y mejore el rendimiento del servicio.',
      lastUpdated: 'Última actualización: 27/04/2026',
      legalNotice: 'Puedes revisar y modificar tus preferencias en cualquier momento desde el navegador.',
      quickFacts: [
        'Las cookies técnicas son necesarias para operar la web.',
        'Las analíticas ayudan a mejorar rendimiento y experiencia.',
        'Puedes bloquear o eliminar cookies en cualquier momento.',
      ],
      sections: [
        {
          heading: 'Categorías de cookies',
          paragraphs: [
            'Utilizamos cookies técnicas para autenticación, seguridad y funcionalidades básicas de navegación.',
            'También empleamos cookies de analítica para entender el uso de la plataforma y optimizarla.',
          ],
          bullets: [
            'Técnicas: necesarias para acceso y sesión.',
            'Analíticas: evaluación de uso y rendimiento.',
            'Preferencias: idioma, filtros y ajustes personalizados.',
          ],
        },
        {
          heading: 'Gestión y desactivación',
          paragraphs: [
            'Puedes aceptar, bloquear o eliminar cookies desde la configuración de tu navegador.',
            'Si desactivas ciertas categorías, algunas funciones de personalización pueden limitarse.',
          ],
          bullets: [
            'Configura permisos en navegador o dispositivo.',
            'Elimina datos almacenados cuando lo necesites.',
            'Reactiva cookies para restaurar experiencia completa.',
          ],
        },
      ],
      faqs: [
        {
          question: '¿Desactivar cookies afecta a la reserva?',
          answer:
            'Las cookies técnicas son necesarias para procesos clave; si se bloquean, algunas funciones de reserva pueden fallar.',
        },
        {
          question: '¿Cómo vuelvo a activar cookies?',
          answer:
            'Puedes restablecer permisos en tu navegador y volver a cargar la página para aplicar los cambios.',
        },
      ],
      supportCard: {
        title: 'Configura cookies según tu preferencia',
        description:
          'Si necesitas ayuda técnica para gestionar cookies, nuestro equipo puede guiarte paso a paso.',
        primaryActionLabel: 'Pedir ayuda técnica',
        primaryActionLink: '/contact',
      },
    },
    contact: {
      pageType: 'contact',
      title: 'Contacto',
      subtitle: 'Atención rápida y soporte experto',
      intro:
        'Nuestro equipo está disponible para ayudarte antes, durante y después de tu alquiler por el canal que prefieras.',
      lastUpdated: 'Última actualización: 27/04/2026',
      legalNotice: 'El horario puede variar en días festivos según la oficina o canal de atención.',
      quickFacts: [
        'Respuesta rápida en horario laboral.',
        'Soporte para reservas, cambios, facturación e incidencias.',
        'Atención prioritaria para incidencias en carretera.',
      ],
      sections: [
        {
          heading: 'Canales de atención',
          paragraphs: [
            'Atendemos consultas de reservas, documentación, facturación, cambios y reclamaciones.',
            'El tiempo medio de respuesta por email es inferior a 2 horas en horario operativo.',
          ],
          bullets: [
            'Email: soporte@rentauto.com',
            'Atención diaria: 09:00 - 21:00',
            'Chat online para consultas rápidas',
          ],
        },
        {
          heading: 'Qué incluir en tu solicitud',
          paragraphs: [
            'Para agilizar la resolución, incluye datos de reserva, fecha del incidente y una breve descripción.',
            'En incidencias en carretera, añade ubicación exacta y teléfono de contacto activo.',
          ],
          bullets: [
            'Número de reserva o matrícula.',
            'Fecha y oficina de recogida/devolución.',
            'Captura de pantalla o detalle del error.',
          ],
        },
      ],
      faqs: [
        {
          question: '¿Tenéis teléfono de emergencias?',
          answer:
            'Sí, tras confirmar tu reserva encontrarás el número de asistencia en la documentación enviada por correo.',
        },
        {
          question: '¿Puedo gestionar cambios desde contacto?',
          answer:
            'Sí, puedes solicitar cambios de fecha, oficina o categoría y te confirmaremos opciones disponibles.',
        },
      ],
      supportCard: {
        title: 'Empieza tu gestión ahora',
        description:
          'Si ya sabes qué necesitas, puedes ir directamente al catálogo o crear una nueva reserva.',
        primaryActionLabel: 'Explorar coches',
        primaryActionLink: '/cars',
      },
    },
  };

  content: InfoContent | null = null;

  constructor(private route: ActivatedRoute) {
    this.route.data.subscribe((data) => {
      const pageType = (data['pageType'] as string) ?? '';
      this.content = this.pages[pageType] ?? null;
    });
  }
}
