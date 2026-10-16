# Campus Matériel

Application web monopage (Angular 19) permettant aux étudiants de consulter et de réserver le matériel du campus, et à un responsable de gérer le catalogue.

Projet final — connexion simulée, données conservées localement dans le navigateur (`localStorage`), aucun serveur.

---

## 1. Installation et lancement

**Prérequis** : Node.js 20 (ou 22) et npm.

```bash
npm install      # installe les dépendances et génère package-lock.json
npm start        # lance le serveur de développement
```

Puis ouvrir <http://localhost:4200>.

Autres commandes :

| Commande        | Rôle                                          |
|-----------------|-----------------------------------------------|
| `npm run build` | Compile l'application pour la production (`dist/`) |

> Le fichier `package-lock.json` est créé par `npm install` : il doit être conservé et rendu avec le projet. Le dossier `node_modules` ne doit pas être rendu.

---

## 2. Comptes de démonstration

La connexion est simulée : on clique sur un compte, sans mot de passe.

| Compte           | Profil      | Possibilités                                                      |
|------------------|-------------|-------------------------------------------------------------------|
| Alice Martin     | Étudiant    | Catalogue, fiches, réserver, consulter/annuler ses réservations   |
| Yanis Bernard    | Étudiant    | Idem (permet de vérifier que chaque étudiant ne voit que les siennes) |
| Camille Dupont   | Responsable | Catalogue, créer / modifier / supprimer des fiches                |

---

## 3. Routes

| Route                    | Contenu                                   | Accès                                   |
|--------------------------|-------------------------------------------|-----------------------------------------|
| `/`                      | Redirection selon la session              | Public (→ `/login` ou `/catalogue`)     |
| `/login`                 | Choix du compte de démonstration          | Public                                  |
| `/catalogue`             | Liste, recherche par nom, filtre catégorie | Utilisateur connecté                    |
| `/materiels/:id`         | Fiche détaillée et réservation            | Connecté ; réservation réservée aux étudiants |
| `/mes-reservations`      | Réservations de l'étudiant connecté       | Étudiant                                |
| `/gestion`               | Tableau de gestion du catalogue           | Responsable (chargé à la demande)       |
| `/gestion/nouveau`       | Création d'un équipement                  | Responsable                             |
| `/gestion/:id/modifier`  | Modification d'un équipement              | Responsable                             |
| `/acces-refuse`          | Explication d'un refus                    | Public                                  |
| toute autre URL          | Page 404                                  | Public                                  |

Les protections sont assurées par des **guards** (`src/app/guards/acces.guards.ts`) : elles s'appliquent aussi lorsqu'on saisit une URL directement dans la barre d'adresse (masquer un lien ne suffit pas).

- Visiteur non connecté sur une page privée → redirigé vers `/login`.
- Utilisateur connecté avec un mauvais rôle → `/acces-refuse` avec une explication.

---

## 4. Architecture du code

```
src/app/
├── data/          Jeu de données initial fourni (équipements, comptes, types)
├── models/        Types partagés (Resultat) et libellés d'affichage
├── services/      Logique métier + état partagé + persistance
│   ├── storage.service.ts       Accès sécurisé à localStorage (gestion des erreurs)
│   ├── session.service.ts       Utilisateur connecté (session simulée)
│   ├── catalogue.service.ts     Équipements : créer / modifier / supprimer
│   ├── reservation.service.ts   Réservations : réserver / annuler / disponibilité
│   └── notification.service.ts  Messages affichés à l'utilisateur
├── guards/        Protection des routes (connexion, rôle)
├── validators/    Validateur de texte du formulaire
├── utils/         Fonctions utilitaires (recherche, identifiants, contrôle des données lues)
├── components/    Composants réutilisables (navigation, carte, badge, formulaire, bandeau)
└── pages/         Pages routées (login, catalogue, détail, mes réservations, gestion…)
```

Principes suivis :

