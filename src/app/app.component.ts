// Composant racine et structure commune de l'application.
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BandeauNotificationComponent } from './components/bandeau-notification/bandeau-notification.component';
import { BarreNavigationComponent } from './components/barre-navigation/barre-navigation.component';

/** Composant racine : structure commune à toutes les pages (navigation, messages, contenu). */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, BarreNavigationComponent, BandeauNotificationComponent],
  templateUrl: './app.component.html'
})
export class AppComponent {}
