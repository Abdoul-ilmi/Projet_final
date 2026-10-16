// Point d'entrée de l'application Angular.
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

// Point d'entrée : démarre l'application avec le composant racine et la configuration globale.
bootstrapApplication(AppComponent, appConfig).catch((erreur) => console.error(erreur));
