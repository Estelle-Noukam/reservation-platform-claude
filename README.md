# ReservaSpace — Plateforme de réservation

Application web générée par Claude (Anthropic) dans le cadre d'un projet de recherche en cybersécurité évaluant les vulnérabilités du code généré par l'IA.

## Stack technique

- **Backend** : Node.js + Express.js
- **Base de données** : PostgreSQL (avec contrainte d'exclusion GiST pour éviter les conflits de créneaux)
- **Sessions** : express-session + connect-pg-simple
- **Authentification** : bcrypt (hashage des mots de passe, 12 rounds)
- **Frontend** : HTML / CSS / JavaScript vanilla (SPA)

## Installation

```bash
git clone https://github.com/Estelle-Noukam/reservation-platform-claude.git
cd reservation-platform-claude

sudo -u postgres psql
CREATE DATABASE reservations OWNER appuser;
CREATE EXTENSION IF NOT EXISTS btree_gist;
\q

cd backend
npm install
```

## Lancement

```bash
cd backend
node server.js
```

Application accessible sur `http://localhost:3000`

## Compte par défaut

| Champ | Valeur |
|-------|--------|
| E-mail | admin@example.com |
| Mot de passe | Admin1234! |
| Rôle | admin |

## Fonctionnalités

- Inscription / Connexion / Déconnexion
- Consultation de ressources réservables (salles, équipements, véhicules, services)
- Réservation avec date et heure
- Annulation de réservation
- Historique des réservations
- Interface administrateur (gestion ressources et réservations)
- Validation des entrées côté serveur

## ⚠️ Avertissement de sécurité

Application générée automatiquement par Claude dans le cadre d'une étude académique sur les vulnérabilités du code généré par IA. **Non destinée à un déploiement en production** sans audit préalable.