- **Les pages orchestrent, les services décident.** Les règles métier (une seule réservation par équipement, suppression interdite si réservé, annulation limitée à ses propres réservations) sont dans les services, jamais dans les gabarits HTML.
- **Un état partagé unique** par domaine, basé sur des *signals* Angular : session, catalogue et réservations. Toute modification met à jour l'affichage automatiquement, sans rechargement.
- **La disponibilité n'est jamais stockée.** Un équipement est disponible si aucune réservation active ne porte son identifiant (`ReservationService.estReserve`). Il ne peut donc pas y avoir de contradiction.
- **Composants de présentation** (`CarteMaterielComponent`, `FormulaireMaterielComponent`, `BadgeDisponibiliteComponent`) : ils reçoivent leurs données par `input()` et renvoient leurs actions par `output()`.

### Communication entre composants
`CarteMaterielComponent` reçoit un équipement et émet `demandeReservation` quand on clique sur « Réserver ». La page `CataloguePageComponent` écoute cet événement et appelle `ReservationService.reserver`. Le formulaire fonctionne de la même façon (`soumis`, `annule`).

### Chargement à la demande
L'espace `/gestion` est chargé avec `loadChildren` : son code forme un fichier séparé, téléchargé seulement lors de la première visite (visible dans l'onglet Réseau des outils de développement).

### Formulaire partagé
`FormulaireMaterielComponent` (formulaire réactif) sert à la création **et** à la modification : s'il reçoit un équipement, il pré-remplit les champs. Règles : nom ≥ 3 caractères, catégorie obligatoire, description ≥ 10 caractères, localisation obligatoire (les espaces en début/fin sont ignorés). En cas d'erreur, la saisie est conservée et les messages s'affichent sous chaque champ.

---

## 5. Persistance

Clés utilisées dans `localStorage` :

| Clé                    | Contenu                                  |
|------------------------|------------------------------------------|
| `campus.equipements`   | Catalogue                                |
| `campus.reservations`  | Réservations actives                     |
| `campus.session`       | Identifiant du compte connecté (supprimé à la déconnexion) |

- Le jeu initial n'est chargé que si la clé **n'existe pas**. Un tableau vide enregistré (`[]`) est une donnée valide et n'est pas écrasé.
- Les données initiales sont copiées avec `structuredClone` avant utilisation.
- Les nouveaux équipements reçoivent `plus grand identifiant + 1` (et non la longueur du tableau) ; les réservations reçoivent un `crypto.randomUUID()`.
- La session ne conserve que l'identifiant : le rôle est toujours relu depuis la liste officielle des comptes.
- Les données lues sont **vérifiées** (forme des objets). Si elles sont illisibles ou si le stockage est indisponible, un message s'affiche et l'application reste utilisable.
- Chaque modification est **enregistrée d'abord, puis appliquée à l'écran** : si l'enregistrement échoue, rien ne change à l'écran et un message d'erreur est affiché.

**Réinitialiser les données de démonstration** : outils de développement du navigateur → Application → Stockage local → supprimer les clés `campus.*`, puis recharger.

---

## 6. Le trajet d'une réservation

1. **Clic** — l'étudiant clique sur « Réserver » (carte du catalogue ou fiche détaillée).
2. **Transmission** — la carte émet `demandeReservation` ; la page appelle `ReservationService.reserver(equipement)`.
3. **Contrôles** — le service vérifie que l'utilisateur connecté est un étudiant, puis que l'équipement n'a pas déjà de réservation active. Sinon il renvoie un message d'erreur explicite et rien n'est modifié.
4. **Création** — une réservation `{ id, equipementId, etudiantId }` est créée avec l'identifiant de l'étudiant connecté.
5. **Sauvegarde** — la nouvelle liste est écrite dans `localStorage` (`campus.reservations`). En cas d'échec, l'opération est abandonnée.
6. **Mise à jour de l'état** — le signal `reservations` reçoit la nouvelle liste.
7. **Actualisation des vues** — les valeurs calculées (`idsReserves`, `mesReservations`) et les gabarits qui les lisent se recalculent : le badge passe à « Réservé », le bouton disparaît, le compteur de la barre de navigation augmente, et la page « Mes réservations » affiche l'équipement. Un message de confirmation apparaît.

