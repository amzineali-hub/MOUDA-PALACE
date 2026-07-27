const fs = require('fs');
let code = fs.readFileSync('src/GuideEcrans.tsx', 'utf8');

const target = `<div className="h-px bg-gray-100 w-full"></div>

        <div>
          <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4 flex items-center gap-2">
            <ArrowRight className="text-[#DDA956]" /> Résolution des Problèmes Courants
          </h2>`;

const replacement = `<div className="h-px bg-gray-100 w-full"></div>

        {/* NOUVEAU MODULE : MODE D'EMPLOI ET CONFIGURATION */}
        <div>
          <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4 flex items-center gap-2">
            <Smartphone className="text-[#DDA956]" /> Mode d'emploi : Connexion et Configuration
          </h2>
          <div className="space-y-6 text-gray-600">
            <p>
              Ce guide détaillé vous explique pas-à-pas comment ajouter un nouvel appareil (tablette, POS ou KDS) à votre établissement, comment lui attribuer un rôle et comment le gérer au quotidien.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Étape 1 : Ajouter un appareil */}
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-8 h-8 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center font-bold">1</span>
                  <h3 className="font-bold text-gray-900 text-lg">Générer un code d'appairage</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <p>Depuis le tableau de bord administrateur :</p>
                  <ol className="list-decimal pl-4 space-y-1">
                    <li>Allez dans le module <strong>"Gestion des Écrans"</strong>.</li>
                    <li>Cliquez sur le bouton <strong>"Ajouter un Écran"</strong>.</li>
                    <li>Renseignez le nom (ex: "Caisse Bar"), le type d'appareil, et éventuellement un identifiant unique (ex: "BAR-01").</li>
                    <li>Validez pour générer un <strong>code à 6 chiffres</strong>. Ce code est valable pour une durée limitée.</li>
                  </ol>
                </div>
              </div>

              {/* Étape 2 : Connecter l'appareil */}
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-8 h-8 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center font-bold">2</span>
                  <h3 className="font-bold text-gray-900 text-lg">Connecter l'appareil physique</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <p>Sur la nouvelle tablette ou l'écran POS/KDS vierge :</p>
                  <ol className="list-decimal pl-4 space-y-1">
                    <li>Ouvrez l'application (ou simulez-la via <strong>"Simuler Tablette"</strong>).</li>
                    <li>L'écran affichera une mire de connexion demandant un code.</li>
                    <li>Saisissez le <strong>code à 6 chiffres</strong> généré à l'étape précédente.</li>
                    <li>L'appareil est désormais connecté, authentifié, et synchronisé avec le serveur central !</li>
                  </ol>
                </div>
              </div>
            </div>

            {/* Étape 3 : Gestion et Assignation */}
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 mt-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-8 h-8 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center font-bold">3</span>
                <h3 className="font-bold text-gray-900 text-lg">Gérer et Assigner les appareils</h3>
              </div>
              <div className="space-y-3 text-sm">
                <p>Une fois l'appareil connecté, il apparaît dans la liste de la <strong>Gestion des Écrans</strong>. Vous pouvez à tout moment :</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>
                    <strong>Configurer l'appareil :</strong> Cliquez sur "Configurer" pour modifier son nom, changer son type, ou <strong>l'assigner à un membre spécifique du personnel</strong> (ex: "Assigné à : Youssef"). Cela est particulièrement utile pour suivre qui utilise quelle tablette serveur.
                  </li>
                  <li>
                    <strong>Modifier l'identifiant :</strong> Vous pouvez mettre à jour l'identifiant unique (ex: changer "TERRASSE-1" en "TERRASSE-2").
                  </li>
                  <li>
                    <strong>Déconnecter l'appareil :</strong> Cliquez sur "Déconnecter" (icône corbeille) pour révoquer l'accès de cet appareil. L'appareil physique se reverrouillera automatiquement et demandera un nouveau code d'appairage.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="h-px bg-gray-100 w-full"></div>

        <div>
          <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4 flex items-center gap-2">
            <ArrowRight className="text-[#DDA956]" /> Résolution des Problèmes Courants
          </h2>`;

code = code.replace(
  /<div className="h-px bg-gray-100 w-full"><\/div>\s*<div>\s*<h2 className="text-2xl font-bold text-\[\#1A1A1A\] mb-4 flex items-center gap-2">\s*<ArrowRight className="text-\[\#DDA956\]" \/> Résolution des Problèmes Courants\s*<\/h2>/,
  replacement
);

fs.writeFileSync('src/GuideEcrans.tsx', code);
