// Page de consultation, recherche, filtrage et réservation du catalogue.
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Categorie, Equipement } from '../../data/donnees-initiales';
import { CarteMaterielComponent } from '../../components/carte-materiel/carte-materiel.component';
import { CatalogueService } from '../../services/catalogue.service';
import { NotificationService } from '../../services/notification.service';
import { ReservationService } from '../../services/reservation.service';
import { SessionService } from '../../services/session.service';
import { normaliser } from '../../utils/texte';

/** Page catalogue : liste, recherche par nom, filtre par catégorie, réservation depuis une carte. */
@Component({
  selector: 'app-catalogue-page',
  imports: [CarteMaterielComponent, RouterLink],
  templateUrl: './catalogue-page.component.html'
})
export class CataloguePageComponent {
  protected readonly catalogue = inject(CatalogueService);
  protected readonly session = inject(SessionService);
  private readonly reservations = inject(ReservationService);
  private readonly notifications = inject(NotificationService);

  // Critères de filtre : de simples signaux, la liste affichée se recalcule toute seule.
  protected readonly recherche = signal('');
  protected readonly categorie = signal<Categorie | ''>('');

  protected readonly resultats = computed(() => {
    const terme = normaliser(this.recherche());
    const categorie = this.categorie();
    return this.catalogue
      .equipements()
      .filter(
        (e) =>
          (categorie === '' || e.categorie === categorie) && normaliser(e.nom).includes(terme)
      );
  });

  protected readonly filtresActifs = computed(
    () => this.recherche().trim() !== '' || this.categorie() !== ''
  );

  surRecherche(evenement: Event): void {
    this.recherche.set((evenement.target as HTMLInputElement).value);
  }

  surCategorie(evenement: Event): void {
    this.categorie.set((evenement.target as HTMLSelectElement).value as Categorie | '');
  }

  reinitialiser(): void {
    this.recherche.set('');
    this.categorie.set('');
  }

  estDisponible(equipement: Equipement): boolean {
    return !this.reservations.estReserve(equipement.id);
  }

  /** Le bouton « Réserver » n'est proposé qu'aux étudiants, pour du matériel libre. */
  peutReserver(equipement: Equipement): boolean {
    return this.session.estEtudiant() && this.estDisponible(equipement);
  }

  /** Appelé quand une carte émet « demandeReservation » : le parent appelle le service. */
  reserver(equipement: Equipement): void {
    this.notifications.depuis(this.reservations.reserver(equipement));
  }
}