L'annulation suit le même chemin dans l'autre sens : contrôle de propriété → retrait de l'entrée → sauvegarde → mise à jour de l'état → l'équipement redevient disponible partout immédiatement.

---

## 7. Scénario de test

> Avant de commencer : vider les clés `campus.*` du stockage local (voir §5) pour partir du jeu initial.

| # | Étape | Résultat attendu |
|---|---|---|
| 1 | Ouvrir `/catalogue` sans session, puis se connecter avec **Alice Martin**. | Redirection vers `/login`, puis accès au catalogue étudiant. |
| 2 | Alice ouvre l'équipement 101 et clique sur « Réserver ». | Confirmation, badge « Réservé » et compteur « Mes réservations » à 1. |
| 3 | Recharger la page, puis ouvrir « Mes réservations ». | La session et la réservation sont conservées et l'équipement 101 est listé. |
| 4 | Se déconnecter, puis se connecter avec **Yanis Bernard** et ouvrir l'équipement 101. | Ses réservations sont vides ; l'équipement est réservé par un autre étudiant. |
| 5 | Se connecter avec **Camille Dupont**, modifier une fiche dans `/gestion`, puis tenter de supprimer l'équipement 101. | La modification est enregistrée ; la suppression est refusée car l'équipement est réservé. |
| 6 | Revenir avec Alice dans « Mes réservations » et annuler la réservation. | Confirmation, liste vide et équipement 101 à nouveau disponible. |
| 7 | Revenir avec Camille et supprimer l'équipement 101 après l'annulation. | Suppression confirmée et équipement retiré du catalogue. |
| 8 | Tester `/nimportequoi`, `/materiels/9999` et `/gestion` avec un étudiant. | Page 404, message « Équipement introuvable » et page « Accès refusé » respectivement. |

---

## 8. Fonctionnalités réalisées

- Connexion simulée avec 3 comptes (2 étudiants, 1 responsable) ; session conservée au rechargement, supprimée à la déconnexion.
- Catalogue de 6 équipements (4 catégories) : recherche par nom (insensible à la casse et aux accents), filtre par catégorie, indication de disponibilité, fiche détaillée, messages pour liste vide / recherche sans résultat.
- Réservation et annulation avec respect des règles métier ; page « Mes réservations ».
- Gestion du catalogue : création, modification (même formulaire réactif), suppression avec confirmation et refus expliqué si l'équipement est réservé.
- Routage complet, guards d'authentification et de rôle, page d'accès refusé, page 404, chargement différé de l'espace de gestion, lien actif dans la navigation.
- Persistance `localStorage` avec contrôle des données lues et gestion des erreurs de lecture/écriture.
- Interface : menu latéral indigo, cartes arrondies, accent violet et corail (feuille de style unique `src/styles.css`, variables CSS en tête de fichier).
- Accessibilité de base : libellés de formulaire, messages d'erreur reliés aux champs, rôles `alert`/`status`, focus visible, lien d'évitement, états indiqués par du texte et non uniquement par la couleur.

## 9. Limites connues

- Les données sont locales à un navigateur : aucune synchronisation entre plusieurs ordinateurs ni entre profils de navigateur. Deux onglets ouverts en parallèle ne se synchronisent pas automatiquement (rechargement nécessaire).
- La connexion est simulée : sans mot de passe, et les contrôles d'accès ne sont que des protections d'interface. Une vraie application les vérifierait aussi côté serveur.
- Pas de dates de début/fin de réservation : le matériel reste réservé jusqu'à l'annulation (conformément au sujet).
- Un identifiant d'équipement supprimé en dernier peut être attribué à un nouvel équipement (aucune réservation ne peut le référencer, la suppression d'un équipement réservé étant interdite).
- Pas de tests automatisés : la vérification se fait avec le scénario manuel du §7.
- Extensions facultatives non réalisées : filtre conservé dans l'URL, retour à la page demandée après connexion, compteur par catégorie, bouton de réinitialisation des données de démonstration.
#   P r o j e t _ f i n a l  
 