// Configuration globale : routage, détection des changements et initialisation des services.
import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideZoneChangeDetection
} from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { routes } from './app.routes';
import { CatalogueService } from './services/catalogue.service';
import { ReservationService } from './services/reservation.service';
import { SessionService } from './services/session.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    // withComponentInputBinding : les paramètres de l'URL (:id, ?requis=…) arrivent directement
    // dans les propriétés input() des composants de page.
    provideRouter(routes, withComponentInputBinding()),
    // Les services d'état sont créés (et leurs données chargées depuis localStorage) AVANT
    // l'affichage de la première page : l'interface démarre toujours avec des données cohérentes.
    provideAppInitializer(() => {
      inject(SessionService);
      inject(CatalogueService);
      inject(ReservationService);
    })
  ]
};
