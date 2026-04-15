import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';

type InfoContent = {
  title: string;
  intro: string;
  sections: {
    heading: string;
    paragraphs: string[];
    bullets: string[];
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
      title: 'Política de privacidad',
      intro:
        'Protegemos tu información personal en todo momento y aplicamos medidas técnicas y organizativas para un uso seguro y transparente.',
      sections: [
        {
          heading: 'Qué datos recopilamos',
          paragraphs: [
            'Recopilamos datos de identificación, contacto y reserva para procesar tu alquiler y ofrecer soporte.',
            'En determinados casos también almacenamos información de pago mediante proveedores certificados.',
          ],
          bullets: [
            'Nombre completo, email y teléfono.',
            'Datos de reserva y preferencias de vehículo.',
            'Información de facturación vinculada al servicio.',
          ],
        },
        {
          heading: 'Cómo usamos tus datos',
          paragraphs: [
            'Utilizamos la información para confirmar reservas, gestionar cambios y prevenir fraudes.',
            'No vendemos datos personales y solo compartimos con terceros cuando es imprescindible para el servicio.',
          ],
          bullets: [
            'Gestión y confirmación de reservas.',
            'Mejora de experiencia y soporte post-venta.',
            'Cumplimiento legal y fiscal.',
          ],
        },
      ],
      supportCard: {
        title: '¿Quieres ejercer tus derechos?',
        description:
          'Puedes solicitar acceso, rectificación o eliminación de datos desde nuestro canal de soporte.',
        primaryActionLabel: 'Ir a contacto',
        primaryActionLink: '/contact',
      },
    },
    terms: {
      title: 'Términos y condiciones',
      intro:
        'Estas condiciones regulan el uso del servicio de alquiler y detallan responsabilidades, cobertura y política de uso.',
      sections: [
        {
          heading: 'Condiciones de reserva',
          paragraphs: [
            'La reserva se confirma tras completar el pago y recibir el correo de confirmación.',
            'Puedes modificar fechas según disponibilidad y posibles diferencias de tarifa.',
          ],
          bullets: [
            'Confirmación inmediata por email.',
            'Cambios sujetos a disponibilidad.',
            'Cancelación según política vigente.',
          ],
        },
        {
          heading: 'Requisitos del conductor',
          paragraphs: [
            'El conductor principal debe cumplir la edad mínima y presentar licencia vigente.',
            'En algunas categorías premium pueden aplicarse requisitos adicionales.',
          ],
          bullets: [
            'Edad mínima general de 21 años.',
            'Licencia con al menos 1 año de antigüedad.',
            'Documento de identidad válido en el momento de recogida.',
          ],
        },
      ],
      supportCard: {
        title: '¿Tienes dudas antes de reservar?',
        description:
          'Nuestro equipo puede ayudarte a validar requisitos para evitar incidencias al recoger el coche.',
        primaryActionLabel: 'Hablar con soporte',
        primaryActionLink: '/contact',
      },
    },
    cookies: {
      title: 'Política de cookies',
      intro:
        'Las cookies nos ayudan a que el sitio funcione correctamente, recuerde tus preferencias y mejore el rendimiento general.',
      sections: [
        {
          heading: 'Tipos de cookies',
          paragraphs: [
            'Utilizamos cookies técnicas necesarias para navegación, autenticación y seguridad.',
            'También usamos cookies analíticas para medir rendimiento y mejorar funcionalidades.',
          ],
          bullets: [
            'Técnicas: necesarias para operar la web.',
            'Analíticas: medición de uso y rendimiento.',
            'Preferencias: recordar idioma y ajustes.',
          ],
        },
        {
          heading: 'Control de preferencias',
          paragraphs: [
            'Puedes eliminar o bloquear cookies desde la configuración del navegador.',
            'Al desactivar ciertas cookies, algunas funciones podrían verse limitadas.',
          ],
          bullets: [
            'Gestiona permisos desde tu navegador.',
            'Borra historial y datos de navegación cuando quieras.',
            'Vuelve a aceptar cookies para recuperar experiencia completa.',
          ],
        },
      ],
      supportCard: {
        title: '¿Necesitas ayuda con la configuración?',
        description:
          'Te guiamos para ajustar cookies y privacidad según tu navegador o dispositivo.',
        primaryActionLabel: 'Contactar soporte',
        primaryActionLink: '/contact',
      },
    },
    contact: {
      title: 'Contacto',
      intro:
        'Estamos aquí para ayudarte antes, durante y después de tu reserva. Elige el canal más cómodo para ti.',
      sections: [
        {
          heading: 'Canales disponibles',
          paragraphs: [
            'Respondemos consultas sobre reservas, cambios de fecha, documentación y facturación.',
            'Nuestro tiempo de respuesta promedio por email es menor a 2 horas en horario laboral.',
          ],
          bullets: [
            'Email: soporte@rentacar.com',
            'Atención diaria: 09:00 - 21:00',
            'Chat en vivo para consultas rápidas',
          ],
        },
        {
          heading: 'Antes de escribirnos',
          paragraphs: [
            'Para ayudarte más rápido, incluye número de reserva, fecha y descripción del problema.',
            'Si es una incidencia en carretera, indica tu ubicación y teléfono de contacto.',
          ],
          bullets: [
            'Número de reserva o matrícula.',
            'Fecha y oficina de recogida/devolución.',
            'Captura o detalle del error recibido.',
          ],
        },
      ],
      supportCard: {
        title: '¿Quieres resolverlo ya?',
        description:
          'Puedes volver al inicio para iniciar una nueva reserva o revisar coches disponibles.',
        primaryActionLabel: 'Ver coches',
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
