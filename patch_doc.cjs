const fs = require('fs');
let code = fs.readFileSync('src/Documentation.tsx', 'utf8');

const oldRH = `## 6. Attribution des rôles serveurs
Gérez votre personnel.
- Allez dans **Équipe & RH**.
- Ajoutez vos employés (Serveurs, Cuisiniers, Managers).
- Attribuez-leur des rôles pour contrôler leurs accès (ex: Serveur pour prendre des commandes sur le POS).`;

const newRH = `## 6. Gestion d'Équipe & RH
Gérez votre personnel et vos ressources humaines de A à Z.
- Allez dans le module **Équipe & RH**.
- **Gestion des Employés :** Ajoutez vos employés (Serveurs, Cuisiniers, Managers) avec leurs informations personnelles, contrats et documents.
- **Rôles et Accès :** Attribuez-leur des rôles pour contrôler précisément leurs accès aux différents modules (ex: accès restreint au POS pour un Serveur, accès total pour un Manager).
- **Plannings et Présences :** Gérez les plannings hebdomadaires, suivez les pointages et les heures travaillées.
- **Paie et Avances :** Gérez les bulletins de paie, les acomptes, les primes et le calcul des salaires nets.
- **Congés et Absences :** Suivez les demandes de congés, les jours de repos et les absences justifiées/injustifiées.`;

const oldCompta = `## 8. Comptabilité et Finances
Analysez vos résultats.
- Allez dans le module **Comptabilité & Finances**.
- Les ventes du POS et les dépenses fournisseurs y remontent automatiquement.
- Vous obtenez une vue claire de votre chiffre d'affaires, de votre marge et de la trésorerie.`;

const newCompta = `## 8. Comptabilité et Finances
Gérez la comptabilité complète de votre établissement.
- Allez dans le module **Comptabilité & Finances**.
- **Chiffre d'Affaires et Trésorerie :** Les ventes du POS et les dépenses fournisseurs y remontent automatiquement pour une vue claire de votre trésorerie et de vos marges.
- **Déclaration de TVA :** Suivez la TVA collectée (sur vos ventes) et la TVA déductible (sur vos achats) pour générer facilement vos déclarations de TVA périodiques.
- **Journal Comptable :** Toutes les opérations (ventes, achats, salaires, charges fixes) sont centralisées dans un journal des écritures comptables.
- **Bilan et Compte de Résultat :** Éditez votre bilan, votre compte de résultat et vos états financiers.
- **Gestion des Charges :** Saisissez vos charges fixes (Loyer, Électricité, Assurances) et variables pour un calcul précis de votre rentabilité.`;

code = code.replace(oldRH, newRH);
code = code.replace(oldCompta, newCompta);

fs.writeFileSync('src/Documentation.tsx', code);
