# Campus Matériel

Application Angular pour réserver du matériel du campus. Les étudiants peuvent voir le catalogue et réserver. Le responsable gère les fiches de matériel. La connexion est simulée et les données sont enregistrées dans le navigateur (localStorage).

## Lancer le projet

```bash
npm install
npm start
```

Puis ouvrir http://localhost:4200

## Comptes de démonstration

- Alice Martin : étudiante
- Yanis Bernard : étudiant
- Camille Dupont : responsable

## Routes

| Route | Page | Accès |
|---|---|---|
| `/login` | Choix du compte | Public |
| `/catalogue` | Liste, recherche, filtre | Connecté |
| `/materiels/:id` | Fiche et réservation | Connecté |
| `/mes-reservations` | Mes réservations | Étudiant |
| `/gestion` | Gestion du catalogue | Responsable |
| `/gestion/nouveau` | Créer un équipement | Responsable |
| `/gestion/:id/modifier` | Modifier un équipement | Responsable |
| `/acces-refuse` | Accès refusé | Public |
| autre URL | Page 404 | Public |

`/` redirige vers la connexion ou le catalogue selon la session. Les pages privées sont protégées par des guards (`src/app/guards/`), même si on tape l'URL à la main.

## Organisation

- `services/` : la logique (session, catalogue, réservations, stockage)
- `guards/` : protection des routes
- `components/` : composants réutilisables
- `pages/` : les pages

Un équipement est disponible s'il n'a aucune réservation active : la disponibilité est calculée, pas stockée.

## Scénario de test

1. Ouvrir `/catalogue` sans être connecté : on arrive sur la connexion.
2. Se connecter avec Alice, réserver l'ordinateur portable 01.
3. Aller dans « Mes réservations », recharger : la réservation est toujours là.
4. Se connecter avec Yanis : il ne voit pas cette réservation et ne peut pas réserver l'ordinateur 01.
5. Se connecter avec Camille, modifier une fiche, puis essayer de supprimer l'ordinateur 01 : la suppression est refusée.
6. Alice annule sa réservation : l'ordinateur 01 est de nouveau disponible.
7. Tester `/nimportequoi` (404), `/materiels/9999` (introuvable) et `/gestion` avec Alice (accès refusé).

## Fonctionnalités

- Connexion simulée, session gardée au rechargement
- Recherche par nom, filtre par catégorie, disponibilité
- Réservation et annulation
- Création, modification et suppression de matériel (avec confirmation)
- Guards, page 404, accès refusé, chargement différé de `/gestion`
- Messages d'erreur (saisie invalide, déjà réservé, problème de stockage)

## Limites

- Les données restent dans un seul navigateur.
- La connexion est simulée, sans vérification côté serveur.
- Pas de dates de réservation : le matériel reste réservé jusqu'à l'annulation.
- Pas de tests automatiques.